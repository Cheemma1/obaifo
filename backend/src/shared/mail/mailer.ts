import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transport: Transporter | null = null;

/**
 * Sends through SMTP when SMTP_HOST is set (any provider: Zoho, Resend, Brevo,
 * Gmail…). Without it (local dev) the mail is printed to the API console instead.
 */
export async function sendMail(mail: Mail) {
  if (!env.smtp.host) {
    console.log(`\n✉  Mail to ${mail.to}: ${mail.subject}\n${mail.text}\n`);
    return;
  }
  transport ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  await transport.sendMail({ from: env.smtp.from, ...mail });
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A plain, single-button email in the site's colours. */
export function simpleMail({ heading, body, button, url, footer }: { heading: string; body: string; button: string; url: string; footer: string }) {
  const html = `<!doctype html><html><body style="margin:0;background:#efe6d6;font-family:Arial,Helvetica,sans-serif;color:#1a1410">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<p style="margin:0 0 24px;font-size:22px;font-weight:800">Ọbaifo</p>
<div style="background:#fbf6ec;border-top:4px solid #1a1410;padding:28px">
<h1 style="margin:0 0 16px;font-size:22px">${escape(heading)}</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6">${escape(body)}</p>
<a href="${escape(url)}" style="display:inline-block;background:#1a1410;color:#fbf6ec;padding:14px 24px;font-weight:700;text-decoration:none">${escape(button)}</a>
<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#4a403a">${escape(footer)}<br><span style="word-break:break-all">${escape(url)}</span></p>
</div></div></body></html>`;
  const text = `${heading}\n\n${body}\n\n${button}: ${url}\n\n${footer}`;
  return { html, text };
}
