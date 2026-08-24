import type { DecisionTab } from "@/lib/types";

/** Karar paneli sekmeleri. Ana sayfa kahraman metni ile aynı metinler. */
export const DECISION_TABS: Array<{
  id: DecisionTab;
  label: string;
  short: string;
}> = [
  { id: "self", label: "Ben ne kullanmalıyım?", short: "Ben" },
  { id: "contractor", label: "Yüklenici ne kullanmalı?", short: "Yüklenici" },
  { id: "operator", label: "İşletmede ne eksik?", short: "İşletme" },
  { id: "action", label: "Nasıl müdahale etmeliyim?", short: "Müdahale" },
];
