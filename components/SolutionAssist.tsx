"use client";

interface SolutionAssistProps {
  fillLabel?: string;
  fillAllLabel: string;
  onFill?: () => void;
  onFillAll: () => void;
  fillDisabled?: boolean;
  fillAllDisabled?: boolean;
  fillUsed?: boolean;
  fillAllUsed?: boolean;
  categoryPenalty: number;
  fullPenalty: number;
  note: string;
}

/**
 * Takılınca doğru cevabı giydiren çözüm çubuğu.
 * (i) kart rehberinden ve kademeli ipucundan ayrıdır; puan düşürür.
 */
export default function SolutionAssist({
  fillLabel,
  fillAllLabel,
  onFill,
  onFillAll,
  fillDisabled = false,
  fillAllDisabled = false,
  fillUsed = false,
  fillAllUsed = false,
  categoryPenalty,
  fullPenalty,
  note,
}: SolutionAssistProps) {
  const showFill = Boolean(onFill && fillLabel);

  return (
    <div className="rounded-xl border border-erd-line bg-erd-light p-3">
      <p className="text-[11px] leading-snug text-erd-gray">{note}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {showFill && (
          <button
            type="button"
            onClick={onFill}
            disabled={fillDisabled || fillUsed}
            className="sw-btn-ghost px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fillUsed ? "Aile çözüldü" : fillLabel}
            {!fillUsed && (
              <span className="font-medium text-erd-gray">−{categoryPenalty}</span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onFillAll}
          disabled={fillAllDisabled || fillAllUsed}
          className="sw-btn-dark px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fillAllUsed ? "Çözüm uygulandı" : fillAllLabel}
          {!fillAllUsed && (
            <span className="font-medium text-white/70">−{fullPenalty}</span>
          )}
        </button>
      </div>
    </div>
  );
}
