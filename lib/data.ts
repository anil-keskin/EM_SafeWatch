"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ZONES } from "@/content/zones";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_ITEMS } from "@/content/equipment";
import { SCENARIOS } from "@/content/scenarios";
import type {
  EquipmentCategory,
  EquipmentItem,
  Scenario,
  Zone,
} from "@/lib/types";

/**
 * İçerik katmanı.
 *
 * Uygulama önce `content/` altındaki yerel veriyi gösterir; böylece Supabase
 * bağlanmadan da çalışır. Supabase yapılandırılmışsa veriler arka planda
 * veritabanından çekilip yerel içeriğin üzerine yazılır.
 */

/**
 * Verinin nereden geldiği. Kurulumun doğru yapılıp yapılmadığını
 * arayüzde göstermek için kullanılır.
 *
 *  - `local`    : Supabase yapılandırılmamış, yerel içerik kullanılıyor.
 *  - `loading`  : Supabase yapılandırılmış, veri çekiliyor.
 *  - `database` : Veri Supabase'ten geliyor.
 *  - `error`    : Supabase'e ulaşılamadı veya tablolar boş; yerel içeriğe düşüldü.
 */
export type DataSource = "local" | "loading" | "database" | "error";

export interface SafeWatchData {
  zones: Zone[];
  scenarios: Scenario[];
  categories: EquipmentCategory[];
  equipment: EquipmentItem[];
  source: DataSource;
}

const LOCAL_CONTENT = {
  zones: ZONES,
  scenarios: SCENARIOS,
  categories: EQUIPMENT_CATEGORIES,
  equipment: EQUIPMENT_ITEMS,
};

type RemoteContent = Omit<SafeWatchData, "source">;

function normalizeList(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function normalizeScenario(row: Scenario): Scenario {
  return {
    ...row,
    is_draft: false,
    briefing: row.briefing ?? {},
    hazards: Array.isArray(row.hazards) ? row.hazards : [],
    actors: Array.isArray(row.actors) ? row.actors : [],
    required_self: normalizeList(row.required_self),
    forbidden_self: normalizeList(row.forbidden_self),
    contractor_gaps: normalizeList(row.contractor_gaps),
    operator_gaps: normalizeList(row.operator_gaps),
    correct_actions: normalizeList(row.correct_actions),
    wrong_actions: normalizeList(row.wrong_actions),
    hints: normalizeList(row.hints),
    competency_tags: normalizeList(row.competency_tags),
  };
}

/**
 * Supabase'de eksik kalan senaryolar yerel listeden tamamlanır.
 * Böylece veritabanında 6 kayıt olsa bile saha seçiminde 30 senaryo görünür.
 */
function mergeScenarios(remote: Scenario[], local: Scenario[]): Scenario[] {
  const bySlug = new Map<string, Scenario>();
  for (const item of local) {
    bySlug.set(item.slug, normalizeScenario(item));
  }
  for (const item of remote) {
    if (!item?.slug) continue;
    const previous = bySlug.get(item.slug);
    bySlug.set(item.slug, normalizeScenario({ ...previous, ...item } as Scenario));
  }
  return Array.from(bySlug.values());
}

async function fetchFromSupabase(): Promise<RemoteContent | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const [zonesRes, scenariosRes, categoriesRes, itemsRes] = await Promise.all([
    supabase.from("zones").select("*").order("order_index"),
    supabase.from("scenarios").select("*").order("order_index").limit(100),
    supabase.from("equipment_categories").select("*").order("order_index"),
    supabase.from("equipment_items").select("*").order("order_index").limit(200),
  ]);

  if (zonesRes.error && scenariosRes.error) return null;

  const zones = (zonesRes.data?.length ? (zonesRes.data as Zone[]) : ZONES);
  const remoteScenarios = (scenariosRes.data ?? []) as Scenario[];
  if (zones.length === 0) return null;

  return {
    zones,
    scenarios: mergeScenarios(remoteScenarios, SCENARIOS),
    categories: (categoriesRes.data?.length
      ? (categoriesRes.data as EquipmentCategory[])
      : EQUIPMENT_CATEGORIES),
    equipment: (itemsRes.data?.length
      ? (itemsRes.data as EquipmentItem[])
      : EQUIPMENT_ITEMS),
  };
}

export function useSafeWatchData(): SafeWatchData {
  const [content, setContent] = useState<RemoteContent>(LOCAL_CONTENT);
  const [source, setSource] = useState<DataSource>(
    isSupabaseConfigured ? "loading" : "local"
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    fetchFromSupabase()
      .then((remote) => {
        if (cancelled) return;
        if (remote) {
          setContent(remote);
          setSource("database");
        } else {
          setSource("error");
        }
      })
      .catch(() => {
        // Veritabanına ulaşılamazsa yerel içerikle devam edilir.
        if (!cancelled) setSource("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...content, source };
}

export function scenariosOfZone(
  scenarios: Scenario[],
  zoneId: string
): Scenario[] {
  return scenarios
    .filter((s) => s.zone_id === zoneId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function findScenario(
  scenarios: Scenario[],
  slug: string
): Scenario | undefined {
  return scenarios.find((s) => s.slug === slug);
}
