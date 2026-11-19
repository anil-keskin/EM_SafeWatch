import { describe, expect, it } from "vitest";
import { consequenceChain, defenseLayers, stopLayerIndex } from "@/lib/consequences";
import type { Scenario, ScenarioResult, SectionResult } from "@/lib/types";

const sec = (p: Partial<SectionResult> = {}): SectionResult => ({
  score: 0, hits: [], misses: [], extras: [], criticalExtras: [], ...p,
});

const scenario = {
  slug: "t",
  hazards: [{ code: "co", label: "CO birikmesi", is_real: true }],
  required_self: ["baret_en397"],
  contractor_gaps: ["eldiven_isi"],
  correct_actions: ["kayit_al"],
  actors: [],
} as unknown as Scenario;

const result = (s: Partial<ScenarioResult["sections"]>): ScenarioResult =>
  ({
    sections: { hazards: sec(), self: sec(), contractor: sec(), operator: sec(), actions: sec(), ...s },
  }) as ScenarioResult;

describe("savunma katmanları", () => {
  it("ilk sağlam katmanda zincir kesilir", () => {
    const layers = defenseLayers(scenario, result({ hazards: sec({ misses: ["co"] }) }));
    expect(layers.map((l) => l.holes)).toEqual([1, 0, 0, 0]);
    expect(stopLayerIndex(layers)).toBe(1);
  });
  it("tüm katmanlar açıksa olay gerçekleşir", () => {
    const layers = defenseLayers(
      scenario,
      result({
        hazards: sec({ misses: ["co"] }),
        self: sec({ misses: ["baret_en397"] }),
        contractor: sec({ misses: ["eldiven_isi"] }),
        actions: sec({ misses: ["kayit_al"] }),
      })
    );
    expect(stopLayerIndex(layers)).toBe(-1);
  });
  it("kapsam dışı katman zinciri kesmez", () => {
    const noContractor = { ...scenario, contractor_gaps: [] } as Scenario;
    const layers = defenseLayers(
      noContractor,
      result({ hazards: sec({ misses: ["co"] }), self: sec({ misses: ["baret_en397"] }), actions: sec({ misses: ["kayit_al"] }) })
    );
    expect(layers[2].idle).toBe(true);
    expect(stopLayerIndex(layers)).toBe(-1);
  });
  it("kaçırılan yüklenici eksiği sonuç zincirine ailesinin sonucuyla girer", () => {
    const chain = consequenceChain(
      scenario,
      result({ contractor: sec({ misses: ["eldiven_isi"] }) }),
      [{ code: "eldiven_isi", name: "Isıya Dayanıklı Eldiven", category_id: "el" } as never],
      (c) => c
    );
    expect(chain[0].title).toContain("Isıya Dayanıklı Eldiven");
    expect(chain[0].outcome).toContain("el yaralanması");
  });
});
