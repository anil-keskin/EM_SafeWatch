"use client";

import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import SceneBackdrop from "@/components/SceneBackdrop";
import {
  InstrumentBar,
  InstrumentOverlay,
  useInstrumentSound,
} from "@/components/FieldInstruments";
import {
  BASELINE,
  alarmFor,
  readField,
  type InstrumentId,
} from "@/lib/field-sensors";
import type { Hazard } from "@/lib/types";

const HOT_ZONES = new Set(["yuksek_firin", "celikhane", "haddehane", "kok_fabrikasi"]);
const DUSTY_ZONES = new Set(["sinter", "liman_stok", "kok_fabrikasi", "yuksek_firin"]);

/** Bölgeye göre hafif hareketli atmosfer: duman, toz, kıvılcım. */
function SceneAtmosphere({ zoneId }: { zoneId: string }) {
  const hot = HOT_ZONES.has(zoneId);
  const dusty = DUSTY_ZONES.has(zoneId);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={`s${i}`}
          className="sw-smoke absolute rounded-full"
          style={{
            left: `${15 + i * 30}%`,
            bottom: "-10%",
            width: "38%",
            aspectRatio: "1",
            animationDelay: `${i * -4}s`,
            background: dusty
              ? "radial-gradient(circle, rgba(190,170,140,0.22), transparent 65%)"
              : "radial-gradient(circle, rgba(200,200,210,0.16), transparent 65%)",
          }}
        />
      ))}
      {hot &&
        Array.from({ length: 10 }).map((_, i) => (
          <span
            key={`k${i}`}
            className="sw-spark absolute h-1 w-1 rounded-full bg-amber-300"
            style={{
              left: `${8 + ((i * 37) % 84)}%`,
              bottom: `${10 + ((i * 13) % 25)}%`,
              animationDelay: `${(i * 0.37) % 3}s`,
              animationDuration: `${1.6 + (i % 4) * 0.5}s`,
            }}
          />
        ))}
      {hot && <span className="sw-heat absolute inset-x-0 bottom-0 h-1/3" />}
    </div>
  );
}

interface HazardSceneProps {
  zoneId: string;
  hazards: Hazard[];
  selected: string[];
  onToggle: (code: string) => void;
  /** Değerlendirme sonrası doğru/yanlış işaretlemeyi gösterir. */
  revealed?: boolean;
}

/**
 * Tehlike tanıma sahnesi.
 * Sahnedeki noktalar numaralıdır ve altında aynı numaralarla "Saha
 * gözlemleri" listesi bulunur. Oyuncu görev kartındaki koşullara bakarak
 * hangi gözlemin bu işte GERÇEK risk olduğuna karar verir; körlemesine
 * tıklama yerine muhakeme ölçülür. Konumlar her denemede rastgele dağılır.
 */
