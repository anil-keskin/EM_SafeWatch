"use client";

import { useEffect, useState } from "react";
import { scoreBand } from "@/lib/scoring";

interface ScoreMeterProps {
  label: string;
  hint: string;
  score: number;
}

const TONE = {
  strong: { stroke: "#10b981", chip: "bg-emerald-50 text-emerald-700" },
  solid: { stroke: "#E1251B", chip: "bg-red-50 text-erd-red" },
  developing: { stroke: "#f59e0b", chip: "bg-amber-50 text-amber-700" },
} as const;

/** Puanı 0'dan hedefe sayar; hareket azaltma açıksa doğrudan gösterir. */
function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

/** İki eksenli puan göstergesi. Geçme/kalma eşiği yoktur. */
export default function ScoreMeter({ label, hint, score }: ScoreMeterProps) {
  const band = scoreBand(score);
  const tone = TONE[band.tone];
  const shown = useCountUp(score);
  const r = 42;
  const circ = 2 * Math.PI * r;

  return (
    <div className="sw-card sw-rise flex items-center gap-4 p-4">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#ececec" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={tone.stroke}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - shown / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tabular-nums text-erd-charcoal" aria-label={`${score} / 100`}>
            {shown}
          </span>
          <span className="-mt-1 text-[10px] font-medium text-erd-gray">/ 100</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-erd-charcoal">{label}</p>
        <p className="mt-0.5 text-xs leading-snug text-erd-gray">{hint}</p>
        <span
          className={`sw-badge sw-pop mt-2 inline-block ${tone.chip}`}
          style={{ animationDelay: "900ms" }}
        >
          {band.label}
        </span>
      </div>
    </div>
  );
}
