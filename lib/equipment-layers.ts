/**
 * Donanımın iki katmanı — ilke, tekil ürüne bağlı değildir.
 *
 * cevresel : Aynı alandaki çevresel riske karşı herkesin ortak kullandığı
 *            koruyucu (gaz, gürültü, ısı, toz, temel saha, görünürlük, Ex).
 * ise_ozgu : Yalnızca o işi fiilen yapan kişide bulunur. Gözlemci takarsa
 *            gereksiz seçimdir.
 *
 * "Kaynak maskesi" ve "alüminize giysi" yalnızca örnek; aynı kural kaynak
 * seti, düşüş durdurma, kimyasal temas, kapalı hacim girişi, su kenarı,
 * ark/sıcak iş ekibi tedbiri ve katalogdaki diğer özel donanımlar için
 * de geçerlidir.
 */

export type RiskLayer = "cevresel" | "ise_ozgu";

/**
 * İşe özel giyilebilir / ekip tedbiri.
 * Anahtar = yapılan iş; değer = o işi yapanın donanımı.
 */
export const TASK_SPECIFIC_BY_JOB: Record<string, readonly string[]> = {
  kaynak: [
    "kaynak_maskesi",
    "eldiven_kaynak",
    "kaynakci_onlugu",
    "kaynak_perdesi",
  ],
  sivi_metal_mudahale: ["aluminize_giysi", "yuz_siperi"],
  yuksekte_calisma: [
    "tam_vucut_kemeri",
    "soklu_lanyard",
    "cift_kancali_lanyard",
    "yatay_yasam_hatti",
  ],
  kapali_hacim_giris: ["temiz_hava_solunum"],
  kimyasal_temas: ["eldiven_kimyasal", "yarim_yuz_maske"],
  su_kenari: ["can_yelegi"],
  tibbi_rontgen: ["kursun_onluk"],
};

const ISE_OZGU = new Set<string>(
  Object.values(TASK_SPECIFIC_BY_JOB).flat()
);

/**
 * Kızgın zemin botu: required_self'te varsa o sahada ortam (herkes yürür);
 * yalnızca müdahale edenin expected'ındaysa işe özeldir.
 */
const DUAL_AREA_OR_TASK = new Set<string>(["cizme_isi_hi3"]);

/**
 * Alana giren herkesin giydiği / taşıdığı çevresel donanım.
 * Alan tedbiri ve formlar (bariyer, gözetmen, izin) burada değildir.
 */
export const ENVIRONMENTAL_WEARABLE = new Set<string>([
  "baret_en397",
  "baret_jugular",
  "baret_en14052",
  "gozluk_en166",
  "gozluk_ir",
  "kacis_maskesi_co",
  "toz_maskesi_ffp3",
  "kulak_tikaci",
  "kulaklik_en352",
  "eldiven_isi",
  "ayakkabi_s3",
  "standart_is_kiyafeti",
  "fr_kiyafet",
  "antistatik_ex_kiyafet",
  "reflektorlu_yelek",
  "gaz_dedektoru_co",
  "gaz_dedektoru_4li",
  "ex_el_feneri",
  "telsiz_atex",
]);

/** Aynı koruma yuvası: aktörde bu yuvadan biri varsa ikinciyi eklemeyiz. */
export const PROTECTION_SLOTS: readonly (readonly string[])[] = [
  ["baret_en397", "baret_jugular", "baret_en14052"],
  ["gozluk_en166", "gozluk_ir", "kaynak_maskesi", "yuz_siperi"],
  ["kulak_tikaci", "kulaklik_en352"],
  ["gaz_dedektoru_co", "gaz_dedektoru_4li"],
  ["ayakkabi_s3", "cizme_isi_hi3"],
  ["kacis_maskesi_co", "temiz_hava_solunum"],
  ["toz_maskesi_ffp3", "yarim_yuz_maske", "temiz_hava_solunum"],
  ["standart_is_kiyafeti", "fr_kiyafet", "aluminize_giysi"],
];

export function riskLayerFor(
  code: string,
  requiredSelf?: readonly string[]
): RiskLayer {
  if (DUAL_AREA_OR_TASK.has(code)) {
    return requiredSelf?.includes(code) ? "cevresel" : "ise_ozgu";
  }
  return ISE_OZGU.has(code) ? "ise_ozgu" : "cevresel";
}

export function isTaskSpecific(code: string): boolean {
  return ISE_OZGU.has(code);
}

export function isEnvironmentalWearable(code: string): boolean {
  return ENVIRONMENTAL_WEARABLE.has(code);
}

export function riskLayerLabel(layer: RiskLayer): string {
  return layer === "ise_ozgu" ? "İşe özel" : "Ortam (ortak)";
}

/**
 * Kontrollük kendi işini yapmıyorsa işe özel kartı seçmesi ağır hatadır.
 * Senaryonun required_self'inde bilinçli duranlar (iskeleye çıkış, yangın
 * gözcüsü kontrolü, kızgın zeminde yürüyüş) bu kümeye girmez.
 */
export function taskSpecificExtrasForSelf(requiredSelf: string[]): string[] {
  const required = new Set(requiredSelf);
  const extras = [...ISE_OZGU].filter((code) => !required.has(code));
  for (const code of DUAL_AREA_OR_TASK) {
    if (!required.has(code) && !extras.includes(code)) extras.push(code);
  }
  return extras;
}
