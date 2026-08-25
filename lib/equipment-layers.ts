/**
 * Donanımın iki katmanı.
 *
 * cevresel : Aynı alandaki çevresel riske karşı herkesin ortak kullandığı
 *            koruyucu (gaz, gürültü, radyan ısı, toz, temel saha seti).
 * ise_ozgu : Yalnızca o işi fiilen yapan kişide bulunur. Gözlemci takarsa
 *            gereksiz seçimdir.
 */

export type RiskLayer = "cevresel" | "ise_ozgu";

const ISE_OZGU = new Set<string>([
  "kaynak_maskesi",
  "eldiven_kaynak",
  "kaynakci_onlugu",
  "aluminize_giysi",
  "yuz_siperi",
  "cizme_isi_hi3",
  "tam_vucut_kemeri",
  "soklu_lanyard",
  "cift_kancali_lanyard",
  "yatay_yasam_hatti",
  "temiz_hava_solunum",
  "eldiven_kimyasal",
  "can_yelegi",
]);

export function riskLayerFor(code: string): RiskLayer {
  return ISE_OZGU.has(code) ? "ise_ozgu" : "cevresel";
}

export function isTaskSpecific(code: string): boolean {
  return ISE_OZGU.has(code);
}

export function riskLayerLabel(layer: RiskLayer): string {
  return layer === "ise_ozgu" ? "İşe özel" : "Ortam (ortak)";
}

/**
 * Kontrollük kendi işini yapmıyorsa işe özel kartı seçmesi ağır hatadır.
 * Senaryonun required_self'inde bilinçli duranlar (ör. iskeleye çıkılacaksa
 * kemer) bu kümeye girmez.
 */
export function taskSpecificExtrasForSelf(requiredSelf: string[]): string[] {
  const required = new Set(requiredSelf);
  return [...ISE_OZGU].filter((code) => !required.has(code));
}
