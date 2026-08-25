/**
 * Kontrollük yetki sınırı.
 *
 * İşletme personelindeki KKD eksiği tespit edilir, giydirilmez.
 * Yalnızca işletme uygunsuzluğu varsa doğru müdahale bildirim, kendi
 * ekibini çıkarma ve kayıttır. Müteahhit durdurma kartı bu durumda yanlıştır.
 *
 * Yüklenici uygunsuzluğunda durdurma yetkisi geçerlidir; iki gap birden
 * varsa durdurma kartı yüklenici içindir, silinmez.
 */

import type { Scenario } from "@/lib/types";

/** İşletme-only uygunsuzlukta doğru müdahale kümesi. bildir_isg, işletme/İSG bildirim kanalıdır. */
export const OPERATOR_ONLY_ACTIONS = new Set([
  "bildir_isletme",
  "bildir_isg",
  "ekibi_cikar",
  "kayit_al",
]);

const NEVER_FOR_OPERATOR_ONLY = ["durdur_muteahhit", "bildir_firma"] as const;

function unique(codes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const code of codes) {
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

export function applyOperatorAuthority(scenario: Scenario): Scenario {
  const hasOperatorGap = (scenario.operator_gaps?.length ?? 0) > 0;
  const hasContractorGap = (scenario.contractor_gaps?.length ?? 0) > 0;
  if (!hasOperatorGap || hasContractorGap) return scenario;

  const correct = unique(scenario.correct_actions).filter((code) =>
    OPERATOR_ONLY_ACTIONS.has(code)
  );
  const wrong = unique([
    ...scenario.wrong_actions,
    ...NEVER_FOR_OPERATOR_ONLY,
  ]);

  return {
    ...scenario,
    correct_actions: correct,
    wrong_actions: wrong,
  };
}
