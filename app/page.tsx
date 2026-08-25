"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardList,
  HardHat,
  MapPin,
  Play,
} from "lucide-react";
import AppIcon from "@/components/AppIcon";
import BrandMark from "@/components/BrandMark";
import CircularProgress from "@/components/CircularProgress";
import FeedbackForm from "@/components/FeedbackForm";
import FactorySilhouette from "@/components/FactorySilhouette";
import OyakMark from "@/components/OyakMark";
import PrinciplesBar from "@/components/PrinciplesBar";
import SafeWatchWordmark from "@/components/SafeWatchWordmark";
import { findScenario, useSafeWatchData } from "@/lib/data";
import { tabGlyph } from "@/lib/icon-theme";
import { useAuth } from "@/lib/auth";
import { completedCount, useProgress } from "@/lib/progress";
import type { DecisionTab } from "@/lib/types";
import type { IconTone } from "@/lib/icon-theme";
import type { LucideIcon } from "lucide-react";

const METHODOLOGY: Array<{
  id: DecisionTab;
  num: string;
  title: string;
  body: string;
}> = [
  {
    id: "self",
    num: "01",
    title: "Ben ne kullanmalıyım?",
    body: "Kendi KKD ve hazırlığını doğru seç.",
  },
  {
    id: "contractor",
    num: "02",
    title: "Yüklenici ne kullanmalı?",
    body: "Yüklenicinin eksiklerini belirle.",
  },
  {
    id: "operator",
    num: "03",
    title: "İşletmede ne eksik?",
    body: "İşletme uygunsuzluklarını analiz et.",
  },
  {
    id: "action",
    num: "04",
    title: "Nasıl müdahale etmeliyim?",
    body: "Doğru kontrollük kararını ver.",
  },
];

