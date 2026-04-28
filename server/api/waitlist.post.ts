import { createError, getRequestHeader, readBody } from "h3";
import { getWaitlistGreetingEmail } from "../utils/email";

type WaitlistBody = {
  name?: string;
  email?: string;
  note?: string;
  company?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLocaleFromReferer = (referer: string): "en" | "ua" => {
  return referer.includes("/ua") ? "ua" : "en";
};

export default defineEventHandler(async (event) => {
  const body = await readBody<WaitlistBody>(event);
  const email = body.email?.trim().toLowerCase() || "";
  const name = body.name?.trim() || "";
  const note = body.note?.trim() || "";

  if (body.company) {
    return { ok: true };
  }

  if (!emailPattern.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid email is required.",
    });
  }

  if (name.length > 120 || email.length > 254 || note.length > 1200) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submitted details are too long.",
    });
  }

  const config = useRuntimeConfig(event);

  const submission = {
    name,
    email,
    note,
    userAgent: getRequestHeader(event, "user-agent") || "",
    referer: getRequestHeader(event, "referer") || "",
    createdAt: new Date().toISOString(),
  };

  console.info("Ixercise waitlist submission", submission);

  const resendApiKey = config.resendApiKey || process.env.RESEND_API_KEY || "";
  const waitlistToEmail =
    config.waitlistToEmail || process.env.WAITLIST_TO_EMAIL || "";

  const waitlistFromEmail =
    config.waitlistFromEmail ||
    process.env.WAITLIST_FROM_EMAIL ||
    "Ixercise Waitlist <waitlist@ixercise.com>";

  const userGreetingFromEmail =
    config.userGreetingFromEmail ||
    process.env.USER_GREETING_FROM_EMAIL ||
    "Ixercise <waitlist@ixercise.com>";

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (!resendApiKey || !waitlistToEmail) {
    console.error("Waitlist email delivery is not configured", {
      hasResendApiKey: Boolean(resendApiKey),
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

  const ownerResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: waitlistFromEmail,
      to: [waitlistToEmail],
      subject: "New Ixercise waitlist signup",
      text: [
        "New Ixercise waitlist signup",
        "",
        `Name: ${name || "-"}`,
        `Email: ${email}`,
        `Note: ${note || "-"}`,
        `Created: ${submission.createdAt}`,
        `Referer: ${submission.referer || "-"}`,
        `User agent: ${submission.userAgent || "-"}`,
      ].join("\n"),
    }),
  });

  if (!ownerResponse.ok) {
    const errorText = await ownerResponse.text();

    console.error("Failed to send waitlist email", {
      status: ownerResponse.status,
      statusText: ownerResponse.statusText,
      error: errorText,
    });

    throw createError({
      statusCode: 502,
      statusMessage: "Could not send waitlist notification.",
    });
  }

  const ownerDelivery = (await ownerResponse.json().catch(() => null)) as {
    id?: string;
  } | null;

  const locale = getLocaleFromReferer(submission.referer);
  const greetingEmail = getWaitlistGreetingEmail({ name, locale });

  const greetingResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: userGreetingFromEmail,
      to: [email],
      subject: greetingEmail.subject,
      html: greetingEmail.html,
      text: greetingEmail.text,
    }),
  });

  let greetingDelivery: { id?: string } | null = null;

  if (!greetingResponse.ok) {
    const errorText = await greetingResponse.text();

    // Important: do not fail the waitlist signup only because the greeting failed.
    console.error("Failed to send waitlist greeting email", {
      status: greetingResponse.status,
      statusText: greetingResponse.statusText,
      error: errorText,
    });
  } else {
    greetingDelivery = (await greetingResponse.json().catch(() => null)) as {
      id?: string;
    } | null;
  }

  return {
    ok: true,
    delivery: "email",
    id: ownerDelivery?.id,
    greetingId: greetingDelivery?.id,
  };
});
