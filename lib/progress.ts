"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * `user_progress` ve `competency_summary` tablolarına da yazılır ve
 * girişte bulut kaydı ile birleştirilir.
 */

const PROGRESS_KEY = "safewatch:progress:v1";
const COMPETENCY_KEY = "safewatch:competency:v1";
const GUEST_PROGRESS_KEY = "safewatch:progress:guest-v1";
const GUEST_COMPETENCY_KEY = "safewatch:competency:guest-v1";
const RESULT_KEY_PREFIX = "safewatch:result:";

export type CompetencyMap = Record<
  string,
  { score: number; attempts: number; zone_id: string }
>;

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

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

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* yok say */
  }
}

export function loadProgress(): ProgressMap {
  return readJSON<ProgressMap>(PROGRESS_KEY, {});
}

export function loadCompetencies(): CompetencyMap {
  return readJSON<CompetencyMap>(COMPETENCY_KEY, {});
}

export function saveLastResult(result: ScenarioResult): void {
  writeJSON(RESULT_KEY_PREFIX + result.slug, result);
}

export function loadLastResult(slug: string): ScenarioResult | null {
  return readJSON<ScenarioResult | null>(RESULT_KEY_PREFIX + slug, null);
}

function snapshotGuestIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(GUEST_PROGRESS_KEY)) return;
  writeJSON(GUEST_PROGRESS_KEY, loadProgress());
  writeJSON(GUEST_COMPETENCY_KEY, loadCompetencies());
}

function restoreGuestSnapshot(): { progress: ProgressMap; competencies: CompetencyMap } {
  const progress = readJSON<ProgressMap>(GUEST_PROGRESS_KEY, loadProgress());
  const competencies = readJSON<CompetencyMap>(
    GUEST_COMPETENCY_KEY,
    loadCompetencies()
  );
  writeJSON(PROGRESS_KEY, progress);
  writeJSON(COMPETENCY_KEY, competencies);
  removeKey(GUEST_PROGRESS_KEY);
  removeKey(GUEST_COMPETENCY_KEY);
  return { progress, competencies };
}

function mergeProgressEntries(
  local: ProgressEntry | undefined,
  cloud: ProgressEntry | undefined
): ProgressEntry | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  return {
    status:
      local.status === "tamamlandi" || cloud.status === "tamamlandi"
        ? "tamamlandi"
        : "acik",
    best_technical: Math.max(local.best_technical, cloud.best_technical),
    best_behavior: Math.max(local.best_behavior, cloud.best_behavior),
    attempts: Math.max(local.attempts, cloud.attempts),
    hints_used: Math.max(local.hints_used, cloud.hints_used),
    updated_at:
      local.updated_at >= cloud.updated_at ? local.updated_at : cloud.updated_at,
  };
}

function mergeProgressMaps(local: ProgressMap, cloud: ProgressMap): ProgressMap {
  const slugs = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const next: ProgressMap = {};
  for (const slug of slugs) {
    const merged = mergeProgressEntries(local[slug], cloud[slug]);
    if (merged) next[slug] = merged;
  }
  return next;
}

function mergeCompetencyMaps(local: CompetencyMap, cloud: CompetencyMap): CompetencyMap {
  const keys = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const next: CompetencyMap = {};
  for (const key of keys) {
    const a = local[key];
    const b = cloud[key];
    if (!a) {
      next[key] = b;
      continue;
    }
    if (!b) {
      next[key] = a;
      continue;
    }
    next[key] = {
      zone_id: a.zone_id || b.zone_id,
      score: Math.max(a.score, b.score),
      attempts: Math.max(a.attempts, b.attempts),
    };
  }
  return next;
}

function applyResultToEntry(
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

async function resolveScenarioId(slug: string, knownId?: string): Promise<string | null> {
  if (knownId) return knownId;
  const supabase = getSupabase();
  if (!supabase || !slug) return null;
  const { data, error } = await supabase
    .from("scenarios")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    if (isDev()) console.error("SafeWatch progress sync failed:", error.message);
    return null;
  }
  return (data?.id as string | undefined) ?? null;
}

