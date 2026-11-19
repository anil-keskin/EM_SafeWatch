/**
 * Ana sayfa sahnesi: gece vardiyasında hareketli bir demir-çelik tesisi.
 * Tamamen SVG + CSS; harici görsel yok. Animasyonlar `prefers-reduced-motion`
 * açıkken durur (globals.css).
 */
export default function PlantHero() {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMaxYMax slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ph-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070b14" />
          <stop offset="55%" stopColor="#1a1420" />
          <stop offset="100%" stopColor="#4a1d10" />
        </linearGradient>
        <radialGradient id="ph-glow" cx="30%" cy="85%" r="45%">
          <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ph-glow2" cx="78%" cy="70%" r="30%">
          <stop offset="0%" stopColor="#ffb347" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ph-molten" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="45%" stopColor="#ffb020" />
          <stop offset="100%" stopColor="#e1251b" />
        </linearGradient>
        <radialGradient id="ph-smoke" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9aa3ad" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9aa3ad" stopOpacity="0" />
        </radialGradient>
        <pattern id="ph-stripe" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="24" fill="#facc15" />
          <rect x="12" width="12" height="24" fill="#111" />
        </pattern>
      </defs>

      <rect width="1200" height="420" fill="url(#ph-sky)" />
      <rect width="1200" height="420" fill="url(#ph-glow)" className="ph-flicker" />
      <rect width="1200" height="420" fill="url(#ph-glow2)" />

      {/* Yıldızlar */}
      <g fill="#fff">
        {[
          [80, 40], [190, 70], [420, 30], [560, 64], [700, 26], [930, 50], [1080, 34], [1150, 90], [260, 22],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} className="ph-twinkle" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>

      <g transform="translate(395 70) scale(0.77)">
      {/* Uzak silüet */}
      <g fill="#161b26" opacity="0.9">
        <path d="M0 300 L0 230 L60 230 L60 200 L110 200 L110 250 L170 250 L170 215 L215 215 L215 300 Z" />
        <path d="M980 300 L980 225 L1030 225 L1030 190 L1060 190 L1060 240 L1130 240 L1130 205 L1200 205 L1200 300 Z" />
        <rect x="520" y="235" width="90" height="65" />
        <rect x="600" y="210" width="16" height="90" />
      </g>

      {/* Bacalar + duman */}
      <g>
        <rect x="815" y="110" width="22" height="200" fill="#252c39" />
        <rect x="868" y="140" width="18" height="170" fill="#252c39" />
        <rect x="815" y="128" width="22" height="6" fill="#e1251b" opacity="0.7" />
        <rect x="815" y="150" width="22" height="6" fill="#fff" opacity="0.25" />
        <circle cx="826" cy="106" r="2.5" fill="#ff3b30" className="ph-blink" />
        <circle cx="877" cy="136" r="2.2" fill="#ff3b30" className="ph-blink" style={{ animationDelay: "0.8s" }} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={`a${i}`} cx="826" cy="100" r="22" fill="url(#ph-smoke)" className="ph-smoke" style={{ animationDelay: `${i * -2.2}s` }} />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={`b${i}`} cx="877" cy="130" r="18" fill="url(#ph-smoke)" className="ph-smoke" style={{ animationDelay: `${i * -2.9 - 1}s` }} />
        ))}
      </g>

      {/* Yüksek fırın */}
      <g fill="#2a3240" stroke="#465266" strokeWidth="2">
        {/* sobalar */}
        <rect x="150" y="170" width="44" height="140" rx="4" />
        <path d="M150 172 Q172 140 194 172 Z" />
        <rect x="200" y="160" width="44" height="150" rx="4" />
        <path d="M200 162 Q222 128 244 162 Z" />
        {/* fırın gövdesi */}
        <path d="M300 310 L290 200 L312 150 L318 90 L362 90 L368 150 L390 200 L380 310 Z" />
        <rect x="322" y="60" width="36" height="32" />
        <path d="M330 60 L330 30 L350 30 L350 60" fill="none" strokeWidth="6" stroke="#323c4c" />
        {/* aşağı inen borular */}
        <path d="M358 70 Q420 70 430 130 L430 300" fill="none" strokeWidth="10" stroke="#323c4c" />
        <path d="M322 70 Q260 70 244 120" fill="none" strokeWidth="8" stroke="#323c4c" />
        {/* platformlar */}
        <rect x="282" y="196" width="116" height="5" fill="#465266" />
        <rect x="298" y="150" width="84" height="4" fill="#465266" />
      </g>
      {/* döküm deliği parıltısı */}
      <ellipse cx="340" cy="296" rx="26" ry="9" fill="url(#ph-molten)" className="ph-flicker" />
      <path d="M340 300 Q360 312 420 314 L470 314" stroke="url(#ph-molten)" strokeWidth="6" fill="none" className="ph-flicker" />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={340 + (i % 3) * 6} cy={292} r="1.8" fill="#ffd27a" className="ph-spark" style={{ animationDelay: `${i * 0.23}s`, ["--sx" as string]: `${(i % 5) * 9 - 18}px` }} />
      ))}

      {/* Çelikhane binası + tavan vinci */}
      <g>
        <path d="M600 310 L600 170 L760 130 L1120 130 L1120 310 Z" fill="#202733" stroke="#465266" strokeWidth="2" />
        <rect x="640" y="180" width="440" height="130" fill="#0b0f16" />
        <rect x="640" y="180" width="440" height="130" fill="url(#ph-glow2)" opacity="0.8" />
        {/* vinç yolu */}
        <rect x="640" y="184" width="440" height="7" fill="#3a4556" />
        <g className="ph-crane">
          <rect x="660" y="178" width="80" height="18" fill="#f59e0b" stroke="#7c4a03" strokeWidth="1.5" />
          <rect x="690" y="196" width="20" height="8" fill="#374151" />
          <line x1="694" y1="204" x2="688" y2="238" stroke="#9ca3af" strokeWidth="1.5" />
          <line x1="706" y1="204" x2="712" y2="238" stroke="#9ca3af" strokeWidth="1.5" />
          <path d="M676 238 L724 238 L718 274 L682 274 Z" fill="#3b2a24" stroke="#5b4036" strokeWidth="2" />
          <ellipse cx="700" cy="239" rx="24" ry="4.5" fill="url(#ph-molten)" className="ph-flicker" />
        </g>
        {/* bina ışıkları */}
        {[660, 720, 780, 840, 900, 960, 1020, 1080].map((x, i) => (
          <rect key={x} x={x} y="145" width="18" height="10" fill="#ffcf7a" opacity={0.35 + (i % 3) * 0.15} />
        ))}
      </g>

      {/* Konveyör */}
      <g>
        <line x1="470" y1="262" x2="610" y2="210" stroke="#2f3a4a" strokeWidth="10" />
        <line x1="470" y1="262" x2="610" y2="210" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 10" className="ph-belt" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="-6" y="-12" width="12" height="8" fill="#7a4a2a" className="ph-ore" style={{ animationDelay: `${i * -1.6}s` }} />
        ))}
        <line x1="490" y1="262" x2="490" y2="310" stroke="#2f3a4a" strokeWidth="4" />
        <line x1="580" y1="228" x2="580" y2="310" stroke="#2f3a4a" strokeWidth="4" />
      </g>

      </g>

      {/* Zemin + uyarı bandı */}
      <rect y="308" width="1200" height="112" fill="#0a0d13" />
      <rect y="308" width="1200" height="7" fill="url(#ph-stripe)" opacity="0.85" />

      {/* Yürüyen kontrolör (beyaz baret, yansıtıcı yelek) */}
      <g className="ph-walker">
        <g transform="scale(1.25)">
          <circle cx="0" cy="-44" r="6" fill="#e5d3c0" />
          <path d="M-7 -46 Q0 -58 7 -46 Z" fill="#ffffff" />
          <rect x="-8" y="-46" width="16" height="2.5" fill="#ffffff" />
          <rect x="-7" y="-37" width="14" height="20" rx="3" fill="#f97316" />
          <rect x="-7" y="-30" width="14" height="2.5" fill="#e5e7eb" />
          <rect x="-7" y="-24" width="14" height="2.5" fill="#e5e7eb" />
          <rect x="-6" y="-17" width="5" height="17" fill="#1f2937" className="ph-leg-a" />
          <rect x="1" y="-17" width="5" height="17" fill="#1f2937" className="ph-leg-b" />
          <rect x="6" y="-30" width="5" height="7" rx="1" fill="#facc15" />
        </g>
      </g>
    </svg>
  );
}
