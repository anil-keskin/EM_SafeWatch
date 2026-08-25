import { describe, expect, it } from "vitest";
import {
  applyAllAssist,
  applyManualToggle,
  applyTakAssist,
  computeRoleAssistPenalty,
  emptyRoleAssist,
  emptyScenarioAssist,
  hazardAssistPenalty,
  liveManualCodes,
  requiredCategoryIds,
} from "@/lib/assist";
import { evaluateScenario } from "@/lib/scoring";
import type {
  EquipmentItem,
  Scenario,
  ScenarioAnswers,
  ScenarioAssistState,
} from "@/lib/types";

const CATS = ["bas", "goz", "solunum", "el", "ayak", "govde"] as const;
const SELF_CODES = CATS.map((cat) => `s_${cat}`);

function item(code: string, category_id: string): EquipmentItem {
  return {
    code,
    name: code,
    category_id,
    standard: "EN",
    description: "",
    used_by: "hepsi",
    not_for: "",
    icon: "",
    order_index: 1,
  };
}

const EQUIPMENT: EquipmentItem[] = [
  ...SELF_CODES.map((code, i) => item(code, CATS[i])),
  item("c1", "bas"),
  item("op1", "el"),
];

function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    slug: "test-skor",
    zone_id: "z",
    order_index: 1,
    title: "Test",
    is_draft: false,
    briefing: { gorev: "görev" },
    hazards: [
      { code: "r1", label: "R1", is_real: true, x: 10, y: 10, explanation: "" },
      { code: "fake", label: "Sahte", is_real: false, x: 20, y: 20, explanation: "" },
    ],
    actors: [],
    required_self: [...SELF_CODES],
    forbidden_self: [],
    contractor_gaps: ["c1"],
    operator_gaps: ["op1"],
    correct_actions: ["kayit_al"],
    wrong_actions: ["durdur_muteahhit"],
    hints: ["i1", "i2", "i3"],
    explanation: "",
    competency_tags: ["tag"],
    ...overrides,
  };
}

const EMPTY_ANSWERS: ScenarioAnswers = {
  hazards: [],
  self: [],
  contractor: [],
  operator: [],
  action: [],
};

function takAllSelf(assist: ScenarioAssistState): ScenarioAssistState {
  let self = assist.self;
  for (let i = 0; i < CATS.length; i++) {
    self = applyTakAssist(self, CATS[i], [SELF_CODES[i]]);
  }
  return { ...assist, self };
}

