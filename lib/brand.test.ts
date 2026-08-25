import { describe, expect, it } from "vitest";
import { brandSafeGray, brandWatchRed } from "@/lib/brand";

describe("SafeWatch marka renkleri", () => {
  it("Safe yazısı Erdemir logosu grisini kullanır", () => {
    expect(brandSafeGray).toBe("#5C5A5B");
  });

  it("Watch yazısı Erdemir kırmızısını kullanır", () => {
    expect(brandWatchRed).toBe("#E1251B");
  });
});
