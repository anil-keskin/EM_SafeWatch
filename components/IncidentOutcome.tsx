import { History } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import { formatIncidentDate } from "@/lib/incident";
import type { Scenario } from "@/lib/types";

/**
 * "Peki gerçekte ne oldu?" bloğu.
 *
 * Yalnızca time_machine senaryolarda ve sonuç ekranındaki puan barlarının
 * ALTINDA görünür: oyuncu önce kendi kararını görür, sonra gerçeği öğrenir.
 * Ton öğreticidir, suçlayıcı değildir; kişi, sicil veya firma bilgisi geçmez.
 *
 * Olay alanları boşsa (eğitim senaryoları) hiç render edilmez.
 */
export default function IncidentOutcome({ scenario }: { scenario: Scenario }) {
  const { incident_outcome, incident_lesson, incident_unit } = scenario;
  if (!incident_outcome && !incident_lesson) return null;

  const date = formatIncidentDate(scenario.incident_date);
  const heading = [date, incident_unit].filter(Boolean).join(" — ");

  return (
    <section className="overflow-hidden rounded-2xl border-l-4 border-erd-red bg-erd-charcoal">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3.5">
        <AppIcon icon={History} tone="crane" size="sm" onDark />
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">
          Peki gerçekte ne oldu?
        </h2>
      </div>

      <div className="space-y-4 px-5 py-4">
        {heading && (
          <p className="text-xs font-semibold tabular-nums text-[#FFCDD2]">
            {heading}
          </p>
        )}

        {incident_outcome && (
          <p className="text-sm leading-relaxed text-white/85">
            {incident_outcome}
          </p>
        )}

        {incident_lesson && (
          <div className="rounded-xl bg-white/[0.07] px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FFCDD2]">
              Çıkarılan ders
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              {incident_lesson}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
