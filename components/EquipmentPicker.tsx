"use client";

import { useEffect, useMemo, useState } from "react";
import CardHint from "@/components/CardHint";
import EquipmentGlyph from "@/components/EquipmentGlyph";
import FamilyStepper from "@/components/FamilyStepper";
import { IconWatermark } from "@/components/AppIcon";
import SolutionAssist from "@/components/SolutionAssist";
import { TAB_SELECT_CONTEXT, whySelectFor } from "@/content/card-hints";
import {
  SOLUTION_CATEGORY_PENALTY,
  SOLUTION_FULL_PENALTY,
} from "@/lib/scoring";
import { codesInCategory, isExactSolved, isScopeSolved } from "@/lib/solutions";
import { riskLayerFor, riskLayerLabel } from "@/lib/equipment-layers";
import { equipmentGlyph } from "@/lib/icon-theme";
import type { DecisionTab, EquipmentCategory, EquipmentItem } from "@/lib/types";

interface EquipmentPickerProps {
  categories: EquipmentCategory[];
  items: EquipmentItem[];
  selected: string[];
  onToggle: (code: string) => void;
  tab: Exclude<DecisionTab, "action" | "operator">;
  correctCodes: string[];
  /** Kontrollüğün required_self listesi; kızgın zemin botu gibi çift katmanlı kartların etiketini belirler. */
  requiredSelf?: string[];
  usedKeys: Set<string>;
  onFillScope: (categoryId: string) => void;
  onFillAll: () => void;
  disabled?: boolean;
  /** Dışarıdan (karakterin vücuduna tıklanarak) aile seçimi. */
  focusRequest?: { categoryId: string; nonce: number } | null;
  onCategoryChange?: (categoryId: string) => void;
}

const TAB_NOTE: Record<Exclude<DecisionTab, "action" | "operator">, string> = {
  self: "Karta sizin tıklamanız puan düşürmez. Açık ailede TAK o ailenin doğrularını giydirir (−1, aynı aileye tekrar basmak ek kesinti üretmez). HEPSİNİ TAK sekmenin doğrularını yazar ve kesintiyi 8’e tamamlar; TAK toplamına eklenmez.",
  contractor:
    "Karta sizin tıklamanız puan düşürmez. İŞARETLE yüklenicide o ailedeki eksikleri yazar — ona giydirmez (−1). HEPSİNİ İŞARETLE tüm eksikleri yazar ve kesintiyi 8’e tamamlar.",
};

const FILL_LABEL: Record<
  Exclude<DecisionTab, "action" | "operator">,
  { fill: string; fillAll: string }
> = {
  self: { fill: "TAK", fillAll: "HEPSİNİ TAK" },
  contractor: { fill: "İŞARETLE", fillAll: "HEPSİNİ İŞARETLE" },
};

/**
 * Ekipman ve tedbir kartları.
 * (i) düğmesi tanım değil, o sekmede "neden seçmeliyim?" rehberi açar.
 */
