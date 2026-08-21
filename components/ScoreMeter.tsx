import { scoreBand } from "@/lib/scoring";

interface ScoreMeterProps {
  label: string;
  hint: string;
  score: number;
}

const TONE_CLASSES = {
  strong: { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  solid: { bar: "bg-erd-red", chip: "bg-red-50 text-erd-red" },
  developing: { bar: "bg-erd-red", chip: "bg-red-50 text-erd-red" },
} as const;

/** İki eksenli puan göstergesi. Geçme/kalma eşiği yoktur. */
export default function ScoreMeter({ label, hint, score }: ScoreMeterProps) {
  const band = scoreBand(score);
  const tone = TONE_CLASSES[band.tone];

  return (
    <div className="sw-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-erd-charcoal">{label}</p>
          <p className="mt-0.5 text-xs leading-snug text-erd-gray">{hint}</p>
        </div>
        <span className={`sw-badge shrink-0 ${tone.chip}`}>{band.label}</span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-3xl font-bold tabular-nums text-erd-charcoal">
          {score}
        </span>
        <span className="pb-1 text-xs font-medium text-erd-gray">/ 100</span>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-erd-line">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${tone.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
