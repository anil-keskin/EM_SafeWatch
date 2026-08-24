"use client";

import { useMemo, useState } from "react";
import CardHint from "@/components/CardHint";
import EquipmentGlyph from "@/components/EquipmentGlyph";
import { FilledIcon, IconWatermark } from "@/components/AppIcon";
import SolutionAssist from "@/components/SolutionAssist";
import { TAB_SELECT_CONTEXT, whySelectFor } from "@/content/card-hints";
import {
  SOLUTION_CATEGORY_PENALTY,
  SOLUTION_FULL_PENALTY,
} from "@/lib/scoring";
import { codesInCategory, isExactSolved, isScopeSolved } from "@/lib/solutions";
import { categoryGlyph, categoryTone, equipmentGlyph } from "@/lib/icon-theme";
import type { DecisionTab, EquipmentCategory, EquipmentItem } from "@/lib/types";

interface EquipmentPickerProps {
  categories: EquipmentCategory[];
  items: EquipmentItem[];
  selected: string[];
  onToggle: (code: string) => void;
  tab: Exclude<DecisionTab, "action">;
  correctCodes: string[];
  usedKeys: Set<string>;
  onFillScope: (categoryId: string) => void;
  onFillAll: () => void;
  disabled?: boolean;
}

const TAB_NOTE: Record<Exclude<DecisionTab, "action">, string> = {
  self: "Açık ailede TAK yalnızca o koruma ailesinin doğrularını giydirir. HEPSİNİ TAK tüm sekmenin doğru donanımını yazar. Çözüm puan düşürür.",
  contractor:
    "Açık ailede TAK, yüklenicide o ailedeki eksikleri işaretler. HEPSİNİ TAK tüm eksikleri yazar. Çözüm puan düşürür.",
  operator:
    "Açık ailede TAK, işletmede o ailedeki uygunsuzlukları işaretler. HEPSİNİ TAK tüm eksikleri yazar. Çözüm puan düşürür.",
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
  usedKeys,
  onFillScope,
  onFillAll,
  disabled = false,
}: EquipmentPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const selectedSet = new Set(selected);
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
    const q = query.trim().toLocaleLowerCase("tr");
    return items
      .filter((item) =>
        activeCategory === "all" ? true : item.category_id === activeCategory
      )
      .filter((item) =>
        q.length === 0
          ? true
          : `${item.name} ${item.standard}`.toLocaleLowerCase("tr").includes(q)
      )
      .sort((a, b) => a.order_index - b.order_index);
  }, [items, activeCategory, query]);

  return (
    <div className="space-y-3">
      <SolutionAssist
        fillLabel={activeCategory === "all" ? undefined : "TAK"}
        fillAllLabel="HEPSİNİ TAK"
        onFill={
          activeCategory === "all"
            ? undefined
            : () => onFillScope(activeCategory)
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

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <CategoryChip
          label="Tümü"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {categories
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.name}
              categoryId={cat.id}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
      </div>

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
                  onClick={() => onToggle(item.code)}
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

function CategoryChip({
  label,
  categoryId,
  active,
  onClick,
}: {
  label: string;
  categoryId?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-erd-charcoal text-white"
          : "bg-erd-light text-erd-gray hover:bg-erd-line"
      }`}
    >
      {categoryId && (
        <FilledIcon
          icon={categoryGlyph(categoryId)}
          tone={active ? "kkd" : categoryTone(categoryId)}
          size={14}
          className={active ? "!text-white" : ""}
        />
      )}
      {label}
    </button>
  );
}
