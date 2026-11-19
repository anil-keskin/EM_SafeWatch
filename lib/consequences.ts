/**
 * Sonuç zinciri ve savunma katmanları (Reason'ın İsviçre peyniri modeli).
 *
 * Değerlendirme sonucundaki her kaçırılan kalem, o katmanda bir "delik"tir.
 * Bir tehlike ancak tüm katmanlardaki delikler hizalanırsa olaya dönüşür;
 * tek bir sağlam katman zinciri keser. Dil kurumsal ve öğreticidir.
 */

import type { EquipmentItem, Scenario, ScenarioResult } from "@/lib/types";

export type LayerId = "hazards" | "self" | "contractor" | "actions";

export interface DefenseLayer {
  id: LayerId;
  title: string;
  /** Katmandaki açık sayısı (kaçırılan + kritik hatalı seçim). */
  holes: number;
  /** Bu katmanda aranacak bir şey yoktu (puanlanmadı). */
  idle: boolean;
}

export interface ChainLink {
  kind: "kacti" | "onlendi" | "yetki";
  layer: LayerId;
  title: string;
  outcome: string;
}

const LAYER_TITLE: Record<LayerId, string> = {
  hazards: "Tehlike tanıma",
  self: "Kendi hazırlığınız",
  contractor: "Yüklenici denetimi",
  actions: "Müdahale kararı",
};

/** KKD ailesi eksik kaldığında olası sonuç. */
const CATEGORY_OUTCOME: Record<string, string> = {
  bas: "düşen malzeme veya çarpmada baş yaralanması",
  goz: "sıçrama, toz veya radyan ısıyla göz yaralanması",
  solunum: "gaz veya toz solunması; zehirlenme ya da akciğer hasarı",
  isitme: "kalıcı işitme kaybı ve uyarı seslerinin duyulmaması",
  el: "yanık, kesik veya kimyasal temasla el yaralanması",
  ayak: "ezilme ya da sıcak zeminde ayak yanığı",
  govde: "yanık veya sahada görünmez kalma",
  yuksekte: "yüksekten düşme",
  olcum: "görünmeyen gaz veya radyasyonun fark edilmemesi",
  alan: "tehlike alanına yetkisiz ya da korumasız giriş",
  dokuman: "koşulları değişmiş işin izinsiz sürmesi",
};

const ACTION_OUTCOME: Record<string, string> = {
  durdur_muteahhit: "tehlikeli çalışma durmadan sürer",
  bildir_firma: "yüklenici firma uygunsuzluğu öğrenmez ve düzeltmez",
  bildir_isletme: "işletme tarafındaki tehlike sahibine ulaşmaz",
  bildir_isg: "kurumsal İSG birimi riskten habersiz kalır",
  ekibi_cikar: "kendi ekibiniz risk alanında kalır",
  izin_kontrol: "değişen saha koşulları iş iznine yansımaz",
  kayit_al: "uygunsuzluk izlenemez ve tekrar eder",
  gozleme_devam: "gözlem sürekliliği kopar",
};

const ACTION_PREVENTED: Record<string, string> = {
  durdur_muteahhit: "Tehlikeli çalışma zamanında durduruldu.",
  bildir_firma: "Yüklenici firma uygunsuzluktan haberdar edildi.",
  bildir_isletme: "Tehlike, sahibi olan işletmeye iletildi.",
  bildir_isg: "Kurumsal İSG birimi bilgilendirildi.",
  ekibi_cikar: "Kendi ekibiniz risk alanından çıkarıldı.",
  izin_kontrol: "İş izni güncel koşullara göre yeniden kontrol ettirildi.",
  kayit_al: "Uygunsuzluk kayıt altına alındı; izlenebilir.",
  gozleme_devam: "Gözlem kesintisiz sürdü.",
};

