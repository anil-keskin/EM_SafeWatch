"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HazardScene from "@/components/HazardScene";
import ScoreMeter from "@/components/ScoreMeter";
import { actionLabel } from "@/content/actions";
import { competencyLabel } from "@/content/scenarios";
import { useSafeWatchData, findScenario, scenariosOfZone } from "@/lib/data";
import { loadLastResult } from "@/lib/progress";
import type { EquipmentItem, ScenarioResult, SectionResult } from "@/lib/types";

type LabelFn = (code: string) => string;

/**
 * Sonuç / değerlendirme ekranı.
 * Dil kurumsal ve öğreticidir; hiçbir yerde "başarısız" ifadesi kullanılmaz.
 */
export default function ResultView({ slug }: { slug: string }) {
  const { zones, scenarios, equipment } = useSafeWatchData();
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(loadLastResult(slug));
    setReady(true);
  }, [slug]);

  const scenario = findScenario(scenarios, slug);
  const zone = zones.find((z) => z.id === scenario?.zone_id);
  const zoneScenarios = scenario
    ? scenariosOfZone(scenarios, scenario.zone_id)
    : [];
  const currentIndex = scenario
    ? zoneScenarios.findIndex((item) => item.slug === scenario.slug)
    : -1;
  const nextScenario =
    currentIndex >= 0 ? zoneScenarios[currentIndex + 1] : undefined;

  if (!ready) {
    return <p className="py-16 text-center text-sm text-erd-gray">Yükleniyor…</p>;
  }

  if (!scenario || !result) {
    return (
      <div className="sw-card p-8 text-center">
        <h1 className="text-xl font-bold text-erd-charcoal">
          Henüz bir değerlendirme yok
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-erd-gray">
          Bu senaryoyu tamamladığınızda sonuç kartınız burada görünecek.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`/senaryo/${slug}`} className="sw-btn-primary">
            Senaryoyu Oyna
          </Link>
          <Link href="/saha" className="sw-btn-ghost">
            Saha Seçimi
          </Link>
        </div>
      </div>
    );
  }

  const equipmentLabel = makeEquipmentLabel(equipment);
  const hazardLabel: LabelFn = (code) =>
    scenario.hazards.find((h) => h.code === code)?.label ?? code;

  return (
    <div className="space-y-4">
      <div className="sw-card overflow-hidden">
        <div className="bg-erd-charcoal px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            Değerlendirme · {zone?.name}
          </p>
          <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            {scenario.title}
          </h1>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <ScoreMeter
            label="Teknik Doğruluk"
            hint="Tehlike tanıma, doğru KKD ailesi ve gereksiz seçimden kaçınma."
            score={result.technical}
          />
          <ScoreMeter
            label="Kontrollük Davranışı"
            hint="Doğru kanala bildirme, gerektiğinde durdurma, yetki sınırını gözetme."
            score={result.behavior}
          />
        </div>
        <AssistSummary result={result} />
      </div>

      <div className="sw-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-erd-gray">
          Sahne Tekrarı
        </h2>
        <HazardScene
          zoneId={scenario.zone_id}
          hazards={scenario.hazards}
          selected={[
            ...result.sections.hazards.hits,
            ...result.sections.hazards.extras,
          ]}
          onToggle={() => {}}
          revealed
        />
        <ul className="mt-3 flex flex-wrap gap-3 text-[11px] font-medium text-erd-gray">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Doğru
            işaretlediniz
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-erd-red" /> Gerçek
            tehlike değildi
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-amber-500" />{" "}
            Gözden kaçtı
          </li>
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Tehlike Tanıma"
          section={result.sections.hazards}
          labelFn={hazardLabel}
          extrasTitle="Gerçek tehlike olmayan noktalar"
        />
        <SectionCard
          title="Kendi Hazırlığınız"
          section={result.sections.self}
          labelFn={equipmentLabel}
          extrasTitle="Bu görev için gereksiz seçimler"
          criticalTitle="Bu görevde yanlış olan seçimler"
        />
        <SectionCard
          title="Yüklenici Denetimi"
          section={result.sections.contractor}
          labelFn={equipmentLabel}
          extrasTitle="Yüklenicide eksik olmayan kalemler"
          emptyMessage="Bu senaryoda yüklenicide eksik bulunmuyordu; boş bırakmak doğruydu."
        />
        <SectionCard
          title="İşletmede Gözlem"
          section={result.sections.operator}
          labelFn={equipmentLabel}
          extrasTitle="İşletmede uygunsuzluk olmayan kalemler"
          emptyMessage="Bu senaryoda işletme personelinde uygunsuzluk yoktu; boş bırakmak doğruydu."
        />
        <SectionCard
          title="Müdahale Kararlarınız"
          section={result.sections.actions}
          labelFn={actionLabel}
          extrasTitle="Gereksiz aksiyonlar"
          criticalTitle="Yetki sınırını aşan veya hatalı aksiyonlar"
          className="lg:col-span-2"
        />
      </div>

      <div className="sw-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Neden böyle olmalıydı?
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-erd-charcoal">
          {scenario.explanation}
        </p>
        {scenario.competency_tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {scenario.competency_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-erd-light px-2.5 py-1 text-[11px] font-medium text-erd-gray"
              >
                {competencyLabel(tag)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {nextScenario ? (
          <Link href={`/senaryo/${nextScenario.slug}`} className="sw-btn-primary">
            Sonraki Senaryoya Geç
          </Link>
        ) : (
          <Link href="/saha" className="sw-btn-primary">
            Saha Senaryolarına Dön
          </Link>
        )}
        <Link href={`/senaryo/${slug}`} className="sw-btn-dark">
          Tekrar Dene
        </Link>
        <Link href="/saha" className="sw-btn-ghost">
          Saha Seçimi
        </Link>
        <Link href="/gelisim" className="sw-btn-ghost">
          Gelişim Raporum
        </Link>
      </div>
    </div>
  );
}

function AssistSummary({ result }: { result: ScenarioResult }) {
  const hints = result.hintsUsed ?? 0;
  const solutions =
    (result.categorySolutions ?? 0) + (result.fullSolutions ?? 0);
  const penalty = result.hintPenalty ?? 0;
  if (hints === 0 && solutions === 0) return null;

  const parts: string[] = [];
  if (solutions > 0) parts.push(`${solutions} çözüm`);
  if (hints > 0) parts.push(`${hints} ipucu`);

  return (
    <p className="border-t border-erd-line px-5 py-3 text-xs leading-snug text-erd-gray">
      {parts.join(" ve ")} kullandınız; her iki puandan {penalty} puan
      düşüldü. Çözüm ve ipucu öğrenmeyi hızlandırır; bu kadar yardım alınca
      gelişim raporunda ilgili alanlar “gelişime açık” görünebilir.
    </p>
  );
}

function makeEquipmentLabel(equipment: EquipmentItem[]): LabelFn {
  const byCode = new Map(equipment.map((e) => [e.code, e.name]));
  return (code) => byCode.get(code) ?? code;
}

function SectionCard({
  title,
  section,
  labelFn,
  extrasTitle,
  criticalTitle = "Yanlış seçimler",
  emptyMessage,
  className = "",
}: {
  title: string;
  section: SectionResult;
  labelFn: LabelFn;
  extrasTitle: string;
  criticalTitle?: string;
  emptyMessage?: string;
  className?: string;
}) {
  const mildExtras = section.extras.filter(
    (code) => !section.criticalExtras.includes(code)
  );
  const nothingToShow =
    section.hits.length === 0 &&
    section.misses.length === 0 &&
    section.extras.length === 0;

  return (
    <div className={`sw-card p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-erd-charcoal">{title}</h3>
        <span className="text-sm font-bold tabular-nums text-erd-gray">
          {section.score}
          <span className="text-xs font-medium">/100</span>
        </span>
      </div>

      {nothingToShow ? (
        <p className="mt-2.5 text-xs leading-snug text-erd-gray">
          {emptyMessage ?? "Bu bölümde işaretlenecek bir şey yoktu."}
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          <CodeList
            title="Doğru belirledikleriniz"
            codes={section.hits}
            labelFn={labelFn}
            tone="good"
          />
          <CodeList
            title="Gözden kaçanlar"
            codes={section.misses}
            labelFn={labelFn}
            tone="miss"
          />
          <CodeList
            title={criticalTitle}
            codes={section.criticalExtras}
            labelFn={labelFn}
            tone="bad"
          />
          <CodeList
            title={extrasTitle}
            codes={mildExtras}
            labelFn={labelFn}
            tone="extra"
          />
        </div>
      )}
    </div>
  );
}

const TONE_STYLES = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  miss: "border-amber-200 bg-amber-50 text-amber-800",
  bad: "border-red-200 bg-red-50 text-erd-red",
  extra: "border-erd-line bg-erd-light text-erd-gray",
} as const;

function CodeList({
  title,
  codes,
  labelFn,
  tone,
}: {
  title: string;
  codes: string[];
  labelFn: LabelFn;
  tone: keyof typeof TONE_STYLES;
}) {
  if (codes.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
        {title}
      </p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {codes.map((code) => (
          <li
            key={code}
            className={`rounded-lg border px-2 py-1 text-[11px] font-medium ${TONE_STYLES[tone]}`}
          >
            {labelFn(code)}
          </li>
        ))}
      </ul>
    </div>
  );
}
