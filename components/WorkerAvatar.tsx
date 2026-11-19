"use client";

import type { ReactNode } from "react";
import type { EquipmentItem } from "@/lib/types";

/**
 * KKD giydirme karakteri.
 *
 * Her ekipman kodu kendi parçasıyla çizilir: mekanik eldiven ile ısı eldiveni,
 * kulak tıkacı ile manşon, FR elbise ile alüminize giysi birbirinden ayırt
 * edilir. "worn" kodları karakterin üzerinde görünür. "flagged" kodları
 * (yüklenicide eksik diye işaretlenen) aynı parçanın kırmızı kesikli
 * "olması gereken" hayaleti olarak çizilir. Sadece görseldir; puanlamaya
 * dokunmaz ve hangi parçanın gerekli olduğunu ele vermez.
 */

type Layer = "back" | "suit" | "over" | "head" | "hat" | "top";
type Piece = { layer: Layer; draw: (t: Tone) => ReactNode };
type Tone = "self" | "contractor";

const SUITS: Record<string, { body: string; leg: string; trim?: string }> = {
  standart_is_kiyafeti: { body: "#475569", leg: "#334155" },
  fr_kiyafet: { body: "#1e3a8a", leg: "#1e3a8a", trim: "#e5e7eb" },
  aluminize_giysi: { body: "#cbd5e1", leg: "#94a3b8", trim: "#f8fafc" },
  antistatik_ex_kiyafet: { body: "#0f766e", leg: "#115e59", trim: "#facc15" },
};

const helmetColor = (t: Tone) => (t === "contractor" ? "#facc15" : "#ffffff");

const Helmet = ({ t }: { t: Tone }) => (
  <>
    <path d="M74 44 Q74 18 100 18 Q126 18 126 44 Z" fill={helmetColor(t)} stroke="#9ca3af" strokeWidth="1.5" />
    <rect x="68" y="40" width="64" height="7" rx="3.5" fill={helmetColor(t)} stroke="#9ca3af" strokeWidth="1.5" />
    <rect x="96" y="19" width="8" height="21" fill={t === "contractor" ? "#eab308" : "#e1251b"} opacity="0.85" />
  </>
);

const GloveShape = ({ fill, cuff, long }: { fill: string; cuff: string; long?: boolean }) => (
  <>
    {long && (
      <>
        <line x1="44" y1="166" x2="39" y2="190" stroke={cuff} strokeWidth="20" strokeLinecap="round" />
        <line x1="156" y1="166" x2="161" y2="190" stroke={cuff} strokeWidth="20" strokeLinecap="round" />
      </>
    )}
    <circle cx="38" cy="198" r="12" fill={fill} stroke="#00000033" />
    <circle cx="162" cy="198" r="12" fill={fill} stroke="#00000033" />
    <rect x="28" y="182" width="20" height="7" rx="2" fill={cuff} />
    <rect x="152" y="182" width="20" height="7" rx="2" fill={cuff} />
  </>
);

