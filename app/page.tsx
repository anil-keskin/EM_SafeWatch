"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  History,
  Play,
} from "lucide-react";
import AppIcon from "@/components/AppIcon";
import FeedbackForm from "@/components/FeedbackForm";
import PlantHero from "@/components/PlantHero";
import ZoneIcon from "@/components/ZoneIcon";
import PrinciplesBar from "@/components/PrinciplesBar";
import {
  findScenario,
  timeMachineScenarios,
  trainingScenarios,
  useSafeWatchData,
} from "@/lib/data";
import { tabGlyph } from "@/lib/icon-theme";
import { useAuth } from "@/lib/auth";
import { completedIn, useProgress } from "@/lib/progress";
import type { DecisionTab } from "@/lib/types";

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

  // "30 Senaryo" metriği yalnızca eğitim havuzunu sayar; Zaman Makinesi
  // senaryoları bu sayıyı ve ilerleme çubuğunu etkilemez.
  const training = trainingScenarios(scenarios);
  const timeMachine = timeMachineScenarios(scenarios);
  const total = training.length;
  const done = completedIn(progress, training);
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
    training.find((s) => !progress[s.slug]) ?? training[0];

  const continueHref = lastSlug
    ? `/senaryo/${lastSlug}`
    : nextScenario
      ? `/senaryo/${nextScenario.slug}`
      : "/saha";


  const zoneCards = zones
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((zone) => {
      const list = training
        .filter((s) => s.zone_id === zone.id)
        .sort((a, b) => a.order_index - b.order_index);
      const zoneDone = list.filter((s) => progress[s.slug]).length;
      const next = list.find((s) => !progress[s.slug]) ?? list[0];
      return { zone, total: list.length, done: zoneDone, next };
    })
    .filter((z) => z.total > 0);

  return (
    <div className="bg-erd-canvas">
      {/* ---------- Sahne ---------- */}
      <section className="relative isolate overflow-hidden bg-[#070b14] text-white">
        <PlantHero />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070b14]/90 via-[#070b14]/55 to-transparent" />
        <div className="relative mx-auto flex min-h-[26rem] max-w-6xl flex-col justify-center px-4 py-10 sm:min-h-[30rem] sm:px-6">
          <p className="sw-rise inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Kontrollük antrenmanı · {displayName}
          </p>
          <h1 className="sw-rise mt-4 max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
            Sahaya çık.
            <br />
            <span className="text-amber-300">Riski gör.</span>
            <br />
            Kazayı önle.
          </h1>
          <p className="sw-rise mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base" style={{ animationDelay: "160ms" }}>
            Demir-çelik sahasında müteahhit işlerini denetleyen kontrolör sizsiniz.
            Ölçün, KKD&apos;nizi seçin, eksikleri yakalayın, doğru kişiye doğru talimatı verin.
          </p>
          <div className="sw-rise mt-6 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
            <Link
              href={continueHref}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-erd-red px-6 py-3.5 text-base font-bold text-white shadow-[0_10px_30px_-8px_rgba(225,37,27,0.8)] transition-transform hover:-translate-y-0.5"
            >
              <Play size={20} fill="currentColor" />
              {lastSlug ? "Kaldığın yerden devam" : "Vardiyaya Başla"}
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/zaman-makinesi"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <History size={18} /> Zaman Makinesi
              {timeMachine.length > 0 && (
                <span className="rounded-full bg-amber-300 px-1.5 text-[11px] font-bold text-black">
                  {timeMachine.length}
                </span>
              )}
            </Link>
          </div>
          <dl className="sw-rise mt-8 flex flex-wrap gap-x-8 gap-y-3" style={{ animationDelay: "320ms" }}>
            {[
              { k: "Tamamlanan", v: `${done}/${total}` },
              { k: "Teknik doğruluk", v: avgTechnical === null ? "—" : `%${avgTechnical}` },
              { k: "Kontrollük davranışı", v: avgBehavior === null ? "—" : `%${avgBehavior}` },
            ].map((m) => (
              <div key={m.k}>
                <dt className="text-[11px] uppercase tracking-wider text-white/55">{m.k}</dt>
                <dd className="text-2xl font-bold tabular-nums">{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        {/* ---------- Tesis haritası ---------- */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-erd-red">Tesis haritası</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-erd-charcoal">Bugün hangi sahaya çıkıyorsunuz?</h2>
            </div>
            <Link href="/saha" className="text-sm font-semibold text-erd-red hover:underline">
              Tüm senaryolar →
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {zoneCards.map(({ zone, total: zt, done: zd, next }, i) => {
              const pct = zt > 0 ? Math.round((zd / zt) * 100) : 0;
              const complete = zd === zt;
              return (
                <li key={zone.id} className="sw-rise" style={{ animationDelay: `${i * 40}ms` }}>
                  <Link
                    href={next ? `/senaryo/${next.slug}` : "/saha"}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-erd-line bg-white p-4 transition-all hover:-translate-y-1 hover:border-erd-red/40 hover:shadow-[0_18px_40px_-18px_rgba(46,46,46,0.35)]"
                  >
                    <ZoneIcon zoneId={zone.id} watermark />
                    <div className="relative flex items-start justify-between gap-2">
                      <ZoneIcon zoneId={zone.id} />
                      {complete ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">TAMAM</span>
                      ) : (
                        <span className="rounded-full bg-erd-light px-2 py-0.5 text-[10px] font-bold tabular-nums text-erd-gray">
                          {zd}/{zt}
                        </span>
                      )}
                    </div>
                    <h3 className="relative mt-3 text-sm font-bold leading-snug text-erd-charcoal">{zone.name}</h3>
                    <p className="relative mt-0.5 line-clamp-1 text-[11px] text-erd-gray">
                      {next && !complete ? `Sıradaki: ${next.title}` : "Tekrar oyna"}
                    </p>
                    <div className="relative mt-auto pt-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-erd-line">
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ${complete ? "bg-emerald-500" : "bg-erd-red"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------- 4 karar ---------- */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-erd-red">Her senaryoda</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-erd-charcoal">Dört kritik karar</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {METHODOLOGY.map((item) => {
              const g = tabGlyph(item.id);
              return (
                <li key={item.id} className="relative rounded-2xl border border-erd-line bg-white p-4">
                  <span className="absolute right-4 top-3 text-3xl font-black text-erd-line">{item.num}</span>
                  <AppIcon icon={g.icon} tone={g.tone} size="md" />
                  <h3 className="mt-3 text-sm font-bold text-erd-charcoal">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-erd-gray">{item.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-erd-line bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-erd-gray">Son tamamlanan</p>
            <p className="mt-1 text-base font-semibold text-erd-charcoal">
              {lastTitle ?? "Henüz yok — ilk vardiyanız sizi bekliyor."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/gelisim" className="sw-btn-ghost inline-flex items-center gap-1.5">
                <BarChart3 size={16} /> Gelişim raporum
              </Link>
              <Link href="/nasil-oynanir" className="sw-btn-ghost inline-flex items-center gap-1.5">
                <BookOpen size={16} /> Nasıl oynanır
              </Link>
            </div>
          </div>
          <FeedbackForm />
        </section>
      </div>

      <PrinciplesBar />
    </div>
  );
}

