"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import BriefingCard from "@/components/BriefingCard";
import DecisionPanel from "@/components/DecisionPanel";
import HazardScene from "@/components/HazardScene";
import HintBox from "@/components/HintBox";
import { useSafeWatchData, findScenario } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { evaluateScenario, isScenarioScorable } from "@/lib/scoring";
import type { DecisionTab, ScenarioAnswers } from "@/lib/types";

const HINT_PENALTY = 5;

type Step = "brief" | "hazard" | "decide";

const EMPTY_ANSWERS: ScenarioAnswers = {
  hazards: [],
  self: [],
  contractor: [],
  operator: [],
  action: [],
};

function toggle(list: string[], code: string): string[] {
  return list.includes(code)
    ? list.filter((c) => c !== code)
    : [...list, code];
}

export default function ScenarioPlayer({ slug }: { slug: string }) {
  const router = useRouter();
  const { zones, scenarios, categories, equipment } = useSafeWatchData();
  const { recordResult } = useProgress();

  const [step, setStep] = useState<Step>("brief");
  const [answers, setAnswers] = useState<ScenarioAnswers>(EMPTY_ANSWERS);
  const [activeTab, setActiveTab] = useState<DecisionTab>("self");
  const [hintsUsed, setHintsUsed] = useState(0);

  const scenario = useMemo(
    () => findScenario(scenarios, slug),
    [scenarios, slug]
  );
  const zone = zones.find((z) => z.id === scenario?.zone_id);

  if (!scenario) {
    return (
      <EmptyState
        title="Senaryo bulunamadı"
        body="Bu adrese ait bir senaryo yok. Saha seçiminden devam edebilirsiniz."
      />
    );
  }

  const handleToggle = (tab: DecisionTab, code: string) => {
    setAnswers((prev) => ({ ...prev, [tab]: toggle(prev[tab], code) }));
  };

  const handleHazardToggle = (code: string) => {
    setAnswers((prev) => ({ ...prev, hazards: toggle(prev.hazards, code) }));
  };

  const handleEvaluate = () => {
    if (!isScenarioScorable(scenario)) return;
    const result = evaluateScenario(scenario, answers, hintsUsed);
    recordResult(scenario, result);
    router.push(`/sonuc/${scenario.slug}`);
  };

  const scorable = isScenarioScorable(scenario);

  const totalSelections =
    answers.self.length +
    answers.contractor.length +
    answers.operator.length +
    answers.action.length;

  return (
    <div className="space-y-4">
      <StepBar step={step} onStep={setStep} />

      {step === "brief" && (
        <>
          <BriefingCard
            title={scenario.title}
            zoneName={zone?.name ?? ""}
            briefing={scenario.briefing}
            actors={scenario.actors}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="sw-btn-primary"
              onClick={() => setStep("hazard")}
            >
              Sahaya Çık
            </button>
            <Link href="/saha" className="sw-btn-ghost">
              Saha Seçimine Dön
            </Link>
          </div>
        </>
      )}

      {step !== "brief" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="sw-card overflow-hidden p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-erd-gray">
                    {zone?.name}
                  </p>
                  <h1 className="text-lg font-bold text-erd-charcoal">
                    {scenario.title}
                  </h1>
                </div>
                <span className="rounded-lg bg-erd-light px-2.5 py-1 text-xs font-semibold text-erd-gray">
                  {answers.hazards.length} risk işaretlendi
                </span>
              </div>

              <HazardScene
                zoneId={scenario.zone_id}
                hazards={scenario.hazards}
                selected={answers.hazards}
                onToggle={handleHazardToggle}
              />

              {step === "hazard" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="sw-btn-primary"
                    onClick={() => setStep("decide")}
                  >
                    Hazırlık ve Denetime Geç
                  </button>
                  <button
                    type="button"
                    className="sw-btn-ghost"
                    onClick={() => setStep("brief")}
                  >
                    Görev Kartına Dön
                  </button>
                </div>
              )}
            </div>

            <HintBox
              hints={scenario.hints}
              used={hintsUsed}
              onReveal={() =>
                setHintsUsed((n) => Math.min(n + 1, scenario.hints.length))
              }
              penaltyPerHint={HINT_PENALTY}
            />
          </div>

          {step === "decide" && (
            <div className="space-y-4">
              <DecisionPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                answers={answers}
                onToggle={handleToggle}
                categories={categories}
                equipment={equipment}
                actors={scenario.actors}
              />

              <div className="sw-card sticky bottom-4 flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-erd-charcoal">
                    {scorable
                      ? "Değerlendirmeye hazır mısınız?"
                      : "Bu senaryo henüz puanlanamaz"}
                  </p>
                  <p className="text-xs text-erd-gray">
                    {scorable
                      ? `${totalSelections} karar, ${answers.hazards.length} risk işaretlemesi yaptınız. Değerlendirme sonunda oyun bitmez; tekrar deneyebilirsiniz.`
                      : "Görev içeriği henüz doldurulmamış. Puan şişmesini önlemek için değerlendirme kapalıdır."}
                  </p>
                </div>
                <button
                  type="button"
                  className="sw-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleEvaluate}
                  disabled={!scorable}
                >
                  Değerlendir
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepBar({
  step,
  onStep,
}: {
  step: Step;
  onStep: (s: Step) => void;
}) {
  const steps: Array<{ id: Step; label: string }> = [
    { id: "brief", label: "1. Görev Kartı" },
    { id: "hazard", label: "2. Tehlike Tanıma" },
    { id: "decide", label: "3. Hazırlık ve Denetim" },
  ];
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <nav className="flex gap-1.5 overflow-x-auto">
      {steps.map((s, index) => {
        const active = s.id === step;
        const visited = index <= currentIndex;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onStep(s.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "bg-erd-red text-white"
                : visited
                  ? "bg-erd-charcoal text-white"
                  : "bg-white text-erd-gray border border-erd-line"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="sw-card p-8 text-center">
      <h1 className="text-xl font-bold text-erd-charcoal">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-erd-gray">
        {body}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/saha" className="sw-btn-primary">
          Saha Seçimi
        </Link>
        <Link href="/" className="sw-btn-ghost">
          Ana Menü
        </Link>
      </div>
    </div>
  );
}