export default function HomePage() {
  const { scenarios, zones } = useSafeWatchData();
  const { progress } = useProgress();
  const { displayName } = useAuth();

  const total = scenarios.length || 30;
  const done = completedCount(progress);
  const completed = Object.values(progress).filter(
    (entry) => entry.status === "tamamlandi"
  );
  const avgTechnical =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, entry) => sum + entry.best_technical, 0) /
            completed.length
        )
      : null;
  const avgBehavior =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, entry) => sum + entry.best_behavior, 0) /
            completed.length
        )
      : null;

  const lastCompleted = Object.entries(progress)
    .filter(([, entry]) => entry.status === "tamamlandi")
    .sort((a, b) => b[1].updated_at.localeCompare(a[1].updated_at))[0];
  const lastTitle = lastCompleted
    ? findScenario(scenarios, lastCompleted[0])?.title ?? lastCompleted[0]
    : null;

  const lastSlug = Object.entries(progress).sort((a, b) =>
    b[1].updated_at.localeCompare(a[1].updated_at)
  )[0]?.[0];

  const nextScenario =
    scenarios.find((s) => !progress[s.slug]) ?? scenarios[0];

  const continueHref = lastSlug
    ? `/senaryo/${lastSlug}`
    : nextScenario
      ? `/senaryo/${nextScenario.slug}`
      : "/saha";

  const catalog = [
    { value: String(zones.length || 11), label: "Bölge", icon: MapPin, tone: "steel" as const },
    { value: String(total), label: "Senaryo", icon: ClipboardList, tone: "kkd" as const },
    { value: "4", label: "Kritik Karar", icon: HardHat, tone: "kkd" as const },
  ];

  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden bg-erd-canvas">
      <div className="pointer-events-none absolute inset-0 sw-lms-wash" aria-hidden />
      <FactorySilhouette />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[minmax(17.5rem,20.5rem)_minmax(0,1fr)] lg:gap-10 lg:py-12">
        <aside className="lg:sticky lg:top-[5.25rem]">
          <div className="sw-home-panel p-6 sm:p-7">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-erd-gray">
              Kontrollük antrenmanı
            </p>
            <p className="mt-2 text-center text-sm text-erd-gray">
              Hoş geldiniz,{" "}
              <span className="font-semibold text-erd-charcoal">{displayName}</span>
            </p>

            <div className="mt-5 flex flex-col items-center gap-3">
              <OyakMark size="hero" />
              <BrandMark size="hero" />
            </div>

            <nav className="mt-8 space-y-2" aria-label="Öğrenme menüsü">
              <HomeButton
                href={continueHref}
                label="Oyuna Başla"
                icon={Play}
                tone="kkd"
                primary
              />
              <HomeButton href="/saha" label="Saha Seçimi" icon={MapPin} tone="steel" />
              <HomeButton
                href="/ilerlemem"
                label="Gelişim Raporum"
                icon={BarChart3}
                tone="nav"
              />
              <HomeButton
                href="/yardim"
                label="Nasıl Oynanır"
                icon={BookOpen}
                tone="port"
              />
            </nav>

            <div className="mt-7 flex items-center gap-4 border-t border-erd-line pt-5">
              <CircularProgress value={done} total={total} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-erd-charcoal">
                  {done}/{total} senaryo
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-erd-line">
                  <div
                    className="h-full rounded-full bg-erd-red"
                    style={{
                      width: `${total ? Math.round((done / total) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs leading-snug text-erd-gray">
                  Gelişiminiz kayıtlıdır; kaldığınız yerden devam edebilirsiniz.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <FeedbackForm />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8 pb-2 lg:pt-1">
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
              <SafeWatchWordmark />
              <span className="text-erd-red"> metodolojisi</span>
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-erd-charcoal sm:text-3xl">
              Dört Karar Metodolojisi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-erd-gray">
              Her senaryoda aynı dört kararı çalışırsınız. Sistem tanı koymaz;
              yalnızca gelişim göstergesi üretir.
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {METHODOLOGY.map((item) => {
                const glyph = tabGlyph(item.id);
                return (
                  <li
                    key={item.id}
                    className="sw-lift sw-home-card relative min-h-[11.5rem] overflow-hidden rounded-2xl p-5 sm:min-h-[13.25rem] sm:p-6"
                  >
                    <span className="absolute inset-y-0 left-0 w-1 bg-erd-red/80" aria-hidden />
                    <div className="flex items-start justify-between gap-3">
                      <AppIcon icon={glyph.icon} tone={glyph.tone} size="md" />
                      <span className="text-2xl font-light tabular-nums tracking-tight text-erd-red/70">
                        {item.num}
                      </span>
                    </div>
                    <h2 className="mt-5 text-base font-bold leading-snug text-erd-charcoal sm:text-lg">
                      {item.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-erd-gray">
                      {item.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <ul className="grid grid-cols-3 gap-3">
              {catalog.map((fact) => (
                <li
                  key={fact.label}
                  className="sw-lift sw-home-card relative overflow-hidden rounded-2xl px-3 py-7 text-center sm:px-5 sm:py-10"
                >
                  <span className="mx-auto mb-4 hidden sm:flex sm:justify-center">
                    <AppIcon icon={fact.icon} tone={fact.tone} size="md" />
                  </span>
                  <p className="text-4xl font-bold tabular-nums tracking-tight text-erd-charcoal sm:text-6xl">
                    {fact.value}
                  </p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-erd-gray sm:text-xs">
                    {fact.label}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-erd-gray">
              Gelişiminiz
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                label="Son tamamlanan"
                value={lastTitle ?? "Henüz yok"}
                compact
              />
              <MetricCard label="Tamamlanan senaryo" value={`${done}/${total}`} />
              <MetricCard
                label="Ortalama teknik doğruluk"
                value={avgTechnical == null ? "—" : String(avgTechnical)}
              />
              <MetricCard
                label="Ortalama kontrollük davranışı"
                value={avgBehavior == null ? "—" : String(avgBehavior)}
              />
            </ul>
          </section>
        </div>
      </div>

      <PrinciplesBar />
    </div>
  );
}

function MetricCard({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <li className="sw-home-card min-h-[5.5rem] rounded-2xl px-4 py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-erd-gray">
        {label}
      </p>
      <p
        className={`mt-2 font-bold leading-snug text-erd-charcoal ${
          compact ? "text-sm" : "text-lg sm:text-xl"
        }`}
      >
        {value}
      </p>
    </li>
  );
}

function HomeButton({
  href,
  label,
  icon: Icon,
  tone,
  primary = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  tone: IconTone;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`sw-nav-item flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 text-sm font-semibold ${
        primary
          ? "bg-erd-red text-white shadow-[0_2px_8px_rgba(225,37,27,0.16)] hover:bg-erd-red-dark"
          : "border border-erd-line bg-erd-canvas text-erd-charcoal hover:border-brand-safe-gray/25 hover:bg-white"
      }`}
    >
      {primary ? (
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon
            size={20}
            strokeWidth={1.7}
            fill="currentColor"
            fillOpacity={0.28}
            className="text-white"
          />
        </span>
      ) : (
        <AppIcon icon={Icon} tone={tone} size="sm" />
      )}
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight
        size={18}
        strokeWidth={2}
        className={primary ? "text-white/80" : "text-erd-red"}
      />
    </Link>
  );
}
