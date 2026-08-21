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

async function fetchFromSupabase(): Promise<RemoteContent | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const [zonesRes, scenariosRes, categoriesRes, itemsRes] = await Promise.all([
    supabase.from("zones").select("*").order("order_index"),
    supabase.from("scenarios").select("*").order("order_index"),
    supabase.from("equipment_categories").select("*").order("order_index"),
    supabase.from("equipment_items").select("*").order("order_index"),
  ]);

  const failed =
    zonesRes.error || scenariosRes.error || categoriesRes.error || itemsRes.error;
  // Şema kurulmuş ama seed çalıştırılmamışsa tablolar boş gelir.
  const empty =
    !zonesRes.data?.length ||
    !scenariosRes.data?.length ||
    !itemsRes.data?.length;

  if (failed || empty) return null;

  return {
    zones: zonesRes.data as Zone[],
    scenarios: scenariosRes.data as Scenario[],
    categories: categoriesRes.data as EquipmentCategory[],
    equipment: itemsRes.data as EquipmentItem[],
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
