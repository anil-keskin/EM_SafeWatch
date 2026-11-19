import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildDialogue, summarizeDialogue } from "@/lib/dialogue";
import type { EquipmentItem, Scenario } from "@/lib/types";

const backup = (file: string) =>
  JSON.parse(readFileSync(join(process.cwd(), "supabase", "yedek", file), "utf-8"));
const scenarios = backup("scenarios.json") as Scenario[];
const equipment = backup("equipment_items.json") as EquipmentItem[];

describe("saha diyaloğu", () => {
  it("yüklenicisi olan her senaryoda en az iki konuşma turu üretir", () => {
    for (const s of scenarios) {
      if (!s.actors?.some((a) => a.type === "yuklenici")) continue;
      expect(buildDialogue(s, equipment).length, s.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("her turda tam olarak bir doğru seçenek vardır ve kimlikler tekildir", () => {
    for (const s of scenarios) {
      const rounds = buildDialogue(s, equipment);
      expect(new Set(rounds.map((r) => r.id)).size).toBe(rounds.length);
      for (const r of rounds) {
        expect(r.options.filter((o) => o.verdict === "dogru").length, `${s.slug}/${r.id}`).toBe(1);
        expect(new Set(r.options.map((o) => o.id)).size).toBe(r.options.length);
      }
    }
  });

  it("işletme personeline talimat seçeneği yetki aşımı sayılır", () => {
    const s = scenarios.find((x) => x.operator_gaps?.length > 0)!;
    const round = buildDialogue(s, equipment).find((r) => r.id === "isletme-yetki")!;
    expect(round.options.find((o) => o.id === "talimat")!.verdict).toBe("yetki");
  });

  it("doğru cevap her senaryoda aynı sırada durmaz", () => {
    const positions = new Set(
      scenarios.map((s) => buildDialogue(s, equipment)[0]?.options.findIndex((o) => o.verdict === "dogru"))
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it("özet doğru sayısını ve cevap metnini taşır", () => {
    const s = scenarios.find((x) => x.slug === "yf-dokum-kanali")!;
    const rounds = buildDialogue(s, equipment);
    const picks = rounds.map((r) => {
      const o = r.options.find((x) => x.verdict === "dogru")!;
      return { roundId: r.id, optionId: o.id, verdict: o.verdict };
    });
    const sum = summarizeDialogue(rounds, picks);
    expect(sum.correct).toBe(rounds.length);
    expect(sum.picks[0].answer.length).toBeGreaterThan(10);
  });
});

describe("saha diyaloğu özeti", () => {
  it("aynı tura gelen ikinci cevabı yok sayar", () => {
    const s = scenarios.find((x) => x.slug === "yf-dokum-kanali")!;
    const rounds = buildDialogue(s, equipment);
    const r = rounds[0];
    const [a, b2] = r.options;
    const sum = summarizeDialogue(rounds, [
      { roundId: r.id, optionId: a.id, verdict: a.verdict },
      { roundId: r.id, optionId: b2.id, verdict: b2.verdict },
    ]);
    expect(sum.picks).toHaveLength(1);
    expect(sum.picks[0].optionId).toBe(a.id);
  });
});
