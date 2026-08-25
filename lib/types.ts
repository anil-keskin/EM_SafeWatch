/**
 * SafeWatch veri tipleri.
 * Supabase tabloları ile birebir aynı alan adlarını kullanır; böylece
 * veritabanından gelen kayıtlar dönüştürülmeden kullanılabilir.
 */

/** Sahadaki kişinin bağlı olduğu kuruluş türü. Yetki sınırlarını belirler. */
export type ActorType = "kontrolluk" | "yuklenici" | "isletme";

export interface Zone {
  id: string;
  name: string;
  icon: string;
  description: string;
  order_index: number;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  order_index: number;
}

/** Ortam riski herkes için ortak; işe özel donanım yalnızca işi yapan kişidedir. */
export type RiskLayer = "cevresel" | "ise_ozgu";

export interface EquipmentItem {
  code: string;
  name: string;
  category_id: string;
  standard: string;
  description: string;
  used_by: string;
  not_for: string;
  /** Kart (i) rehberi. Boşsa uygulama yerel card-hints metnini kullanır. */
  why_select?: string;
  /** cevresel = alandaki herkes; ise_ozgu = yalnızca işi fiilen yapan. */
  risk_layer?: RiskLayer;
  icon: string;
  order_index: number;
}

/** Sahnede tıklanabilir risk noktası. x/y yüzde cinsinden konumdur. */
export interface Hazard {
  code: string;
  label: string;
  /** false ise oyuncuyu yanıltmak için konulmuş sahte risk noktasıdır. */
  is_real: boolean;
  x: number;
  y: number;
  explanation: string;
}

export interface Actor {
  type: ActorType;
  employer: string;
  activity: string;
  /** Sadece kontrollük için: yetki sınırlarının açıklaması. */
  authority?: string;
  expected_items?: string[];
  current_items?: string[];
}

export interface Briefing {
  konum?: string;
  gorev?: string;
  isletme_faaliyeti?: string;
  yuklenici_faaliyeti?: string;
  hava?: string;
  is_izni?: string;
  gaz?: string;
  sicaklik?: string;
  yukseklik?: string;
  ozel_not?: string;
}

export interface Scenario {
  slug: string;
  zone_id: string;
  order_index: number;
  title: string;
  is_draft: boolean;
  briefing: Briefing;
  hazards: Hazard[];
  actors: Actor[];
  /** Oyuncunun kendi doğru donanımı (equipment code listesi). */
  required_self: string[];
  /** Bu görev için gereksiz veya yanlış olan seçimler. */
  forbidden_self: string[];
  contractor_gaps: string[];
  operator_gaps: string[];
  correct_actions: string[];
  /** Yetki sınırını aşan veya açıkça hatalı aksiyonlar. */
  wrong_actions: string[];
  hints: string[];
  explanation: string;
  competency_tags: string[];
  /** Supabase'ten geldiyse tablo satırının UUID'si. */
  id?: string;
}

export type ActionKind = "gozlem" | "durdurma" | "bildirim" | "kayit";

export interface ActionOption {
  code: string;
  label: string;
  description: string;
  kind: ActionKind;
}

/** Karar panelindeki dört sekmeden biri. */
export type DecisionTab = "self" | "contractor" | "operator" | "action";

/** Karar panelindeki sekme kimlikleri ile aynı anahtarları kullanır. */
export interface ScenarioAnswers {
  hazards: string[];
  self: string[];
  contractor: string[];
  operator: string[];
  action: string[];
}

export interface SectionResult {
  /** 0–100 yüzde (eski kayıtlar ve rozet uyumu). */
  score: number;
  /** Bölüm ham puanı (yardım kesintisi düşülmüş). */
  rawScore?: number;
  /** Bölümün ham tavanı (tehlike 35, kendi 20, yüklenici 20, müdahale 25). */
  maxScore?: number;
  /** Yardım düşülmeden önceki ham puan. */
  baseScore?: number;
  /** Otomatik yardım kesintisi (yanlış seçimden ayrı). */
  assistPenalty?: number;
  /** Doğru işaretlenenler. */
  hits: string[];
  /** Gözden kaçanlar. */
  misses: string[];
  /** Gereksiz yere işaretlenenler. */
  extras: string[];
  /** Gereksiz seçimler içinde açıkça yanlış / yetki aşımı olanlar. */
  criticalExtras: string[];
}

/** Kartın bu denemede ilk nasıl seçildiği. Sonraki tıklama kaynağı değiştirmez. */
export type SelectionSource = "manual" | "tak_assist" | "all_assist";

export interface RoleAssistState {
  manualSelectedCodes: string[];
  takUsedCategoryIds: string[];
  allAssistUsed: boolean;
  autoAssistPenalty: number;
  provenance: Record<string, SelectionSource>;
}

export interface HazardAssistState {
  hintsUsed: number;
  allAssistUsed: boolean;
}

export interface ScenarioAssistState {
  self: RoleAssistState;
  contractor: RoleAssistState;
  operator: RoleAssistState;
  action: RoleAssistState;
  hazards: HazardAssistState;
}

export interface AssistUsage {
  hintsUsed: number;
  /** Bir aile / müdahale grubu için TAK veya SEÇ. */
  categorySolutions: number;
  /** Sekmenin veya sahnenin tamamı için HEPSİNİ TAK / SEÇ / BELİRLE. */
  fullSolutions: number;
}

export interface ScoreBreakdown {
  riskRaw: number;
  selfRaw: number;
  contractorRaw: number;
  interventionRaw: number;
  totalRaw: number;
  riskAssistPenalty: number;
  selfAssistPenalty: number;
  contractorAssistPenalty: number;
  interventionAssistPenalty: number;
  selfIndirectFull: boolean;
  contractorIndirectFull: boolean;
  actionIndirectFull: boolean;
  behaviorCapped: boolean;
  technicalNotes: string[];
  behaviorNotes: string[];
}

export interface ScenarioResult {
  slug: string;
  technical: number;
  behavior: number;
  hintsUsed: number;
  categorySolutions: number;
  fullSolutions: number;
  hintPenalty: number;
  breakdown?: ScoreBreakdown;
  sections: {
    hazards: SectionResult;
    self: SectionResult;
    contractor: SectionResult;
    operator: SectionResult;
    actions: SectionResult;
  };
  competencyScores: Record<string, number>;
  completedAt: string;
}

export interface ProgressEntry {
  status: "acik" | "tamamlandi";
  best_technical: number;
  best_behavior: number;
  attempts: number;
  hints_used: number;
  updated_at: string;
}

export type ProgressMap = Record<string, ProgressEntry>;
