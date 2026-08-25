import { Resend } from "resend";
import {
  FEEDBACK_SUBJECT,
  FEEDBACK_TO,
  buildFeedbackEmail,
  parseFeedbackPayload,
} from "./feedback";

/** Resend ile Hotmail'e geri bildirim iletir. Netlify Forms kullanılmaz. */
export async function handleFeedbackRequest(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response("Geçersiz istek", { status: 400 });
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.honey === "string" && record.honey.trim()) {
    return Response.json({ ok: true });
  }

  const payload = parseFeedbackPayload(raw);
  if (!payload) {
    return new Response("Eksik veya geçersiz alan", { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response("E-posta yapılandırması eksik", { status: 500 });
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
    return new Response("E-posta gönderilemedi", { status: 502 });
  }

  return Response.json({ ok: true });
}