const PIECES: Record<string, Piece> = {
  /* ---- baş ---- */
  baret_en397: { layer: "hat", draw: (t) => <Helmet t={t} /> },
  baret_jugular: {
    layer: "hat",
    draw: (t) => (
      <>
        <Helmet t={t} />
        <path d="M76 46 Q78 80 100 82 Q122 80 124 46" fill="none" stroke="#374151" strokeWidth="2.5" />
      </>
    ),
  },
  baret_en14052: {
    layer: "hat",
    draw: (t) => (
      <>
        <path d="M74 44 Q74 18 100 18 Q126 18 126 44 Z" fill={helmetColor(t)} stroke="#9ca3af" strokeWidth="1.5" />
        <ellipse cx="100" cy="44" rx="42" ry="6" fill={helmetColor(t)} stroke="#9ca3af" strokeWidth="1.5" />
      </>
    ),
  },
  /* ---- göz / yüz ---- */
  gozluk_en166: {
    layer: "head",
    draw: () => (
      <>
        <rect x="78" y="45" width="44" height="13" rx="6" fill="#bae6fd" opacity="0.7" stroke="#0c4a6e" strokeWidth="2" />
        <line x1="76" y1="51" x2="71" y2="50" stroke="#0c4a6e" strokeWidth="3" />
        <line x1="124" y1="51" x2="129" y2="50" stroke="#0c4a6e" strokeWidth="3" />
      </>
    ),
  },
  gozluk_ir: {
    layer: "head",
    draw: () => (
      <>
        <rect x="78" y="45" width="44" height="13" rx="6" fill="#166534" opacity="0.9" stroke="#052e16" strokeWidth="2" />
        <line x1="76" y1="51" x2="71" y2="50" stroke="#052e16" strokeWidth="3" />
        <line x1="124" y1="51" x2="129" y2="50" stroke="#052e16" strokeWidth="3" />
      </>
    ),
  },
  yuz_siperi: {
    layer: "top",
    draw: () => (
      <>
        <rect x="72" y="36" width="56" height="6" rx="2" fill="#475569" />
        <path d="M74 42 L126 42 L122 80 Q100 88 78 80 Z" fill="#bae6fd" opacity="0.45" stroke="#64748b" strokeWidth="1.5" />
      </>
    ),
  },
  kaynak_maskesi: {
    layer: "top",
    draw: () => (
      <>
        <path d="M74 34 L126 34 L124 78 Q100 90 76 78 Z" fill="#1f2937" stroke="#030712" strokeWidth="1.5" />
        <rect x="88" y="48" width="24" height="10" rx="2" fill="#65a30d" stroke="#14532d" />
      </>
    ),
  },
  /* ---- solunum ---- */
  toz_maskesi_ffp3: {
    layer: "head",
    draw: () => (
      <>
        <ellipse cx="100" cy="70" rx="15" ry="11" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="100" cy="72" r="4" fill="#e1251b" />
        <line x1="85" y1="66" x2="76" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="115" y1="66" x2="124" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
      </>
    ),
  },
  yarim_yuz_maske: {
    layer: "head",
    draw: () => (
      <>
        <path d="M84 60 Q100 54 116 60 L114 76 Q100 84 86 76 Z" fill="#4b5563" />
        <circle cx="85" cy="72" r="6.5" fill="#ec4899" stroke="#831843" />
        <circle cx="115" cy="72" r="6.5" fill="#ec4899" stroke="#831843" />
      </>
    ),
  },
  kacis_maskesi_co: {
    layer: "over",
    draw: () => (
      <>
        <rect x="112" y="180" width="20" height="18" rx="3" fill="#f97316" stroke="#9a3412" />
        <rect x="116" y="184" width="12" height="4" fill="#fff" opacity="0.85" />
      </>
    ),
  },
  temiz_hava_solunum: {
    layer: "back",
    draw: () => (
      <>
        <rect x="132" y="94" width="18" height="78" rx="8" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
        <path d="M132 120 Q118 112 112 80" fill="none" stroke="#111827" strokeWidth="3.5" />
        <ellipse cx="100" cy="60" rx="22" ry="26" fill="#94a3b8" opacity="0.45" stroke="#1f2937" strokeWidth="3" />
        <circle cx="100" cy="76" r="6" fill="#1f2937" />
      </>
    ),
  },
  /* ---- işitme ---- */
  kulak_tikaci: {
    layer: "head",
    draw: () => (
      <>
        <circle cx="76" cy="57" r="4" fill="#f97316" stroke="#9a3412" />
        <circle cx="124" cy="57" r="4" fill="#f97316" stroke="#9a3412" />
      </>
    ),
  },
  kulaklik_en352: {
    layer: "head",
    draw: () => (
      <>
        <path d="M74 52 Q100 4 126 52" stroke="#e1251b" strokeWidth="4" fill="none" />
        <rect x="66" y="45" width="13" height="20" rx="5" fill="#e1251b" />
        <rect x="121" y="45" width="13" height="20" rx="5" fill="#e1251b" />
      </>
    ),
  },
  /* ---- el ---- */
  eldiven_mekanik: { layer: "over", draw: () => <GloveShape fill="#9ca3af" cuff="#4b5563" /> },
  eldiven_isi: { layer: "over", draw: () => <GloveShape fill="#e5e7eb" cuff="#cbd5e1" long /> },
  eldiven_kaynak: { layer: "over", draw: () => <GloveShape fill="#b45309" cuff="#92400e" long /> },
  eldiven_kimyasal: { layer: "over", draw: () => <GloveShape fill="#16a34a" cuff="#15803d" long /> },
  /* ---- ayak ---- */
  ayakkabi_s3: {
    layer: "over",
    draw: () => (
      <>
        <path d="M66 306 L98 306 L100 326 L60 326 Q58 316 66 306 Z" fill="#1f2937" />
        <path d="M102 306 L134 306 Q142 316 140 326 L100 326 Z" fill="#1f2937" />
        <rect x="60" y="322" width="40" height="5" fill="#facc15" />
        <rect x="100" y="322" width="40" height="5" fill="#facc15" />
      </>
    ),
  },
  cizme_isi_hi3: {
    layer: "over",
    draw: () => (
      <>
        <path d="M70 262 L98 262 L100 326 L58 326 Q58 312 70 306 Z" fill="#111827" />
        <path d="M102 262 L130 262 L130 306 Q142 312 142 326 L100 326 Z" fill="#111827" />
        <rect x="70" y="268" width="28" height="5" fill="#e1251b" />
        <rect x="102" y="268" width="28" height="5" fill="#e1251b" />
      </>
    ),
  },
  /* ---- gövde: elbiseler karakterin rengini belirler, burada şerit/detay ---- */
  standart_is_kiyafeti: {
    layer: "suit",
    draw: () => <rect x="110" y="112" width="18" height="14" rx="2" fill="#00000022" />,
  },
  fr_kiyafet: {
    layer: "suit",
    draw: () => (
      <>
        <rect x="62" y="150" width="74" height="6" fill="#e5e7eb" />
        <rect x="62" y="174" width="74" height="6" fill="#e5e7eb" />
        <rect x="72" y="280" width="24" height="5" fill="#e5e7eb" />
        <rect x="104" y="280" width="24" height="5" fill="#e5e7eb" />
      </>
    ),
  },
  aluminize_giysi: {
    layer: "suit",
    draw: () => (
      <>
        <path d="M70 100 Q100 92 130 100" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M72 130 L80 200" stroke="#ffffff" strokeWidth="4" opacity="0.6" />
        <path d="M76 18 Q100 8 124 18 L128 74 Q100 84 72 74 Z" fill="#cbd5e1" opacity="0.55" stroke="#94a3b8" />
      </>
    ),
  },
  antistatik_ex_kiyafet: {
    layer: "suit",
    draw: () => (
      <>
        <rect x="96" y="96" width="8" height="108" fill="#facc15" opacity="0.8" />
        <rect x="62" y="160" width="74" height="4" fill="#facc15" opacity="0.8" />
      </>
    ),
  },
  reflektorlu_yelek: {
    layer: "over",
    draw: () => (
      <>
        <path d="M64 98 L90 96 L94 204 L66 204 Z" fill="#bef264" />
        <path d="M136 98 L110 96 L106 204 L134 204 Z" fill="#bef264" />
        <rect x="64" y="160" width="30" height="6" fill="#e5e7eb" />
        <rect x="106" y="160" width="30" height="6" fill="#e5e7eb" />
      </>
    ),
  },
  kaynakci_onlugu: {
    layer: "over",
    draw: () => (
      <>
        <path d="M76 104 L124 104 L130 236 L70 236 Z" fill="#78350f" stroke="#451a03" />
        <line x1="44" y1="140" x2="40" y2="182" stroke="#78350f" strokeWidth="20" strokeLinecap="round" />
        <line x1="156" y1="140" x2="160" y2="182" stroke="#78350f" strokeWidth="20" strokeLinecap="round" />
      </>
    ),
  },
  kursun_onluk: {
    layer: "over",
    draw: () => (
      <>
        <path d="M72 100 L128 100 L132 240 L68 240 Z" fill="#475569" stroke="#1e293b" />
        <text x="100" y="176" textAnchor="middle" fontSize="16" fontWeight="700" fill="#e2e8f0">Pb</text>
      </>
    ),
  },
  can_yelegi: {
    layer: "over",
    draw: () => (
      <>
        <path d="M62 98 Q100 86 138 98 L136 186 L64 186 Z" fill="#f97316" stroke="#9a3412" />
        <path d="M82 84 Q100 98 118 84" stroke="#f97316" strokeWidth="10" fill="none" />
        <rect x="64" y="130" width="72" height="5" fill="#e5e7eb" />
        <rect x="96" y="100" width="8" height="86" fill="#9a3412" opacity="0.5" />
      </>
    ),
  },
  /* ---- yüksekte çalışma ---- */
  tam_vucut_kemeri: {
    layer: "top",
    draw: () => (
      <g stroke="#facc15" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M72 96 L96 168" />
        <path d="M128 96 L104 168" />
        <path d="M66 172 L134 172" />
        <path d="M84 196 L96 220 M116 196 L104 220" />
        <circle cx="100" cy="108" r="5" stroke="#9ca3af" strokeWidth="3" />
      </g>
    ),
  },
  soklu_lanyard: {
    layer: "top",
    draw: () => (
      <>
        <path d="M100 104 Q150 96 150 150 L150 214" stroke="#1d4ed8" strokeWidth="4" fill="none" />
        <rect x="143" y="150" width="14" height="26" rx="4" fill="#1d4ed8" />
        <path d="M144 214 Q150 228 156 214" stroke="#6b7280" strokeWidth="4" fill="none" />
      </>
    ),
  },
  cift_kancali_lanyard: {
    layer: "top",
    draw: () => (
      <>
        <path d="M100 104 Q150 96 150 150 L142 214 M150 150 L162 214" stroke="#1d4ed8" strokeWidth="4" fill="none" />
        <path d="M136 214 Q142 228 148 214" stroke="#6b7280" strokeWidth="4" fill="none" />
        <path d="M156 214 Q162 228 168 214" stroke="#6b7280" strokeWidth="4" fill="none" />
      </>
    ),
  },
  yatay_yasam_hatti: {
    layer: "back",
    draw: () => (
      <>
        <line x1="14" y1="8" x2="186" y2="8" stroke="#f59e0b" strokeWidth="3" />
        <rect x="10" y="4" width="6" height="22" fill="#6b7280" />
        <rect x="184" y="4" width="6" height="22" fill="#6b7280" />
      </>
    ),
  },
  /* ---- ölçüm ve tespit ---- */
  gaz_dedektoru_co: {
    layer: "top",
    draw: () => (
      <>
        <rect x="116" y="104" width="16" height="22" rx="3" fill="#facc15" stroke="#854d0e" />
        <rect x="119" y="108" width="10" height="7" fill="#14532d" />
        <circle cx="124" cy="121" r="2" fill="#22c55e" className="sw-flag" />
      </>
    ),
  },
  gaz_dedektoru_4li: {
    layer: "top",
    draw: () => (
      <>
        <rect x="113" y="100" width="22" height="28" rx="4" fill="#111827" stroke="#facc15" strokeWidth="2.5" />
        <rect x="117" y="104" width="14" height="9" fill="#14532d" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={117 + i * 4.6} cy="121" r="1.6" fill="#22c55e" />
        ))}
      </>
    ),
  },
  dozimetre: {
    layer: "top",
    draw: () => (
      <>
        <rect x="68" y="106" width="16" height="20" rx="2" fill="#ffffff" stroke="#334155" />
        <circle cx="76" cy="116" r="5" fill="#facc15" stroke="#111827" />
        <circle cx="76" cy="116" r="1.5" fill="#111827" />
      </>
    ),
  },
  ex_el_feneri: {
    layer: "top",
    draw: () => (
      <>
        <path d="M168 214 L196 260 L176 268 Z" fill="#fef08a" opacity="0.55" />
        <rect x="157" y="196" width="11" height="24" rx="2" fill="#f59e0b" stroke="#78350f" transform="rotate(-25 162 208)" />
      </>
    ),
  },
  telsiz_atex: {
    layer: "top",
    draw: () => (
      <>
        <rect x="66" y="104" width="12" height="22" rx="2" fill="#1f2937" />
        <line x1="70" y1="104" x2="70" y2="90" stroke="#1f2937" strokeWidth="2.5" />
        <rect x="68" y="108" width="8" height="5" fill="#38bdf8" />
      </>
    ),
  },
};

