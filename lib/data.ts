"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { EQUIPMENT_WHY_SELECT } from "@/content/card-hints";
import { riskLayerFor } from "@/lib/equipment-layers";
import { applyLayerConsistency } from "@/lib/ppe-consistency";
import { ZONES } from "@/content/zones";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_ITEMS } from "@/content/equipment";
import { SCENARIOS } from "@/content/scenarios";
import type {
  Actor,
  Briefing,
  EquipmentCategory,
  EquipmentItem,
  Hazard,
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

export type DataSource = "local" | "loading" | "database" | "error";

export interface SafeWatchData {
  zones: Zone[];
  scenarios: Scenario[];
  categories: EquipmentCategory[];
  equipment: EquipmentItem[];
  source: DataSource;
  /** Kaynak `error` ise kısa teknik açıklama (anahtar sızdırılmaz). */
  sourceDetail?: string;
}

type RemoteContent = Omit<SafeWatchData, "source" | "sourceDetail">;

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function asList(value: unknown): string[] {
  const parsed = parseJson<unknown>(value, []);
  return Array.isArray(parsed) ? parsed.map(String) : [];
}

function hasPlayableContent(scenario: Pick<Scenario, "briefing" | "hazards">): boolean {
  return Boolean(scenario.briefing?.gorev) || (scenario.hazards?.length ?? 0) > 0;
}

function normalizeScenario(
  row: Partial<Scenario> & { slug?: string }
): Scenario | null {
  const slug = row.slug?.trim();
  if (!slug) return null;
  return applyLayerConsistency({
    slug,
    zone_id: row.zone_id ?? "",
    order_index: Number(row.order_index) || 0,
    title: row.title ?? slug,
    is_draft: false,
    briefing: parseJson<Briefing>(row.briefing, {}),
    hazards: parseJson<Hazard[]>(row.hazards, []),
    actors: parseJson<Actor[]>(row.actors, []),
    required_self: asList(row.required_self),
    forbidden_self: asList(row.forbidden_self),
    contractor_gaps: asList(row.contractor_gaps),
    operator_gaps: asList(row.operator_gaps),
    correct_actions: asList(row.correct_actions),
    wrong_actions: asList(row.wrong_actions),
    hints: asList(row.hints),
    competency_tags: asList(row.competency_tags),
    explanation: row.explanation ?? "",
    id: row.id,
  });
}

function mergeById<T extends { id: string }>(remote: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of local) map.set(item.id, item);
  for (const item of remote) {
    if (!item?.id) continue;
    map.set(item.id, { ...map.get(item.id), ...item });
  }
  return Array.from(map.values()).sort(
    (a, b) => ((a as { order_index?: number }).order_index ?? 0) -
      ((b as { order_index?: number }).order_index ?? 0)
  );
}

function mergeScenarios(remote: Scenario[], local: Scenario[]): Scenario[] {
  const bySlug = new Map<string, Scenario>();
  for (const item of local) {
    const normalized = normalizeScenario(item);
    if (normalized) bySlug.set(normalized.slug, normalized);
  }
  for (const item of remote) {
    const incoming = normalizeScenario(item);
    if (!incoming) continue;
    const previous = bySlug.get(incoming.slug);
    if (previous && hasPlayableContent(previous) && !hasPlayableContent(incoming)) {
      bySlug.set(incoming.slug, {
        ...previous,
        title: incoming.title || previous.title,
        zone_id: incoming.zone_id || previous.zone_id,
        order_index: incoming.order_index || previous.order_index,
      });
    } else {
      bySlug.set(incoming.slug, previous ? { ...previous, ...incoming } : incoming);
    }
  }
  return Array.from(bySlug.values());
}

function normalizeEquipment(row: Partial<EquipmentItem> & { id?: string }): EquipmentItem | null {
  const code = (row.code ?? "").trim();
  if (!code) return null;
  return {
    code,
    name: row.name ?? code,
    category_id: row.category_id ?? "",
    standard: row.standard ?? "",
    description: row.description ?? "",
    used_by: row.used_by ?? "hepsi",
    not_for: row.not_for ?? "",
    why_select:
      (row.why_select ?? "").trim() || EQUIPMENT_WHY_SELECT[code] || "",
    risk_layer: row.risk_layer === "ise_ozgu" ? "ise_ozgu" : riskLayerFor(code),
    icon: row.icon ?? "",
    order_index: Number(row.order_index) || 0,
  };
}

const LOCAL_CONTENT: RemoteContent = {
  zones: ZONES,
  scenarios: mergeScenarios([], SCENARIOS),
  categories: EQUIPMENT_CATEGORIES,
  equipment: EQUIPMENT_ITEMS,
};

function errorText(error: { message?: string; code?: string } | null): string {
  if (!error?.message) return "";
  return [error.code, error.message].filter(Boolean).join(": ");
}

async function fetchFromSupabase(): Promise<{
  content: RemoteContent;
  ok: boolean;
  detail?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { content: LOCAL_CONTENT, ok: false, detail: "İstemci oluşturulamadı." };
  }

  const [zonesRes, scenariosRes, categoriesRes, itemsRes] = await Promise.all([
    supabase.from("zones").select("*"),
    supabase.from("scenarios").select("*").limit(200),
    supabase.from("equipment_categories").select("*"),
    supabase.from("equipment_items").select("*").limit(200),
  ]);

  const failures = [
    zonesRes.error && `zones: ${errorText(zonesRes.error)}`,
    scenariosRes.error && `scenarios: ${errorText(scenariosRes.error)}`,
    categoriesRes.error && `equipment_categories: ${errorText(categoriesRes.error)}`,
    itemsRes.error && `equipment_items: ${errorText(itemsRes.error)}`,
  ].filter(Boolean) as string[];

  const remoteScenarios = (scenariosRes.data ?? []) as Scenario[];
  const remoteZones = (zonesRes.data ?? []) as Zone[];
  const remoteCategories = (categoriesRes.data ?? []) as EquipmentCategory[];
  const remoteItems = ((itemsRes.data ?? []) as Array<Partial<EquipmentItem>>)
    .map(normalizeEquipment)
    .filter((item): item is EquipmentItem => Boolean(item));

  const content: RemoteContent = {
    zones: mergeById(remoteZones, ZONES),
    scenarios: mergeScenarios(remoteScenarios, SCENARIOS),
    categories: mergeById(remoteCategories, EQUIPMENT_CATEGORIES),
    equipment: remoteItems.length ? remoteItems : EQUIPMENT_ITEMS,
  };

  const ok = !zonesRes.error || !scenariosRes.error;
  return {
    content,
    ok,
    detail: failures.length ? failures.join(" · ") : undefined,
  };
}

export function useSafeWatchData(): SafeWatchData {
  const [content, setContent] = useState<RemoteContent>(LOCAL_CONTENT);
  const [source, setSource] = useState<DataSource>(
    isSupabaseConfigured ? "loading" : "local"
  );
  const [sourceDetail, setSourceDetail] = useState<string | undefined>();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    fetchFromSupabase()
      .then((result) => {
        if (cancelled) return;
        setContent(result.content);
        setSource(result.ok ? "database" : "error");
        setSourceDetail(result.detail);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSource("error");
        setSourceDetail(error instanceof Error ? error.message : "Ağ hatası");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...content, source, sourceDetail };
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
