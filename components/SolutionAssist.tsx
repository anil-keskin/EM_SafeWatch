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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-erd-line bg-erd-light/60 px-3 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">Takıldınız mı?</span>
      <div className="flex flex-wrap gap-2">
        {showFill && (
          <button
            type="button"
            onClick={onFill}
            disabled={fillDisabled || fillUsed}
            className="sw-btn-ghost px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fillUsed ? "Aile çözüldü" : fillLabel}
            {!fillUsed && categoryPenalty > 0 && (
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
          {!fillAllUsed && fullPenalty > 0 && (
            <span className="font-medium text-white/70">−{fullPenalty}</span>
          )}
        </button>
      </div>
      <details className="group ml-auto text-[11px] text-erd-gray">
        <summary className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded-full border border-erd-line bg-white font-bold text-erd-gray hover:text-erd-charcoal" aria-label="Yardım puanı nasıl hesaplanır?">
          ?
        </summary>
        <p className="mt-2 max-w-md leading-snug">{note}</p>
      </details>
    </div>
  );
}
