"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  tab: Exclude<DecisionTab, "action">;
  correctCodes: string[];
  /** Kontrollüğün required_self listesi; kızgın zemin botu gibi çift katmanlı kartların etiketini belirler. */
  requiredSelf?: string[];
  usedKeys: Set<string>;
  onFillScope: (categoryId: string) => void;
  onFillAll: () => void;
  disabled?: boolean;
}

const TAB_NOTE: Record<Exclude<DecisionTab, "action">, string> = {
  self: "Açık ailede TAK yalnızca o koruma ailesinin doğrularını giydirir. HEPSİNİ TAK tüm sekmenin doğru donanımını yazar. Çözüm puan düşürür.",
  contractor:
    "Açık ailede İŞARETLE, yüklenicide o ailedeki eksikleri yazar — ona giydirmez. HEPSİNİ İŞARETLE tüm eksikleri yazar. Çözüm puan düşürür.",
  operator:
    "Siz işletme personeline KKD giydirmezsiniz. İŞARETLE gördüğünüz eksiği tespit eder. Müdahale yetkisi bildirim sekmesindedir. Çözüm puan düşürür.",
};

const FILL_LABEL: Record<
  Exclude<DecisionTab, "action">,
  { fill: string; fillAll: string }
> = {
  self: { fill: "TAK", fillAll: "HEPSİNİ TAK" },
  contractor: { fill: "İŞARETLE", fillAll: "HEPSİNİ İŞARETLE" },
  operator: { fill: "İŞARETLE", fillAll: "HEPSİNİ İŞARETLE" },
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
}: EquipmentPickerProps) {
  const sortedCategories = useMemo(
    () => categories.slice().sort((a, b) => a.order_index - b.order_index),
    [categories]
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    () => sortedCategories[0]?.id ?? "all"
  );
  const [query, setQuery] = useState("");
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    setActiveCategory(sortedCategories[0]?.id ?? "all");
    setQuery("");
    setOpenInfo(null);
  }, [tab]);

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

  const handlePick = (code: string) => {
    const adding = !selectedSet.has(code);
    onToggle(code);
    if (!adding || !inFamily || query.trim()) return;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(goNextFamily, 280);
  };
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.map((item) => {
          const isSelected = selectedSet.has(item.code);
          const infoOpen = openInfo === item.code;
          const glyph = equipmentGlyph(item.code, item.category_id);
          return (
            <div
              key={item.code}
              className={`relative overflow-hidden rounded-xl border p-2.5 transition-colors ${
                isSelected
                  ? "border-erd-red bg-red-50/60"
                  : "border-erd-line bg-white hover:border-erd-gray/40"
              }`}
            >
              <IconWatermark icon={glyph.icon} tone={glyph.tone} />
              <div className="relative flex items-start gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handlePick(item.code)}
                  className="flex min-w-0 flex-1 items-start gap-2.5 text-left disabled:opacity-60"
                  aria-pressed={isSelected}
                >
                  <EquipmentGlyph
                    code={item.code}
                    categoryId={item.category_id}
                    size="sm"
                  />
                  <span className="min-w-0 pr-0.5">
                    <span className="block text-xs font-semibold leading-snug text-erd-charcoal">
                      {item.name}
                    </span>
                    {item.standard && item.standard !== "—" && (
                      <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-erd-gray">
                        {item.standard}
                      </span>
                    )}
                    <span className="mt-0.5 block text-[10px] font-medium text-erd-gray">
                      {riskLayerLabel(riskLayerFor(item.code, requiredSelf))}
                    </span>
                  </span>
                </button>
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
