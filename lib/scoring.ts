import { matchSelectedToCorrect } from "@/lib/equipment-families";
import { taskSpecificExtrasForSelf } from "@/lib/equipment-layers";
import {
  ALL_ASSIST_PENALTY,
  BEHAVIOR_HEAVY_ASSIST_CAP,
  SCORE_MAX,
  TAK_PENALTY,
  actionAssistNote,
  computeRoleAssistPenalty,
  emptyScenarioAssist,
  equipmentAssistNote,
  hazardAssistPenalty,
  heavyAssistShouldCap,
  hintPenaltyTotal,
  requiredActionKinds,
  requiredCategoryIds,
} from "@/lib/assist";
import type {
  EquipmentItem,
  Scenario,
  ScenarioAnswers,
  ScenarioAssistState,
  ScenarioResult,
  ScoreBreakdown,
  SectionResult,
} from "@/lib/types";

/**
 * SafeWatch puanlama motoru.
 *
 * Ham tavan: tehlike 35 + kendi donanım 20 + yüklenici 20 + müdahale 25 = 100.
 * İşletme sekmesi bağımsız puan üretmez; müdahale kararına bağlam sağlar.
 *
 * Teknik bar yalnızca tehlike + kendi + yüklenici (75) üzerinden 0–100'e ölçeklenir.
 * Kontrollük barı müdahale ham puanından (25) üretilir; teknik barın kopyası değildir.
 */

export const HINT_PENALTY_PER_LEVEL = 2;
export const SOLUTION_CATEGORY_PENALTY = TAK_PENALTY;
export const SOLUTION_FULL_PENALTY = ALL_ASSIST_PENALTY;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Bir çoktan seçmeli bölümü 0–100 doğruluk yüzdesi olarak puanlar.
 *
 * @param selected  Oyuncunun işaretledikleri
 * @param correct   Doğru cevap kümesi
 * @param critical  Seçilmesi ağır hata sayılan kodlar (yasak KKD, yetki aşan aksiyon)
 */
export function scoreSection(
  selected: string[],
  correct: string[],
  critical: string[] = []
): SectionResult {
  const { hits, misses, extras } = matchSelectedToCorrect(selected, correct);
  const criticalSet = new Set(critical);
  const criticalExtras = extras.filter((code) => criticalSet.has(code));
  const mildExtras = extras.filter((code) => !criticalSet.has(code));

  let score: number;
  if (correct.length === 0) {
    score = 100 - mildExtras.length * 8 - criticalExtras.length * 16;
  } else {
    const recall = hits.length / correct.length;
    const extraDrop =
      (mildExtras.length * 0.12 + criticalExtras.length * 0.28) /
      Math.max(correct.length, 4);
    score = (recall - extraDrop) * 100;
  }

  const clamped = Math.round(clamp(score, 0, 100));
  return {
    score: clamped,
    rawScore: clamped,
    maxScore: 100,
    baseScore: clamped,
    assistPenalty: 0,
    hits,
    misses,
    extras,
    criticalExtras,
  };
}

export function isScenarioScorable(scenario: Scenario): boolean {
  return (
    Boolean(scenario.briefing?.gorev) ||
    (scenario.hazards?.length ?? 0) > 0 ||
    (scenario.required_self?.length ?? 0) > 0 ||
    (scenario.correct_actions?.length ?? 0) > 0
  );
}

function emptySection(maxScore = 0): SectionResult {
  return {
    score: 0,
    rawScore: 0,
    maxScore,
    baseScore: 0,
    assistPenalty: 0,
    hits: [],
    misses: [],
    extras: [],
    criticalExtras: [],
  };
}

function applyAssistToSection(
  section: SectionResult,
  maxScore: number,
  assistPenalty: number
): SectionResult {
  const baseScore = Math.round((section.score / 100) * maxScore);
  const rawScore = clamp(baseScore - assistPenalty, 0, maxScore);
  const score =
    maxScore <= 0 ? 0 : Math.round((rawScore / maxScore) * 100);
  return {
    ...section,
    score,
    rawScore,
    maxScore,
    baseScore,
    assistPenalty,
  };
}

