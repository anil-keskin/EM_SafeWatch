import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildFieldEvent, resolveFieldEvent } from "@/lib/field-events";
import type { Scenario } from "@/lib/types";

const scenarios = JSON.parse(
  readFileSync(join(process.cwd(), "supabase", "yedek", "scenarios.json"), "utf-8")
) as Scenario[];

describe("anlık saha olayları", () => {
  it("her senaryoya kendi gerçek riskinden bir olay düşer", () => {
    const missing = scenarios.filter((s) => !buildFieldEvent(s)).map((s) => s.slug);
    expect(missing).toEqual([]);
  });

  it("olay her zaman senaryonun gerçek bir riskine bağlıdır", () => {
    for (const s of scenarios) {
      const ev = buildFieldEvent(s)!;
      expect(s.hazards.some((h) => h.code === ev.hazardCode && h.is_real), s.slug).toBe(true);
    }
  });

  it("her olayda tam bir doğru seçenek vardır", () => {
    for (const s of scenarios) {
      const ev = buildFieldEvent(s)!;
      expect(ev.options.filter((o) => o.verdict === "dogru")).toHaveLength(1);
    }
  });

  it("kaynak ışıması olan senaryo izolasyon olayına düşmez", () => {
    const s = scenarios.find((x) => x.hazards.some((h) => h.code === "ark_isimasi"))!;
    expect(buildFieldEvent(s)!.family).not.toBe("enerji");
  });

  it("süre dolarsa gecikme sayılır", () => {
    const ev = buildFieldEvent(scenarios[0])!;
    const r = resolveFieldEvent(ev, null, 15000);
    expect(r.verdict).toBe("gecikme");
  });
});