describe("TAK / HEPSİNİ TAK kesintisi", () => {
  it("TEST 1: altı kategoride TAK, manuel seçim yok → kesinti 8, dolaylı HEPSİNİ TAK", () => {
    const required = requiredCategoryIds(SELF_CODES, EQUIPMENT);
    let state = emptyRoleAssist();
    for (let i = 0; i < CATS.length; i++) {
      state = applyTakAssist(state, CATS[i], [SELF_CODES[i]]);
    }
    const result = computeRoleAssistPenalty(state, [...SELF_CODES], required);
    expect(required).toHaveLength(6);
    expect(result.penalty).toBe(8);
    expect(result.indirectFullAssist).toBe(true);
    expect(result.liveManual).toHaveLength(0);
  });

  it("TEST 2: bir doğru kart manuel, kalan beş kategoride TAK → kesinti 5, 8’e yükselmez", () => {
    const required = requiredCategoryIds(SELF_CODES, EQUIPMENT);
    let state = emptyRoleAssist();
    state = applyManualToggle(state, SELF_CODES[0], false);
    for (let i = 1; i < CATS.length; i++) {
      state = applyTakAssist(state, CATS[i], [SELF_CODES[i]]);
    }
    const result = computeRoleAssistPenalty(state, [...SELF_CODES], required);
    expect(result.penalty).toBe(5);
    expect(result.indirectFullAssist).toBe(false);
    expect(result.liveManual).toEqual([SELF_CODES[0]]);
  });

  it("üç TAK sonra HEPSİNİ TAK kesintiyi 8’e tamamlar, 11 yapmaz", () => {
    let state = emptyRoleAssist();
    state = applyTakAssist(state, "bas", ["s_bas"]);
    state = applyTakAssist(state, "goz", ["s_goz"]);
    state = applyTakAssist(state, "solunum", ["s_solunum"]);
    state = applyAllAssist(state, [...SELF_CODES]);
    const result = computeRoleAssistPenalty(state, [...SELF_CODES], CATS.slice());
    expect(result.penalty).toBe(8);
    expect(result.indirectFullAssist).toBe(false);
  });

  it("aynı kategoride TAK tekrar ek kesinti üretmez", () => {
    let state = emptyRoleAssist();
    state = applyTakAssist(state, "bas", ["s_bas"]);
    state = applyTakAssist(state, "bas", ["s_bas"]);
    const result = computeRoleAssistPenalty(state, ["s_bas"], ["bas", "goz"]);
    expect(result.penalty).toBe(1);
    expect(result.takCount).toBe(1);
  });

  it("manuel kart seçimi sabit yardım kesintisi üretmez", () => {
    let state = emptyRoleAssist();
    state = applyManualToggle(state, "s_bas", false);
    const result = computeRoleAssistPenalty(state, ["s_bas"], ["bas"]);
    expect(result.penalty).toBe(0);
  });

  it("HEPSİNİ TAK tekrar basmak ek kesinti üretmez", () => {
    let state = emptyRoleAssist();
    state = applyAllAssist(state, [...SELF_CODES]);
    state = applyAllAssist(state, [...SELF_CODES]);
    const result = computeRoleAssistPenalty(state, [...SELF_CODES], CATS.slice());
    expect(result.penalty).toBe(8);
  });

  it("TAK ile seçilmiş karta sonradan tıklamak kaynağı manual yapmaz", () => {
    let state = emptyRoleAssist();
    state = applyTakAssist(state, "bas", ["s_bas"]);
    state = applyManualToggle(state, "s_bas", true);
    state = applyManualToggle(state, "s_bas", false);
    expect(state.provenance.s_bas).toBe("tak_assist");
    expect(liveManualCodes(state, ["s_bas"])).toEqual([]);
  });

  it("manuel kart çıkarılırsa dolaylı 8 kuralı yeniden uygulanır", () => {
    const required = requiredCategoryIds(SELF_CODES, EQUIPMENT);
    let state = emptyRoleAssist();
    state = applyManualToggle(state, SELF_CODES[0], false);
    for (let i = 0; i < CATS.length; i++) {
      state = applyTakAssist(state, CATS[i], [SELF_CODES[i]]);
    }
    const withCard = computeRoleAssistPenalty(state, [...SELF_CODES], required);
    expect(withCard.penalty).toBe(6);
    expect(withCard.indirectFullAssist).toBe(false);

    state = applyManualToggle(state, SELF_CODES[0], true);
    const afterRemove = computeRoleAssistPenalty(
      state,
      SELF_CODES.slice(1),
      required
    );
    expect(afterRemove.liveManual).toHaveLength(0);
    expect(afterRemove.penalty).toBe(8);
    expect(afterRemove.indirectFullAssist).toBe(true);
  });
});

describe("risk ipucu ve HEPSİNİ BELİRLE", () => {
  it("üç ipucu toplamı 10, HEPSİNİ BELİRLE +8, tavan 15", () => {
    expect(hazardAssistPenalty(1, false)).toBe(2);
    expect(hazardAssistPenalty(2, false)).toBe(5);
    expect(hazardAssistPenalty(3, false)).toBe(10);
    expect(hazardAssistPenalty(3, true)).toBe(15);
    expect(hazardAssistPenalty(0, true)).toBe(8);
  });
});

