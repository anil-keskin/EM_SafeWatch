import { describe, expect, it } from "vitest";
import {
  SCENARIOS,
  TIME_MACHINE_SCENARIOS,
  competencyLabel,
} from "@/content/scenarios";
import { ACTION_BY_CODE } from "@/content/actions";
import { EQUIPMENT_ITEMS } from "@/content/equipment";
import {
  formatDayBefore,
  formatIncidentDate,
  isPublished,
  isTimeMachine,
  riskTags,
  scenarioType,
  timeTravelLabel,
} from "@/lib/incident";
import { emptyScenarioAssist } from "@/lib/assist";
import { evaluateScenario } from "@/lib/scoring";
import { timeMachineScenarios, trainingScenarios } from "@/lib/data";
import type { Scenario, ScenarioAnswers } from "@/lib/types";

const EQUIPMENT_CODES = new Set(EQUIPMENT_ITEMS.map((item) => item.code));

const blank: ScenarioAnswers = {
  hazards: [],
  self: [],
  contractor: [],
  operator: [],
  action: [],
};
const perfect = (s: Scenario): ScenarioAnswers => ({
  hazards: s.hazards.filter((h) => h.is_real).map((h) => h.code),
  self: [...s.required_self],
  contractor: [...s.contractor_gaps],
  operator: [...s.operator_gaps],
  action: [...s.correct_actions],
});
const half = (s: Scenario): ScenarioAnswers => {
  const p = perfect(s);
  const h = <T,>(a: T[]) => a.slice(0, Math.ceil(a.length / 2));
  return {
    hazards: h(p.hazards),
    self: h(p.self),
    contractor: h(p.contractor),
    operator: h(p.operator),
    action: h(p.action),
  };
};
const run = (s: Scenario, a: ScenarioAnswers) =>
  evaluateScenario(s, a, emptyScenarioAssist(), EQUIPMENT_ITEMS);

describe("tarih yardımcıları", () => {
  it("ISO tarihi gg.aa.yyyy olarak biçimler", () => {
    expect(formatIncidentDate("2026-08-21")).toBe("21.08.2026");
    expect(formatIncidentDate("2026-07-18")).toBe("18.07.2026");
  });

  it("olaydan bir gün öncesini hesaplar", () => {
    expect(formatDayBefore("2026-08-21")).toBe("20.08.2026");
    expect(formatDayBefore("2026-07-18")).toBe("17.07.2026");
  });

  it("ay ve yıl sınırını doğru aşar", () => {
    expect(formatDayBefore("2026-08-01")).toBe("31.07.2026");
    expect(formatDayBefore("2026-01-01")).toBe("31.12.2025");
    expect(formatDayBefore("2028-03-01")).toBe("29.02.2028");
  });

  it("buton metnini üretir", () => {
    expect(timeTravelLabel("2026-08-21")).toBe("20.08.2026'ya dön");
    expect(timeTravelLabel("2026-07-18")).toBe("17.07.2026'ya dön");
  });

  it("geçersiz veya eksik tarihte çökmez", () => {
    expect(formatIncidentDate(undefined)).toBe("");
    expect(formatDayBefore("")).toBe("");
    expect(formatDayBefore("bozuk")).toBe("");
    expect(timeTravelLabel(undefined)).toBe("Senaryoya gir");
  });
});

describe("havuz ayrımı", () => {
  it("eğitim havuzu tam 30 senaryodur", () => {
    expect(trainingScenarios(SCENARIOS)).toHaveLength(30);
  });

  it("zaman makinesi havuzu tam 2 senaryodur", () => {
    expect(timeMachineScenarios(SCENARIOS)).toHaveLength(2);
  });

  it("alan taşımayan senaryo eğitim havuzunda sayılır", () => {
    expect(scenarioType({ scenario_type: undefined })).toBe("training");
    expect(isTimeMachine({ scenario_type: undefined })).toBe(false);
  });

  it("zaman makinesi listesi en yeni üstte sıralanır", () => {
    const list = timeMachineScenarios(SCENARIOS);
    expect(list.map((s) => s.slug)).toEqual([
      "tm-kok-gazi-flans-butunlugu",
      "tm-zemin-saci-cokmesi",
    ]);
    expect(list[0].incident_date! > list[1].incident_date!).toBe(true);
  });

  it("is_published=false senaryo hiçbir havuzda ve sayaçta görünmez", () => {
    const hidden: Scenario = {
      ...TIME_MACHINE_SCENARIOS[0],
      slug: "tm-yayinda-degil",
      is_published: false,
    };
    const pool = [...SCENARIOS, hidden].filter(isPublished);
    expect(pool.some((s) => s.slug === "tm-yayinda-degil")).toBe(false);
    expect(trainingScenarios(pool)).toHaveLength(30);
    expect(timeMachineScenarios(pool)).toHaveLength(2);
  });

  it("eğitim senaryolarının hiçbiri olay alanı taşımaz", () => {
    for (const s of trainingScenarios(SCENARIOS)) {
      expect(s.incident_date).toBeUndefined();
      expect(s.incident_outcome).toBeUndefined();
    }
  });
});

