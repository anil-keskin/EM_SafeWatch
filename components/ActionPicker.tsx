"use client";

import { ACTIONS } from "@/content/actions";

interface ActionPickerProps {
  selected: string[];
  onToggle: (code: string) => void;
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

/** Müdahale sekmesi: birden fazla aksiyon birlikte seçilebilir. */
export default function ActionPicker({
  selected,
  onToggle,
  disabled = false,
}: ActionPickerProps) {
  const selectedSet = new Set(selected);

  return (
    <ul className="space-y-2">
      {ACTIONS.map((action) => {
        const isSelected = selectedSet.has(action.code);
        return (
          <li key={action.code}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onToggle(action.code)}
              aria-pressed={isSelected}
              className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors disabled:opacity-60 ${
                isSelected
                  ? "border-erd-red bg-red-50/60"
                  : "border-erd-line bg-white hover:border-erd-gray/40"
              }`}
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
                  <span
                    className={`sw-badge ${KIND_STYLES[action.kind]}`}
                  >
                    {KIND_LABELS[action.kind]}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-snug text-erd-gray">
                  {action.description}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
