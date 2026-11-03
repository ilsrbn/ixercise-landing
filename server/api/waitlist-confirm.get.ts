import { getQuery, setResponseHeader } from "h3";
import { getWaitlistGreetingEmail } from "../utils/email";
import { sendEmail } from "../utils/resend";
import {
  CONFIRM_TOKEN_MAX_AGE_MS,
  verifyToken,
} from "../utils/waitlist-security";

type ConfirmPayload = {
  k?: string;
  e?: string;
  n?: string;
  note?: string;
  loc?: "en" | "ua";
  ts?: number;
};

const page = (locale: "en" | "ua", ok: boolean) => {
  const ua = locale === "ua";
  const title = ok
    ? ua
      ? "Email підтверджено"
      : "Email confirmed"
    : ua
      ? "Посилання недійсне"
      : "Link is not valid";
  const text = ok
    ? ua
      ? "Дякую! Ви у списку очікування Ixercise. Я надішлю лист, коли застосунок буде готовий."
      : "Thank you! You are on the Ixercise waitlist. I will email you when the app is ready."
    : ua
      ? "Посилання застаріло або пошкоджене. Спробуйте підписатися ще раз на ixercise.com."
      : "The link has expired or is broken. Please try joining again on ixercise.com.";
  return `<!doctype html><html lang="${ua ? "uk" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080808;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;"><main style="max-width:30rem;padding:2rem;text-align:center"><h1 style="letter-spacing:-0.04em">${title}</h1><p style="color:#b8b8b8;line-height:1.6">${text}</p><p><a href="https://www.ixercise.com/${ua ? "ua" : ""}" style="color:#fff">ixercise.com</a></p></main></body></html>`;
};

// Step 2 of double opt-in: only now is the owner notified and the greeting sent.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const secret = config.resendApiKey || process.env.RESEND_API_KEY || "";
  const token = String(getQuery(event).t || "");
  const payload = verifyToken<ConfirmPayload>(secret, token);

  setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "no-store");
  setResponseHeader(event, "Referrer-Policy", "no-referrer");

  const locale = payload?.loc === "ua" ? "ua" : "en";
  const age = payload?.ts ? Date.now() - payload.ts : -1;

  if (
    payload?.k !== "confirm" ||
    !payload.e ||
    age < 0 ||
    age > CONFIRM_TOKEN_MAX_AGE_MS
  ) {
    setResponseStatus(event, 400);
    return page(locale, false);
  }

  const email = payload.e;
  const name = payload.n || "";
  const note = payload.note || "";
  const waitlistToEmail =
    config.waitlistToEmail || process.env.WAITLIST_TO_EMAIL || "";
  const ownerFrom =
    config.waitlistFromEmail ||
    process.env.WAITLIST_FROM_EMAIL ||
    "Ixercise Waitlist <waitlist@ixercise.com>";
  const userFrom =
    config.userGreetingFromEmail ||
    process.env.USER_GREETING_FROM_EMAIL ||
    "Ixercise <waitlist@ixercise.com>";

  // Idempotency keys make repeated clicks within 24h send nothing new.
  await sendEmail({
    apiKey: secret,
    from: ownerFrom,
    to: [waitlistToEmail],
    subject: "New Ixercise waitlist signup",
    text: [
      "New Ixercise waitlist signup (email confirmed)",
      "",
      `Name: ${name || "-"}`,
      `Email: ${email}`,
      `Note: ${note || "-"}`,
      `Confirmed: ${new Date().toISOString()}`,
    ].join("\n"),
    idempotencyKey: `waitlist-owner-${email}`,
  });

  const greeting = getWaitlistGreetingEmail({ name, locale });
  await sendEmail({
    apiKey: secret,
    from: userFrom,
    to: [email],
    subject: greeting.subject,
    html: greeting.html,
    text: greeting.text,
    replyTo: waitlistToEmail,
    idempotencyKey: `waitlist-greeting-${email}`,
  });

  return page(locale, true);
});
