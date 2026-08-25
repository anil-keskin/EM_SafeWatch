"use client";

import { Lightbulb } from "lucide-react";
import { FilledIcon } from "@/components/AppIcon";

interface HintBoxProps {
  hints: string[];
  used: number;
  onReveal: () => void;
  nextPenalty: number;
}

/**
 * Kademeli ipucu kutusu.
 * 1. kademe −2, 2. kademe ek −3, 3. kademe ek −5. İlerlemeyi engellemez.
 */
export default function HintBox({
  hints,
  used,
  onReveal,
  nextPenalty,
}: HintBoxProps) {
  if (hints.length === 0) return null;
  const allRevealed = used >= hints.length;

  return (
    <div className="sw-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-erd-charcoal">
          <FilledIcon icon={Lightbulb} tone="risk" size={18} />
          İpucu
          <span className="ml-2 text-xs font-medium text-erd-gray">
            {used}/{hints.length} açıldı
          </span>
        </h3>
        <button
          type="button"
          onClick={onReveal}
          disabled={allRevealed}
          className="sw-btn-ghost px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {allRevealed
            ? "Tüm ipuçları açık"
            : nextPenalty > 0
              ? `İpucu Al (−${nextPenalty})`
              : "İpucu Al"}
        </button>
      </div>

      {used === 0 ? (
        <p className="mt-2 text-xs leading-snug text-erd-gray">
          Takıldıysanız ipucu alabilirsiniz. Kademeler tehlike tanıma ham
          puanından 2, sonra 3, sonra 5 puan düşürür (en fazla 10). İlerlemenizi
          engellemez.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {hints.slice(0, used).map((hint, index) => (
            <li
              key={index}
              className="rounded-xl border-l-4 border-erd-red bg-red-50/60 px-3.5 py-2.5 text-sm leading-snug text-erd-charcoal"
            >
              <span className="mr-1.5 font-semibold text-erd-red">
                {index + 1}.
              </span>
              {hint}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
