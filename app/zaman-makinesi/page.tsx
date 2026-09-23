"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, History, Info } from "lucide-react";
import AppIcon, { FilledIcon } from "@/components/AppIcon";
import CircularProgress from "@/components/CircularProgress";
import PageShell from "@/components/PageShell";
import { competencyLabel } from "@/content/scenarios";
import { timeMachineScenarios, useSafeWatchData } from "@/lib/data";
import {
  formatIncidentDate,
  riskTags,
  timeTravelLabel,
} from "@/lib/incident";
import { completedIn, useProgress } from "@/lib/progress";
import type { ProgressMap, Scenario } from "@/lib/types";

/**
 * Zaman Makinesi liste ekranı.
 *
 * Bölge kartı yoktur: havuz açık uçludur ve kronolojik listelenir (en yeni
 * üstte). Tasarım dili Saha Seçimi kartlarıyla aynıdır; yeni bir görsel dil
 * kullanılmaz.
 */
export default function ZamanMakinesiPage() {
  const { scenarios } = useSafeWatchData();
  const { progress } = useProgress();

  const incidents = useMemo(
    () => timeMachineScenarios(scenarios),
    [scenarios]
  );

  const total = incidents.length;
  const done = completedIn(progress, incidents);

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-erd-charcoal">
            <span className="h-7 w-1 rounded-full bg-erd-red" aria-hidden="true" />
            <AppIcon icon={History} tone="crane" size="sm" />
            Zaman Makinesi
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-erd-gray">
            Sahada yaşanan olayların bir gün öncesine dön. Bu kez oradasın —
            fark edebilir misin?
          </p>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-3">
            <CircularProgress value={done} total={total} size={56} />
            <div>
              <p className="text-xs font-medium text-erd-gray">Tamamlanan</p>
              <p className="text-2xl font-bold tabular-nums text-erd-red">
                {done} / {total}
              </p>
            </div>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="sw-card mt-6 p-8 text-center">
          <h2 className="text-lg font-bold text-erd-charcoal">
            Henüz yayında olay yok
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-erd-gray">
            Yaşanmış olaylardan türetilen senaryolar yayına alındığında burada
            kronolojik olarak listelenecek.
          </p>
          <Link href="/saha" className="sw-btn-primary mt-5">
            Saha Seçimine Git
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {incidents.map((scenario) => (
            <IncidentCard
              key={scenario.slug}
              scenario={scenario}
              progress={progress}
            />
          ))}
        </ul>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs leading-snug text-erd-gray">
        <FilledIcon icon={Info} tone="kkd" size={16} className="mt-0.5" />
        Bu senaryolar gerçek olaylardan türetilmiştir ve yalnızca kontrollük,
        yüklenici ve işletme rolleri üzerinden anlatılır. Kişi, sicil veya firma
        bilgisi içermez. Eğitim müfredatındaki 30 senaryodan ayrı sayılır.
      </p>
    </PageShell>
  );
}

function IncidentCard({
  scenario,
  progress,
}: {
  scenario: Scenario;
  progress: ProgressMap;
}) {
  const entry = progress[scenario.slug];
  const isDone = entry?.status === "tamamlandi";
  const tags = riskTags(scenario, competencyLabel);

  return (
    <li className="sw-card overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-erd-line bg-erd-charcoal px-5 py-3">
        <AppIcon icon={History} tone="crane" size="sm" onDark />
        <span className="text-sm font-bold tabular-nums text-white">
          {formatIncidentDate(scenario.incident_date)}
        </span>
        {scenario.incident_unit && (
          <>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <span className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
              {scenario.incident_unit}
            </span>
          </>
        )}
      </header>

      <div className="p-5">
        <h2 className="text-base font-bold leading-snug text-erd-charcoal sm:text-lg">
          {scenario.title}
        </h2>

        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-lg border border-erd-line bg-erd-light px-2.5 py-1 text-[11px] font-medium text-erd-gray"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/senaryo/${scenario.slug}`}
            className="sw-btn-primary inline-flex items-center gap-1.5"
          >
            {timeTravelLabel(scenario.incident_date)}
            <ChevronRight size={16} strokeWidth={2} />
          </Link>

          <span
            className={`text-xs font-semibold ${
              isDone ? "text-emerald-700" : "text-erd-gray"
            }`}
          >
            {isDone ? "✓ Tamamlandı" : "○ Tamamlanmadı"}
          </span>

          {entry && (
            <span className="text-[11px] font-semibold tabular-nums text-erd-gray">
              {entry.best_technical}/{entry.best_behavior}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
