import { describe, expect, it } from "vitest";
import { handleFeedbackRequest } from "@/lib/send-feedback-handler";

describe("send-feedback function", () => {
  it("GET isteğini reddeder", async () => {
    const result = await handleFeedbackRequest(
      new Request("https://example.com/api/send-feedback", { method: "GET" })
    );
    expect(result.status).toBe(405);
  });

  it("geçersiz gövdeyi reddeder", async () => {
    const result = await handleFeedbackRequest(
      new Request("https://example.com/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "Öneri", message: "kısa" }),
      })
    );
    expect(result.status).toBe(400);
  });

  it("bal alanı doluysa sessizce 200 döner", async () => {
    const result = await handleFeedbackRequest(
      new Request("https://example.com/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "Öneri",
          name: "",
          email: "",
          message: "Yeterince uzun bir mesaj",
          honey: "bot",
        }),
      })
    );
    expect(result.status).toBe(200);
  });
});
