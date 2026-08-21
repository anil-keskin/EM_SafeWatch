interface SceneBackdropProps {
  zoneId: string;
}

/**
 * Senaryo sahnesinin arka planı.
 *
 * Fotoğraf yerine bölgeye göre renklenen soyut bir endüstriyel siluet çizer;
 * böylece uygulama harici görsel dosyasına ihtiyaç duymadan çalışır.
 * Sahne dekoratiftir, tehlike noktaları üzerine ayrıca yerleştirilir.
 */

const ZONE_TONES: Record<string, { sky: [string, string]; accent: string }> = {
  yuksek_firin: { sky: ["#3a2018", "#7c3a1d"], accent: "#E1251B" },
  celikhane: { sky: ["#3a1c16", "#8a3a1a"], accent: "#E1251B" },
  gaz_hatlari: { sky: ["#16232e", "#33566b"], accent: "#E1251B" },
  yuksekte_iskele: { sky: ["#1d2a33", "#4a6a7d"], accent: "#E1251B" },
  radyografi: { sky: ["#241f2e", "#4c4160"], accent: "#E1251B" },
  haddehane: { sky: ["#241d1a", "#5e4436"], accent: "#E1251B" },
  kok_fabrikasi: { sky: ["#2a231b", "#6a5334"], accent: "#E1251B" },
  sinter: { sky: ["#262421", "#5c564c"], accent: "#E1251B" },
  enerji_elektrik: { sky: ["#1b2130", "#3f4c6b"], accent: "#E1251B" },
  liman_stok: { sky: ["#16242c", "#376073"], accent: "#E1251B" },
  kapali_alan: { sky: ["#212429", "#4a5159"], accent: "#E1251B" },
};

const DEFAULT_TONE = { sky: ["#242a30", "#4c5761"], accent: "#E1251B" };

export default function SceneBackdrop({ zoneId }: SceneBackdropProps) {
  const tone = ZONE_TONES[zoneId] ?? DEFAULT_TONE;
  const gradientId = `sw-sky-${zoneId}`;
  const glowId = `sw-glow-${zoneId}`;

  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone.sky[0]} />
          <stop offset="100%" stopColor={tone.sky[1]} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor={tone.accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={tone.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="250" fill={`url(#${gradientId})`} />
      <rect width="400" height="250" fill={`url(#${glowId})`} />

      {/* Uzak tesis silueti */}
      <g fill="#000" opacity="0.28">
        <rect x="8" y="96" width="34" height="120" />
        <rect x="46" y="118" width="22" height="98" />
        <rect x="120" y="84" width="18" height="132" />
        <rect x="146" y="106" width="46" height="110" />
        <rect x="236" y="92" width="26" height="124" />
        <rect x="268" y="120" width="52" height="96" />
        <rect x="332" y="100" width="30" height="116" />
        <rect x="366" y="130" width="26" height="86" />
      </g>

      {/* Bacalar ve kuleler */}
      <g fill="#000" opacity="0.38">
        <rect x="86" y="40" width="14" height="176" />
        <rect x="80" y="34" width="26" height="10" />
        <rect x="206" y="56" width="12" height="160" />
        <rect x="200" y="50" width="24" height="9" />
        <rect x="300" y="66" width="10" height="150" />
      </g>

      {/* Boru köprüsü */}
      <g stroke="#000" strokeOpacity="0.35" strokeWidth="4" fill="none">
        <line x1="0" y1="150" x2="400" y2="150" />
        <line x1="0" y1="160" x2="400" y2="160" />
        <line x1="60" y1="150" x2="60" y2="216" strokeWidth="5" />
        <line x1="180" y1="150" x2="180" y2="216" strokeWidth="5" />
        <line x1="300" y1="150" x2="300" y2="216" strokeWidth="5" />
      </g>

      {/* Zemin */}
      <rect x="0" y="214" width="400" height="36" fill="#000" opacity="0.55" />
      <g stroke={tone.accent} strokeOpacity="0.28" strokeWidth="2">
        <line x1="0" y1="222" x2="400" y2="222" />
      </g>
    </svg>
  );
}
