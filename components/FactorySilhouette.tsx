/** Demir çelik tesis silüeti — ana sayfa arka planı. */
export default function FactorySilhouette() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] w-full text-erd-charcoal/25"
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sw-stack-glow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e1251b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2e2e2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="currentColor">
        <path d="M70 420 L110 170 H170 L210 420 Z" />
        <ellipse cx="140" cy="170" rx="32" ry="10" />
        <path d="M230 420 L265 210 H315 L350 420 Z" />
        <ellipse cx="290" cy="210" rx="26" ry="8" />

        <path d="M390 420 V210 L430 150 H510 L550 210 V420 Z" />
        <rect x="430" y="120" width="18" height="40" />
        <rect x="492" y="95" width="16" height="65" />
        <rect x="425" y="88" width="28" height="10" />
        <rect x="487" y="86" width="26" height="10" />

        <rect x="580" y="70" width="22" height="350" />
        <rect x="616" y="110" width="18" height="310" />
        <rect x="648" y="50" width="26" height="370" />
        <rect x="574" y="62" width="34" height="12" />
        <rect x="642" y="42" width="38" height="12" />

        <rect x="690" y="240" width="220" height="14" />
        <rect x="710" y="254" width="10" height="166" />
        <rect x="800" y="254" width="10" height="166" />
        <rect x="880" y="254" width="10" height="166" />

        <rect x="700" y="280" width="160" height="140" />
        <polygon points="700,280 780,230 860,280" />
        <rect x="720" y="310" width="28" height="40" opacity="0.4" />
        <rect x="760" y="310" width="28" height="40" opacity="0.4" />
        <rect x="800" y="310" width="28" height="40" opacity="0.4" />

        <rect x="920" y="160" width="12" height="260" />
        <rect x="900" y="160" width="180" height="10" />
        <rect x="1060" y="170" width="6" height="90" />
        <rect x="1048" y="256" width="30" height="14" />

        <rect x="980" y="250" width="70" height="170" />
        <rect x="1060" y="300" width="90" height="120" />
        <path d="M1070 300 L1110 250 L1145 300 Z" />
        <path d="M200 400 H1100 V420 H200 Z" opacity="0.5" />
      </g>
      <rect x="572" y="0" width="110" height="80" fill="url(#sw-stack-glow)" />
    </svg>
  );
}