export default function HazardScene({
  zoneId,
  hazards,
  selected,
  onToggle,
  revealed = false,
}: HazardSceneProps) {
  const selectedSet = new Set(selected);
  const [instrument, setInstrument] = useState<InstrumentId | null>(null);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);
  const [sound, setSound] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const reading = useMemo(
    () => (probe ? readField(probe.x, probe.y, hazards) : BASELINE),
    [probe, hazards]
  );
  const level = instrument && probe ? alarmFor(instrument, reading) : "normal";
  useInstrumentSound(sound, instrument, level, reading.doseRate);

  const measuring = Boolean(instrument) && !revealed;
  const onPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!measuring) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setProbe({
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    });
  };

  return (
    <div>
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-erd-line bg-erd-charcoal ${
        measuring ? "cursor-crosshair touch-none" : ""
      }`}
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      onPointerLeave={() => setProbe(null)}
    >
      <div className={instrument === "termal" && !revealed ? "sw-thermal-base absolute inset-0" : "absolute inset-0"}>
        <SceneBackdrop zoneId={zoneId} />
      </div>
      <SceneAtmosphere zoneId={zoneId} />
      {measuring && instrument && (
        <InstrumentOverlay
          instrument={instrument}
          hazards={hazards}
          probe={probe}
          reading={reading}
        />
      )}

      {hazards.length === 0 && (
        <p className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-white/80">
          Bu senaryo için risk noktaları henüz tanımlanmadı. Karar paneline geçerek
          donanım ve müdahale seçimlerini çalışabilirsiniz.
        </p>
      )}

      {hazards.map((hazard, index) => {
        const isSelected = selectedSet.has(hazard.code);
        const showTruth = revealed;
        const correct = showTruth && isSelected && hazard.is_real;
        const wrong = showTruth && isSelected && !hazard.is_real;
        const missed = showTruth && !isSelected && hazard.is_real;

        let ring = "bg-white/15 border-white/60 text-white";
        if (isSelected) ring = "bg-erd-red border-white text-white";
        if (correct) ring = "bg-emerald-500 border-white text-white";
        if (wrong) ring = "bg-erd-red border-white text-white";
        if (missed) ring = "bg-white/25 border-dashed border-amber-300 text-amber-100";

        return (
          <button
            key={hazard.code}
            type="button"
            onClick={() => onToggle(hazard.code)}
            onMouseEnter={() => setHovered(hazard.code)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(hazard.code)}
            onBlur={() => setHovered(null)}
            disabled={revealed}
            style={{ left: `${hazard.x}%`, top: `${hazard.y}%` }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 backdrop-blur-sm
                        transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40
                        ${ring} ${!isSelected && !revealed && hovered !== hazard.code ? "sw-hotspot-idle" : ""}
                        ${hovered === hazard.code ? "z-10 scale-125 ring-4 ring-white/60" : ""}`}
            aria-pressed={isSelected}
            aria-label={revealed ? hazard.label : "İncelenmemiş risk noktası"}
          >
            <span className="flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11">
              {revealed ? (
                <span className="text-sm font-bold">
                  {correct ? "✓" : wrong ? "✕" : missed ? "!" : ""}
                </span>
              ) : isSelected ? (
                <span className="text-sm font-bold">✓</span>
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </span>

            {(revealed || isSelected || hovered === hazard.code) && (
              <span
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-40 -translate-x-1/2
                           rounded-lg bg-erd-charcoal/95 px-2.5 py-1.5 text-center text-[11px]
                           font-medium leading-snug text-white shadow-lg"
              >
                {hazard.label}
              </span>
            )}
          </button>
        );
      })}
    </div>

      {hazards.length > 0 && !revealed && (
        <InstrumentBar
          active={instrument}
          onSelect={(id) => {
            setInstrument(id);
            setProbe(null);
          }}
          sound={sound}
          onSound={setSound}
        />
      )}

      {hazards.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-erd-gray">
            <TriangleAlert size={14} className="text-erd-red" />
            Saha gözlemleri — bu işte gerçek risk olanları seçin
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {hazards.map((hazard, index) => {
              const isSelected = selectedSet.has(hazard.code);
              const correct = revealed && isSelected && hazard.is_real;
              const wrong = revealed && isSelected && !hazard.is_real;
              const missed = revealed && !isSelected && hazard.is_real;
              let tone = "border-erd-line bg-white text-erd-charcoal hover:border-erd-red/40";
              if (isSelected) tone = "border-erd-red bg-red-50 text-erd-charcoal";
              if (correct) tone = "border-emerald-500 bg-emerald-50 text-emerald-900";
              if (wrong) tone = "border-erd-red bg-red-50 text-erd-red";
              if (missed) tone = "border-dashed border-amber-400 bg-amber-50 text-amber-900";
              return (
                <li key={hazard.code}>
                  <button
                    type="button"
                    onClick={() => onToggle(hazard.code)}
                    onMouseEnter={() => setHovered(hazard.code)}
                    onMouseLeave={() => setHovered(null)}
                    disabled={revealed}
                    aria-pressed={isSelected}
                    className={`flex w-full ${hovered === hazard.code ? "ring-2 ring-erd-red/40" : ""} items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${tone}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isSelected ? "bg-erd-red text-white" : "bg-erd-light text-erd-gray"
                      }`}
                    >
                      {isSelected ? "✓" : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{hazard.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