describe("evaluateScenario puan dağılımı", () => {
  it("işletme sekmesi teknik bara girmez", () => {
    const scenario = makeScenario();
    const baseAnswers: ScenarioAnswers = {
      ...EMPTY_ANSWERS,
      hazards: ["r1"],
      self: [...SELF_CODES],
      contractor: ["c1"],
      action: ["kayit_al"],
    };
    const withoutOp = evaluateScenario(
      scenario,
      baseAnswers,
      emptyScenarioAssist(),
      EQUIPMENT
    );
    const withOp = evaluateScenario(
      scenario,
      { ...baseAnswers, operator: ["op1"] },
      emptyScenarioAssist(),
      EQUIPMENT
    );
    expect(withoutOp.technical).toBe(withOp.technical);
    expect(withoutOp.sections.operator.maxScore).toBe(0);
    expect(withOp.breakdown?.totalRaw).toBe(100);
  });

  it("teknik ve kontrollük barları bağımsızdır", () => {
    const scenario = makeScenario();
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, action: ["kayit_al"] },
      emptyScenarioAssist(),
      EQUIPMENT
    );
    expect(result.technical).toBeLessThan(40);
    expect(result.behavior).toBe(100);
    expect(result.technical).not.toBe(result.behavior);
  });

  it("TEST 1 entegrasyon: altı TAK, manuel yok → self kesinti 8 ve dolaylı bayrak", () => {
    const scenario = makeScenario();
    const assist = takAllSelf(emptyScenarioAssist());
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, self: [...SELF_CODES] },
      assist,
      EQUIPMENT
    );
    expect(result.breakdown?.selfAssistPenalty).toBe(8);
    expect(result.breakdown?.selfIndirectFull).toBe(true);
    expect(result.sections.self.baseScore).toBe(20);
    expect(result.sections.self.rawScore).toBe(12);
    expect(result.breakdown?.technicalNotes.some((n) => n.includes("HEPSİNİ TAK düzeyinde"))).toBe(
      true
    );
  });

  it("TEST 2 entegrasyon: bir manuel + beş TAK → kesinti 5", () => {
    const scenario = makeScenario();
    let assist = emptyScenarioAssist();
    assist = {
      ...assist,
      self: applyManualToggle(assist.self, SELF_CODES[0], false),
    };
    for (let i = 1; i < CATS.length; i++) {
      assist = {
        ...assist,
        self: applyTakAssist(assist.self, CATS[i], [SELF_CODES[i]]),
      };
    }
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, self: [...SELF_CODES] },
      assist,
      EQUIPMENT
    );
    expect(result.breakdown?.selfAssistPenalty).toBe(5);
    expect(result.breakdown?.selfIndirectFull).toBe(false);
    expect(result.sections.self.rawScore).toBe(15);
    expect(
      result.breakdown?.technicalNotes.some((n) => n.includes("Yardım etkisi 5 puandır"))
    ).toBe(true);
  });

  it("doğruluk 18 ve yardım 5 ise ham puan 13 olur", () => {
    const extra = ["s_isitme", "s_yuksekte", "s_olcum", "s_alan"];
    const allSelf = [...SELF_CODES, ...extra];
    const equipment = [
      ...EQUIPMENT,
      item("s_isitme", "isitme"),
      item("s_yuksekte", "yuksekte"),
      item("s_olcum", "olcum"),
      item("s_alan", "alan"),
    ];
    const scenario = makeScenario({ required_self: allSelf });
    let assist = emptyScenarioAssist();
    assist = {
      ...assist,
      self: applyManualToggle(assist.self, SELF_CODES[0], false),
    };
    for (let i = 1; i <= 5; i++) {
      assist = {
        ...assist,
        self: applyTakAssist(assist.self, CATS[i], [SELF_CODES[i]]),
      };
    }
    const selected = allSelf.filter((code) => code !== extra[3]);
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, self: selected },
      assist,
      equipment
    );
    expect(result.sections.self.baseScore).toBe(18);
    expect(result.breakdown?.selfAssistPenalty).toBe(5);
    expect(result.sections.self.rawScore).toBe(13);
  });

  it("en az iki ipucu ve bir otomatik çözümde kontrollük en fazla 90 olur", () => {
    const scenario = makeScenario();
    const assist = takAllSelf({
      ...emptyScenarioAssist(),
      hazards: { hintsUsed: 2, allAssistUsed: false },
    });
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, action: ["kayit_al"], self: [...SELF_CODES] },
      assist,
      EQUIPMENT
    );
    expect(result.behavior).toBe(90);
    expect(result.breakdown?.behaviorCapped).toBe(true);
  });

  it("iki hazırlık sekmesinde otomatik çözüm kontrollüğü 90 ile sınırlar", () => {
    const scenario = makeScenario();
    let assist = takAllSelf(emptyScenarioAssist());
    assist = {
      ...assist,
      contractor: applyTakAssist(assist.contractor, "bas", ["c1"]),
    };
    const result = evaluateScenario(
      scenario,
      {
        ...EMPTY_ANSWERS,
        self: [...SELF_CODES],
        contractor: ["c1"],
        action: ["kayit_al"],
      },
      assist,
      EQUIPMENT
    );
    expect(result.behavior).toBe(90);
    expect(result.breakdown?.behaviorCapped).toBe(true);
  });

  it("yalnızca birinci seviye tek ipucu üst sınırı uygulamaz", () => {
    const scenario = makeScenario();
    const assist: ScenarioAssistState = {
      ...emptyScenarioAssist(),
      hazards: { hintsUsed: 1, allAssistUsed: false },
    };
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, action: ["kayit_al"] },
      assist,
      EQUIPMENT
    );
    expect(result.breakdown?.behaviorCapped).toBe(false);
    expect(result.behavior).toBe(100);
  });

  it("HEPSİNİ BELİRLE risk kesintisini 8 uygular ve ipucu ile tavan 15’tir", () => {
    const scenario = makeScenario();
    const assist: ScenarioAssistState = {
      ...emptyScenarioAssist(),
      hazards: { hintsUsed: 3, allAssistUsed: true },
    };
    const result = evaluateScenario(
      scenario,
      { ...EMPTY_ANSWERS, hazards: ["r1"] },
      assist,
      EQUIPMENT
    );
    expect(result.breakdown?.riskAssistPenalty).toBe(15);
    expect(result.sections.hazards.baseScore).toBe(35);
    expect(result.sections.hazards.rawScore).toBe(20);
  });
});
