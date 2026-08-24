import { matchSelectedToCorrect } from "@/lib/equipment-families";
import type {
  AssistUsage,
  Scenario,
  ScenarioAnswers,
  ScenarioResult,
  SectionResult,
} from "@/lib/types";

/**
 * SafeWatch puanlama motoru.
 *
 * İki ayrı eksen üretir:
 *  - Teknik doğruluk : tehlike tanıma, doğru KKD ailesi (eşdeğer kartlar
 *                      isabet sayılır), gereksiz KKD'den kaçınma, yüklenici
 *                      ve işletme personelindeki eksikleri görme.
 *  - Kontrollük davranışı : doğru kişiye bildirme, gerektiğinde durdurma,
 *                           yetki sınırını aşmama, kayıt tutma.
 *
 * Puan bir geçme/kalma eşiği değil, bir gelişim göstergesidir.
 */

/** Her senaryo ipucu kademesinin düşürdüğü puan. */
export const HINT_PENALTY_PER_LEVEL = 3;
/** Bir aile veya müdahale grubunu giydirme (TAK / SEÇ). */
export const SOLUTION_CATEGORY_PENALTY = 6;
/** Sekmenin veya sahnenin tam çözümünü giydirme. */
export const SOLUTION_FULL_PENALTY = 10;
/** KKD / sahne çözümü kontrollük davranışını daha az etkiler. */
const BEHAVIOR_SOLUTION_FACTOR = 0.4;

export function assistAxisPenalties(
  assist: AssistUsage,
  hintCount: number
): { hints: number; solutions: number; technical: number; behavior: number } {
  const hints =
    Math.min(Math.max(assist.hintsUsed, 0), hintCount) * HINT_PENALTY_PER_LEVEL;
  const solutions =
    Math.max(assist.categorySolutions, 0) * SOLUTION_CATEGORY_PENALTY +
    Math.max(assist.fullSolutions, 0) * SOLUTION_FULL_PENALTY;
  return {
    hints,
    solutions,
    technical: hints + solutions,
    behavior: hints + Math.round(solutions * BEHAVIOR_SOLUTION_FACTOR),
  };
}

export function assistPenalty(assist: AssistUsage, hintCount: number): number {
  return assistAxisPenalties(assist, hintCount).technical;
}

export function emptyAssist(): AssistUsage {
  return { hintsUsed: 0, categorySolutions: 0, fullSolutions: 0 };
}

const TECHNICAL_WEIGHTS = {
  hazards: 0.3,
  self: 0.4,
  contractor: 0.15,
  operator: 0.15,
} as const;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Bir çoktan seçmeli bölümü puanlar.
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

  // İsabetler korunur. Fazlalık, isabeti bire bir silmez; hafif düşürür.
  let score: number;
  if (correct.length === 0) {
    // Doğru cevabın "hiçbiri" olduğu bölümler: boş bırakmak tam puandır.
    score = 100 - mildExtras.length * 8 - criticalExtras.length * 16;
  } else {
    const recall = hits.length / correct.length;
    const extraDrop =
      (mildExtras.length * 0.12 + criticalExtras.length * 0.28) /
      Math.max(correct.length, 4);
    score = (recall - extraDrop) * 100;
  }

  return {
    score: Math.round(clamp(score)),
    hits,
    misses,
    extras,
    criticalExtras,
  };
}

/**
 * Görev metni, tehlike noktası veya doğru cevap kümesi olmayan taslaklar
 * puanlanmaz. Altı dolu senaryonun bölüm boşluğu (ör. işletmede eksik yok)
 * bu kontrolü geçmez; onlar hâlâ puanlanır.
 */
export function isScenarioScorable(scenario: Scenario): boolean {
  return (
    Boolean(scenario.briefing?.gorev) ||
    (scenario.hazards?.length ?? 0) > 0 ||
    (scenario.required_self?.length ?? 0) > 0 ||
    (scenario.correct_actions?.length ?? 0) > 0
  );
}

function emptySection(): SectionResult {
  return { score: 0, hits: [], misses: [], extras: [], criticalExtras: [] };
}

function resultAssist(assist: AssistUsage) {
  return {
    hintsUsed: assist.hintsUsed,
    categorySolutions: assist.categorySolutions,
    fullSolutions: assist.fullSolutions,
  };
}

export function evaluateScenario(
  scenario: Scenario,
  answers: ScenarioAnswers,
  assist: AssistUsage = emptyAssist()
): ScenarioResult {
  if (!isScenarioScorable(scenario)) {
    return {
      slug: scenario.slug,
      technical: 0,
      behavior: 0,
      ...resultAssist(assist),
      hintPenalty: 0,
      sections: {
        hazards: emptySection(),
        self: emptySection(),
        contractor: emptySection(),
        operator: emptySection(),
        actions: emptySection(),
      },
      competencyScores: {},
      completedAt: new Date().toISOString(),
    };
  }

  const realHazards = scenario.hazards
    .filter((h) => h.is_real)
    .map((h) => h.code);
  const fakeHazards = scenario.hazards
    .filter((h) => !h.is_real)
    .map((h) => h.code);

  const sections = {
    hazards: scoreSection(answers.hazards, realHazards, fakeHazards),
    self: scoreSection(
      answers.self,
      scenario.required_self,
      scenario.forbidden_self
    ),
    contractor: scoreSection(answers.contractor, scenario.contractor_gaps),
    operator: scoreSection(answers.operator, scenario.operator_gaps),
    actions: scoreSection(
      answers.action,
      scenario.correct_actions,
      scenario.wrong_actions
    ),
  };

  const penalties = assistAxisPenalties(assist, scenario.hints.length);

  const technicalRaw =
    sections.hazards.score * TECHNICAL_WEIGHTS.hazards +
    sections.self.score * TECHNICAL_WEIGHTS.self +
    sections.contractor.score * TECHNICAL_WEIGHTS.contractor +
    sections.operator.score * TECHNICAL_WEIGHTS.operator;

  const technical = Math.round(clamp(technicalRaw - penalties.technical));
  const behavior = Math.round(
    clamp(sections.actions.score - penalties.behavior)
  );

  // Yetkinlik puanı: senaryonun etiketlerine iki eksenin ortalaması yazılır.
  const overall = Math.round((technical + behavior) / 2);
  const competencyScores: Record<string, number> = {};
  for (const tag of scenario.competency_tags) {
    competencyScores[tag] = overall;
  }

  return {
    slug: scenario.slug,
    technical,
    behavior,
    ...resultAssist(assist),
    hintPenalty: penalties.technical,
    sections,
    competencyScores,
    completedAt: new Date().toISOString(),
  };
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
