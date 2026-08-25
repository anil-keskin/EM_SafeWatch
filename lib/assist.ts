import { ACTIONS } from "@/content/actions";
import type {
  DecisionTab,
  EquipmentItem,
  RoleAssistState,
  ScenarioAssistState,
  SelectionSource,
} from "@/lib/types";

/** TAK / İŞARETLE / SEÇ: özgün aile başına ham kesinti. */
export const TAK_PENALTY = 1;
/** HEPSİNİ TAK / İŞARETLE / SEÇ / BELİRLE ve dolaylı tam otomatik çözüm. */
export const ALL_ASSIST_PENALTY = 8;
/** Tehlike tanıma ipucu kademeleri: 1. −2, 2. ek −3, 3. ek −5. */
export const HINT_PENALTIES = [2, 3, 5] as const;
/** İpucu + HEPSİNİ BELİRLE toplamı bu tavanı aşmaz. */
export const RISK_ASSIST_CAP = 15;
export const BEHAVIOR_HEAVY_ASSIST_CAP = 90;

export const SCORE_MAX = {
  hazards: 35,
  self: 20,
  contractor: 20,
  intervention: 25,
  technical: 75,
  total: 100,
} as const;

export function emptyRoleAssist(): RoleAssistState {
  return {
    manualSelectedCodes: [],
    takUsedCategoryIds: [],
    allAssistUsed: false,
    autoAssistPenalty: 0,
    provenance: {},
  };
}

export function emptyScenarioAssist(): ScenarioAssistState {
  return {
    self: emptyRoleAssist(),
    contractor: emptyRoleAssist(),
    operator: emptyRoleAssist(),
    action: emptyRoleAssist(),
    hazards: { hintsUsed: 0, allAssistUsed: false },
  };
}

function unique(codes: string[]): string[] {
  return [...new Set(codes)];
}

function withProvenance(
  current: Record<string, SelectionSource>,
  codes: string[],
  source: SelectionSource
): Record<string, SelectionSource> {
  const next = { ...current };
  for (const code of codes) {
    if (!next[code]) next[code] = source;
  }
  return next;
}

/** Değerlendirme anında hâlâ seçili ve ilk kaynağı manuel olan kartlar. */
export function liveManualCodes(
  state: RoleAssistState,
  selected: string[]
): string[] {
  return selected.filter((code) => state.provenance[code] === "manual");
}

/**
 * Kullanıcı kartına tıkladı. İlk otomatik seçimin kaynağını manuel yapmaz.
 * Çıkarılan kart manuel katkı sayılmaz.
 */
export function applyManualToggle(
  state: RoleAssistState,
  code: string,
  wasSelected: boolean
): RoleAssistState {
  if (!wasSelected) {
    const provenance = state.provenance[code]
      ? state.provenance
      : { ...state.provenance, [code]: "manual" as const };
    const source = provenance[code];
    const manualSelectedCodes =
      source === "manual"
        ? unique([...state.manualSelectedCodes, code])
        : state.manualSelectedCodes;
    return { ...state, provenance, manualSelectedCodes };
  }

  return {
    ...state,
    manualSelectedCodes: state.manualSelectedCodes.filter((item) => item !== code),
  };
}

export function applyTakAssist(
  state: RoleAssistState,
  categoryId: string,
  filledCodes: string[]
): RoleAssistState {
  const takUsedCategoryIds = state.takUsedCategoryIds.includes(categoryId)
    ? state.takUsedCategoryIds
    : [...state.takUsedCategoryIds, categoryId];
  return {
    ...state,
    provenance: withProvenance(state.provenance, filledCodes, "tak_assist"),
    takUsedCategoryIds,
  };
}

export function applyAllAssist(
  state: RoleAssistState,
  correctCodes: string[]
): RoleAssistState {
  if (state.allAssistUsed) return state;
  return {
    ...state,
    provenance: withProvenance(state.provenance, correctCodes, "all_assist"),
    allAssistUsed: true,
  };
}

export function patchRole(
  assist: ScenarioAssistState,
  tab: Exclude<DecisionTab, never>,
  next: RoleAssistState
): ScenarioAssistState {
  if (tab === "self") return { ...assist, self: next };
  if (tab === "contractor") return { ...assist, contractor: next };
  if (tab === "operator") return { ...assist, operator: next };
  return { ...assist, action: next };
}

export function roleOf(
  assist: ScenarioAssistState,
  tab: DecisionTab
): RoleAssistState {
  if (tab === "self") return assist.self;
  if (tab === "contractor") return assist.contractor;
  if (tab === "operator") return assist.operator;
  return assist.action;
}

export function requiredCategoryIds(
  correctCodes: string[],
  items: EquipmentItem[]
): string[] {
  const byCode = new Map(items.map((item) => [item.code, item.category_id]));
  const ids = new Set<string>();
  for (const code of correctCodes) {
    const id = byCode.get(code);
    if (id) ids.add(id);
  }
  return [...ids];
}

export function requiredActionKinds(correctCodes: string[]): string[] {
  const kinds = new Set<string>();
  for (const code of correctCodes) {
    const kind = ACTIONS.find((action) => action.code === code)?.kind;
    if (kind) kinds.add(kind);
  }
  return [...kinds];
}

