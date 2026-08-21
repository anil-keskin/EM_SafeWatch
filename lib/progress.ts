"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  ProgressEntry,
  ProgressMap,
  Scenario,
  ScenarioResult,
} from "@/lib/types";

/**
 * İlerleme deposu.
 *
 * Her zaman tarayıcıda (localStorage) tutulur; oyuncu giriş yapmadan da
 * kaldığı yerden devam edebilir. Supabase oturumu varsa aynı kayıt
 * `user_progress` ve `competency_summary` tablolarına da yazılır.
 *
 * Can/kalp sistemi yoktur: bir senaryo asla "başarısız" olarak kapanmaz,
 * yalnızca en iyi skorlar saklanır ve tekrar oynanarak geliştirilebilir.
 */

const PROGRESS_KEY = "safewatch:progress:v1";
const RESULT_KEY_PREFIX = "safewatch:result:";
const COMPETENCY_KEY = "safewatch:competency:v1";

export type CompetencyMap = Record<
  string,
  { score: number; attempts: number; zone_id: string }
>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Depolama kotası dolu veya gizli mod: sessizce yoksayılır.
  }
}

export function loadProgress(): ProgressMap {
  return readJSON<ProgressMap>(PROGRESS_KEY, {});
}

export function loadCompetencies(): CompetencyMap {
  return readJSON<CompetencyMap>(COMPETENCY_KEY, {});
}

/** Sonuç ekranının okuyacağı son değerlendirme. */
export function saveLastResult(result: ScenarioResult): void {
  writeJSON(RESULT_KEY_PREFIX + result.slug, result);
}

export function loadLastResult(slug: string): ScenarioResult | null {
  return readJSON<ScenarioResult | null>(RESULT_KEY_PREFIX + slug, null);
}

function mergeEntry(
  previous: ProgressEntry | undefined,
  result: ScenarioResult
): ProgressEntry {
  return {
    status: "tamamlandi",
    best_technical: Math.max(previous?.best_technical ?? 0, result.technical),
    best_behavior: Math.max(previous?.best_behavior ?? 0, result.behavior),
    attempts: (previous?.attempts ?? 0) + 1,
    hints_used: (previous?.hints_used ?? 0) + result.hintsUsed,
    updated_at: result.completedAt,
  };
}

/** Supabase oturumu varsa ilerlemeyi buluta da yazar. Hata olursa sessiz geçer. */
async function syncToSupabase(
  scenario: Scenario,
  entry: ProgressEntry,
  result: ScenarioResult
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !scenario.id) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_progress").upsert({
    user_id: user.id,
    scenario_id: scenario.id,
    status: entry.status,
    best_technical: entry.best_technical,
    best_behavior: entry.best_behavior,
    attempts: entry.attempts,
    hints_used: entry.hints_used,
    updated_at: entry.updated_at,
  });

  const rows = Object.entries(result.competencyScores).map(
    ([competency, score]) => ({
      user_id: user.id,
      zone_id: scenario.zone_id,
      competency,
      score,
      weak_flag: score < 55,
      updated_at: result.completedAt,
    })
  );
  if (rows.length > 0) {
    await supabase.from("competency_summary").upsert(rows);
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [competencies, setCompetencies] = useState<CompetencyMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setCompetencies(loadCompetencies());
    setReady(true);
  }, []);

  const recordResult = useCallback(
    (scenario: Scenario, result: ScenarioResult) => {
      const current = loadProgress();
      const entry = mergeEntry(current[scenario.slug], result);
      const nextProgress = { ...current, [scenario.slug]: entry };
      writeJSON(PROGRESS_KEY, nextProgress);
      setProgress(nextProgress);

      const currentComp = loadCompetencies();
      const nextComp: CompetencyMap = { ...currentComp };
      for (const [competency, score] of Object.entries(
        result.competencyScores
      )) {
        const key = `${scenario.zone_id}:${competency}`;
        const prev = nextComp[key];
        // En iyi skor saklanır; tekrar oynayarak geliştirmek mümkündür.
        nextComp[key] = {
          zone_id: scenario.zone_id,
          score: Math.max(prev?.score ?? 0, score),
          attempts: (prev?.attempts ?? 0) + 1,
        };
      }
      writeJSON(COMPETENCY_KEY, nextComp);
      setCompetencies(nextComp);

      saveLastResult(result);

      if (isSupabaseConfigured) {
        void syncToSupabase(scenario, entry, result).catch(() => {});
      }
    },
    []
  );

  const reset = useCallback(() => {
    writeJSON(PROGRESS_KEY, {});
    writeJSON(COMPETENCY_KEY, {});
    setProgress({});
    setCompetencies({});
  }, []);

  return { progress, competencies, ready, recordResult, reset };
}

export function completedCount(progress: ProgressMap): number {
  return Object.values(progress).filter((p) => p.status === "tamamlandi")
    .length;
}
