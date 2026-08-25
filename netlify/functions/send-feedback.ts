import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import {
  FEEDBACK_SUBJECT,
  FEEDBACK_TO,
  buildFeedbackEmail,
  parseFeedbackPayload,
} from "../../lib/feedback";

/**
 * Geri bildirimi Resend ile anil.keskin@hotmail.com adresine iletir.
 * Netlify Forms kullanılmaz.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Geçersiz istek" };
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.honey === "string" && record.honey.trim()) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const payload = parseFeedbackPayload(raw);
  if (!payload) {
    return { statusCode: 400, body: "Eksik veya geçersiz alan" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "E-posta yapılandırması eksik" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM?.trim() || "SafeWatch <beth.t@example.com>";
  const to = process.env.FEEDBACK_TO?.trim() || FEEDBACK_TO;

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email || undefined,
    subject: FEEDBACK_SUBJECT,
    text: buildFeedbackEmail(payload),
  });

  if (error) {
    return { statusCode: 502, body: "E-posta gönderilemedi" };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
