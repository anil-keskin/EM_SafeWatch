import { MessagesSquare, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import type { DialogueResult } from "@/lib/dialogue";

const CHIP = {
  dogru: { label: "Doğru yaklaşım", cls: "bg-emerald-50 text-emerald-700", Icon: ShieldCheck },
  yetki: { label: "Yetki sınırı aşıldı", cls: "bg-amber-50 text-amber-700", Icon: ShieldAlert },
  zayif: { label: "Zayıf yaklaşım", cls: "bg-red-50 text-erd-red", Icon: TriangleAlert },
} as const;

export default function DialogueSummary({ dialogue }: { dialogue?: DialogueResult }) {
  if (!dialogue || dialogue.picks.length === 0) return null;
  const pct = Math.round((dialogue.correct / Math.max(dialogue.total, 1)) * 100);
  return (
    <div className="sw-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-erd-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-erd-charcoal text-white">
            <MessagesSquare size={18} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-erd-red">Saha diyaloğu</p>
            <h2 className="text-lg font-bold text-erd-charcoal">
              {dialogue.correct}/{dialogue.total} konuşmada doğru yaklaşım
            </h2>
          </div>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-erd-line">
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol className="divide-y divide-erd-line">
        {dialogue.picks.map((p, i) => {
          const c = CHIP[p.verdict];
          return (
            <li key={`${p.roundId}-${i}`} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-[11px] font-semibold text-erd-gray">{p.speaker}</p>
                <p className="mt-1 text-sm italic leading-snug text-erd-charcoal">&ldquo;{p.line}&rdquo;</p>
                <p className="mt-2 rounded-xl bg-erd-light px-3 py-2 text-sm leading-snug text-erd-charcoal">
                  <span className="font-semibold">Cevabınız: </span>
                  {p.answer}
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${c.cls}`}>
                  <c.Icon size={13} /> {c.label}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-erd-gray">{p.feedback}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
