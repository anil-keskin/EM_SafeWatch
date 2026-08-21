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
  const [openZone, setOpenZone] = useState<string | null>(null);

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
        return true;
      });
  }, [zones, scenarios, progress, query, filter]);

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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleZones.map((zone) => {
          const zoneScenarios = scenariosOfZone(scenarios, zone.id);
          const isOpen = openZone === zone.id;
          return (
            <ZoneCard
              key={zone.id}
              zone={zone}
              scenarios={zoneScenarios}
              progress={progress}
              open={isOpen}
              onToggle={() => setOpenZone(isOpen ? null : zone.id)}
            />
          );
        })}
      </div>

      {visibleZones.length === 0 && (
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
  open,
  onToggle,
}: {
  zone: Zone;
  scenarios: Scenario[];
  progress: ProgressMap;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-erd-line bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3.5 text-left hover:bg-erd-light/60"
        aria-expanded={open}
      >
        <ZoneIcon zoneId={zone.id} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-erd-charcoal">{zone.name}</span>
          <span className="mt-0.5 block text-xs text-erd-gray">
            {scenarios.length} senaryo
          </span>
          <span className="mt-1.5 flex flex-wrap gap-1">
            {scenarios.map((scenario) => (
              <span
                key={scenario.slug}
                title={scenario.title}
                className={`h-2 w-2 rounded-full ${
                  progress[scenario.slug] ? "bg-erd-red" : "bg-erd-line"
                }`}
              />
            ))}
          </span>
        </span>
        <ChevronRight
          size={18}
          className={`shrink-0 text-erd-gray transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <ul className="border-t border-erd-line">
          {scenarios.map((scenario) => {
            const entry = progress[scenario.slug];
            if (scenario.is_draft) {
              return (
                <li
                  key={scenario.slug}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-erd-gray/70"
                >
                  <span className="h-2 w-2 rounded-full bg-erd-line" />
                  <span className="min-w-0 flex-1 truncate">{scenario.title}</span>
                  <span className="rounded-md bg-erd-light px-2 py-0.5 text-[10px] font-semibold uppercase">
                    Yakında
                  </span>
                </li>
              );
            }
            return (
              <li key={scenario.slug}>
                <Link
                  href={`/senaryo/${scenario.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-erd-light"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      entry ? "bg-erd-red" : "border border-erd-gray/40"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-erd-charcoal">
                    {scenario.title}
                  </span>
                  {entry && (
                    <span className="text-[11px] font-semibold tabular-nums text-erd-gray">
                      {entry.best_technical}/{entry.best_behavior}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
