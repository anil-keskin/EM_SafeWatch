"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, ShieldAlert, ShieldCheck, Siren, TriangleAlert } from "lucide-react";
import { resolveFieldEvent, type EventVerdict, type FieldEvent, type FieldEventResult } from "@/lib/field-events";

const UI: Record<EventVerdict, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  dogru: { label: "Doğru refleks", cls: "bg-emerald-500/15 text-emerald-100 border-emerald-400/40", Icon: ShieldCheck },
  yetki: { label: "Yetki sınırı aşıldı", cls: "bg-amber-500/15 text-amber-100 border-amber-400/40", Icon: ShieldAlert },
  zayif: { label: "Riskli karar", cls: "bg-red-500/15 text-red-100 border-red-400/40", Icon: TriangleAlert },
  gecikme: { label: "Süre doldu", cls: "bg-red-500/15 text-red-100 border-red-400/40", Icon: Clock },
};

/** Kısa iki tonlu alarm sesi (WebAudio). Desteklenmezse sessiz geçer. */
function playAlarm() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.28, 0.56].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = i % 2 ? 660 : 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.24);
    });
    window.setTimeout(() => ctx.close(), 1200);
  } catch {
    /* ses yoksa sorun değil */
  }
}

/**
 * "Durum değişti!" kartı: süre işler, oyuncu tek seçimle karar verir.
 * Karar sonrası gerekçe gösterilir; "Devam et" ile kart kapanır.
 */
export default function FieldEventModal({
  event,
  onDone,
}: {
  event: FieldEvent;
  onDone: (result: FieldEventResult) => void;
}) {
  const started = useRef(performance.now());
  const [left, setLeft] = useState(event.seconds);
  const [result, setResult] = useState<FieldEventResult | null>(null);

  useEffect(() => {
    playAlarm();
  }, []);

  useEffect(() => {
    if (result) return;
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - started.current) / 1000;
      const remain = Math.max(0, event.seconds - elapsed);
      setLeft(remain);
      if (remain <= 0) {
        window.clearInterval(id);
        setResult(resolveFieldEvent(event, null, event.seconds * 1000));
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [event, result]);

  const choose = (id: string) => {
    if (result) return;
    setResult(resolveFieldEvent(event, id, Math.round(performance.now() - started.current)));
  };

  const pct = left / event.seconds;
  const urgent = left <= 5;
  const r = 22;
  const circ = 2 * Math.PI * r;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" role="alertdialog" aria-modal="true" aria-labelledby="fe-title">
      <div className="sw-pop pointer-events-none fixed inset-0 border-[6px] border-erd-red/70 sw-flag" aria-hidden />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#14161d] text-white shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-erd-red to-[#9b1810] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Siren size={22} className="sw-flag" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Durum değişti!</p>
              <h2 id="fe-title" className="text-lg font-black leading-tight">{event.title}</h2>
            </div>
          </div>
          {!result && (
            <div className="relative h-14 w-14 shrink-0" aria-label={`${Math.ceil(left)} saniye`}>
              <svg viewBox="0 0 50 50" className="h-full w-full -rotate-90">
                <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle cx="25" cy="25" r={r} fill="none" stroke={urgent ? "#fde047" : "#fff"} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-lg font-black tabular-nums ${urgent ? "text-yellow-300" : ""}`}>
                {Math.ceil(left)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 p-5">
          <p className="text-sm leading-relaxed text-white/85">{event.situation}</p>
          {event.reading && (
            <p className="rounded-xl border border-lime-400/30 bg-black px-3 py-2 text-center font-mono text-lg font-bold tracking-wider text-lime-300 sw-flag">
              {event.reading}
            </p>
          )}

          {!result ? (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Ne yapıyorsunuz?</p>
              {event.options.map((o, i) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(o.id)}
                  className="sw-rise flex w-full items-start gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm leading-snug transition-all hover:border-erd-red hover:bg-erd-red/20"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30 text-[11px] font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {o.text}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <span className="text-white/50">Kararınız: </span>
                {result.answer}
              </div>
              {(() => {
                const u = UI[result.verdict];
                return (
                  <div className={`sw-pop rounded-2xl border px-4 py-3 text-xs leading-relaxed ${u.cls}`}>
                    <p className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                      <u.Icon size={16} /> {u.label}
                      {result.verdict !== "gecikme" && (
                        <span className="ml-auto font-mono text-[11px] font-semibold opacity-80">
                          {(result.ms / 1000).toFixed(1)} sn
                        </span>
                      )}
                    </p>
                    {result.feedback}
                  </div>
                );
              })()}
              <button type="button" onClick={() => onDone(result)} className="sw-btn-primary w-full">
                Devam et
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