function emptyBreakdown(): ScoreBreakdown {
  return {
    riskRaw: 0,
    selfRaw: 0,
    contractorRaw: 0,
    interventionRaw: 0,
    totalRaw: 0,
    riskAssistPenalty: 0,
    selfAssistPenalty: 0,
    contractorAssistPenalty: 0,
    interventionAssistPenalty: 0,
    selfIndirectFull: false,
    contractorIndirectFull: false,
    actionIndirectFull: false,
    behaviorCapped: false,
    technicalNotes: [],
    behaviorNotes: [],
  };
}

export function emptyAssist(): ScenarioAssistState {
  return emptyScenarioAssist();
}

export function evaluateScenario(
  scenario: Scenario,
  answers: ScenarioAnswers,
  assist: ScenarioAssistState = emptyScenarioAssist(),
  equipment: EquipmentItem[] = []
): ScenarioResult {
  const completedAt = new Date().toISOString();

  if (!isScenarioScorable(scenario)) {
    return {
      slug: scenario.slug,
      technical: 0,
      behavior: 0,
      hintsUsed: assist.hazards.hintsUsed,
      categorySolutions: 0,
      fullSolutions: 0,
      hintPenalty: 0,
      breakdown: emptyBreakdown(),
      sections: {
        hazards: emptySection(SCORE_MAX.hazards),
        self: emptySection(SCORE_MAX.self),
        contractor: emptySection(SCORE_MAX.contractor),
        operator: emptySection(0),
        actions: emptySection(SCORE_MAX.intervention),
      },
      competencyScores: {},
      completedAt,
    };
  }

  const realHazards = scenario.hazards
    .filter((h) => h.is_real)
    .map((h) => h.code);
  const fakeHazards = scenario.hazards
    .filter((h) => !h.is_real)
    .map((h) => h.code);

  const hazardSection = scoreSection(answers.hazards, realHazards, fakeHazards);
  const selfSection = scoreSection(
    answers.self,
    scenario.required_self,
    [
      ...scenario.forbidden_self,
      ...taskSpecificExtrasForSelf(scenario.required_self),
    ]
  );
  const contractorSection = scoreSection(
    answers.contractor,
    scenario.contractor_gaps
  );
  const operatorSection = scoreSection(
    answers.operator,
    scenario.operator_gaps
  );
  const actionSection = scoreSection(
    answers.action,
    scenario.correct_actions,
    scenario.wrong_actions
  );

  const selfAssist = computeRoleAssistPenalty(
    assist.self,
    answers.self,
    requiredCategoryIds(scenario.required_self, equipment)
  );
  const contractorAssist = computeRoleAssistPenalty(
    assist.contractor,
    answers.contractor,
    requiredCategoryIds(scenario.contractor_gaps, equipment)
  );
  const actionAssist = computeRoleAssistPenalty(
    assist.action,
    answers.action,
    requiredActionKinds(scenario.correct_actions)
  );

  const riskAssistPenalty = hazardAssistPenalty(
    assist.hazards.hintsUsed,
    assist.hazards.allAssistUsed
  );

  const hazards = applyAssistToSection(
    hazardSection,
    SCORE_MAX.hazards,
    riskAssistPenalty
  );
  const self = applyAssistToSection(
    selfSection,
    SCORE_MAX.self,
    selfAssist.penalty
  );
  const contractor = applyAssistToSection(
    contractorSection,
    SCORE_MAX.contractor,
    contractorAssist.penalty
  );
  const operator: SectionResult = {
    ...operatorSection,
    rawScore: 0,
    maxScore: 0,
    baseScore: 0,
    assistPenalty: 0,
    score: 0,
  };
  const actions = applyAssistToSection(
    actionSection,
    SCORE_MAX.intervention,
    actionAssist.penalty
  );

  const riskRaw = hazards.rawScore ?? 0;
  const selfRaw = self.rawScore ?? 0;
  const contractorRaw = contractor.rawScore ?? 0;
  const interventionRaw = actions.rawScore ?? 0;
  const totalRaw = riskRaw + selfRaw + contractorRaw + interventionRaw;

  const technical = Math.round(
    (clamp(riskRaw + selfRaw + contractorRaw, 0, SCORE_MAX.technical) /
      SCORE_MAX.technical) *
      100
  );

  let behavior = Math.round(
    (clamp(interventionRaw, 0, SCORE_MAX.intervention) /
      SCORE_MAX.intervention) *
      100
  );

  const selfPrepUsed =
    selfAssist.penalty > 0 || assist.self.allAssistUsed;
  const contractorPrepUsed =
    contractorAssist.penalty > 0 || assist.contractor.allAssistUsed;
  const prepTabsWithAssist =
    (selfPrepUsed ? 1 : 0) + (contractorPrepUsed ? 1 : 0);
  const hasAutoSolution =
    selfPrepUsed ||
    contractorPrepUsed ||
    actionAssist.penalty > 0 ||
    assist.action.allAssistUsed ||
    assist.hazards.allAssistUsed;

  const behaviorCapped = heavyAssistShouldCap({
    hintsUsed: assist.hazards.hintsUsed,
    hasAutoSolution,
    prepTabsWithAssist,
  });
  if (behaviorCapped) {
    behavior = Math.min(behavior, BEHAVIOR_HEAVY_ASSIST_CAP);
  }

  const technicalNotes = [
    equipmentAssistNote({
      tab: "self",
      takCount: selfAssist.takCount,
      penalty: selfAssist.penalty,
      liveManualCount: selfAssist.liveManual.length,
      allAssistUsed: assist.self.allAssistUsed,
      indirectFullAssist: selfAssist.indirectFullAssist,
    }),
    equipmentAssistNote({
      tab: "contractor",
      takCount: contractorAssist.takCount,
      penalty: contractorAssist.penalty,
      liveManualCount: contractorAssist.liveManual.length,
      allAssistUsed: assist.contractor.allAssistUsed,
      indirectFullAssist: contractorAssist.indirectFullAssist,
    }),
    riskAssistPenalty > 0
      ? riskHelpNote(assist.hazards.hintsUsed, assist.hazards.allAssistUsed, riskAssistPenalty)
      : null,
  ].filter((note): note is string => Boolean(note));

  const behaviorNotes = buildBehaviorNotes({
    actions,
    actionNote: actionAssistNote({
      takCount: actionAssist.takCount,
      penalty: actionAssist.penalty,
      liveManualCount: actionAssist.liveManual.length,
      allAssistUsed: assist.action.allAssistUsed,
      indirectFullAssist: actionAssist.indirectFullAssist,
    }),
    behaviorCapped,
  });

  const breakdown: ScoreBreakdown = {
    riskRaw,
    selfRaw,
    contractorRaw,
    interventionRaw,
    totalRaw,
    riskAssistPenalty,
    selfAssistPenalty: selfAssist.penalty,
    contractorAssistPenalty: contractorAssist.penalty,
    interventionAssistPenalty: actionAssist.penalty,
    selfIndirectFull: selfAssist.indirectFullAssist,
    contractorIndirectFull: contractorAssist.indirectFullAssist,
    actionIndirectFull: actionAssist.indirectFullAssist,
    behaviorCapped,
    technicalNotes,
    behaviorNotes,
  };

  const categorySolutions =
    assist.self.takUsedCategoryIds.length +
    assist.contractor.takUsedCategoryIds.length +
    assist.action.takUsedCategoryIds.length;
  const fullSolutions =
    Number(assist.self.allAssistUsed) +
    Number(assist.contractor.allAssistUsed) +
    Number(assist.action.allAssistUsed) +
    Number(assist.hazards.allAssistUsed) +
    Number(selfAssist.indirectFullAssist) +
    Number(contractorAssist.indirectFullAssist) +
    Number(actionAssist.indirectFullAssist);

  const competencyScores: Record<string, number> = {};
  for (const tag of scenario.competency_tags) {
    competencyScores[tag] = totalRaw;
  }

  return {
    slug: scenario.slug,
    technical,
    behavior,
    hintsUsed: assist.hazards.hintsUsed,
    categorySolutions,
    fullSolutions,
    hintPenalty: riskAssistPenalty,
    breakdown,
    sections: {
      hazards,
      self,
      contractor,
      operator,
      actions,
    },
    competencyScores,
    completedAt,
  };
}

