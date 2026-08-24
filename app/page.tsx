"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  MapPin,
  Play,
  Shield,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import CircularProgress from "@/components/CircularProgress";
import DataSourceNote from "@/components/DataSourceNote";
import FactorySilhouette from "@/components/FactorySilhouette";
import PrinciplesBar from "@/components/PrinciplesBar";
import { useAuth } from "@/lib/auth";
import { useSafeWatchData } from "@/lib/data";
import { completedCount, useProgress } from "@/lib/progress";

const HOME_FACTS = [
  { value: "11", label: "Bölge" },
  { value: "30", label: "Senaryo" },
  { value: "Yok", label: "Tanı" },
];

export default function HomePage() {
  const { scenarios, source, sourceDetail } = useSafeWatchData();
  const { progress } = useProgress();
  const { displayName } = useAuth();

  const total = scenarios.length || 30;
  const done = completedCount(progress);

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

  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden bg-erd-light">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(225,37,27,0.08),_transparent_55%),linear-gradient(180deg,#ffffff_0%,#f4f4f4_55%,#ececec_100%)]" />
      <FactorySilhouette />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-8 sm:py-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="w-full rounded-2xl border border-erd-line bg-white p-6 shadow-sm sm:p-8">
          <p className="text-center text-sm text-erd-gray">
            Hoş geldiniz,{" "}
            <span className="font-semibold text-erd-charcoal">{displayName}</span>
          </p>

          <div className="mt-4 flex justify-center">
            <BrandMark size="hero" dark />
          </div>

          <div className="mt-8 space-y-2.5">
            <HomeButton
              href={continueHref}
              label="Oyuna Başla"
              icon={Play}
              primary
            />
            <HomeButton href="/saha" label="Saha Seçimi" icon={MapPin} />
            <HomeButton
              href="/ilerlemem"
              label="Gelişim Raporum"
              icon={BarChart3}
            />
            <HomeButton
              href="/yardim"
              label="Nasıl Oynanır"
              icon={BookOpen}
            />
          </div>

          <div className="mt-7 flex items-center gap-4 border-t border-erd-line pt-5">
            <CircularProgress value={done} total={total} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-erd-red">
                Tamamlanan: {done}/{total} senaryo
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-erd-line">
                <div
                  className="h-full rounded-full bg-erd-red"
                  style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-erd-gray">
                Devam et, gelişimini birlikte takip edelim.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <DataSourceNote source={source} detail={sourceDetail} />
          </div>
        </div>

        <div className="flex flex-col justify-end pb-2 lg:min-h-[28rem] lg:pb-10">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-erd-red">
            <Shield size={14} strokeWidth={2.2} />
            Kontrollük antrenmanı
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight text-erd-charcoal sm:text-3xl">
            Saha refleksini, sahaya çıkmadan kurun.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-erd-gray">
            Dört karar sekmesiyle kendi donanımınızı, yüklenici eksiğini,
            işletme uygunsuzluğunu ve müdahaleyi çalışırsınız. Sistem tanı
            koymaz; yalnızca gelişim göstergesi üretir.
          </p>
          <ul className="mt-6 grid max-w-md grid-cols-3 gap-2">
            {HOME_FACTS.map((fact) => (
              <li
                key={fact.label}
                className="rounded-xl border border-erd-line/80 bg-white/80 px-3 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-xl font-bold tabular-nums text-erd-charcoal">
                  {fact.value}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-erd-gray">
                  {fact.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PrinciplesBar />
    </div>
  );
}

function HomeButton({
  href,
  label,
  icon: Icon,
  primary = false,
}: {
  href: string;
  label: string;
  icon: typeof Play;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ${
        primary
          ? "bg-erd-red text-white hover:bg-erd-red-dark"
          : "border border-erd-red/70 bg-white text-erd-charcoal hover:bg-red-50/50"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={2}
        className={primary ? "text-white" : "text-erd-red"}
      />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight
        size={18}
        className={primary ? "text-white/80" : "text-erd-red"}
      />
    </Link>
  );
}
