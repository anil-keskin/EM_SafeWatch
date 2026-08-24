"use client";

import { useState } from "react";
import CardHint from "@/components/CardHint";
import SolutionAssist from "@/components/SolutionAssist";
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
  gozlem: "bg-erd-light text-erd-gray",
  durdurma: "bg-red-50 text-erd-red",
  bildirim: "bg-blue-50 text-blue-700",
  kayit: "bg-emerald-50 text-emerald-700",
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
  const [activeKind, setActiveKind] = useState<string>("all");

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
        onFill={activeKind === "all" ? undefined : () => onFillScope(activeKind)}
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
        note="Açık grupta SEÇ o türdeki doğru müdahaleyi işaretler. HEPSİNİ SEÇ tüm doğru adımları yazar. Çözüm puan düşürür."
      />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <KindChip
          label="Tümü"
          active={activeKind === "all"}
          onClick={() => setActiveKind("all")}
        />
        {KIND_ORDER.map((kind) => (
          <KindChip
            key={kind}
            label={KIND_LABELS[kind]}
            active={activeKind === kind}
            onClick={() => setActiveKind(kind)}
          />
        ))}
      </div>

      <ul className="space-y-2">
        {visible.map((action) => {
          const isSelected = selectedSet.has(action.code);
          const infoOpen = openInfo === action.code;
          return (
            <li
              key={action.code}
              className={`rounded-xl border p-3.5 transition-colors ${
                isSelected
                  ? "border-erd-red bg-red-50/60"
                  : "border-erd-line bg-white hover:border-erd-gray/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(action.code)}
                  aria-pressed={isSelected}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-60"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${
                      isSelected
                        ? "border-erd-red bg-erd-red text-white"
                        : "border-erd-line text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
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

function KindChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-erd-charcoal text-white"
          : "bg-erd-light text-erd-gray hover:bg-erd-line"
      }`}
    >
      {label}
    </button>
  );
}