/** Giriş yapmış kullanıcı için buluta yazar. Misafirde çağrılmaz. */
async function syncToSupabase(
  scenario: Scenario,
  entry: ProgressEntry,
  result: ScenarioResult
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return;

  const scenarioId = await resolveScenarioId(scenario.slug, scenario.id);
  if (!scenarioId) {
    if (isDev()) {
      console.warn(
        "SafeWatch progress sync skipped: scenario could not be resolved"
      );
    }
    return;
  }

  const { error: progressError } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      scenario_id: scenarioId,
      status: entry.status,
      best_technical: entry.best_technical,
      best_behavior: entry.best_behavior,
      attempts: entry.attempts,
      hints_used: entry.hints_used,
      updated_at: entry.updated_at,
    },
    { onConflict: "user_id,scenario_id" }
  );
  if (progressError && isDev()) {
    console.error("SafeWatch progress sync failed:", progressError.message);
  }

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
    const { error: compError } = await supabase
      .from("competency_summary")
      .upsert(rows, { onConflict: "user_id,zone_id,competency" });
    if (compError && isDev()) {
      console.error("SafeWatch progress sync failed:", compError.message);
    }
  }
}

async function pullCloudProgress(): Promise<{
  progress: ProgressMap;
  competencies: CompetencyMap;
} | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: rows, error } = await supabase
    .from("user_progress")
    .select(
      "scenario_id, status, best_technical, best_behavior, attempts, hints_used, updated_at"
    );
  if (error) {
    if (isDev()) console.error("SafeWatch progress sync failed:", error.message);
    return null;
  }

  const ids = [
    ...new Set((rows ?? []).map((row) => row.scenario_id).filter(Boolean)),
  ] as string[];

  const slugById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: scens, error: scenarioError } = await supabase
      .from("scenarios")
      .select("id, slug")
      .in("id", ids);
    if (scenarioError && isDev()) {
      console.error("SafeWatch progress sync failed:", scenarioError.message);
    }
    for (const item of scens ?? []) {
      if (item.id && item.slug) slugById.set(item.id, item.slug);
    }
  }

  const progress: ProgressMap = {};
  for (const row of rows ?? []) {
    const slug = slugById.get(row.scenario_id);
    if (!slug) continue;
    progress[slug] = {
      status: row.status === "tamamlandi" ? "tamamlandi" : "acik",
      best_technical: Number(row.best_technical) || 0,
      best_behavior: Number(row.best_behavior) || 0,
      attempts: Number(row.attempts) || 0,
      hints_used: Number(row.hints_used) || 0,
      updated_at: row.updated_at || new Date(0).toISOString(),
    };
  }

  const competencies: CompetencyMap = {};
  const { data: comps, error: compError } = await supabase
    .from("competency_summary")
    .select("zone_id, competency, score, attempts");
  if (compError) {
    if (isDev()) console.error("SafeWatch progress sync failed:", compError.message);
  } else {
    for (const row of comps ?? []) {
      if (!row.zone_id || !row.competency) continue;
      const key = `${row.zone_id}:${row.competency}`;
      competencies[key] = {
        zone_id: row.zone_id,
        score: Number(row.score) || 0,
        attempts: Number(row.attempts) || 0,
      };
    }
  }

  return { progress, competencies };
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [competencies, setCompetencies] = useState<CompetencyMap>({});
  const [ready, setReady] = useState(false);
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    setCompetencies(loadCompetencies());
    setReady(true);

    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    const applyCloud = async (userId: string) => {
      if (cancelled || syncedUserId.current === userId) return;
      syncedUserId.current = userId;
      snapshotGuestIfNeeded();
      const cloud = await pullCloudProgress();
      if (cancelled || !cloud) return;
      const mergedProgress = mergeProgressMaps(loadProgress(), cloud.progress);
      const mergedComp = mergeCompetencyMaps(
        loadCompetencies(),
        cloud.competencies
      );
      writeJSON(PROGRESS_KEY, mergedProgress);
      writeJSON(COMPETENCY_KEY, mergedComp);
      setProgress(mergedProgress);
      setCompetencies(mergedComp);
    };

    const onSignedOut = () => {
      if (!syncedUserId.current) return;
      syncedUserId.current = null;
      const restored = restoreGuestSnapshot();
      setProgress(restored.progress);
      setCompetencies(restored.competencies);
    };

    void supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id;
      if (userId) void applyCloud(userId);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        onSignedOut();
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void applyCloud(session.user.id);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const recordResult = useCallback(
    (scenario: Scenario, result: ScenarioResult) => {
      const current = loadProgress();
      const entry = applyResultToEntry(current[scenario.slug], result);
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
        void syncToSupabase(scenario, entry, result);
      }
    },
    []
  );

  const reset = useCallback(() => {
    writeJSON(PROGRESS_KEY, {});
    writeJSON(COMPETENCY_KEY, {});
    removeKey(GUEST_PROGRESS_KEY);
    removeKey(GUEST_COMPETENCY_KEY);
    setProgress({});
    setCompetencies({});
  }, []);

  return { progress, competencies, ready, recordResult, reset };
}

export function completedCount(progress: ProgressMap): number {
  return Object.values(progress).filter((p) => p.status === "tamamlandi")
    .length;
}
