"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, HardHat, TriangleAlert } from "lucide-react";
import BriefingCard from "@/components/BriefingCard";
import DecisionPanel, {
  decisionTabShort,
  nextDecisionTab,
} from "@/components/DecisionPanel";
import HazardScene from "@/components/HazardScene";
import HintBox from "@/components/HintBox";
import SolutionAssist from "@/components/SolutionAssist";
import { useSafeWatchData, findScenario } from "@/lib/data";
import {
  createHazardLayoutSeed,
  scatterHazards,
} from "@/lib/hazard-layout";
import { useProgress } from "@/lib/progress";
import {
  ALL_ASSIST_PENALTY,
  applyAllAssist,
  applyManualToggle,
  applyTakAssist,
  emptyScenarioAssist,
  nextHintPenalty,
  patchRole,
  roleOf,
} from "@/lib/assist";
import {
  evaluateScenario,
  isScenarioScorable,
} from "@/lib/scoring";
import {
  actionCodesInKind,
  codesInCategory,
  correctCodesForTab,
  fillExact,
  fillScope,
  isExactSolved,
  realHazardCodes,
} from "@/lib/solutions";
import type { DecisionTab, ScenarioAnswers } from "@/lib/types";

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
  const [assist, setAssist] = useState(emptyScenarioAssist);
  const [usedKeys, setUsedKeys] = useState<Set<string>>(() => new Set());
  const [layoutSeed, setLayoutSeed] = useState<number | null>(null);

  const scenario = useMemo(
    () => findScenario(scenarios, slug),
    [scenarios, slug]
  );
  const zone = zones.find((z) => z.id === scenario?.zone_id);

  useEffect(() => {
    setLayoutSeed(createHazardLayoutSeed(slug));
  }, [slug]);

  const sceneHazards = useMemo(() => {
    if (!scenario || layoutSeed == null) return [];
    return scatterHazards(scenario.hazards, layoutSeed);
  }, [scenario, layoutSeed]);

  if (!scenario) {
    return (
      <EmptyState
        title="Senaryo bulunamadı"
        body="Bu adrese ait bir senaryo yok. Saha seçiminden devam edebilirsiniz."
      />
    );
  }

  const handleToggle = (tab: DecisionTab, code: string) => {
    const wasSelected = answers[tab].includes(code);
    setAnswers((prev) => ({ ...prev, [tab]: toggle(prev[tab], code) }));
    setAssist((prev) =>
      patchRole(prev, tab, applyManualToggle(roleOf(prev, tab), code, wasSelected))
    );
  };

  const handleHazardToggle = (code: string) => {
    setAnswers((prev) => ({ ...prev, hazards: toggle(prev.hazards, code) }));
  };

  const handleEvaluate = () => {
    if (!isScenarioScorable(scenario)) return;
    const result = evaluateScenario(scenario, answers, assist, equipment);
    recordResult(scenario, result);
    router.push(`/sonuc/${scenario.slug}`);
  };

  const markUsed = (key: string) => {
    setUsedKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const handleFillScope = (tab: DecisionTab, scopeId: string) => {
    const correct = correctCodesForTab(scenario, tab);
    const scopeCodes =
      tab === "action"
        ? actionCodesInKind(scopeId)
        : codesInCategory(equipment, scopeId);
    const key = tab === "action" ? `action:kind:${scopeId}` : `${tab}:cat:${scopeId}`;
    const filledCodes = correct.filter((code) => scopeCodes.includes(code));
    setAnswers((prev) => ({
      ...prev,
      [tab]: fillScope(prev[tab], correct, scopeCodes),
    }));
    setAssist((prev) =>
      patchRole(prev, tab, applyTakAssist(roleOf(prev, tab), scopeId, filledCodes))
    );
    markUsed(key);
  };

  const handleFillTab = (tab: DecisionTab) => {
    const correct = correctCodesForTab(scenario, tab);
    setAnswers((prev) => ({
      ...prev,
      [tab]: fillExact(correct),
    }));
    setAssist((prev) =>
      patchRole(prev, tab, applyAllAssist(roleOf(prev, tab), correct))
    );
    markUsed(`${tab}:all`);
  };

  const handleFillHazards = () => {
    setAnswers((prev) => ({
      ...prev,
      hazards: fillExact(realHazardCodes(scenario)),
    }));
    setAssist((prev) =>
      prev.hazards.allAssistUsed
        ? prev
        : { ...prev, hazards: { ...prev.hazards, allAssistUsed: true } }
    );
    markUsed("hazards:all");
  };

  const correctByTab = {
    self: correctCodesForTab(scenario, "self"),
    contractor: correctCodesForTab(scenario, "contractor"),
    operator: correctCodesForTab(scenario, "operator"),
    action: correctCodesForTab(scenario, "action"),
  };

  const handleNextTab = () => {
    const next = nextDecisionTab(activeTab);
    setActiveTab(next);
    requestAnimationFrame(() => {
      document
        .getElementById("decision-tabs")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
            zoneId={scenario.zone_id}
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
                hazards={sceneHazards}
                selected={answers.hazards}
                onToggle={handleHazardToggle}
              />

              {scenario.hazards.length > 0 && (
                <div className="mt-4">
                  <SolutionAssist
                    fillAllLabel="HEPSİNİ BELİRLE"
                    onFillAll={handleFillHazards}
                    fillAllDisabled={isExactSolved(
                      answers.hazards,
                      realHazardCodes(scenario)
                    )}
                    fillAllUsed={usedKeys.has("hazards:all")}
                    categoryPenalty={0}
                    fullPenalty={ALL_ASSIST_PENALTY}
                    note="Risk noktasına sizin tıklamanız puan düşürmez. HEPSİNİ BELİRLE gerçek riskleri otomatik seçer (−8). İpucu kademeleri ayrıdır (−2 / −3 / −5); risk yardımının tavanı 15 puandır."
                  />
                </div>
              )}

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
              used={assist.hazards.hintsUsed}
              onReveal={() =>
                setAssist((prev) => ({
                  ...prev,
                  hazards: {
                    ...prev.hazards,
                    hintsUsed: Math.min(
                      prev.hazards.hintsUsed + 1,
                      scenario.hints.length
                    ),
                  },
                }))
              }
              nextPenalty={nextHintPenalty(assist.hazards.hintsUsed)}
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
                correctByTab={correctByTab}
                usedKeys={usedKeys}
                onFillScope={handleFillScope}
                onFillTab={handleFillTab}
              />

              <div className="sw-card sticky bottom-4 z-20 flex flex-wrap items-center gap-3 p-4">
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
                <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
                  <button
                    type="button"
                    className="sw-btn-primary flex-1 px-4 py-3 text-sm sm:flex-none"
                    onClick={handleNextTab}
                  >
                    Sıradaki · {decisionTabShort(nextDecisionTab(activeTab))}
                  </button>
                  <button
                    type="button"
                    className="sw-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    onClick={handleEvaluate}
                    disabled={!scorable}
                  >
                    Değerlendir
                  </button>
                </div>
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
  const steps: Array<{ id: Step; label: string; icon: typeof ClipboardList }> = [
    { id: "brief", label: "1. Görev Kartı", icon: ClipboardList },
    { id: "hazard", label: "2. Tehlike Tanıma", icon: TriangleAlert },
    { id: "decide", label: "3. Hazırlık ve Denetim", icon: HardHat },
  ];
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <nav className="flex gap-1.5 overflow-x-auto">
      {steps.map((s, index) => {
        const active = s.id === step;
        const visited = index <= currentIndex;
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onStep(s.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "bg-erd-red text-white"
                : visited
                  ? "bg-erd-charcoal text-white"
                  : "bg-white text-erd-gray border border-erd-line"
            }`}
          >
            <Icon
              size={16}
              strokeWidth={1.7}
              fill="currentColor"
              fillOpacity={0.32}
            />
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