/** Elbise hayaleti: gövde ve kollar kesikli çizgiyle. */
function SuitGhost() {
  return (
    <>
      <path d="M60 96 Q100 82 140 96 L136 204 L64 204 Z" fill="#94a3b8" />
      <path d="M56 98 L72 102 L48 190 L32 186 Z" fill="#94a3b8" />
      <path d="M144 98 L128 102 L152 190 L168 186 Z" fill="#94a3b8" />
    </>
  );
}

/** Eksik işaretinin rozet konumu (kategoriye göre). */
const BADGE_ANCHOR: Record<string, [number, number]> = {
  bas: [128, 22],
  goz: [130, 44],
  solunum: [126, 74],
  isitme: [138, 52],
  el: [176, 186],
  ayak: [146, 306],
  govde: [146, 120],
  yuksekte: [150, 160],
  olcum: [142, 100],
};

const SLOT_LABEL: Record<string, string> = {
  alan: "Alan tedbiri",
  dokuman: "Doküman",
};


export default function WorkerAvatar({
  equipment,
  worn,
  flagged = [],
  caption,
  tone = "self",
}: {
  equipment: EquipmentItem[];
  worn: string[];
  flagged?: string[];
  caption: string;
  tone?: Tone;
}) {
  const byCode = new Map(equipment.map((e) => [e.code, e]));
  const catOf = (code: string) => byCode.get(code)?.category_id;
  const drawable = (code: string) => code in PIECES;

  const wornDrawn = worn.filter(drawable);
  const flaggedDrawn = flagged.filter(drawable);
  const extras = ["alan", "dokuman"]
    .map((cat) => ({
      cat,
      worn: worn.filter((c) => catOf(c) === cat).length,
      flagged: flagged.filter((c) => catOf(c) === cat).length,
    }))
    .filter((x) => x.worn > 0 || x.flagged > 0);

  const suitCode = wornDrawn.find((c) => c in SUITS);
  const suit = suitCode ? SUITS[suitCode] : null;
  const skin = "#e8cdb5";
  const jacket = suit?.body ?? (tone === "contractor" ? "#6b7280" : "#94a3b8");
  const legs = suit?.leg ?? "#475569";
  const hasHeadCover = wornDrawn.some((c) => catOf(c) === "bas");
  const hasGloves = wornDrawn.some((c) => catOf(c) === "el");
  const hasShoes = wornDrawn.some((c) => catOf(c) === "ayak");

  const renderLayer = (layer: Layer) => (
    <>
      {wornDrawn
        .filter((c) => PIECES[c].layer === layer)
        .map((c) => (
          <g key={`w-${c}`} className="sw-equip">
            {PIECES[c].draw(tone)}
          </g>
        ))}
      {flaggedDrawn
        .filter((c) => PIECES[c].layer === layer)
        .map((c) => (
          <g key={`g-${c}`} className="sw-ghost">
            {c in SUITS ? <SuitGhost /> : PIECES[c].draw(tone)}
          </g>
        ))}
    </>
  );

  const badgeCats = [...new Set(flaggedDrawn.map(catOf).filter(Boolean) as string[])];

  return (
    <figure className="flex flex-col items-center">
      <div
        className={`relative w-full max-w-[11rem] overflow-hidden rounded-2xl p-2 ring-1 ${
          tone === "contractor"
            ? "bg-gradient-to-b from-amber-50 via-white to-erd-light ring-amber-200"
            : "bg-gradient-to-b from-sky-50 via-white to-erd-light ring-erd-line"
        }`}
      >
        <svg viewBox="0 0 200 340" className="h-auto w-full" role="img" aria-label={caption}>
          {/* zemin: uyarı bandı */}
          <defs>
            <pattern id="wa-stripe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="5" height="10" fill="#facc15" />
              <rect x="5" width="5" height="10" fill="#1f2937" />
            </pattern>
          </defs>
          <rect x="0" y="330" width="200" height="10" fill="url(#wa-stripe)" opacity="0.7" />
          <ellipse cx="100" cy="329" rx="56" ry="6" fill="#000" opacity="0.1" />

          {renderLayer("back")}

          {/* bacaklar */}
          <rect x="72" y="196" width="24" height="116" rx="8" fill={legs} />
          <rect x="104" y="196" width="24" height="116" rx="8" fill={legs} />
          {/* kollar + gövde */}
          <line x1="64" y1="100" x2="40" y2="188" stroke={jacket} strokeWidth="18" strokeLinecap="round" />
          <line x1="136" y1="100" x2="160" y2="188" stroke={jacket} strokeWidth="18" strokeLinecap="round" />
          <path d="M60 96 Q100 82 140 96 L136 204 L64 204 Z" fill={jacket} />
          {!suit && <path d="M88 92 L100 104 L112 92" stroke="#00000022" strokeWidth="2" fill="none" />}

          {renderLayer("suit")}

          {/* boyun + baş */}
          <rect x="92" y="74" width="16" height="16" fill={skin} />
          <circle cx="100" cy="54" r="24" fill={skin} />
          <circle cx="91" cy="52" r="2" fill="#333" />
          <circle cx="109" cy="52" r="2" fill="#333" />
          <path d="M93 66 Q100 70 107 66" stroke="#9a6b4f" strokeWidth="1.8" fill="none" />
          {!hasHeadCover && (
            <path d="M78 40 Q80 26 100 26 Q120 26 122 40 Q110 34 100 34 Q90 34 78 40 Z" fill="#4a3426" />
          )}

          {/* çıplak el / ayak */}
          {!hasGloves && (
            <>
              <circle cx="38" cy="196" r="9" fill={skin} />
              <circle cx="162" cy="196" r="9" fill={skin} />
            </>
          )}
          {!hasShoes && (
            <>
              <ellipse cx="82" cy="318" rx="16" ry="8" fill="#9ca3af" />
              <ellipse cx="118" cy="318" rx="16" ry="8" fill="#9ca3af" />
            </>
          )}

          {renderLayer("over")}
          {renderLayer("head")}
          {renderLayer("hat")}
          {renderLayer("top")}

          {/* eksik rozeti */}
          {badgeCats.map((cat) => {
            const [x, y] = BADGE_ANCHOR[cat] ?? [150, 100];
            return (
              <g key={`b-${cat}`} className="sw-pop" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                <circle cx={x} cy={y} r="8" fill="#e1251b" stroke="#fff" strokeWidth="2" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">!</text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 hidden text-center text-[11px] font-semibold text-erd-charcoal @2xl:block">{caption}</figcaption>
      {(extras.length > 0 || flagged.length > 0) && (
        <div className="mt-1.5 flex max-w-[12rem] flex-wrap justify-center gap-1 @max-2xl:hidden">
          {flagged.length > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-erd-red">
              {flagged.length} eksik işaretlendi
            </span>
          )}
          {extras.map(({ cat, worn: n }) =>
            n > 0 ? (
              <span key={cat} className="rounded-full bg-erd-light px-2 py-0.5 text-[10px] font-semibold text-erd-gray">
                {SLOT_LABEL[cat]}: {n}
              </span>
            ) : null
          )}
        </div>
      )}
    </figure>
  );
}
