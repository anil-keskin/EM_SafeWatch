export const FEEDBACK_CATEGORIES = [
  "Hata Bildirimi",
  "İçerik Hatası",
  "Öneri",
  "Diğer",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_TO = "ankeskin@erdemir.com.tr";
export const FEEDBACK_SUBJECT = "[SafeWatch] Yeni Geri Bildirim";

export interface FeedbackPayload {
  category: FeedbackCategory;
  name: string;
  email: string;
  message: string;
}

function escapeMailto(value: string): string {
  return encodeURIComponent(value);
}

export function buildFeedbackBody(payload: FeedbackPayload, sentAt: Date): string {
  const user = payload.name.trim() || "Belirtilmedi";
  const mail = payload.email.trim() || "Belirtilmedi";
  return [
    `Kategori: ${payload.category}`,
    `Kullanıcı: ${user}`,
    `E-posta: ${mail}`,
    `Tarih: ${sentAt.toISOString()}`,
    "",
    "Mesaj:",
    payload.message.trim(),
  ].join("\n");
}

export function mailtoFeedbackUrl(payload: FeedbackPayload, sentAt = new Date()): string {
  const body = buildFeedbackBody(payload, sentAt);
  return `mailto:${FEEDBACK_TO}?subject=${escapeMailto(FEEDBACK_SUBJECT)}&body=${escapeMailto(body)}`;
}

/**
 * Statik GitHub Pages'te API rotası olmadığı için FormSubmit kullanılır.
 * İlk gönderimde alıcı adresinin e-postadan onay vermesi gerekebilir.
 */
export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const sentAt = new Date();
  const body = {
    _subject: FEEDBACK_SUBJECT,
    _template: "table",
    _captcha: "false",
    Kategori: payload.category,
    Kullanıcı: payload.name.trim() || "Belirtilmedi",
    "E-posta": payload.email.trim() || "Belirtilmedi",
    Tarih: sentAt.toISOString(),
    Mesaj: payload.message.trim(),
  };

  const response = await fetch(
    `https://formsubmit.co/ajax/${FEEDBACK_TO}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Gönderilemedi");
  }
}
