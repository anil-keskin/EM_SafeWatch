/** Demir çelik tesis silüeti — düşük opaklıkta kurumsal atmosfer. */
export default function FactorySilhouette() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] w-full text-erd-charcoal/[0.13]"
      viewBox="0 0 1440 480"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sw-skyline-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e2e2e" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#2e2e2e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sw-stack-ember" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e1251b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e1251b" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1440" height="480" fill="url(#sw-skyline-fade)" />

      <g fill="currentColor">
        {/* Yüksek fırın ve cowper */}
        <path d="M92 480 L128 210 H188 L224 480 Z" />
        <ellipse cx="158" cy="208" rx="34" ry="11" />
        <rect x="142" y="168" width="14" height="42" />
        <path d="M248 480 L278 248 H322 L352 480 Z" />
        <ellipse cx="300" cy="246" rx="24" ry="8" />
        <rect x="268" y="300" width="18" height="8" opacity="0.45" />
        <rect x="268" y="340" width="18" height="8" opacity="0.45" />

        {/* Gaz hattı / boru köprüsü */}
        <rect x="360" y="268" width="210" height="8" />
        <rect x="360" y="292" width="210" height="5" opacity="0.55" />
        <rect x="392" y="276" width="7" height="204" />
        <rect x="456" y="276" width="7" height="204" />
        <rect x="528" y="276" width="7" height="204" />
        <circle cx="372" cy="272" r="7" />
        <circle cx="558" cy="272" r="7" />

        {/* Baca grubu */}
        <rect x="590" y="86" width="20" height="394" />
        <rect x="622" y="132" width="16" height="348" />
        <rect x="650" y="64" width="24" height="416" />
        <rect x="584" y="78" width="32" height="10" />
        <rect x="644" y="56" width="36" height="10" />
        <rect x="648" y="0" width="28" height="72" fill="url(#sw-stack-ember)" />

        {/* Haddehane — testere çatı */}
        <rect x="700" y="268" width="268" height="212" />
        <path d="M700 268 L746 214 L792 268 L838 214 L884 268 L930 214 L968 268 Z" />
        <rect x="728" y="312" width="36" height="52" opacity="0.38" />
        <rect x="788" y="312" width="36" height="52" opacity="0.38" />
        <rect x="848" y="312" width="36" height="52" opacity="0.38" />
        <rect x="908" y="312" width="28" height="52" opacity="0.38" />

        {/* Vinç köprüsü */}
        <rect x="990" y="148" width="10" height="332" />
        <rect x="1388" y="148" width="10" height="332" />
        <rect x="990" y="148" width="408" height="9" />
        <rect x="1178" y="157" width="8" height="86" />
        <rect x="1164" y="239" width="36" height="12" />
        <rect x="1148" y="157" width="68" height="6" opacity="0.5" />

        {/* Gazometre / tank ve atölye */}
        <rect x="1024" y="292" width="88" height="188" />
        <path d="M1024 292 L1068 248 L1112 292 Z" />
        <rect x="1136" y="332" width="118" height="148" />
        <path d="M1136 332 L1195 286 L1254 332 Z" />
        <rect x="1284" y="368" width="72" height="112" />

        <path d="M60 456 H1380 V480 H60 Z" opacity="0.55" />
      </g>
    </svg>
  );
}
