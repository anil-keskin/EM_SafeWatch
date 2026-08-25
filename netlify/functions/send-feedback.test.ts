import { describe, expect, it } from "vitest";
import { handler } from "@/netlify/functions/send-feedback";

describe("send-feedback function", () => {
  it("GET isteğini reddeder", async () => {
    const result = await handler(
      { httpMethod: "GET" } as never,
      {} as never,
      () => undefined
    );
    expect(result?.statusCode).toBe(405);
  });

  it("geçersiz gövdeyi reddeder", async () => {
    const result = await handler(
      {
        httpMethod: "POST",
        body: JSON.stringify({ category: "Öneri", message: "kısa" }),
      } as never,
      {} as never,
      () => undefined
    );
    expect(result?.statusCode).toBe(400);
  });

  it("bal alanı doluysa sessizce 200 döner", async () => {
    const result = await handler(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          category: "Öneri",
          name: "",
          email: "",
          message: "Yeterince uzun bir mesaj",
          honey: "bot",
        }),
      } as never,
      {} as never,
      () => undefined
    );
    expect(result?.statusCode).toBe(200);
  });
});
