import { describe, expect, it } from "vitest";
import {
  FEEDBACK_SUBJECT,
  buildFeedbackBody,
  mailtoFeedbackUrl,
} from "@/lib/feedback";

describe("geri bildirim", () => {
  it("e-posta gövdesinde kategori, kullanıcı, tarih ve mesajı taşır", () => {
    const sentAt = new Date("2026-08-25T12:00:00.000Z");
    const body = buildFeedbackBody(
      {
        category: "İçerik Hatası",
        name: "Anıl",
        email: "a@example.com",
        message: "Sahne metni eksik.",
      },
      sentAt
    );
    expect(body).toContain("Kategori: İçerik Hatası");
    expect(body).toContain("Kullanıcı: Anıl");
    expect(body).toContain("2026-08-25T12:00:00.000Z");
    expect(body).toContain("Sahne metni eksik.");
  });

  it("mailto yedek konusu SafeWatch geri bildirimidir", () => {
    const url = mailtoFeedbackUrl({
      category: "Öneri",
      name: "",
      email: "",
      message: "Daha büyük ikonlar",
    });
    expect(url.startsWith("mailto:ankeskin@erdemir.com.tr")).toBe(true);
    expect(decodeURIComponent(url)).toContain(FEEDBACK_SUBJECT);
  });
});
