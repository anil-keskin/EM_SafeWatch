"use client";

import type { EquipmentItem } from "@/lib/types";

/**
 * KKD giydirme karakteri.
 *
 * "worn" kodları karakterin üstünde görünür (seçilen KKD ya da yüklenicinin
 * üzerinde gözlemlenen). "flagged" kodları eksik diye işaretlenmiş parçalardır;
 * vücutta kırmızı uyarı halkası olarak yanıp söner. Sadece görseldir; puanlama
 * mantığına dokunmaz ve hangi parçanın gerekli olduğunu ele vermez.
 */

type Slot = "bas" | "goz" | "solunum" | "isitme" | "el" | "ayak" | "govde" | "yuksekte" | "olcum";

const SLOT_ANCHOR: Record<Slot, [number, number]> = {
  bas: [100, 30],
  goz: [100, 52],
  solunum: [100, 68],
  isitme: [126, 56],
  el: [160, 198],
  ayak: [118, 318],
  govde: [100, 140],
  yuksekte: [100, 170],
  olcum: [124, 112],
};

const SLOT_LABEL: Record<string, string> = {
  bas: "Baş",
  goz: "Göz/Yüz",
  solunum: "Solunum",
  isitme: "İşitme",
  el: "El",
  ayak: "Ayak",
  govde: "Gövde",
  yuksekte: "Yüksekte",
  olcum: "Ölçüm",
  alan: "Alan tedbiri",
  dokuman: "Doküman",
};