export function defenseLayers(scenario: Scenario, result: ScenarioResult): DefenseLayer[] {
  const s = result.sections;
  const layer = (id: LayerId, misses: number, critical: number, idle: boolean): DefenseLayer => ({
    id,
    title: LAYER_TITLE[id],
    holes: idle ? 0 : misses + critical,
    idle,
  });
  return [
    layer("hazards", s.hazards.misses.length, s.hazards.criticalExtras.length, !scenario.hazards.some((h) => h.is_real)),
    layer("self", s.self.misses.length, s.self.criticalExtras.length, scenario.required_self.length === 0),
    layer("contractor", s.contractor.misses.length, 0, scenario.contractor_gaps.length === 0),
    layer("actions", s.actions.misses.length, s.actions.criticalExtras.length, scenario.correct_actions.length === 0),
  ];
}

/** Zincir ilk sağlam (deliksiz, aktif) katmanda kesilir; yoksa olay gerçekleşir. */
export function stopLayerIndex(layers: DefenseLayer[]): number {
  return layers.findIndex((l) => !l.idle && l.holes === 0);
}

export function consequenceChain(
  scenario: Scenario,
  result: ScenarioResult,
  equipment: EquipmentItem[],
  actionLabel: (code: string) => string
): ChainLink[] {
  const byCode = new Map(equipment.map((e) => [e.code, e]));
  const name = (code: string) => byCode.get(code)?.name ?? code;
  const outcomeOf = (code: string) =>
    CATEGORY_OUTCOME[byCode.get(code)?.category_id ?? ""] ?? "korunmasız maruziyet";
  const hazardLabel = (code: string) =>
    scenario.hazards.find((h) => h.code === code)?.label ?? code;
  const s = result.sections;
  const links: ChainLink[] = [];

  for (const code of s.hazards.misses) {
    links.push({
      kind: "kacti",
      layer: "hazards",
      title: `Gözden kaçan risk: ${hazardLabel(code)}`,
      outcome: "Bu risk için tedbir planlanmaz; ekip sahaya hazırlıksız girer.",
    });
  }
  for (const code of s.self.misses) {
    links.push({
      kind: "kacti",
      layer: "self",
      title: `Kendinizde eksik: ${name(code)}`,
      outcome: `Kontrolör olarak siz maruz kalırsınız: ${outcomeOf(code)}.`,
    });
  }
  for (const code of s.contractor.misses) {
    links.push({
      kind: "kacti",
      layer: "contractor",
      title: `Yüklenicide yakalanmayan eksik: ${name(code)}`,
      outcome: `Çalışan işe devam eder; olası sonuç: ${outcomeOf(code)}.`,
    });
  }
  for (const code of s.actions.misses) {
    links.push({
      kind: "kacti",
      layer: "actions",
      title: `Atılmayan adım: ${actionLabel(code)}`,
      outcome: `${(ACTION_OUTCOME[code] ?? "uygunsuzluk sahada kalır").replace(/^./, (c) => c.toLocaleUpperCase("tr"))}.`,
    });
  }
  for (const code of s.actions.criticalExtras) {
    links.push({
      kind: "yetki",
      layer: "actions",
      title: `Hatalı karar: ${actionLabel(code)}`,
      outcome:
        "Yetki sınırı veya durumun gerektirdiği karar aşıldı; sorumluluk karmaşası ve gecikmeye yol açar.",
    });
  }
  for (const p of result.dialogue?.picks ?? []) {
    if (p.verdict === "dogru") continue;
    links.push({
      kind: p.verdict === "yetki" ? "yetki" : "kacti",
      layer: "actions",
      title: `Saha konuşması · ${p.speaker.split(" · ")[0]}`,
      outcome: p.feedback.split(". ").slice(0, 2).join(". ").replace(/\.?$/, "."),
    });
  }
  for (const code of s.actions.hits) {
    links.push({
      kind: "onlendi",
      layer: "actions",
      title: actionLabel(code),
      outcome: ACTION_PREVENTED[code] ?? "Doğru adım atıldı.",
    });
  }
  if (s.contractor.hits.length > 0) {
    links.push({
      kind: "onlendi",
      layer: "contractor",
      title: `Yüklenicide ${s.contractor.hits.length} eksik yakalandı`,
      outcome: s.contractor.hits.map(name).join(", ") + " tamamlatılabilir.",
    });
  }
  return links;
}
