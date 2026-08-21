"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  MapPin,
  Play,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import CircularProgress from "@/components/CircularProgress";
import DataSourceNote from "@/components/DataSourceNote";
import FactorySilhouette from "@/components/FactorySilhouette";
import PrinciplesBar from "@/components/PrinciplesBar";
import { useAuth } from "@/lib/auth";
import { useSafeWatchData } from "@/lib/data";
import { completedCount, useProgress } from "@/lib/progress";

export default function HomePage() {
  const { scenarios, source } = useSafeWatchData();
  const { progress } = useProgress();
  const { displayName } = useAuth();

  const total = scenarios.length || 30;
  const done = completedCount(progress);

  const lastSlug = Object.entries(progress).sort((a, b) =>
    b[1].updated_at.localeCompare(a[1].updated_at)
  )[0]?.[0];

  const nextScenario =
    scenarios.find((s) => !s.is_draft && !progress[s.slug]) ??
    scenarios.find((s) => !s.is_draft);

  const continueHref = lastSlug
    ? `/senaryo/${lastSlug}`
    : nextScenario
      ? `/senaryo/${nextScenario.slug}`
      : "/saha";

  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col bg-gradient-to-b from-white to-erd-light">
      <FactorySilhouette />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md rounded-2xl border border-erd-line bg-white p-6 shadow-sm sm:p-8">
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
            <DataSourceNote source={source} />
          </div>
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
