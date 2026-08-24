"use client";

import Link from "next/link";
import { useMemo } from "react";
import PageShell from "@/components/PageShell";
import ProgressBar from "@/components/ProgressBar";
import ZoneIcon from "@/components/ZoneIcon";
import { competencyLabel } from "@/content/scenarios";
import { useSafeWatchData } from "@/lib/data";
import { completedCount, useProgress } from "@/lib/progress";
import { scoreBand } from "@/lib/scoring";

/** Bu eşiğin altındaki yetkinlikler "gelişime açık alan" olarak sunulur. */
const WEAK_THRESHOLD = 70;

interface ZoneReport {
  zoneId: string;
  zoneName: string;
  average: number;
  weak: Array<{ competency: string; score: number }>;
  strong: Array<{ competency: string; score: number }>;
}

export default function GelisimPage() {
  const { zones, scenarios } = useSafeWatchData();
  const { progress, competencies, ready, reset } = useProgress();

  const done = completedCount(progress);
  const total = scenarios.length;

  const reports = useMemo<ZoneReport[]>(() => {
    const byZone = new Map<string, Array<{ competency: string; score: number }>>();

    for (const [key, value] of Object.entries(competencies)) {
      const [, competency] = key.split(":");
      const list = byZone.get(value.zone_id) ?? [];
      list.push({ competency, score: value.score });
      byZone.set(value.zone_id, list);
    }

    return Array.from(byZone.entries())
      .map(([zoneId, entries]) => {
        const average = Math.round(
          entries.reduce((sum, e) => sum + e.score, 0) / entries.length
        );
        return {
          zoneId,
          zoneName: zones.find((z) => z.id === zoneId)?.name ?? zoneId,
          average,
          weak: entries
            .filter((e) => e.score < WEAK_THRESHOLD)
            .sort((a, b) => a.score - b.score),
          strong: entries
            .filter((e) => e.score >= WEAK_THRESHOLD)
            .sort((a, b) => b.score - a.score),
        };
      })
      .sort((a, b) => a.average - b.average);
  }, [competencies, zones]);

  const overall = useMemo(() => {
    const values = Object.values(competencies).map((c) => c.score);
    if (values.length === 0) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [competencies]);

  const weakestZone = reports.find((r) => r.weak.length > 0);

  return (
    <PageShell className="space-y-5">
      <header>
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-erd-charcoal">
          <span className="h-7 w-1 rounded-full bg-erd-red" aria-hidden="true" />
          İlerlemem
        </h1>
        <p className="mt-1 text-sm text-erd-gray">
          Bu rapor bir değerlendirme notu değil, hangi konuda tekrar
          yapmanızın faydalı olacağını gösteren bir yol haritasıdır. Sıralama
          yoktur; yalnızca sizin gelişiminiz gösterilir.
        </p>
      </header>

      {!ready ? (
        <p className="py-16 text-center text-sm text-erd-gray">Yükleniyor…</p>
      ) : reports.length === 0 ? (
        <div className="sw-card p-8 text-center">
          <h2 className="text-lg font-bold text-erd-charcoal">
            Henüz raporlanacak veri yok
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-erd-gray">
            İlk senaryonuzu tamamladığınızda bölge ve yetkinlik bazında
            gelişim özetiniz burada oluşacak.
          </p>
          <Link href="/saha" className="sw-btn-primary mt-5">
            Saha Seçimine Git
          </Link>
        </div>
      ) : (
        <>
          <section className="sw-card p-5">
            <ProgressBar
              value={done}
              total={total}
              label="Tamamlanan senaryo"
            />
            <p className="mt-4 text-sm leading-relaxed text-erd-charcoal">
              {buildCoachingText(overall, weakestZone)}
            </p>
            {weakestZone && (
              <Link
                href="/saha"
                className="sw-btn-primary mt-4"
                aria-label={`${weakestZone.zoneName} bölgesine git`}
              >
                {weakestZone.zoneName} bölgesine git
              </Link>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
              Bölge Bazında Durum
            </h2>
            {reports.map((report) => {
              const band = scoreBand(report.average);
              return (
                <article
                  key={report.zoneId}
                  className="sw-card relative overflow-hidden p-4"
                >
                  <ZoneIcon zoneId={report.zoneId} watermark />
                  <div className="relative flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ZoneIcon zoneId={report.zoneId} />
                      <h3 className="text-sm font-bold text-erd-charcoal">
                        {report.zoneName}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-erd-gray">
                      Ortalama {report.average}/100 · {band.label}
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-erd-line">
                    <div
                      className="h-full rounded-full bg-erd-red transition-[width] duration-700"
                      style={{ width: `${report.average}%` }}
                    />
                  </div>

                  {report.weak.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-erd-red">
                        Gelişime açık alanlar
                      </p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {report.weak.map((item) => (
                          <li
                            key={item.competency}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-erd-red"
                          >
                            {competencyLabel(item.competency)} · {item.score}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.strong.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
                        Güçlü olduğunuz alanlar
                      </p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {report.strong.map((item) => (
                          <li
                            key={item.competency}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800"
                          >
                            {competencyLabel(item.competency)} · {item.score}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <section className="sw-card p-4">
            <p className="text-xs leading-snug text-erd-gray">
              İlerlemeniz bu cihazda saklanır. Sıfırlarsanız tüm skorlar ve
              gelişim özetiniz silinir.
            </p>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Tüm ilerlemeniz ve gelişim özetiniz silinecek. Devam edilsin mi?"
                  )
                ) {
                  reset();
                }
              }}
              className="sw-btn-ghost mt-3 text-xs"
            >
              İlerlemeyi Sıfırla
            </button>
          </section>
        </>
      )}
    </PageShell>
  );
}

/** Kurumsal koçluk diliyle özet metni üretir. Yargılayıcı ifade kullanılmaz. */
function buildCoachingText(
  overall: number | null,
  weakest: ZoneReport | undefined
): string {
  if (overall === null) return "";

  const opening =
    overall >= 80
      ? "Genel yaklaşımınız güçlü ve tutarlı."
      : overall >= 55
        ? "Genel yaklaşımınız sağlam; temel refleksleriniz yerinde."
        : "Temeli kurmaya başlamışsınız; birkaç tekrar belirgin fark yaratacak.";

  if (!weakest || weakest.weak.length === 0) {
    return `${opening} Şu ana kadar çözdüğünüz senaryolarda belirgin bir gelişim alanı öne çıkmadı. Yeni bölgelerdeki senaryoları çözerek yetkinlik haritanızı genişletebilirsiniz.`;
  }

  const topics = weakest.weak
    .slice(0, 2)
    .map((w) => competencyLabel(w.competency).toLocaleLowerCase("tr"))
    .join(" ve ");

  return `${opening} Gelişime açık alan: ${weakest.zoneName} bölgesinde ${topics} konusunda bazı noktaları gözden kaçırdınız. Bu bölümdeki senaryoları tekrar çözmeniz faydalı olacaktır.`;
}
