"use client";

import { useEffect, useRef } from "react";
import {
  Ear,
  Radiation,
  Thermometer,
  Volume2,
  VolumeX,
  Wind,
  type LucideIcon,
} from "lucide-react";
import {
  alarmFor,
  heatSources,
  type AlarmLevel,
  type FieldReading,
  type InstrumentId,
} from "@/lib/field-sensors";
import type { Hazard } from "@/lib/types";

export const INSTRUMENTS: {
  id: InstrumentId;
  label: string;
  short: string;
  Icon: LucideIcon;
  tip: string;
}[] = [
  {
    id: "gaz",
    label: "4'lü gaz dedektörü",
    short: "Gaz",
    Icon: Wind,
    tip: "CO, H₂S, patlayıcı ortam (%LEL) ve oksijen. CO renksiz ve kokusuzdur; ancak dedektörle fark edilir.",
  },
  {
    id: "doz",
    label: "Kişisel dozimetre",
    short: "Doz",
    Icon: Radiation,
    tip: "Radyografi kaynağına yaklaştıkça doz hızı artar. Sınır çizgisi ve mesafe en iyi korumadır.",
  },
  {
    id: "ses",
    label: "Ses seviyesi ölçer",
    short: "Ses",
    Icon: Ear,
    tip: "80 dB(A) alt, 85 dB(A) üst eylem değeri. 85 üzerinde kulak koruyucu zorunludur.",
  },
  {
    id: "termal",
    label: "Termal kamera",
    short: "Termal",
    Icon: Thermometer,
    tip: "Kızgın yüzey ve radyan ısı kaynakları gözle her zaman ayırt edilmez; termal görüntü gösterir.",
  },
];

const LEVEL_STYLE: Record<AlarmLevel, { ring: string; text: string; label: string }> = {
  normal: { ring: "ring-emerald-400/60", text: "text-emerald-300", label: "NORMAL" },
  dikkat: { ring: "ring-amber-400/80", text: "text-amber-300", label: "DİKKAT" },
  alarm: { ring: "ring-red-500", text: "text-red-400", label: "ALARM" },
};

/** Sahne içinde: termal katman + ölçüm noktası + cihaz ekranı. */
export function InstrumentOverlay({
  instrument,
  hazards,
  probe,
  reading,
}: {
  instrument: InstrumentId;
  hazards: Hazard[];
  probe: { x: number; y: number } | null;
  reading: FieldReading;
}) {
  const level = probe ? alarmFor(instrument, reading) : "normal";
  const style = LEVEL_STYLE[level];
  const meta = INSTRUMENTS.find((i) => i.id === instrument)!;

  return (
    <>
      {instrument === "termal" && <ThermalLayer hazards={hazards} />}

      {probe && (
        <span
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${probe.x}%`, top: `${probe.y}%` }}
          aria-hidden="true"
        >
          <span
            className={`block h-14 w-14 rounded-full border-2 border-dashed ${
              level === "alarm"
                ? "border-red-400 sw-probe-alarm"
                : level === "dikkat"
                  ? "border-amber-300"
                  : "border-white/70"
            }`}
          />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </span>
      )}

      <div
        className={`pointer-events-none absolute top-1.5 z-30 w-[8.75rem] rounded-lg bg-black/75 p-1.5 font-mono text-white shadow-xl ring-2 backdrop-blur transition-[left,right] sm:top-3 sm:w-52 sm:rounded-xl sm:p-2.5 ${
          probe && probe.x < 50 && probe.y < 55 ? "right-1.5 sm:right-3" : "left-1.5 sm:left-3"
        } ${style.ring} ${
          level === "alarm" ? "sw-device-alarm" : ""
        }`}
        role="status"
        aria-label={`${meta.label}: ${style.label}`}
      >
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/60">
          <span className="flex items-center gap-1">
            <meta.Icon size={12} /> {meta.short}
          </span>
          <span className={`font-bold ${style.text}`}>{probe ? style.label : "ÖLÇÜM YOK"}</span>
        </div>
        <Readout instrument={instrument} reading={reading} active={Boolean(probe)} />
        {!probe && (
          <p className="mt-1.5 hidden font-sans text-[10px] leading-snug text-white/60 sm:block">
            Cihazı sahada gezdirin.
          </p>
        )}
      </div>
    </>
  );
}

function Cell({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: string;
  unit: string;
  warn: boolean;
}) {
  return (
    <div className={`rounded-md bg-white/5 px-1.5 py-1 ${warn ? "text-red-300" : "text-emerald-200"}`}>
      <div className="text-[9px] uppercase text-white/50">{label}</div>
      <div className="text-xs font-bold tabular-nums leading-tight sm:text-sm">
        {value}
        <span className="ml-0.5 text-[9px] font-normal text-white/50">{unit}</span>
      </div>
    </div>
  );
}

function Readout({
  instrument,
  reading,
  active,
}: {
  instrument: InstrumentId;
  reading: FieldReading;
  active: boolean;
}) {
  const dash = (v: string) => (active ? v : "--");
  if (instrument === "gaz") {
    const g = reading.gas;
    return (
      <div className="grid grid-cols-2 gap-1">
        <Cell label="CO" value={dash(String(g.co))} unit="ppm" warn={active && g.co >= 35} />
        <Cell label="H₂S" value={dash(g.h2s.toFixed(1))} unit="ppm" warn={active && g.h2s >= 10} />
        <Cell label="LEL" value={dash(String(g.lel))} unit="%" warn={active && g.lel >= 10} />
        <Cell label="O₂" value={dash(g.o2.toFixed(1))} unit="%" warn={active && g.o2 < 19.5} />
      </div>
    );
  }
  const map = {
    doz: { label: "Doz hızı", value: reading.doseRate.toFixed(2), unit: "µSv/h", warn: reading.doseRate >= 2.5 },
    ses: { label: "Ses düzeyi", value: String(reading.noise), unit: "dB(A)", warn: reading.noise >= 85 },
    termal: { label: "Yüzey / ortam", value: String(reading.temperature), unit: "°C", warn: reading.temperature >= 60 },
  }[instrument];
  return <Cell label={map.label} value={dash(map.value)} unit={map.unit} warn={active && map.warn} />;
}

function ThermalLayer({ hazards }: { hazards: Hazard[] }) {
  const sources = heatSources(hazards);
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] sw-thermal" aria-hidden="true">
      {sources.map((s, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${18 + s.intensity * 22}%`,
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(255,255,220,0.95) 0%, rgba(255,210,40,0.85) 18%, rgba(255,90,0,0.7) 38%, rgba(190,0,60,0.45) 60%, rgba(60,0,120,0) 75%)",
            opacity: s.intensity,
            mixBlendMode: "screen",
          }}
        />
      ))}
      <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
        IR · 31°C ▸ 1500°C
      </span>
    </div>
  );
}

