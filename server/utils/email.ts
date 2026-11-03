// server/utils/waitlist-email.ts

type WaitlistGreetingEmailParams = {
  name?: string;
  locale?: "en" | "ua";
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const getWaitlistGreetingEmail = ({
  name,
  locale = "en",
}: WaitlistGreetingEmailParams) => {
  const safeName = name ? escapeHtml(name) : "";

  const copy =
    locale === "ua"
      ? {
          subject: "Ви у списку очікування Ixercise",
          preheader:
            "Дякую, що долучилися. Я напишу, коли Ixercise буде доступний.",
          title: safeName ? `Дякую, ${safeName}.` : "Дякую.",
          intro: "Ви у списку очікування Ixercise.",
          body: "Я надішлю коротке повідомлення, коли застосунок стане доступним. Без розсилки, спаму чи зайвих листів.",
          promiseTitle: "Що це за застосунок?",
          promise:
            "Ixercise — простий iOS-застосунок, який проводить вас крізь власне тренування крок за кроком. Без акаунта, хмари й трекінгу.",
          footer:
            "Ви отримали цей лист, бо залишили email на ixercise.com. Щоб відписатися й видалити свої дані, просто дайте відповідь на цей лист.",
          cta: "Переглянути сайт",
        }
      : {
          subject: "You are on the Ixercise waitlist",
          preheader:
            "Thanks for joining. I will email you when Ixercise is available.",
          title: safeName ? `Thanks, ${safeName}.` : "Thank you.",
          intro: "You are on the Ixercise waitlist.",
          body: "I will send you a short note when the app becomes available. No newsletter, no spam, no unnecessary emails.",
          promiseTitle: "What is Ixercise?",
          promise:
            "Ixercise is a simple iOS app that guides you through your own workouts step by step. No account, no cloud, no tracking.",
          footer:
            "You received this email because you joined the waitlist on ixercise.com. To unsubscribe and delete your data, just reply to this email.",
          cta: "View website",
        };

  const text = [
    copy.title,
    "",
    copy.intro,
    copy.body,
    "",
    copy.promiseTitle,
    copy.promise,
    "",
    "https://www.ixercise.com/",
    "",
    copy.footer,
  ].join("\n");

  const html = `<!doctype html>
<html lang="${locale === "ua" ? "uk" : "en"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta name="color-scheme" content="dark light">
    <meta name="supported-color-schemes" content="dark light">
    <title>${copy.subject}</title>
    <style>
      @media (max-width: 620px) {
        .container { width: 100% !important; }
        .card { padding: 28px 22px !important; }
        .title { font-size: 28px !important; line-height: 34px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#080808;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${copy.preheader}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
            <tr>
              <td style="padding:0 0 20px;">
                <div style="font-size:20px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;">
                  <span style="color:#E11D2E;">I</span>xercise
                </div>
              </td>
            </tr>

            <tr>
              <td class="card" style="background:#111111;border:1px solid #262626;border-radius:28px;padding:40px;">
                <div style="display:inline-block;margin:0 0 24px;padding:8px 12px;border:1px solid #2f2f2f;border-radius:999px;color:#b8b8b8;font-size:13px;">
                  ${copy.intro}
                </div>

                <h1 class="title" style="margin:0 0 16px;font-size:36px;line-height:42px;letter-spacing:-0.05em;color:#ffffff;">
                  ${copy.title}
                </h1>

                <p style="margin:0 0 28px;font-size:17px;line-height:28px;color:#d4d4d4;">
                  ${copy.body}
                </p>

                <div style="height:1px;background:#262626;margin:28px 0;"></div>

                <h2 style="margin:0 0 10px;font-size:18px;line-height:24px;color:#ffffff;">
                  ${copy.promiseTitle}
                </h2>

                <p style="margin:0 0 28px;font-size:15px;line-height:25px;color:#b8b8b8;">
                  ${copy.promise}
                </p>

                <a href="https://www.ixercise.com/${locale === "ua" ? "ua" : ""}"
                  style="display:inline-block;background:#E11D2E;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:999px;padding:13px 18px;">
                  ${copy.cta}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 4px 0;color:#737373;font-size:12px;line-height:18px;">
                ${copy.footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject: copy.subject,
    html,
    text,
  };
};

type ConfirmEmailParams = {
  name?: string;
  locale?: "en" | "ua";
  confirmUrl: string;
};

export const getWaitlistConfirmEmail = ({
  name,
  locale = "en",
  confirmUrl,
}: ConfirmEmailParams) => {
  const ua = locale === "ua";
  const safeName = name ? escapeHtml(name) : "";
  const copy = ua
    ? {
        subject: "Підтвердіть email для списку очікування Ixercise",
        title: safeName ? `Привіт, ${safeName}!` : "Привіт!",
        body: "Хтось (сподіваємось, ви) залишив цю адресу в списку очікування Ixercise. Натисніть кнопку, щоб підтвердити, і я напишу, коли застосунок буде готовий.",
        cta: "Підтвердити email",
        ignore:
          "Якщо це були не ви, просто проігноруйте цей лист: без підтвердження нічого не станеться, і ця адреса не буде додана.",
        expires: "Посилання діє 7 днів.",
      }
    : {
        subject: "Confirm your email for the Ixercise waitlist",
        title: safeName ? `Hi ${safeName},` : "Hi,",
        body: "Someone (hopefully you) added this address to the Ixercise waitlist. Click the button to confirm and I will email you when the app is ready.",
        cta: "Confirm email",
        ignore:
          "If this was not you, just ignore this email: nothing happens without confirmation and this address will not be added.",
        expires: "The link is valid for 7 days.",
      };

  const text = [
    copy.title,
    "",
    copy.body,
    "",
    confirmUrl,
    "",
    copy.ignore,
    copy.expires,
  ].join("\n");

  const html = `<!doctype html>
<html lang="${ua ? "uk" : "en"}">
  <body style="margin:0;padding:32px 16px;background:#080808;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111111;border:1px solid #262626;border-radius:28px;padding:36px;">
          <tr><td>
            <div style="font-size:20px;font-weight:800;letter-spacing:-0.03em;margin-bottom:20px;"><span style="color:#E11D2E;">I</span>xercise</div>
            <h1 style="margin:0 0 14px;font-size:28px;line-height:34px;letter-spacing:-0.04em;">${copy.title}</h1>
            <p style="margin:0 0 24px;font-size:16px;line-height:26px;color:#d4d4d4;">${copy.body}</p>
            <a href="${confirmUrl}" style="display:inline-block;background:#E11D2E;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:999px;padding:13px 20px;">${copy.cta}</a>
            <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#8a8a8a;">${copy.ignore}<br>${copy.expires}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject: copy.subject, text, html };
};
