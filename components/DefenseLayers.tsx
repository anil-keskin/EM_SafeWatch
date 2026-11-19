"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, OctagonAlert, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ChainLink, DefenseLayer } from "@/lib/consequences";
import { stopLayerIndex } from "@/lib/consequences";

/**
 * İsviçre peyniri modeli: tehlike oku soldan katmanlara doğru ilerler.
 * İlk sağlam katmanda durur; hiçbiri sağlam değilse olaya ulaşır.
 */
export default function DefenseLayers({
  layers,
  chain,
}: {
  layers: DefenseLayer[];
  chain: ChainLink[];
}) {
  const [showAll, setShowAll] = useState(false);
  // Animasyon bölüm ekrana girdiğinde başlar.
  const stageRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (layers.every((l) => l.idle)) return null;
  const stop = stopLayerIndex(layers);
  const sliceX = (i: number) => 170 + i * 120;
  const endX = stop >= 0 ? sliceX(stop) - 4 : 650;
  const len = endX - 70;
  const stoppedLayer = stop >= 0 ? layers[stop] : null;

  const kacti = chain.filter((c) => c.kind === "kacti");
  const yetki = chain.filter((c) => c.kind === "yetki");
  const onlendi = chain.filter((c) => c.kind === "onlendi");

  return (
    <div className="sw-card overflow-hidden">
      <div className="border-b border-erd-line px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-erd-red">
          Savunma katmanları · İsviçre peyniri modeli
        </p>
        <h2 className="mt-1 text-lg font-bold text-erd-charcoal">
          {stoppedLayer
            ? `Zincir "${stoppedLayer.title}" katmanında kesildi.`
            : "Hiçbir katman zinciri kesmedi: tehlike olaya dönüşebilirdi."}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-erd-gray">
          Her katmandaki kaçırılan kalem bir açıktır. Kaza, açıklar tüm
          katmanlarda hizalandığında olur; tek bir sağlam katman zinciri keser.
        </p>
      </div>

      <div ref={stageRef} className="overflow-x-auto bg-gradient-to-b from-[#0b0f16] to-[#1a1420] px-2 py-3">
        <svg key={visible ? "play" : "wait"} data-play={visible || undefined} viewBox="0 0 720 230" className="mx-auto block w-full max-w-3xl" role="img" aria-label="Savunma katmanları animasyonu">
          <defs>
            <linearGradient id="dl-cheese" x1="0" x2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* tehlike kaynağı */}
          <g>
            <circle cx="52" cy="100" r="30" fill="#e1251b" opacity="0.18" className="sw-flag" />
            <path d="M52 78 L74 116 L30 116 Z" fill="#e1251b" stroke="#fff" strokeWidth="2" />
            <text x="52" y="111" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff">!</text>
            <text x="52" y="150" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fca5a5">Tehlike</text>
          </g>

          {/* katmanlar */}
          {layers.map((l, i) => {
            const x = sliceX(i);
            const passed = stop < 0 || i < stop;
            const holes = Math.min(l.holes, 4);
            return (
              <g key={l.id} className="sw-rise" style={{ animationDelay: `${i * 120}ms` }}>
                <path
                  d={`M${x} 34 L${x + 34} 22 L${x + 34} 168 L${x} 180 Z`}
                  fill={l.idle ? "#374151" : "url(#dl-cheese)"}
                  stroke={l.idle ? "#4b5563" : "#b45309"}
                  strokeWidth="1.5"
                  opacity={l.idle ? 0.6 : 1}
                />
                {Array.from({ length: holes }).map((_, h) => {
                  // İlk delik, ok geçiyorsa okun hizasında durur.
                  const cy = h === 0 && passed ? 100 : [50, 148, 74, 124][h];
                  return (
                    <ellipse key={h} cx={x + 17} cy={cy} rx="8" ry="10" fill="#0b0f16" stroke="#92400e" />
                  );
                })}
                {!l.idle && l.holes === 0 && i === stop && (
                  <g className="sw-pop" style={{ animationDelay: "1.5s", transformBox: "fill-box", transformOrigin: "center" }}>
                    <circle cx={x + 17} cy="98" r="15" fill="#10b981" stroke="#fff" strokeWidth="2.5" />
                    <path d={`M${x + 10} 98 l5 5 l9 -10`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </g>
                )}
                <text className="dl-label" x={x + 17} y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill="#e5e7eb">
                  {l.title}
                </text>
                <text
                  className="dl-label"
                  x={x + 17}
                  y="216"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={l.idle ? "#9ca3af" : l.holes === 0 ? "#6ee7b7" : "#fca5a5"}
                >
                  {l.idle ? "Bu senaryoda yok" : l.holes === 0 ? "Sağlam" : `${l.holes} açık`}
                </text>
              </g>
            );
          })}

          {/* olay */}
          <g opacity={stop < 0 ? 1 : 0.25}>
            <circle cx="672" cy="100" r="26" fill={stop < 0 ? "#e1251b" : "#374151"} className={stop < 0 ? "sw-pop" : ""} style={{ animationDelay: "1.6s", transformBox: "fill-box", transformOrigin: "center" }} />
            <text x="672" y="106" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff">✕</text>
            <text x="672" y="150" textAnchor="middle" fontSize="11" fontWeight="700" fill={stop < 0 ? "#fca5a5" : "#6b7280"}>Olay</text>
          </g>

          {/* tehlike oku */}
          <path
            d={`M70 100 L${endX} 100`}
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            className="dl-arrow"
            style={{ strokeDasharray: len, strokeDashoffset: len, ["--dl-len" as string]: len }}
          />
          <circle r="7" cy="100" fill="#fff" className="dl-head" style={{ ["--dl-end" as string]: `${endX - 70}px` }} cx="70" />
        </svg>
      </div>

      <ul className="grid grid-cols-2 gap-1.5 border-b border-erd-line px-4 py-3 sm:hidden">
        {layers.map((l, i) => (
          <li key={l.id} className="flex items-center justify-between gap-2 rounded-lg bg-erd-light px-2.5 py-1.5 text-[11px]">
            <span className="font-semibold text-erd-charcoal">{i + 1}. {l.title}</span>
            <span className={`shrink-0 font-bold ${l.idle ? "text-erd-gray" : l.holes === 0 ? "text-emerald-600" : "text-erd-red"}`}>
              {l.idle ? "—" : l.holes === 0 ? "Sağlam" : `${l.holes} açık`}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-erd-charcoal">
            <OctagonAlert size={16} className="text-erd-red" /> Sonuç zinciri
          </h3>
          {kacti.length + yetki.length === 0 ? (
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              Bu senaryoda zinciri büyütecek bir açık bırakmadınız.
            </p>
          ) : (
            <ol className="relative mt-3 space-y-3 border-l-2 border-dashed border-red-200 pl-4">
              {[...yetki, ...kacti].slice(0, showAll ? undefined : 5).map((c, i) => (
                <li key={`${c.title}-${i}`} className="sw-rise relative" style={{ animationDelay: `${400 + i * 90}ms` }}>
                  <span className={`absolute -left-[1.6rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ${c.kind === "yetki" ? "bg-amber-500" : "bg-erd-red"}`}>
                    {c.kind === "yetki" ? <ShieldAlert size={12} /> : <TriangleAlert size={12} />}
                  </span>
                  <p className="text-sm font-semibold leading-snug text-erd-charcoal">{c.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-erd-gray">{c.outcome}</p>
                </li>
              ))}
            </ol>
          )}
          {kacti.length + yetki.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 text-xs font-semibold text-erd-red hover:underline"
            >
              {showAll ? "Daha az göster" : `+${kacti.length + yetki.length - 5} açık daha göster`}
            </button>
          )}
        </div>
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-erd-charcoal">
            <CircleCheck size={16} className="text-emerald-600" /> Önlenenler
          </h3>
          {onlendi.length === 0 ? (
            <p className="mt-2 rounded-xl bg-erd-light px-3 py-2.5 text-sm text-erd-gray">
              Bu denemede zinciri kıran doğru adım kaydedilmedi.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {onlendi.map((c, i) => (
                <li key={`${c.title}-${i}`} className="sw-rise flex gap-2.5 rounded-xl bg-emerald-50 px-3 py-2" style={{ animationDelay: `${500 + i * 90}ms` }}>
                  <CircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>
                    <span className="block text-sm font-semibold text-emerald-900">{c.title}</span>
                    <span className="block text-xs text-emerald-800/80">{c.outcome}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