/** Sahnenin altındaki cihaz seçim çubuğu. */
export function InstrumentBar({
  active,
  onSelect,
  sound,
  onSound,
}: {
  active: InstrumentId | null;
  onSelect: (id: InstrumentId | null) => void;
  sound: boolean;
  onSound: (v: boolean) => void;
}) {
  const meta = INSTRUMENTS.find((i) => i.id === active);
  return (
    <div className="mt-3 rounded-xl border border-erd-line bg-white p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
          Saha cihazları
        </span>
        {INSTRUMENTS.map(({ id, short, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(on ? null : id)}
              aria-pressed={on}
              title={label}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                on
                  ? "border-erd-charcoal bg-erd-charcoal text-white"
                  : "border-erd-line bg-white text-erd-charcoal hover:border-erd-charcoal/40"
              }`}
            >
              <Icon size={14} /> {short}
            </button>
          );
        })}
        {active && (
          <button
            type="button"
            onClick={() => onSound(!sound)}
            aria-pressed={sound}
            title={sound ? "Cihaz sesini kapat" : "Cihaz sesini aç"}
            className="ml-auto flex items-center gap-1 rounded-lg border border-erd-line px-2 py-1.5 text-xs text-erd-gray hover:text-erd-charcoal"
          >
            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">{sound ? "Ses açık" : "Ses kapalı"}</span>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-erd-gray">
        {meta
          ? meta.tip
          : "Bir cihaz seçip sahnede gezdirin. Gerçek tehlike ölçümde iz bırakır; ölçerek doğrulamak iyi kontrollük alışkanlığıdır. Puanı etkilemez."}
      </p>
    </div>
  );
}

/**
 * Cihaz sesi: gaz/ses/termal için alarm bip'i, dozimetre için Geiger tıkırtısı.
 * Varsayılan kapalıdır; yalnızca kullanıcı açınca çalışır.
 */
export function useInstrumentSound(
  enabled: boolean,
  instrument: InstrumentId | null,
  level: AlarmLevel,
  doseRate: number
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stateRef = useRef({ level, doseRate });
  stateRef.current = { level, doseRate };

  useEffect(() => {
    if (!enabled || !instrument || typeof window === "undefined") return;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    ctxRef.current ??= new Ctx();
    const ctx = ctxRef.current;
    void ctx.resume();

    const blip = (freq: number, dur: number, gain: number, type: OscillatorType = "square") => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    };

    let last = 0;
    const timer = window.setInterval(() => {
      const { level: lv, doseRate: dr } = stateRef.current;
      const now = performance.now();
      if (instrument === "doz") {
        // Poisson tıkırtı: doz hızıyla artar.
        const perSecond = Math.min(45, 0.6 + dr * 0.9);
        if (Math.random() < perSecond * 0.04) blip(1800 + Math.random() * 600, 0.012, 0.25, "square");
        return;
      }
      const gap = lv === "alarm" ? 260 : lv === "dikkat" ? 900 : Infinity;
      if (now - last >= gap) {
        last = now;
        blip(lv === "alarm" ? 2900 : 2200, 0.09, 0.08);
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [enabled, instrument]);
}
