import { ACTIONS } from "@/content/actions";
import type {
  DecisionTab,
  EquipmentItem,
  Scenario,
} from "@/lib/types";

/**
 * Çözüm asistanı.
 *
 * TAK / SEÇ: açık olan aile veya müdahale grubundaki doğru kalemleri giydirir.
 * HEPSİNİ TAK / SEÇ / BELİRLE: o sekmenin veya sahnenin tam doğru kümesini yazar.
 * Yanlış seçimler o kapsamda temizlenir; böylece "çözüm" gerçekten doğru cevaptır.
 */

export function correctCodesForTab(
  scenario: Scenario,
  tab: DecisionTab
): string[] {
  switch (tab) {
    case "self":
      return scenario.required_self;
    case "contractor":
      return scenario.contractor_gaps;
    case "operator":
      return scenario.operator_gaps;
    case "action":
      return scenario.correct_actions;
  }
}

export function realHazardCodes(scenario: Scenario): string[] {
  return scenario.hazards.filter((h) => h.is_real).map((h) => h.code);
}

export function codesInCategory(
  items: EquipmentItem[],
  categoryId: string
): string[] {
  return items.filter((item) => item.category_id === categoryId).map((i) => i.code);
}

export function actionCodesInKind(kind: string): string[] {
  return ACTIONS.filter((action) => action.kind === kind).map((a) => a.code);
}

/** Kapsamdaki seçimi tam doğru kümeye çevirir; diğer aileler olduğu gibi kalır. */
export function fillScope(
  selected: string[],
  correct: string[],
  scopeCodes: string[]
): string[] {
  const scope = new Set(scopeCodes);
  const kept = selected.filter((code) => !scope.has(code));
  const added = correct.filter((code) => scope.has(code));
  return [...kept, ...added];
}

export function fillExact(correct: string[]): string[] {
  return [...correct];
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((code) => set.has(code));
}

export function isScopeSolved(
  selected: string[],
  correct: string[],
  scopeCodes: string[]
): boolean {
  const scope = new Set(scopeCodes);
  const selectedInScope = selected.filter((code) => scope.has(code));
  const correctInScope = correct.filter((code) => scope.has(code));
  return sameSet(selectedInScope, correctInScope);
}

export function isExactSolved(selected: string[], correct: string[]): boolean {
  return sameSet(selected, correct);
}

export function tallySolutions(keys: Iterable<string>): {
  categorySolutions: number;
  fullSolutions: number;
} {
  let categorySolutions = 0;
  let fullSolutions = 0;
  for (const key of keys) {
    if (key.includes(":cat:") || key.includes(":kind:")) categorySolutions += 1;
    else if (key.endsWith(":all")) fullSolutions += 1;
  }
  return { categorySolutions, fullSolutions };
}
