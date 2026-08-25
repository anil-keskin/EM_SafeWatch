/**
 * Tesis silüeti — yalnızca atmosfer.
 * Opaklık %4 civarıdır; içerikten rol çalmaz.
 */
export default function FactorySilhouette() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] w-full text-brand-safe-gray opacity-[0.04] sm:h-[46%]"
      viewBox="0 0 1440 480"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g fill="currentColor">
        {/* Yüksek fırın ve cowper */}
        <path d="M78 480 L118 198 H186 L226 480 Z" />
        <ellipse cx="152" cy="196" rx="38" ry="12" />
        <rect x="144" y="154" width="16" height="44" />
        <path d="M236 480 L268 236 H318 L350 480 Z" />
        <ellipse cx="293" cy="234" rx="26" ry="9" />
        <rect x="258" y="292" width="16" height="7" />
        <rect x="258" y="328" width="16" height="7" />
        <rect x="258" y="364" width="16" height="7" />

        {/* Gaz hattı / boru köprüsü */}
        <rect x="360" y="262" width="228" height="9" />
        <rect x="360" y="288" width="228" height="5" />
        <rect x="396" y="271" width="8" height="209" />
        <rect x="468" y="271" width="8" height="209" />
        <rect x="540" y="271" width="8" height="209" />
        <circle cx="372" cy="266" r="8" />
        <circle cx="576" cy="266" r="8" />
        <path
          d="M588 266 C620 266 628 214 662 214"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
        />

        {/* Baca grubu */}
        <rect x="662" y="78" width="22" height="402" />
        <rect x="696" y="124" width="18" height="356" />
        <rect x="726" y="52" width="26" height="428" />
        <rect x="656" y="70" width="34" height="10" />
        <rect x="720" y="44" width="38" height="10" />

        {/* Haddehane — testere çatı */}
        <rect x="768" y="262" width="292" height="218" />
        <path d="M768 262 L818 204 L868 262 L918 204 L968 262 L1018 204 L1060 262 Z" />
        <rect x="796" y="308" width="40" height="56" />
        <rect x="860" y="308" width="40" height="56" />
        <rect x="924" y="308" width="40" height="56" />
        <rect x="988" y="308" width="32" height="56" />

        {/* Vinç köprüsü */}
        <rect x="1090" y="132" width="11" height="348" />
        <rect x="1406" y="132" width="11" height="348" />
        <rect x="1090" y="132" width="327" height="10" />
        <rect x="1238" y="142" width="9" height="92" />
        <rect x="1222" y="230" width="42" height="13" />
        <rect x="1210" y="142" width="72" height="6" />

        {/* Atölye, tank ve zemin */}
        <rect x="1096" y="286" width="96" height="194" />
        <path d="M1096 286 L1144 238 L1192 286 Z" />
        <rect x="1212" y="324" width="128" height="156" />
        <path d="M1212 324 L1276 276 L1340 324 Z" />
        <rect x="1356" y="368" width="68" height="112" />
        <path d="M48 458 H1392 V480 H48 Z" />
      </g>
    </svg>
  );
}
