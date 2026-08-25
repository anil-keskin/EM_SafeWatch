export const FEEDBACK_CATEGORIES = [
  "Hata Bildirimi",
  "İçerik Hatası",
  "Öneri",
  "Diğer",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_TO = "anil.keskin@hotmail.com";
export const FEEDBACK_SUBJECT = "[SafeWatch] Yeni Geri Bildirim";
export const FEEDBACK_ENDPOINT = "/.netlify/functions/send-feedback";

export interface FeedbackPayload {
  category: FeedbackCategory;
  name: string;
  email: string;
  message: string;
}

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(value);
}

export function parseFeedbackPayload(input: unknown): FeedbackPayload | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  const category = typeof data.category === "string" ? data.category.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (!isFeedbackCategory(category)) return null;
  if (message.length < 8) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { category, name, email, message };
}

export function buildFeedbackEmail(
  payload: FeedbackPayload,
  sentAt = new Date()
): string {
  return [
    `Kategori: ${payload.category}`,
    `Kullanıcı: ${payload.name || "Belirtilmedi"}`,
    `E-posta: ${payload.email || "Belirtilmedi"}`,
    `Tarih: ${sentAt.toISOString()}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n");
}

export async function sendFeedback(
  payload: FeedbackPayload,
  honey = ""
): Promise<void> {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, honey }),
  });

  if (!response.ok) {
    throw new Error("Gönderilemedi");
  }
}
