import type { ProgressMap, Scenario } from "@/lib/types";

/**
 * Rozetler.
 *
 * Rozetler kişinin YALNIZCA kendi ilerlemesinden hesaplanır; kişiler arası
 * karşılaştırma veya sıralama yoktur. Hiçbir rozet "kaybedilmez"; kazanılana
 * kadar kilitli görünür ve nasıl açılacağı yazar.
 */

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  /** Rozetin açılması için gereken hedef (ilerleme çubuğu için). */
  target: number;
}

export interface BadgeState extends BadgeDefinition {
  earned: boolean;
  /** Hedefe göre mevcut durum. */
  progress: number;
}

const DEFINITIONS: BadgeDefinition[] = [
  {
    code: "ilk_adim",
    name: "İlk Adım",
    description: "İlk senaryonuzu tamamlayın.",
    target: 1,
  },
  {
    code: "azimli",
    name: "Azimli",
    description: "Üç senaryo tamamlayın.",
    target: 3,
  },
  {
    code: "deneyimli",
    name: "Deneyimli Gözlemci",
    description: "Altı senaryo tamamlayın.",
    target: 6,
  },
  {
    code: "saha_kasifi",
    name: "Saha Kâşifi",
    description: "Üç farklı bölgede senaryo tamamlayın.",
    target: 3,
  },
  {
    code: "teknik_ustalik",
    name: "Teknik Ustalık",
    description: "Bir senaryoda teknik doğruluk puanınız 90 veya üzeri olsun.",
    target: 90,
  },
  {
    code: "yetki_bilinci",
    name: "Yetki Bilinci",
    description:
      "Bir senaryoda kontrollük davranışı puanınız 90 veya üzeri olsun.",
    target: 90,
  },
  {
    code: "cift_kusursuz",
    name: "Çift Kusursuz",
    description: "Aynı senaryoda her iki puanı da 90 ve üzerine çıkarın.",
    target: 90,
  },
  {
    code: "ipucusuz_tur",
    name: "İpucusuz Tur",
    description: "Bir senaryoyu hiç ipucu ve çözüm kullanmadan tamamlayın.",
    target: 1,
  },
  {
    code: "tekrar_eden",
    name: "Tekrarın Gücü",
    description: "Bir senaryoyu en az iki kez oynayın.",
    target: 2,
  },
  {
    code: "tum_cekirdek",
    name: "Çekirdek Program",
    description: "İçeriği hazır olan tüm senaryoları tamamlayın.",
    target: 0, // Çalışma anında hazır senaryo sayısına göre belirlenir.
  },
];

export function evaluateBadges(
  progress: ProgressMap,
  scenarios: Scenario[]
): BadgeState[] {
  const entries = Object.entries(progress);
  const completed = entries.filter(([, e]) => e.status === "tamamlandi");
  const completedSlugs = new Set(completed.map(([slug]) => slug));

  const zonesTouched = new Set(
    scenarios
      .filter((s) => completedSlugs.has(s.slug))
      .map((s) => s.zone_id)
  );

  const bestTechnical = Math.max(
    0,
    ...completed.map(([, e]) => e.best_technical)
  );
  const bestBehavior = Math.max(
    0,
    ...completed.map(([, e]) => e.best_behavior)
  );
  const bestDouble = Math.max(
    0,
    ...completed.map(([, e]) => Math.min(e.best_technical, e.best_behavior))
  );
  const maxAttempts = Math.max(0, ...completed.map(([, e]) => e.attempts));
  const hintFreeRuns = completed.filter(([, e]) => e.hints_used === 0).length;

  const playable = scenarios;
  const playableDone = playable.filter((s) => completedSlugs.has(s.slug)).length;

  const values: Record<string, number> = {
    ilk_adim: completed.length,
    azimli: completed.length,
    deneyimli: completed.length,
    saha_kasifi: zonesTouched.size,
    teknik_ustalik: bestTechnical,
    yetki_bilinci: bestBehavior,
    cift_kusursuz: bestDouble,
    ipucusuz_tur: hintFreeRuns,
    tekrar_eden: maxAttempts,
    tum_cekirdek: playableDone,
  };

  return DEFINITIONS.map((definition) => {
    const target =
      definition.code === "tum_cekirdek"
        ? Math.max(1, playable.length)
        : definition.target;
    const progressValue = values[definition.code] ?? 0;
    return {
      ...definition,
      target,
      progress: Math.min(progressValue, target),
      earned: progressValue >= target,
    };
  });
}

export function earnedCount(badges: BadgeState[]): number {
  return badges.filter((b) => b.earned).length;
}
