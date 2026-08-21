"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ClipboardList, Info, LayoutGrid, Search, Trophy } from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import PageShell from "@/components/PageShell";
import ZoneIcon from "@/components/ZoneIcon";
import { scenariosOfZone, useSafeWatchData } from "@/lib/data";
import { completedCount, useProgress } from "@/lib/progress";
import type { ProgressMap, Scenario, Zone } from "@/lib/types";

type Filter = "all" | "done" | "open";

const FILTER_LABEL: Record<Filter, string> = {
  all: "Tümü",
  done: "Tamamlanan",
  open: "Devam eden",
};

export default function SahaPage() {
  const { zones, scenarios } = useSafeWatchData();
  const { progress } = useProgress();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const total = scenarios.length || 30;
  const done = completedCount(progress);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const visibleZones = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return zones
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .filter((zone) => {
        if (q && !zone.name.toLocaleLowerCase("tr").includes(q)) return false;
        const list = scenariosOfZone(scenarios, zone.id);
        const completed = list.filter((s) => progress[s.slug]).length;
        if (filter === "done") return completed > 0;
        if (filter === "open") return completed < list.length;
        return list.length > 0;
      });
  }, [zones, scenarios, progress, query, filter]);

  const ungrouped = useMemo(() => {
    const known = new Set(zones.map((z) => z.id));
    const q = query.trim().toLocaleLowerCase("tr");
    return scenarios
      .filter((s) => !known.has(s.zone_id))
      .filter((s) => (q ? s.title.toLocaleLowerCase("tr").includes(q) : true))
      .sort((a, b) => a.order_index - b.order_index);
  }, [zones, scenarios, query]);

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-erd-charcoal">
            <span className="h-7 w-1 rounded-full bg-erd-red" aria-hidden="true" />
            Saha Seçimi
          </h1>
          <p className="mt-1 max-w-xl text-sm text-erd-gray">
            Çalışmak istediğiniz saha bölgesini seçerek senaryolara başlayabilirsiniz.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-erd-gray"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Saha ara..."
              className="w-full rounded-xl border border-erd-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-erd-red/50 sm:w-56"
            />
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-xl border border-erd-line bg-white px-3 py-2.5 text-sm font-medium text-erd-charcoal sm:w-40"
            >
              <LayoutGrid size={16} className="text-erd-gray" />
              <span className="flex-1 text-left">{FILTER_LABEL[filter]}</span>
              <ChevronDown size={14} className="text-erd-gray" />
            </button>
            {filterOpen && (
              <ul className="absolute right-0 z-20 mt-1 w-full overflow-hidden rounded-xl border border-erd-line bg-white shadow-lg">
                {(Object.keys(FILTER_LABEL) as Filter[]).map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-erd-light"
                      onClick={() => {
                        setFilter(key);
                        setFilterOpen(false);
                      }}
                    >
                      {FILTER_LABEL[key]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {visibleZones.map((zone) => {
          const zoneScenarios = scenariosOfZone(scenarios, zone.id);
          if (zoneScenarios.length === 0) return null;
          return (
            <ZoneCard
              key={zone.id}
              zone={zone}
              scenarios={zoneScenarios}
              progress={progress}
            />
          );
        })}
        {ungrouped.length > 0 && (
          <ZoneCard
            zone={{
              id: "diger",
              name: "Diğer senaryolar",
              icon: "",
              description: "",
              order_index: 99,
            }}
            scenarios={ungrouped}
            progress={progress}
          />
        )}
      </div>

      {visibleZones.length === 0 && ungrouped.length === 0 && (
        <p className="mt-8 text-center text-sm text-erd-gray">
          Aramanıza uyan saha bölgesi bulunamadı.
        </p>
      )}

      <div className="mt-6 rounded-2xl bg-erd-light px-4 py-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
          <Stat
            icon={<ClipboardList size={20} className="text-erd-red" />}
            label="Toplam Senaryo"
            value={String(total)}
          />
          <Stat
            icon={<Trophy size={20} className="text-erd-red" />}
            label="Tamamlanan Senaryo"
            value={`${done} / ${total}`}
          />
          <div className="flex items-center gap-3">
            <CircularProgress value={done} total={total} size={56} />
            <div>
              <p className="text-xs font-medium text-erd-gray">Genel İlerleme</p>
              <p className="text-2xl font-bold tabular-nums text-erd-red">%{percent}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-snug text-erd-gray">
        <Info size={14} className="mt-0.5 shrink-0 text-erd-red" />
        Senaryoları dilediğiniz sırayla çözebilirsiniz. Her senaryo tamamlandığında
        ilerlemeniz kaydedilir.
      </p>
    </PageShell>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs font-medium text-erd-gray">{label}</p>
        <p className="text-2xl font-bold tabular-nums text-erd-red">{value}</p>
      </div>
    </div>
  );
}

function ZoneCard({
  zone,
  scenarios,
  progress,
}: {
  zone: Zone;
  scenarios: Scenario[];
  progress: ProgressMap;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-erd-line bg-white">
      <header className="flex items-center gap-3 border-b border-erd-line bg-erd-light/40 p-3.5">
        <ZoneIcon zoneId={zone.id} />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-erd-charcoal">{zone.name}</h2>
          <p className="mt-0.5 text-xs text-erd-gray">{scenarios.length} senaryo</p>
        </div>
      </header>

      <ul>
        {scenarios.map((scenario) => {
          const entry = progress[scenario.slug];
          return (
            <li key={scenario.slug} className="border-b border-erd-line last:border-b-0">
              <Link
                href={`/senaryo/${scenario.slug}`}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-erd-light"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    entry ? "bg-erd-red" : "border border-erd-gray/40 bg-white"
                  }`}
                />
                <span className="min-w-0 flex-1 font-medium text-erd-charcoal">
                  {scenario.title}
                </span>
                {entry && (
                  <span className="text-[11px] font-semibold tabular-nums text-erd-gray">
                    {entry.best_technical}/{entry.best_behavior}
                  </span>
                )}
                <ChevronRight size={16} className="shrink-0 text-erd-red" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
