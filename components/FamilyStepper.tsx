"use client";

interface FamilyStepperProps {
  label: string;
  index: number;
  total: number;
  nextLabel?: string;
  onPrev: () => void;
  onNext: () => void;
}

/** Bir sekme içindeki koruma ailesi / müdahale grubu adımları. */
export default function FamilyStepper({
  label,
  index,
  total,
  nextLabel,
  onPrev,
  onNext,
}: FamilyStepperProps) {
  const atStart = index <= 0;
  const atEnd = index >= total - 1;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={atStart}
        className="sw-btn-ghost shrink-0 px-3 py-2 text-xs disabled:opacity-40"
      >
        Geri
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-semibold text-erd-charcoal">
          {label}
        </p>
        <p className="text-[11px] font-medium tabular-nums text-erd-gray">
          {Math.min(index + 1, total)} / {total}
        </p>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={atEnd}
        className="sw-btn-primary shrink-0 px-3 py-2 text-xs disabled:opacity-40"
      >
        {atEnd ? "Son adım" : nextLabel ? `İleri · ${nextLabel}` : "İleri"}
      </button>
    </div>
  );
}