export function hintPenaltyTotal(hintsUsed: number): number {
  const n = Math.min(Math.max(hintsUsed, 0), HINT_PENALTIES.length);
  let total = 0;
  for (let i = 0; i < n; i++) total += HINT_PENALTIES[i];
  return total;
}

export function nextHintPenalty(hintsUsed: number): number {
  return HINT_PENALTIES[hintsUsed] ?? 0;
}

export function hazardAssistPenalty(
  hintsUsed: number,
  allAssistUsed: boolean
): number {
  const hints = hintPenaltyTotal(hintsUsed);
  const all = allAssistUsed ? ALL_ASSIST_PENALTY : 0;
  return Math.min(hints + all, RISK_ASSIST_CAP);
}

export interface RolePenaltyResult {
  penalty: number;
  indirectFullAssist: boolean;
  liveManual: string[];
  takCount: number;
}

/**
 * Sekme yardım kesintisi.
 * HEPSİNİ TAK, TAK toplamına eklenmez; 8'e tamamlanır.
 * Tüm gerekli aileler TAK ve hiç manuel kart yoksa dolaylı tam çözüm = 8.
 */
export function computeRoleAssistPenalty(
  state: RoleAssistState,
  selected: string[],
  requiredIds: string[]
): RolePenaltyResult {
  const liveManual = liveManualCodes(state, selected);
  const takCount = new Set(state.takUsedCategoryIds).size;
  const takPenalty = takCount * TAK_PENALTY;
  let penalty = state.allAssistUsed
    ? Math.max(takPenalty, ALL_ASSIST_PENALTY)
    : takPenalty;

  const allRequiredAssisted =
    requiredIds.length > 0 &&
    requiredIds.every((id) => state.takUsedCategoryIds.includes(id));

  let indirectFullAssist = false;
  if (allRequiredAssisted && liveManual.length === 0) {
    penalty = ALL_ASSIST_PENALTY;
    indirectFullAssist = !state.allAssistUsed;
  }

  return { penalty, indirectFullAssist, liveManual, takCount };
}

export function equipmentAssistNote(input: {
  tab: "self" | "contractor";
  takCount: number;
  penalty: number;
  liveManualCount: number;
  allAssistUsed: boolean;
  indirectFullAssist: boolean;
}): string | null {
  const { takCount, penalty, liveManualCount, allAssistUsed, indirectFullAssist } =
    input;
  if (penalty <= 0) return null;

  if (indirectFullAssist) {
    return "Tüm koruma ailelerini TAK yardımıyla tamamladığınız için bu bölüm, HEPSİNİ TAK düzeyinde otomatik yardım olarak değerlendirilmiştir.";
  }

  if (liveManualCount > 0 && takCount > 0) {
    const card =
      liveManualCount === 1 ? "Bir ekipmanı" : `${liveManualCount} ekipmanı`;
    return `${card} bağımsız seçtiniz; diğer ${takCount} koruma ailesinde TAK yardımından yararlandınız. Yardım etkisi ${penalty} puandır.`;
  }

  if (allAssistUsed) {
    const verb = input.tab === "self" ? "HEPSİNİ TAK" : "HEPSİNİ İŞARETLE";
    return `Bu bölümde ${verb} yardımını kullandınız. Teknik sonuca ${penalty} puanlık yardım etkisi uygulanmıştır.`;
  }

  if (takCount > 0) {
    const verb = input.tab === "self" ? "TAK" : "İŞARETLE";
    return `Donanım seçiminde ${takCount} koruma ailesinde ${verb} yardımını kullandınız. Teknik sonucunuza ${penalty} puanlık yardım etkisi uygulanmıştır.`;
  }

  return null;
}

export function actionAssistNote(input: {
  takCount: number;
  penalty: number;
  liveManualCount: number;
  allAssistUsed: boolean;
  indirectFullAssist: boolean;
}): string | null {
  const { takCount, penalty, liveManualCount, allAssistUsed, indirectFullAssist } =
    input;
  if (penalty <= 0) return null;
  if (indirectFullAssist) {
    return "Tüm müdahale gruplarını SEÇ yardımıyla tamamladığınız için bu bölüm, HEPSİNİ SEÇ düzeyinde otomatik yardım olarak değerlendirilmiştir.";
  }
  if (liveManualCount > 0 && takCount > 0) {
    return `Müdahale adımlarından ${liveManualCount} tanesini bağımsız seçtiniz; ${takCount} grupta SEÇ yardımından yararlandınız. Yardım etkisi ${penalty} puandır.`;
  }
  if (allAssistUsed) {
    return `Müdahale sekmesinde HEPSİNİ SEÇ yardımını kullandınız. Kontrollük sonucuna ${penalty} puanlık yardım etkisi uygulanmıştır.`;
  }
  if (takCount > 0) {
    return `Müdahale seçiminde ${takCount} grupta SEÇ yardımını kullandınız. Kontrollük sonucuna ${penalty} puanlık yardım etkisi uygulanmıştır.`;
  }
  return null;
}

export function heavyAssistShouldCap(input: {
  hintsUsed: number;
  hasAutoSolution: boolean;
  prepTabsWithAssist: number;
}): boolean {
  if (input.hintsUsed >= 2 && input.hasAutoSolution) return true;
  if (input.prepTabsWithAssist >= 2) return true;
  return false;
}
