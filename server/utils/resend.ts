type SendEmailParams = {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  idempotencyKey?: string;
};

// WAITLIST_DRY_RUN=1 skips the network call so local tests never email anyone.
export const sendEmail = async ({
  apiKey,
  from,
  to,
  subject,
  text,
  html,
  replyTo,
  idempotencyKey,
}: SendEmailParams) => {
  if (process.env.WAITLIST_DRY_RUN === "1") {
    return { ok: true, id: "dry-run" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Resend request failed", {
      status: response.status,
      error: await response.text(),
    });
    return { ok: false as const };
  }

  const data = (await response.json().catch(() => null)) as {
    id?: string;
  } | null;
  return { ok: true as const, id: data?.id };
};
