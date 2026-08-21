interface ProgressBarProps {
  value: number;
  total: number;
  label?: string;
  /** İnce sürüm, kart içlerinde kullanılır. */
  compact?: boolean;
}

export default function ProgressBar({
  value,
  total,
  label,
  compact = false,
}: ProgressBarProps) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-erd-charcoal">{label}</span>
          <span className="text-sm font-semibold tabular-nums text-erd-gray">
            {value}/{total}
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-erd-line ${
          compact ? "h-1.5" : "h-2.5"
        }`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-erd-red transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
