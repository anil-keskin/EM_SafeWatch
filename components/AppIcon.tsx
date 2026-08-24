import type { LucideIcon } from "lucide-react";
import { ICON_TONE, type IconTone } from "@/lib/icon-theme";

type IconSize = "xs" | "sm" | "md" | "lg" | "nav";

const SIZE: Record<IconSize, { box: string; px: number }> = {
  xs: { box: "h-8 w-8 sm:h-7 sm:w-7", px: 16 },
  sm: { box: "h-10 w-10 sm:h-9 sm:w-9", px: 18 },
  md: { box: "h-12 w-12 sm:h-11 sm:w-11", px: 22 },
  lg: { box: "h-14 w-14", px: 28 },
  nav: { box: "h-9 w-9 md:h-8 md:w-8", px: 20 },
};

interface AppIconProps {
  icon: LucideIcon;
  tone?: IconTone;
  size?: IconSize;
  className?: string;
  /** Koyu zemin (üst bar, ilke şeridi). */
  onDark?: boolean;
}

/**
 * MD3'e yakın duotone ikon: düşük opaklıkta dolgu + net kontur,
 * %10 renkli kare kap.
 */
export default function AppIcon({
  icon: Icon,
  tone = "kkd",
  size = "md",
  className = "",
  onDark = false,
}: AppIconProps) {
  const dim = SIZE[size];
  const colors = ICON_TONE[tone];

  if (onDark) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-xl ${dim.box} bg-white/10 text-white ${className}`}
        aria-hidden
      >
        <Icon
          size={dim.px}
          strokeWidth={1.7}
          fill="currentColor"
          fillOpacity={0.5}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl ${dim.box} ${colors.bg} ${colors.fg} ${className}`}
      aria-hidden
    >
      <Icon
        size={dim.px}
        strokeWidth={1.7}
        fill="currentColor"
        fillOpacity={0.52}
      />
    </span>
  );
}

/** Kutulu kap olmadan, satır içi dolu ikon (arama, menü, sekmeler). */
export function FilledIcon({
  icon: Icon,
  tone = "kkd",
  size = 20,
  className = "",
}: {
  icon: LucideIcon;
  tone?: IconTone;
  size?: number;
  className?: string;
}) {
  return (
    <Icon
      aria-hidden
      size={size}
      strokeWidth={1.7}
      fill="currentColor"
      fillOpacity={0.5}
      className={`shrink-0 ${ICON_TONE[tone].fg} ${className}`}
    />
  );
}

/** Kart köşesinde %8 filigran. */
export function IconWatermark({
  icon: Icon,
  tone = "kkd",
  className = "",
}: {
  icon: LucideIcon;
  tone?: IconTone;
  className?: string;
}) {
  const colors = ICON_TONE[tone];
  return (
    <Icon
      aria-hidden
      className={`pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 sm:h-28 sm:w-28 ${colors.wash} ${className}`}
      strokeWidth={1.4}
      fill="currentColor"
      fillOpacity={0.5}
      style={{ opacity: 0.08 }}
    />
  );
}
