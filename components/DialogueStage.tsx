"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, HardHat, Radio, ShieldAlert, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import type { DialoguePick, DialogueRound, Verdict } from "@/lib/dialogue";

const VERDICT_UI: Record<Verdict, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  dogru: { label: "Doğru yaklaşım", cls: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100", Icon: ShieldCheck },
  yetki: { label: "Yetki sınırı aşıldı", cls: "border-amber-400/40 bg-amber-500/15 text-amber-100", Icon: ShieldAlert },
  zayif: { label: "Zayıf yaklaşım", cls: "border-red-400/40 bg-red-500/15 text-red-100", Icon: TriangleAlert },
};

type Phase = "typing" | "choose" | "answered" | "reply";

/**
 * Saha diyaloğu: karşı taraf konuşur, kontrolör cevabını seçer, geri
 * bildirim ve karşı tarafın tepkisi gelir. Seçim geri alınamaz.
 */
export default function DialogueStage({
  rounds,
  onFinish,
  onSkip,
}: {
  rounds: DialogueRound[];
  onFinish: (picks: DialoguePick[]) => void;
  onSkip: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [picks, setPicks] = useState<DialoguePick[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const round = rounds[index];
  const pick = picks.find((p) => p.roundId === round?.id);
  const option = round?.options.find((o) => o.id === pick?.optionId);

  useEffect(() => {
    setPhase("typing");
    const t = window.setTimeout(() => setPhase("choose"), 900);
    return () => window.clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (phase !== "answered") return;
    const t = window.setTimeout(() => setPhase("reply"), 1100);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [phase, index]);

  if (!round) return null;
  const last = index === rounds.length - 1;
  const SpeakerIcon = round.speaker.role === "isletme" ? Building2 : HardHat;
  const speakerTone =
    round.speaker.role === "isletme" ? "bg-sky-500/20 text-sky-200 ring-sky-400/30" : "bg-amber-500/20 text-amber-200 ring-amber-400/30";

  const choose = (optionId: string, verdict: Verdict) => {
    if (pick || phase !== "choose") return;
    // Çift tıklamada aynı tura ikinci cevap yazılmaz.
    setPicks((prev) =>
      prev.some((p) => p.roundId === round.id)
        ? prev
        : [...prev, { roundId: round.id, optionId, verdict }]
    );
    setPhase("answered");
  };

  return (
    <div className="sw-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-erd-charcoal px-5 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-erd-red">
            <Radio size={16} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">4. Saha diyaloğu</p>
            <p className="text-sm font-bold">Yetki sınırı ve iletişim</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Tur ${index + 1} / ${rounds.length}`}>
          {rounds.map((r, i) => {
            const p = picks.find((x) => x.roundId === r.id);
            return (
              <span
                key={r.id}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6" : "w-2"} ${
                  p ? (p.verdict === "dogru" ? "bg-emerald-400" : p.verdict === "yetki" ? "bg-amber-400" : "bg-red-400") : i === index ? "bg-white" : "bg-white/25"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="min-h-[24rem] space-y-3 bg-gradient-to-b from-[#111722] to-[#1c1a22] p-4 sm:p-6">
        <p className="mx-auto w-fit rounded-full bg-white/10 px-3 py-1 text-center text-[11px] text-white/70">
          {round.situation}
        </p>

        {/* karşı taraf */}
        <div className="flex items-end gap-2.5">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${speakerTone}`}>
            <SpeakerIcon size={20} />
          </span>
          <div className="max-w-[85%]">
            <p className="mb-1 text-[11px] font-semibold text-white/55">
              {round.speaker.title} · {round.speaker.org}
            </p>
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm leading-relaxed text-erd-charcoal shadow-lg">
              {phase === "typing" ? (
                <span className="flex gap-1 py-1" aria-label="Yazıyor">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-erd-gray/60" style={{ animationDelay: `${d * 140}ms` }} />
                  ))}
                </span>
              ) : (
                <span className="sw-rise block">{round.line}</span>
              )}
            </div>
          </div>
        </div>

        {/* cevap seçenekleri */}
        {phase === "choose" && !pick && (
          <div className="space-y-2 pt-2">
            <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-white/50">Cevabınız</p>
            {round.options.map((o, i) => (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(o.id, o.verdict)}
                className="sw-rise group ml-auto flex w-full max-w-[92%] items-start gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm leading-snug text-white transition-all hover:-translate-x-1 hover:border-erd-red hover:bg-erd-red/20"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30 text-[11px] font-bold group-hover:border-white">
                  {String.fromCharCode(65 + i)}
                </span>
                {o.text}
              </button>
            ))}
          </div>
        )}

        {/* seçilen cevap + geri bildirim + tepki */}
        {pick && option && (
          <>
            <div className="flex items-end justify-end gap-2.5">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-erd-red px-4 py-3 text-sm leading-relaxed text-white shadow-lg sw-rise">
                {option.text}
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-erd-red">
                <UserRound size={20} />
              </span>
            </div>

            {(() => {
              const v = VERDICT_UI[option.verdict];
              return (
                <div className={`sw-pop mx-auto max-w-xl rounded-2xl border px-4 py-3 text-xs leading-relaxed ${v.cls}`}>
                  <p className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                    <v.Icon size={16} /> {v.label}
                  </p>
                  {option.feedback}
                </div>
              );
            })()}

            {phase === "reply" && (
              <div className="flex items-end gap-2.5 sw-rise">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${speakerTone}`}>
                  <SpeakerIcon size={20} />
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm italic leading-relaxed text-erd-charcoal">
                  {option.reply}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-erd-line px-5 py-3">
        <button type="button" onClick={onSkip} className="text-xs font-semibold text-erd-gray hover:text-erd-charcoal hover:underline">
          Diyaloğu atla, değerlendir
        </button>
        {phase === "reply" &&
          (last ? (
            <button type="button" onClick={() => onFinish(picks)} className="sw-btn-primary">
              Değerlendirmeyi gör
            </button>
          ) : (
            <button type="button" onClick={() => setIndex((i) => i + 1)} className="sw-btn-primary">
              Sonraki konuşma
            </button>
          ))}
      </div>
    </div>
  );
}
