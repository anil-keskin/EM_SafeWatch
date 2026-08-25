import { describe, expect, it } from "vitest";
import {
  FEEDBACK_TO,
  buildFeedbackEmail,
  formatFeedbackDate,
  parseFeedbackPayload,
} from "@/lib/feedback";

describe("geri bildirim", () => {
  it("e-posta gövdesinde kategori, ad soyad, tarih ve mesajı taşır", () => {
    const sentAt = new Date("2026-08-25T12:00:00.000Z");
    const body = buildFeedbackEmail(
      {
        category: "İçerik Hatası",
        name: "Anıl",
        email: "a@example.com",
        message: "Sahne metni eksik.",
      },
      sentAt
    );
    expect(body).toBe(
      [
        "Kategori:",
        "İçerik Hatası",
        "",
        "Ad Soyad:",
        "Anıl",
        "",
        "E-posta:",
        "a@example.com",
        "",
        "Tarih:",
        formatFeedbackDate(sentAt),
        "",
        "Mesaj:",
        "Sahne metni eksik.",
      ].join("\n")
    );
  });

  it("alıcı Hotmail adresidir", () => {
    expect(FEEDBACK_TO).toBe("anil.keskin@hotmail.com");
  });

  it("kısa mesajı ve geçersiz kategoriyi reddeder", () => {
    expect(
      parseFeedbackPayload({
        category: "Öneri",
        name: "",
        email: "",
        message: "kısa",
      })
    ).toBeNull();
    expect(
      parseFeedbackPayload({
        category: "Yok",
        name: "",
        email: "",
        message: "Yeterince uzun bir mesaj",
      })
    ).toBeNull();
    expect(
      parseFeedbackPayload({
        category: "Öneri",
        name: "Anıl",
        email: "",
        message: "Yeterince uzun bir mesaj",
      })
    ).toMatchObject({ category: "Öneri", name: "Anıl" });
  });
});