describe("zaman makinesi senaryo verisi", () => {
  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s zorunlu alanları taşır",
    (_slug, s) => {
      expect(s.scenario_type).toBe("time_machine");
      expect(s.is_published).toBe(true);
      expect(s.incident_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.incident_unit?.length).toBeGreaterThan(3);
      expect(s.incident_outcome?.length).toBeGreaterThan(40);
      expect(s.incident_lesson?.length).toBeGreaterThan(40);
      expect(s.briefing.gorev?.length).toBeGreaterThan(20);
      expect(s.explanation.length).toBeGreaterThan(200);
      expect(s.hints).toHaveLength(3);
      expect(s.hazards.length).toBeGreaterThanOrEqual(6);
      expect(s.hazards.some((h) => h.is_real)).toBe(true);
      expect(s.hazards.some((h) => !h.is_real)).toBe(true);
      expect(s.actors.length).toBeGreaterThanOrEqual(3);
      expect(s.competency_tags.length).toBeGreaterThanOrEqual(3);
    }
  );

  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s yalnızca mevcut ekipman kodlarını kullanır",
    (_slug, s) => {
      const used = [
        ...s.required_self,
        ...s.forbidden_self,
        ...s.contractor_gaps,
        ...s.operator_gaps,
        ...s.actors.flatMap((a) => [
          ...(a.expected_items ?? []),
          ...(a.current_items ?? []),
        ]),
      ];
      const unknown = used.filter((code) => !EQUIPMENT_CODES.has(code));
      expect(unknown).toEqual([]);
    }
  );

  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s yalnızca mevcut aksiyon kodlarını kullanır",
    (_slug, s) => {
      const unknown = [...s.correct_actions, ...s.wrong_actions].filter(
        (code) => !ACTION_BY_CODE.has(code)
      );
      expect(unknown).toEqual([]);
    }
  );

  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s yetkinlik etiketleri sözlükte tanımlı",
    (_slug, s) => {
      for (const tag of s.competency_tags) {
        expect(competencyLabel(tag)).not.toBe(tag);
      }
    }
  );

  it("beklenen müdahale kümeleri dosyadaki olay tanımıyla eşleşir", () => {
    const [gas, floor] = TIME_MACHINE_SCENARIOS;
    expect(gas.correct_actions).toEqual([
      "durdur_muteahhit",
      "ekibi_cikar",
      "bildir_isletme",
      "izin_kontrol",
      "kayit_al",
    ]);
    expect(gas.wrong_actions).toContain("gozleme_devam");
    expect(floor.correct_actions).toEqual([
      "durdur_muteahhit",
      "izin_kontrol",
      "bildir_firma",
      "kayit_al",
    ]);
    expect(floor.wrong_actions).toContain("gozleme_devam");
  });

  it("kişi adı, sicil numarası veya firma adı içermez", () => {
    const text = JSON.stringify(TIME_MACHINE_SCENARIOS);
    expect(text).not.toMatch(/sicil/i);
    expect(/\b\d{5,}\b/.test(text)).toBe(false);
  });
});