function riskHelpNote(
  hintsUsed: number,
  allAssistUsed: boolean,
  penalty: number
): string {
  const parts: string[] = [];
  if (hintsUsed > 0) {
    parts.push(
      `${hintsUsed} kademeli ipucu (−${hintPenaltyTotal(hintsUsed)})`
    );
  }
  if (allAssistUsed) {
    parts.push("HEPSİNİ BELİRLE otomatik yardımı (−8)");
  }
  return `Tehlike tanımada ${parts.join(" ve ")} kullandınız. Bu bölüme uygulanan yardım etkisi ${penalty} puandır.`;
}

function buildBehaviorNotes(input: {
  actions: SectionResult;
  actionNote: string | null;
  behaviorCapped: boolean;
}): string[] {
  const notes: string[] = [];
  const { actions } = input;
  const hitRate =
    actions.hits.length + actions.misses.length === 0
      ? 1
      : actions.hits.length / (actions.hits.length + actions.misses.length);

  if (hitRate >= 0.99) {
    notes.push("Müdahale doğruluğu: doğru bildirim ve kayıt adımlarını seçtiniz.");
  } else if (actions.hits.length > 0) {
    notes.push(
      "Müdahale doğruluğu: bir kısım doğru adımı seçtiniz; gözden kaçanlar gelişim alanınızdır."
    );
  } else {
    notes.push(
      "Müdahale doğruluğu: bu denemede doğru müdahale adımları henüz seçilmedi."
    );
  }

  if (actions.criticalExtras.length > 0) {
    notes.push(
      "Yetki sınırı: yetkiyi aşan veya bu bağlamda uygun olmayan bir adım seçildi. İşletme personeline doğrudan emir veya durdurma kontrollük yetkisinde değildir."
    );
  } else {
    notes.push("Yetki sınırı: bu denemede yetki aşımı seçilmedi.");
  }

  if (actions.misses.length > 0) {
    notes.push(
      "Kritik karar sırası: bildirim, durdurma veya kayıt adımlarından biri gözden kaçtı. Tespit, doğru kanala iletme ve kayıt birlikte okunur."
    );
  } else {
    notes.push(
      "Kritik karar sırası: seçmeniz gereken müdahale adımları tamamlandı."
    );
  }

  if (input.actionNote) notes.push(input.actionNote);
  if (input.behaviorCapped) {
    notes.push(
      "Yoğun otomatik yardım nedeniyle kontrollük göstergesi 90 ile sınırlanmıştır. Bu bir başarısızlık değil; bağımsız karar alanını güçlendirmek için bir gelişim işaretidir."
    );
  }
  return notes;
}

/** Puanı kurumsal ve teşvik edici bir ifadeye çevirir. Geçti/kaldı yoktur. */
export function scoreBand(score: number): {
  label: string;
  tone: "strong" | "solid" | "developing";
} {
  if (score >= 80) return { label: "Güçlü", tone: "strong" };
  if (score >= 55) return { label: "Yeterli", tone: "solid" };
  return { label: "Gelişime açık", tone: "developing" };
}
