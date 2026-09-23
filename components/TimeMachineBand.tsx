import { History } from "lucide-react";
import { formatDayBefore } from "@/lib/incident";

/**
 * Zaman Makinesi geçiş bandı.
 *
 * Yalnızca time_machine senaryolarda, Görev Kartı'nın üstünde görünür.
 * Tarih olayın bir gün öncesidir: oyuncu henüz hiçbir şeyin olmadığı ana
 * döner. Training senaryolarda hiç render edilmez.
 */
export default function TimeMachineBand({
  incidentDate,
}: {
  incidentDate?: string;
}) {
  const day = formatDayBefore(incidentDate);
  if (!day) return null;

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-2xl border-l-4 border-erd-red bg-erd-charcoal px-4 py-3">
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-erd-red/20"
        aria-hidden
      >
        <History size={18} strokeWidth={1.8} className="text-[#FFCDD2]" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold tabular-nums text-white">{day}</p>
        <p className="mt-0.5 text-xs leading-snug text-white/70">
          Olaydan 1 gün önce. Henüz hiçbir şey olmadı.
        </p>
      </div>
    </div>
  );
}
