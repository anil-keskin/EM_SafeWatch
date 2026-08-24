import { ClipboardList } from "lucide-react";

interface CircularProgressProps {
  value: number;
  total: number;
  size?: number;
}

/** Dairesel tamamlanma göstergesi. Geçme/kalma eşiği yoktur. */
export default function CircularProgress({
  value,
  total,
  size = 72,
}: CircularProgressProps) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e2e2"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E1251B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[#D32F2F]">
        <ClipboardList size={size * 0.34} strokeWidth={1.7} fill="currentColor" fillOpacity={0.32} />
      </span>
    </div>
  );
}