describe("zaman makinesi puanlaması", () => {
  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s tam ağırlıkla puanlanır (technicalMax 75)",
    (_slug, s) => {
      expect(s.contractor_gaps.length).toBeGreaterThan(0);
      const r = run(s, perfect(s));
      expect(r.breakdown?.technicalMax).toBe(75);
      expect(r.breakdown?.contractorMax).toBe(20);
      expect(r.breakdown?.totalMax).toBe(100);
    }
  );

  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s kusursuz / yarım / boş oyunda tutarlı puan üretir",
    (_slug, s) => {
      const good = run(s, perfect(s));
      const mid = run(s, half(s));
      const none = run(s, blank);
      expect(good.technical).toBeGreaterThanOrEqual(85);
      expect(good.behavior).toBeGreaterThanOrEqual(85);
      expect(mid.technical).toBeGreaterThan(0);
      expect(mid.technical).toBeLessThan(good.technical);
      expect(none.technical).toBe(0);
      expect(none.behavior).toBe(0);
    }
  );

  it.each(TIME_MACHINE_SCENARIOS.map((s) => [s.slug, s] as const))(
    "%s gozleme_devam seçimi kontrollük puanını düşürür",
    (_slug, s) => {
      const clean = run(s, perfect(s));
      const sloppy = run(s, {
        ...perfect(s),
        action: [...s.correct_actions, "gozleme_devam"],
      });
      expect(sloppy.behavior).toBeLessThan(clean.behavior);
      expect(sloppy.sections.actions.criticalExtras).toContain(
        "gozleme_devam"
      );
    }
  );

  it("doğru müdahaleler kontrollük puanı kazandırır", () => {
    for (const s of TIME_MACHINE_SCENARIOS) {
      const none = run(s, blank);
      const good = run(s, perfect(s));
      expect(none.behavior).toBe(0);
      expect(good.behavior).toBeGreaterThan(none.behavior);
    }
  });
});

describe("mevcut 30 senaryo regresyonu", () => {
  /**
   * content/scenarios.ts eğitim havuzunun 6 senaryosunu tam içerikle tutar;
   * kalan 24'ü Supabase'den gelir ve yerelde boş şablondur (openScenario).
   * Bu yüzden puan regresyonu yerelde dolu olanlar üzerinden doğrulanır.
   */
  const sample = [
    "yf-dokum-kanali",
    "ch-dokum-platformu",
    "ch-kaynakli-tadilat",
    "gh-saha-incelemesi",
    "yi-iskele-kalite",
    "rg-sahaya-yaklasim",
  ];

  it.each(sample)("%s puanları beklenen bantta kalır", (slug) => {
    const s = SCENARIOS.find((item) => item.slug === slug)!;
    expect(s).toBeDefined();
    expect(isTimeMachine(s)).toBe(false);
    const good = run(s, perfect(s));
    const none = run(s, blank);
    const mid = run(s, half(s));
    expect(good.technical).toBe(100);
    expect(good.behavior).toBe(100);
    expect(none.technical).toBe(0);
    expect(mid.technical).toBeGreaterThan(0);
    expect(mid.technical).toBeLessThan(100);
  });

  it("yerelde içeriği olan her eğitim senaryosunda kusursuz oyun 100 üretir", () => {
    const filled = trainingScenarios(SCENARIOS).filter(
      (s) => s.hazards.length > 0 && s.required_self.length > 0
    );
    expect(filled).toHaveLength(sample.length);
    const weak = filled
      .map((s) => ({ slug: s.slug, r: run(s, perfect(s)) }))
      .filter(({ r }) => r.technical < 85 || r.behavior < 85)
      .map(({ slug, r }) => `${slug}(t=${r.technical},k=${r.behavior})`);
    expect(weak).toEqual([]);
  });

  it("Zaman Makinesi senaryoları eğitim havuzunun ağırlıklarını değiştirmez", () => {
    // Tavan yalnızca "doğru cevabı olmayan bölüm puanlanmaz" kuralına bağlıdır:
    // yüklenici eksiği olan senaryoda 75, olmayanda 55. Yeni havuz bunu etkilemez.
    for (const slug of sample) {
      const s = SCENARIOS.find((item) => item.slug === slug)!;
      const r = run(s, perfect(s));
      const expected = s.contractor_gaps.length > 0 ? 75 : 55;
      expect(r.breakdown?.technicalMax).toBe(expected);
      expect(r.breakdown?.totalMax).toBe(expected + 25);
      expect(r.technical).toBe(100);
    }
  });
});

describe("risk etiketleri", () => {
  it("yetkinlik etiketlerinden en fazla 3 etiket üretir", () => {
    const tags = riskTags(TIME_MACHINE_SCENARIOS[0], competencyLabel);
    expect(tags).toHaveLength(3);
    expect(tags[0]).toBe("Gaz güvenliği ve ölçüm");
  });

  it("yetkinlik etiketi yoksa gerçek tehlikelere düşer", () => {
    const tags = riskTags(
      { competency_tags: [], hazards: TIME_MACHINE_SCENARIOS[1].hazards },
      (c) => c
    );
    expect(tags).toHaveLength(3);
    expect(tags[0]).toBe("Zemin sacında gizli yapısal hasar");
  });
});
