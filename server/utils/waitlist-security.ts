import { createHmac, timingSafeEqual } from "node:crypto";
import { createError, getRequestHeader, getRequestIP } from "h3";
import type { H3Event } from "h3";

const FORM_TOKEN_MIN_AGE_MS = 3_000;
const FORM_TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;
export const CONFIRM_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Mailboxes that never belong to a person who wants a workout app.
const BLOCKED_LOCAL_PARTS = new Set([
  "abuse",
  "admin",
  "administrator",
  "contact",
  "donotreply",
  "do-not-reply",
  "hostmaster",
  "info",
  "legal",
  "mailer-daemon",
  "no-reply",
  "noreply",
  "office",
  "postmaster",
  "privacy",
  "root",
  "sales",
  "security",
  "service",
  "spam",
  "support",
  "webmaster",
]);

// Carrier SMS/MMS gateways (phone numbers, not mailboxes).
const BLOCKED_DOMAINS = new Set([
  "tmomail.net",
  "vtext.com",
  "txt.att.net",
  "mms.att.net",
  "messaging.sprintpcs.com",
  "vzwpix.com",
  "mymetropcs.com",
  "example.com",
  "example.org",
  "test.com",
]);

export const isBlockedEmail = (email: string) => {
  const [local = "", domain = ""] = email.toLowerCase().split("@");
  return (
    BLOCKED_LOCAL_PARTS.has(local) ||
    BLOCKED_DOMAINS.has(domain) ||
    /^\d{7,}$/.test(local)
  );
};

const b64 = (value: string) => Buffer.from(value).toString("base64url");

const sign = (secret: string, body: string) =>
  createHmac("sha256", secret).update(body).digest("base64url");

export const signToken = (secret: string, payload: Record<string, unknown>) => {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(secret, body)}`;
};

export const verifyToken = <T extends Record<string, unknown>>(
  secret: string,
  token: string,
): T | null => {
  const [body = "", signature = ""] = token.split(".");
  if (!body || !signature || !secret) return null;

  const expected = Buffer.from(sign(secret, body));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
};

export const issueFormToken = (secret: string) =>
  signToken(secret, { k: "form", t: Date.now() });

export const assertValidFormToken = (secret: string, token: unknown) => {
  const payload =
    typeof token === "string"
      ? verifyToken<{ k?: string; t?: number }>(secret, token)
      : null;
  const age = payload?.t ? Date.now() - payload.t : -1;

  if (
    payload?.k !== "form" ||
    age < FORM_TOKEN_MIN_AGE_MS ||
    age > FORM_TOKEN_MAX_AGE_MS
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please reload the page and try again.",
    });
  }
};

const hostOf = (value: string | undefined) => {
  try {
    return value ? new URL(value).hostname : "";
  } catch {
    return "";
  }
};

export const assertSameOrigin = (event: H3Event, siteUrl: string) => {
  const origin =
    hostOf(getRequestHeader(event, "origin")) ||
    hostOf(getRequestHeader(event, "referer"));
  const allowed = new Set([hostOf(siteUrl), "ixercise.com", "www.ixercise.com"]);
  const isDev = process.env.NODE_ENV !== "production" && !process.env.VERCEL;

  if (!allowed.has(origin) && !(isDev && origin === "localhost")) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden." });
  }
};

// Best-effort per-instance limit; the Vercel Firewall rule is the real one.
const hits = new Map<string, number[]>();
export const assertRateLimit = (event: H3Event, max = 6, windowMs = 600_000) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests. Try again later.",
    });
  }

  recent.push(now);
  hits.set(ip, recent);
};
