import { Clock, ShieldAlert, ShieldCheck, Siren, TriangleAlert } from "lucide-react";
import type { FieldEventResult } from "@/lib/field-events";

const CHIP = {
  dogru: { label: "Doğru refleks", cls: "bg-emerald-50 text-emerald-700", Icon: ShieldCheck },
  yetki: { label: "Yetki sınırı aşıldı", cls: "bg-amber-50 text-amber-700", Icon: ShieldAlert },
  zayif: { label: "Riskli karar", cls: "bg-red-50 text-erd-red", Icon: TriangleAlert },
  gecikme: { label: "Süre doldu", cls: "bg-red-50 text-erd-red", Icon: Clock },
} as const;

export default function FieldEventSummary({ event }: { event: FieldEventResult }) {
  const c = CHIP[event.verdict];
  return (
    <div className="sw-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-erd-line bg-gradient-to-r from-red-50 to-white px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-erd-red text-white">
          <Siren size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-erd-red">Durum değişti · Anlık olay</p>
          <h2 className="text-lg font-bold text-erd-charcoal">{event.title}</h2>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${c.cls}`}>
          <c.Icon size={14} /> {c.label}
          {event.verdict !== "gecikme" && (
            <span className="ml-1 font-mono">{(event.ms / 1000).toFixed(1)} sn</span>
          )}
        </span>
      </div>
      <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
        <div>
          <p className="text-sm italic leading-snug text-erd-charcoal">{event.situation}</p>
          <p className="mt-2 rounded-xl bg-erd-light px-3 py-2 text-sm leading-snug text-erd-charcoal">
            <span className="font-semibold">Kararınız: </span>
            {event.answer}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-erd-gray">{event.feedback}</p>
      </div>
    </div>
  );
}
