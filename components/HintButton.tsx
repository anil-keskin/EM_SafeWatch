"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, X } from "lucide-react";

/**
 * Her adımda aynı yerde duran ipucu düğmesi. İpuçları kademelidir; her
 * kademenin bedeli açılmadan önce yazılır. İlerlemeyi engellemez.
 */
export default function HintButton({
  hints,
  used,
  onReveal,
  nextPenalty,
}: {
  hints: string[];
  used: number;
  onReveal: () => void;
  nextPenalty: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (hints.length === 0) return null;
  const allRevealed = used >= hints.length;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
          open ? "bg-amber-400 text-black" : "bg-amber-100 text-amber-900 hover:bg-amber-200"
        }`}
      >
        <Lightbulb size={15} className={used === 0 ? "sw-flag" : ""} />
        İpucu
        <span className="rounded-full bg-black/10 px-1.5 tabular-nums">
          {used}/{hints.length}
        </span>
      </button>

      {open && (
        <div className="sw-pop absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-erd-charcoal">
              <Lightbulb size={16} className="text-amber-500" /> İpuçları
            </p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="rounded-full p-1 text-erd-gray hover:bg-erd-light">
              <X size={16} />
            </button>
          </div>

          {used === 0 ? (
            <p className="text-xs leading-relaxed text-erd-gray">
              Takıldığınız yerde ipucu açabilirsiniz. İpuçları adım adım
              netleşir; her biri puanınızdan biraz düşer (−2, −3, −5).
            </p>
          ) : (
            <ol className="max-h-72 space-y-2 overflow-y-auto">
              {hints.slice(0, used).map((hint, i) => (
                <li key={i} className="sw-rise rounded-xl border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-sm leading-snug text-erd-charcoal">
                  <span className="mr-1 font-bold text-amber-700">{i + 1}.</span>
                  {hint}
                </li>
              ))}
            </ol>
          )}

          <button
            type="button"
            onClick={onReveal}
            disabled={allRevealed}
            className="mt-3 w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-black transition-colors hover:bg-amber-300 disabled:bg-erd-light disabled:text-erd-gray"
          >
            {allRevealed
              ? "Tüm ipuçları açık"
              : `${used + 1}. ipucunu aç${nextPenalty > 0 ? ` (−${nextPenalty})` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
