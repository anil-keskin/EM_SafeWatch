"use client";

import Link from "next/link";
import { Award, Shield, Trophy, type LucideIcon } from "lucide-react";
import AppIcon, { IconWatermark } from "@/components/AppIcon";
import PageShell from "@/components/PageShell";
import ZoneIcon from "@/components/ZoneIcon";
import { competencyLabel } from "@/content/scenarios";
import { scenariosOfZone, useSafeWatchData } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import type { IconTone } from "@/lib/icon-theme";

/**
 * Kişisel rozetler. Sıralama veya başka kullanıcılarla kıyas yoktur;
 * yalnızca bu cihazdaki / bu hesaptaki ilerleme gösterilir.
 */
export default function RozetlerimPage() {
  const { zones, scenarios } = useSafeWatchData();
  const { progress, competencies, ready } = useProgress();

  const completed = Object.entries(progress).filter(
    ([, entry]) => entry.status === "tamamlandi"
  );

  const zoneBadges = zones
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((zone) => {
      const list = scenariosOfZone(scenarios, zone.id);
      const done = list.filter((s) => progress[s.slug]).length;
      return { zone, total: list.length, done, earned: list.length > 0 && done === list.length };
    });

  const strongCompetencies = Object.entries(competencies)
    .filter(([, value]) => value.score >= 80)
    .sort((a, b) => b[1].score - a[1].score);

  return (
    <PageShell>
      <h1 className="flex items-center gap-3 text-2xl font-bold text-erd-charcoal">
        <span className="h-7 w-1 rounded-full bg-erd-red" aria-hidden="true" />
        Rozetlerim
      </h1>
      <p className="mt-1 max-w-xl text-sm text-erd-gray">
        Rozetler yalnızca sizin ilerlemenizi yansıtır. Başkalarıyla karşılaştırma
        yapılmaz.
      </p>

      {!ready ? (
        <p className="mt-10 text-center text-sm text-erd-gray">Yükleniyor…</p>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={Trophy}
              tone="crane"
              label="Tamamlanan senaryo"
              value={String(completed.length)}
            />
            <SummaryCard
              icon={Shield}
              tone="kkd"
              label="Tamamlanan bölge"
              value={String(zoneBadges.filter((b) => b.earned).length)}
            />
            <SummaryCard
              icon={Award}
              tone="steel"
              label="Güçlü yetkinlik"
              value={String(strongCompetencies.length)}
            />
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
              Bölge rozetleri
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {zoneBadges.map(({ zone, total, done, earned }) => (
                <li
                  key={zone.id}
                  className={`relative overflow-hidden flex items-center gap-3 rounded-2xl border p-3.5 ${
                    earned ? "border-erd-red/40 bg-red-50/40" : "border-erd-line bg-white"
                  }`}
                >
                  <ZoneIcon zoneId={zone.id} watermark />
                  <div className="relative flex min-w-0 items-center gap-3">
                    <ZoneIcon zoneId={zone.id} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-erd-charcoal">{zone.name}</p>
                      <p className="text-xs text-erd-gray">
                        {done}/{total} senaryo
                        {earned ? " · Bölge tamamlandı" : ""}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
              Yetkinlik rozetleri
            </h2>
            {strongCompetencies.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-erd-line bg-white p-5 text-sm text-erd-gray">
                Henüz güçlü yetkinlik rozeti yok. Senaryoları tamamladıkça burada
                görünür.
              </p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {strongCompetencies.map(([key, value]) => {
                  const competency = key.split(":")[1] ?? key;
                  return (
                    <li
                      key={key}
                      className="rounded-full border border-erd-red/30 bg-red-50 px-3 py-1.5 text-xs font-semibold text-erd-red"
                    >
                      {competencyLabel(competency)} · {value.score}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <Link href="/saha" className="sw-btn-primary">
            Saha Seçimine Git
          </Link>
        </div>
      )}
    </PageShell>
  );
}

function SummaryCard({
  icon,
  tone,
  label,
  value,
}: {
  icon: LucideIcon;
  tone: IconTone;
  label: string;
  value: string;
}) {
  return (
    <div className="sw-card relative flex items-center gap-3 overflow-hidden p-4">
      <IconWatermark icon={icon} tone={tone} />
      <AppIcon icon={icon} tone={tone} size="md" />
      <div className="relative">
        <p className="text-xs text-erd-gray">{label}</p>
        <p className="text-xl font-bold text-erd-charcoal">{value}</p>
      </div>
    </div>
  );
}
