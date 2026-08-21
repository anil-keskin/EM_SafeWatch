interface ZoneIconProps {
  zoneId: string;
  className?: string;
}

/** Bölge kartlarındaki tematik çizgi ikonlar. Emoji kullanılmaz. */
export default function ZoneIcon({ zoneId, className = "" }: ZoneIconProps) {
  return (
    <span
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-erd-light text-erd-charcoal ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {iconPath(zoneId)}
      </svg>
    </span>
  );
}

function iconPath(zoneId: string) {
  switch (zoneId) {
    case "yuksek_firin":
      return (
        <>
          <path d="M14 42 V22 L20 12 H28 L34 22 V42 Z" />
          <path d="M22 12 V6 H20" className="stroke-erd-red" />
          <path d="M26 12 V8 H28" />
          <path d="M18 28 H30" className="stroke-erd-red" />
        </>
      );
    case "celikhane":
      return (
        <>
          <path d="M12 18 H28 L32 28 H10 Z" />
          <path d="M20 28 L16 40 H24 L20 28 Z" className="stroke-erd-red" />
          <path d="M32 16 H40 V22" />
        </>
      );
    case "kok_fabrikasi":
      return (
        <>
          <rect x="10" y="22" width="28" height="20" />
          <rect x="14" y="10" width="5" height="12" />
          <rect x="22" y="6" width="5" height="16" />
          <rect x="30" y="12" width="5" height="10" />
          <path d="M16 32 H20 M24 32 H28 M32 32 H36" />
        </>
      );
    case "sinter":
      return (
        <>
          <path d="M8 30 H40" />
          <rect x="12" y="24" width="10" height="8" rx="1" />
          <rect x="26" y="22" width="10" height="10" rx="1" />
          <circle cx="16" cy="36" r="3" />
          <circle cx="32" cy="36" r="3" />
          <path d="M22 26 L26 24" className="stroke-erd-red" />
        </>
      );
    case "haddehane":
      return (
        <>
          <circle cx="16" cy="24" r="8" />
          <circle cx="32" cy="24" r="8" />
          <path d="M8 24 H40" className="stroke-erd-red" />
          <path d="M16 16 V10 M32 16 V10" />
        </>
      );
    case "enerji_elektrik":
      return (
        <>
          <path d="M24 6 L24 42" />
          <path d="M14 14 H34 M12 22 H36 M16 30 H32" />
          <path d="M26 18 L22 26 H26 L22 34" className="stroke-erd-red" />
        </>
      );
    case "gaz_hatlari":
      return (
        <>
          <path d="M8 28 H22" />
          <circle cx="28" cy="28" r="6" />
          <path d="M34 28 H42" />
          <path d="M28 16 C26 20 30 20 28 24" className="stroke-erd-red" />
        </>
      );
    case "liman_stok":
      return (
        <>
          <path d="M12 36 H40 L36 28 H16 Z" />
          <path d="M18 18 V36" />
          <path d="M14 18 H36" />
          <path d="M30 18 V26 H34" className="stroke-erd-red" />
        </>
      );
    case "yuksekte_iskele":
      return (
        <>
          <path d="M12 42 V10 H36 V42" />
          <path d="M12 18 H36 M12 28 H36 M12 38 H36" className="stroke-erd-red" />
          <path d="M20 10 V42 M28 10 V42" />
        </>
      );
    case "kapali_alan":
      return (
        <>
          <ellipse cx="24" cy="16" rx="12" ry="5" />
          <path d="M12 16 V36 C12 40 36 40 36 36 V16" />
          <path d="M24 16 V34" />
          <path d="M20 22 H28 M20 28 H28" className="stroke-erd-red" />
        </>
      );
    case "radyografi":
      return (
        <>
          <circle cx="24" cy="24" r="5" className="stroke-erd-red" />
          <path d="M24 8 L28 18 H20 Z" />
          <path d="M38 32 L27 30 L32 40 Z" />
          <path d="M10 32 L16 40 L21 30 Z" />
        </>
      );
    default:
      return <circle cx="24" cy="24" r="10" />;
  }
}
