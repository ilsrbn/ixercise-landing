import { createError, getRequestHeader, readBody } from "h3";
import { getWaitlistConfirmEmail } from "../utils/email";
import { sendEmail } from "../utils/resend";
import {
  assertRateLimit,
  assertSameOrigin,
  assertValidFormToken,
  isBlockedEmail,
  signToken,
} from "../utils/waitlist-security";

type WaitlistBody = {
  name?: string;
  email?: string;
  note?: string;
  company?: string;
  consent?: boolean;
  formToken?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLocaleFromReferer = (referer: string): "en" | "ua" => {
  return referer.includes("/ua") ? "ua" : "en";
};

// Step 1 of double opt-in: nothing is stored or announced until the owner of
// the address clicks the link in the confirmation email (see waitlist-confirm).
// Personal data is deliberately not logged: logs cannot be deleted on request.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl || "https://www.ixercise.com");

  assertSameOrigin(event, siteUrl);
  assertRateLimit(event);

  const body = await readBody<WaitlistBody>(event);
  const email = body.email?.trim().toLowerCase() || "";
  const name = body.name?.trim() || "";
  const note = body.note?.trim() || "";

  // Honeypot: real users never see this field. Pretend success.
  if (body.company) {
    return { ok: true, delivery: "confirmation" };
  }

  if (!emailPattern.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid email is required.",
    });
  }

  if (body.consent !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: "Consent is required.",
    });
  }

  if (name.length > 120 || email.length > 254 || note.length > 1200) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submitted details are too long.",
    });
  }

  const secret = config.resendApiKey || process.env.RESEND_API_KEY || "";
  assertValidFormToken(secret || "dev-secret", body.formToken);

  // Role mailboxes and SMS gateways: pretend success, send nothing.
  if (isBlockedEmail(email)) {
    return { ok: true, delivery: "confirmation" };
  }

  const waitlistToEmail =
    config.waitlistToEmail || process.env.WAITLIST_TO_EMAIL || "";
  const userFromEmail =
    config.userGreetingFromEmail ||
    process.env.USER_GREETING_FROM_EMAIL ||
    "Ixercise <waitlist@ixercise.com>";
  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (!secret || !waitlistToEmail) {
    console.error("Waitlist email delivery is not configured", {
      hasResendApiKey: Boolean(secret),
      hasWaitlistToEmail: Boolean(waitlistToEmail),
      isProduction,
    });

    if (isProduction) {
      throw createError({
        statusCode: 500,
        statusMessage: "Waitlist email delivery is not configured.",
      });
    }

    return { ok: true, delivery: "log" };
  }

  const locale = getLocaleFromReferer(getRequestHeader(event, "referer") || "");
  const token = signToken(secret, {
    k: "confirm",
    e: email,
    n: name,
    note,
    loc: locale,
    ts: Date.now(),
  });
  const confirmUrl = `${siteUrl.replace(/\/$/, "")}/api/waitlist-confirm?t=${encodeURIComponent(token)}`;
  const confirmEmail = getWaitlistConfirmEmail({ name, locale, confirmUrl });

  const result = await sendEmail({
    apiKey: secret,
    from: userFromEmail,
    to: [email],
    subject: confirmEmail.subject,
    text: confirmEmail.text,
    html: confirmEmail.html,
    replyTo: waitlistToEmail,
    // Same address within 24h gets one confirmation email at most.
    idempotencyKey: `waitlist-confirm-${email}`,
  });

  if (!result.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not send the confirmation email.",
    });
  }

  return { ok: true, delivery: "confirmation" };
});