export default function EquipmentPicker({
  categories,
  items,
  selected,
  onToggle,
  tab,
  correctCodes,
  requiredSelf,
  usedKeys,
  onFillScope,
  onFillAll,
  disabled = false,
  focusRequest,
  onCategoryChange,
}: EquipmentPickerProps) {
  const sortedCategories = useMemo(
    () => categories.slice().sort((a, b) => a.order_index - b.order_index),
    [categories]
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    () => sortedCategories[0]?.id ?? "all"
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!focusRequest) return;
    if (!sortedCategories.some((c) => c.id === focusRequest.categoryId)) return;
    setActiveCategory(focusRequest.categoryId);
    setQuery("");
    setOpenInfo(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest?.nonce]);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  useEffect(() => {
    setActiveCategory(sortedCategories[0]?.id ?? "all");
    setQuery("");
    setOpenInfo(null);
  }, [tab]);

  useEffect(() => {
    onCategoryChange?.(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const selectedSet = new Set(selected);
  const familyIds = sortedCategories.map((cat) => cat.id);
  const familyIndex = familyIds.indexOf(activeCategory);
  const inFamily = familyIndex >= 0;
  const nextFamily = inFamily ? sortedCategories[familyIndex + 1] : undefined;

  const goNextFamily = () => {
    setOpenInfo(null);
    setActiveCategory((current) => {
      const ids = sortedCategories.map((cat) => cat.id);
      const index = ids.indexOf(current);
      if (index < 0 || index >= ids.length - 1) return current;
      return ids[index + 1];
    });
  };

  const goPrevFamily = () => {
    setOpenInfo(null);
    if (!inFamily) {
      setActiveCategory(familyIds[familyIds.length - 1] ?? "all");
      return;
    }
    if (familyIndex > 0) setActiveCategory(familyIds[familyIndex - 1]);
  };

  // Seçim yapılınca aile değişmez: aynı aileden birden fazla kart seçilebilir,
  // kullanıcı seçimini görür ve "İleri" ile kendisi geçer.
  const handlePick = (code: string) => onToggle(code);
  const scopeCodes =
    activeCategory === "all" ? [] : codesInCategory(items, activeCategory);
  const tabSolved = isExactSolved(selected, correctCodes);
  const scopeSolved =
    activeCategory !== "all" &&
    isScopeSolved(selected, correctCodes, scopeCodes);
  const fillAllUsed = usedKeys.has(`${tab}:all`);
  const fillUsed =
    activeCategory !== "all" &&
    (usedKeys.has(`${tab}:cat:${activeCategory}`) || fillAllUsed);

  const visible = useMemo(() => {
    return items
      .filter((item) => {
        const q = query.trim().toLocaleLowerCase("tr");
        if (q.length > 0) {
          return `${item.name} ${item.standard}`
            .toLocaleLowerCase("tr")
            .includes(q);
        }
        return activeCategory === "all"
          ? true
          : item.category_id === activeCategory;
      })
      .sort((a, b) => a.order_index - b.order_index);
  }, [items, activeCategory, query]);

  return (
    <div className="space-y-3">
      <SolutionAssist
        fillLabel={activeCategory === "all" ? undefined : FILL_LABEL[tab].fill}
        fillAllLabel={FILL_LABEL[tab].fillAll}
        onFill={
          activeCategory === "all"
            ? undefined
            : () => {
                onFillScope(activeCategory);
                goNextFamily();
              }
        }
        onFillAll={() => {
          onFillAll();
          setActiveCategory("all");
          setQuery("");
        }}
        fillDisabled={disabled || scopeSolved}
        fillAllDisabled={disabled || tabSolved}
        fillUsed={fillUsed}
        fillAllUsed={fillAllUsed}
        categoryPenalty={SOLUTION_CATEGORY_PENALTY}
        fullPenalty={SOLUTION_FULL_PENALTY}
        note={TAB_NOTE[tab]}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ekipman ara (örn. baret, gaz, kemer)"
          className="w-full rounded-xl border border-erd-line bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-erd-gray/70 focus:border-erd-red/50"
        />
        {selected.length > 0 && (
          <span className="shrink-0 rounded-lg bg-erd-light px-3 py-2 text-xs font-semibold text-erd-gray">
            {selected.length} seçim
          </span>
        )}
      </div>

      {inFamily && (
        <FamilyStepper
          label={sortedCategories[familyIndex]?.name ?? ""}
          index={familyIndex}
          total={sortedCategories.length}
          nextLabel={nextFamily?.name}
          onPrev={goPrevFamily}
          onNext={goNextFamily}
        />
      )}

      <select
        value={activeCategory}
        onChange={(e) => {
          setActiveCategory(e.target.value);
          setOpenInfo(null);
        }}
        className="w-full rounded-xl border border-erd-line bg-white px-3.5 py-2.5 text-sm text-erd-charcoal outline-none focus:border-erd-red/50"
        aria-label="Koruma ailesi"
      >
        {sortedCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
        <option value="all">Tüm kartlar</option>
      </select>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {visible.map((item) => {
          const isSelected = selectedSet.has(item.code);
          const infoOpen = openInfo === item.code;
          const glyph = equipmentGlyph(item.code, item.category_id);
          const layer = riskLayerLabel(riskLayerFor(item.code, requiredSelf));
          return (
            <div
              key={item.code}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? tab === "contractor"
                    ? "border-erd-red bg-red-50 shadow-[0_8px_20px_-12px_rgba(225,37,27,0.8)]"
                    : "border-emerald-500 bg-emerald-50 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.8)]"
                  : "border-transparent bg-white ring-1 ring-erd-line hover:-translate-y-0.5 hover:shadow-md hover:ring-erd-gray/30"
              }`}
            >
              <IconWatermark icon={glyph.icon} tone={glyph.tone} />
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick(item.code)}
                className="relative flex h-full w-full flex-col items-start gap-2 p-3 pr-9 text-left disabled:opacity-60"
                aria-pressed={isSelected}
              >
                <span className={`transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                  <EquipmentGlyph code={item.code} categoryId={item.category_id} size="md" />
                </span>
                <span className="block text-[13px] font-bold leading-tight text-erd-charcoal">
                  {item.name}
                </span>
                <span className="mt-auto flex flex-wrap gap-1">
                  {item.standard && item.standard !== "—" && (
                    <span className="rounded-md bg-erd-charcoal/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-erd-gray">
                      {item.standard}
                    </span>
                  )}
                  <span className="rounded-md bg-erd-charcoal/5 px-1.5 py-0.5 text-[10px] font-medium text-erd-gray">
                    {layer}
                  </span>
                </span>
              </button>
              {isSelected && (
                <span
                  className={`sw-pop pointer-events-none absolute right-9 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                    tab === "contractor" ? "bg-erd-red" : "bg-emerald-600"
                  }`}
                >
                  {tab === "contractor" ? "! Eksik" : "✓ Takıldı"}
                </span>
              )}
              <div className="absolute right-1.5 top-1.5">
                <CardHint
                  label={item.name}
                  context={TAB_SELECT_CONTEXT[tab]}
                  why={
                    item.why_select?.trim() ||
                    whySelectFor(item.code, item.description)
                  }
                  caution={item.not_for || undefined}
                  open={infoOpen}
                  onToggle={() => setOpenInfo(infoOpen ? null : item.code)}
                  onClose={() => setOpenInfo(null)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="rounded-xl bg-erd-light px-3 py-6 text-center text-sm text-erd-gray">
          Aramanıza uyan ekipman bulunamadı.
        </p>
      )}
    </div>
  );
}
