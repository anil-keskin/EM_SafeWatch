"use client";

import { useState } from "react";
import CardHint from "@/components/CardHint";
import FamilyStepper from "@/components/FamilyStepper";
import SolutionAssist from "@/components/SolutionAssist";
import AppIcon, { IconWatermark } from "@/components/AppIcon";
import { ACTIONS } from "@/content/actions";
import { TAB_SELECT_CONTEXT, whySelectFor } from "@/content/card-hints";
import {
  SOLUTION_CATEGORY_PENALTY,
  SOLUTION_FULL_PENALTY,
} from "@/lib/scoring";
import {
  actionCodesInKind,
  isExactSolved,
  isScopeSolved,
} from "@/lib/solutions";
import { actionKindGlyph } from "@/lib/icon-theme";

interface ActionPickerProps {
  selected: string[];
  onToggle: (code: string) => void;
  correctCodes: string[];
  usedKeys: Set<string>;
  onFillScope: (kind: string) => void;
  onFillAll: () => void;
  disabled?: boolean;
}

const KIND_STYLES: Record<string, string> = {
  gozlem: "bg-[#546E7A]/10 text-[#546E7A]",
  durdurma: "bg-[#D32F2F]/10 text-[#D32F2F]",
  bildirim: "bg-[#3D5A80]/10 text-[#3D5A80]",
  kayit: "bg-[#424242]/10 text-[#424242]",
};

const KIND_LABELS: Record<string, string> = {
  gozlem: "Gözlem",
  durdurma: "Durdurma",
  bildirim: "Bildirim",
  kayit: "Kayıt",
};

const KIND_ORDER = ["gozlem", "durdurma", "bildirim", "kayit"] as const;

/** Müdahale sekmesi: birden fazla aksiyon birlikte seçilebilir. */
export default function ActionPicker({
  selected,
  onToggle,
  correctCodes,
  usedKeys,
  onFillScope,
  onFillAll,
  disabled = false,
}: ActionPickerProps) {
  const selectedSet = new Set(selected);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [activeKind, setActiveKind] = useState<string>(KIND_ORDER[0]);

  const kindIndex = KIND_ORDER.indexOf(
    activeKind as (typeof KIND_ORDER)[number]
  );
  const inKind = kindIndex >= 0;
  const nextKind = inKind ? KIND_ORDER[kindIndex + 1] : undefined;

  const goNextKind = () => {
    setOpenInfo(null);
    setActiveKind((current) => {
      const index = KIND_ORDER.indexOf(current as (typeof KIND_ORDER)[number]);
      if (index < 0 || index >= KIND_ORDER.length - 1) return current;
      return KIND_ORDER[index + 1];
    });
  };

  const goPrevKind = () => {
    setOpenInfo(null);
    if (!inKind) {
      setActiveKind(KIND_ORDER[KIND_ORDER.length - 1]);
      return;
    }
    if (kindIndex > 0) setActiveKind(KIND_ORDER[kindIndex - 1]);
  };

  const scopeCodes = activeKind === "all" ? [] : actionCodesInKind(activeKind);
  const tabSolved = isExactSolved(selected, correctCodes);
  const scopeSolved =
    activeKind !== "all" && isScopeSolved(selected, correctCodes, scopeCodes);
  const fillAllUsed = usedKeys.has("action:all");
  const fillUsed =
    activeKind !== "all" &&
    (usedKeys.has(`action:kind:${activeKind}`) || fillAllUsed);

  const visible =
    activeKind === "all"
      ? ACTIONS
      : ACTIONS.filter((action) => action.kind === activeKind);

  return (
    <div className="space-y-3">
      <SolutionAssist
        fillLabel={activeKind === "all" ? undefined : "SEÇ"}
        fillAllLabel="HEPSİNİ SEÇ"
        onFill={
          activeKind === "all"
            ? undefined
            : () => {
                onFillScope(activeKind);
                goNextKind();
              }
        }
        onFillAll={() => {
          onFillAll();
          setActiveKind("all");
        }}
        fillDisabled={disabled || scopeSolved}
        fillAllDisabled={disabled || tabSolved}
        fillUsed={fillUsed}
        fillAllUsed={fillAllUsed}
        categoryPenalty={SOLUTION_CATEGORY_PENALTY}
        fullPenalty={SOLUTION_FULL_PENALTY}
        note="Açık grupta SEÇ o türdeki doğru müdahaleyi işaretler (−1). HEPSİNİ SEÇ tüm doğru adımları yazar ve kesintiyi 8’e tamamlar. Karta sizin tıklamanız puan düşürmez."
      />

      {inKind && (
        <FamilyStepper
          label={KIND_LABELS[activeKind]}
          index={kindIndex}
          total={KIND_ORDER.length}
          nextLabel={nextKind ? KIND_LABELS[nextKind] : undefined}
          onPrev={goPrevKind}
          onNext={goNextKind}
        />
      )}

      <select
        value={activeKind}
        onChange={(e) => {
          setActiveKind(e.target.value);
          setOpenInfo(null);
        }}
        className="w-full rounded-xl border border-erd-line bg-white px-3.5 py-2.5 text-sm text-erd-charcoal outline-none focus:border-erd-red/50"
        aria-label="Müdahale grubu"
      >
        {KIND_ORDER.map((kind) => (
          <option key={kind} value={kind}>
            {KIND_LABELS[kind]}
          </option>
        ))}
        <option value="all">Tüm müdahaleler</option>
      </select>

      <ul className="space-y-2">
        {visible.map((action) => {
          const isSelected = selectedSet.has(action.code);
          const infoOpen = openInfo === action.code;
          return (
            <li
              key={action.code}
              className={`relative overflow-hidden rounded-xl border p-3.5 transition-colors ${
                isSelected
                  ? "border-erd-red bg-red-50/60"
                  : "border-erd-line bg-white hover:border-erd-gray/40"
              }`}
            >
              <IconWatermark
                icon={actionKindGlyph(action.kind).icon}
                tone={actionKindGlyph(action.kind).tone}
              />
              <div className="relative flex items-start gap-3">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(action.code)}
                  aria-pressed={isSelected}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-60"
                >
                  <AppIcon
                    icon={actionKindGlyph(action.kind).icon}
                    tone={actionKindGlyph(action.kind).tone}
                    size="sm"
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-erd-charcoal">
                        {action.label}
                      </span>
                      <span className={`sw-badge ${KIND_STYLES[action.kind]}`}>
                        {KIND_LABELS[action.kind]}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-erd-gray">
                      {action.description}
                    </span>
                  </span>
                </button>
                <CardHint
                  label={action.label}
                  context={TAB_SELECT_CONTEXT.action}
                  why={whySelectFor(action.code)}
                  open={infoOpen}
                  onToggle={() => setOpenInfo(infoOpen ? null : action.code)}
                  onClose={() => setOpenInfo(null)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