function isSlot(id: string): id is Slot {
  return id in SLOT_ANCHOR;
}

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
  tone?: "self" | "contractor";
}) {
  const byCode = new Map(equipment.map((e) => [e.code, e]));
  const wornCats = new Set(worn.map((c) => byCode.get(c)?.category_id).filter(Boolean) as string[]);
  const flaggedCats = new Set(
    flagged.map((c) => byCode.get(c)?.category_id).filter(Boolean) as string[]
  );
  const extras = ["alan", "dokuman"]
    .map((cat) => ({ cat, n: worn.filter((c) => byCode.get(c)?.category_id === cat).length }))
    .filter((x) => x.n > 0);
  const has = (s: Slot) => wornCats.has(s);
  const skin = "#e8cdb5";
  const base = tone === "contractor" ? "#6b7280" : "#94a3b8";
  const jacket = has("govde") ? (tone === "contractor" ? "#1d4ed8" : "#f97316") : base;

  return (
    <figure className="flex flex-col items-center">
      <div className="relative w-full max-w-[11rem] rounded-2xl bg-gradient-to-b from-erd-light to-white p-2 ring-1 ring-erd-line">
        <svg viewBox="0 0 200 340" className="h-auto w-full" role="img" aria-label={caption}>
          {/* zemin gölgesi */}
          <ellipse cx="100" cy="330" rx="56" ry="7" fill="#000" opacity="0.08" />

          {/* bacaklar */}
          <rect x="72" y="196" width="24" height="116" rx="8" fill={tone === "contractor" ? "#374151" : "#475569"} />
          <rect x="104" y="196" width="24" height="116" rx="8" fill={tone === "contractor" ? "#374151" : "#475569"} />
          {/* kollar */}
          <line x1="64" y1="100" x2="40" y2="188" stroke={jacket} strokeWidth="18" strokeLinecap="round" />
          <line x1="136" y1="100" x2="160" y2="188" stroke={jacket} strokeWidth="18" strokeLinecap="round" />
          {/* gövde */}
          <path d="M60 96 Q100 82 140 96 L136 204 L64 204 Z" fill={jacket} />
          {has("govde") && (
            <g className="sw-equip" key="govde">
              <rect x="62" y="150" width="74" height="7" fill="#e5e7eb" opacity="0.95" />
              <rect x="62" y="176" width="74" height="7" fill="#e5e7eb" opacity="0.95" />
              <rect x="31" y="150" width="18" height="6" fill="#e5e7eb" transform="rotate(-15 40 153)" />
              <rect x="151" y="150" width="18" height="6" fill="#e5e7eb" transform="rotate(15 160 153)" />
            </g>
          )}
          {/* boyun + baş */}
          <rect x="92" y="74" width="16" height="16" fill={skin} />
          <circle cx="100" cy="54" r="24" fill={skin} />
          <circle cx="91" cy="52" r="2" fill="#333" />
          <circle cx="109" cy="52" r="2" fill="#333" />
          <path d="M93 66 Q100 70 107 66" stroke="#9a6b4f" strokeWidth="1.8" fill="none" />

          {/* eller */}
          {has("el") ? (
            <g className="sw-equip" key="el">
              <circle cx="38" cy="196" r="12" fill="#f59e0b" />
              <circle cx="162" cy="196" r="12" fill="#f59e0b" />
              <rect x="28" y="182" width="20" height="7" rx="2" fill="#b45309" />
              <rect x="152" y="182" width="20" height="7" rx="2" fill="#b45309" />
            </g>
          ) : (
            <>
              <circle cx="38" cy="196" r="9" fill={skin} />
              <circle cx="162" cy="196" r="9" fill={skin} />
            </>
          )}

          {/* ayaklar */}
          {has("ayak") ? (
            <g className="sw-equip" key="ayak">
              <path d="M66 306 L98 306 L100 326 L60 326 Q58 316 66 306 Z" fill="#3f2a1d" />
              <path d="M102 306 L134 306 Q142 316 140 326 L100 326 Z" fill="#3f2a1d" />
              <rect x="60" y="322" width="40" height="5" fill="#facc15" />
              <rect x="100" y="322" width="40" height="5" fill="#facc15" />
            </g>
          ) : (
            <>
              <ellipse cx="82" cy="318" rx="16" ry="8" fill="#9ca3af" />
              <ellipse cx="118" cy="318" rx="16" ry="8" fill="#9ca3af" />
            </>
          )}

          {/* yüksekte çalışma: tam vücut kemeri */}
          {has("yuksekte") && (
            <g className="sw-equip" key="yuksekte" stroke="#facc15" strokeWidth="5" fill="none" strokeLinecap="round">
              <path d="M72 96 L96 168" />
              <path d="M128 96 L104 168" />
              <path d="M66 172 L134 172" />
              <path d="M84 196 L96 220 M116 196 L104 220" />
              <circle cx="100" cy="108" r="5" stroke="#9ca3af" strokeWidth="3" />
            </g>
          )}

          {/* ölçüm: göğüste dedektör */}
          {has("olcum") && (
            <g className="sw-equip" key="olcum">
              <rect x="116" y="104" width="16" height="22" rx="3" fill="#facc15" stroke="#854d0e" />
              <rect x="119" y="108" width="10" height="7" fill="#14532d" />
              <circle cx="124" cy="121" r="2" fill="#22c55e" className="sw-flag" />
            </g>
          )}

          {/* solunum */}
          {has("solunum") && (
            <g className="sw-equip" key="solunum">
              <path d="M84 60 Q100 54 116 60 L114 76 Q100 84 86 76 Z" fill="#4b5563" />
              <circle cx="86" cy="72" r="6" fill="#ec4899" stroke="#831843" />
              <circle cx="114" cy="72" r="6" fill="#ec4899" stroke="#831843" />
            </g>
          )}

          {/* göz */}
          {has("goz") && (
            <g className="sw-equip" key="goz">
              <rect x="78" y="44" width="44" height="14" rx="6" fill="#0ea5e9" opacity="0.75" stroke="#0c4a6e" strokeWidth="2" />
              <line x1="76" y1="51" x2="72" y2="50" stroke="#0c4a6e" strokeWidth="3" />
              <line x1="124" y1="51" x2="128" y2="50" stroke="#0c4a6e" strokeWidth="3" />
            </g>
          )}

          {/* baş: baret */}
          {has("bas") ? (
            <g className="sw-equip" key="bas">
              <path d="M74 44 Q74 18 100 18 Q126 18 126 44 Z" fill={tone === "contractor" ? "#facc15" : "#ffffff"} stroke="#9ca3af" strokeWidth="1.5" />
              <rect x="68" y="40" width="64" height="7" rx="3.5" fill={tone === "contractor" ? "#eab308" : "#f1f5f9"} stroke="#9ca3af" strokeWidth="1.5" />
              <rect x="96" y="18" width="8" height="22" fill={tone === "contractor" ? "#eab308" : "#e1251b"} opacity="0.85" />
            </g>
          ) : (
            <path d="M78 40 Q80 26 100 26 Q120 26 122 40 Q110 34 100 34 Q90 34 78 40 Z" fill="#4a3426" />
          )}

          {/* işitme */}
          {has("isitme") && (
            <g className="sw-equip" key="isitme">
              <path d="M76 52 Q100 6 124 52" stroke="#e1251b" strokeWidth="4" fill="none" />
              <rect x="68" y="46" width="12" height="18" rx="5" fill="#e1251b" />
              <rect x="120" y="46" width="12" height="18" rx="5" fill="#e1251b" />
            </g>
          )}

          {/* eksik işaretleri */}
          {[...flaggedCats].filter(isSlot).map((cat) => {
            const [x, y] = SLOT_ANCHOR[cat];
            return (
              <g key={`f-${cat}`} className="sw-equip">
                <circle cx={x} cy={y} r="15" fill="none" stroke="#e1251b" strokeWidth="3" strokeDasharray="5 4" className="sw-flag" />
                <circle cx={x + 13} cy={y - 13} r="7" fill="#e1251b" />
                <text x={x + 13} y={y - 9.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">!</text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-[11px] font-semibold text-erd-charcoal">{caption}</figcaption>
      {(extras.length > 0 || flaggedCats.size > 0) && (
        <div className="mt-1.5 flex max-w-[12rem] flex-wrap justify-center gap-1">
          {extras.map(({ cat, n }) => (
            <span key={cat} className="rounded-full bg-erd-light px-2 py-0.5 text-[10px] font-semibold text-erd-gray">
              {SLOT_LABEL[cat]}: {n}
            </span>
          ))}
          {[...flaggedCats].map((cat) => (
            <span key={`fl-${cat}`} className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-erd-red">
              Eksik: {SLOT_LABEL[cat] ?? cat}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}
