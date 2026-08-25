/**
 * İki katmanlı KKD tutarlılığı.
 *
 * 1) Ortam (giyilebilir) donanım required_self'teyse, sahadaki yüklenici ve
 *    işletme expected'ında da durur. Öğretici gap listesindeyse current'a
 *    eklenmez.
 * 2) expected − current farkı gap listesinde yoksa bu bir mantık hatasıdır;
 *    current'a yazılır (yeni öğretici gap üretilmez).
 * 3) İşe özel donanım aktörler arasında kopyalanmaz.
 */

import { substituteGroup } from "@/lib/equipment-families";
import {
  PROTECTION_SLOTS,
  isEnvironmentalWearable,
} from "@/lib/equipment-layers";
import type { Actor, Scenario } from "@/lib/types";

function unique(codes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const code of codes) {
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

function hasCodeOrFamily(items: readonly string[], needed: string): boolean {
  const have = new Set(items);
  if (have.has(needed)) return true;
  const group = substituteGroup(needed);
  return items.some((code) => substituteGroup(code) === group);
}

function slotOf(code: string): readonly string[] | null {
  return PROTECTION_SLOTS.find((slot) => slot.includes(code)) ?? null;
}

function hasSlotCoverage(items: readonly string[], needed: string): boolean {
  if (hasCodeOrFamily(items, needed)) return true;
  const slot = slotOf(needed);
  if (!slot) return false;
  return items.some((code) => slot.includes(code));
}

/** 4'lü cihaz CO'yu kapsar; HI3 tabanı S3'ü kapsar; SCBA kaçışı kapsar. */
function hasSuperset(items: readonly string[], needed: string): boolean {
  const have = new Set(items);
  if (needed === "gaz_dedektoru_co" && have.has("gaz_dedektoru_4li")) return true;
  if (needed === "ayakkabi_s3" && have.has("cizme_isi_hi3")) return true;
  if (needed === "kacis_maskesi_co" && have.has("temiz_hava_solunum")) return true;
  if (
    needed === "toz_maskesi_ffp3" &&
    (have.has("temiz_hava_solunum") || have.has("yarim_yuz_maske"))
  ) {
    return true;
  }
  if (needed === "fr_kiyafet" && have.has("aluminize_giysi")) return true;
  if (
    needed === "standart_is_kiyafeti" &&
    (have.has("fr_kiyafet") ||
      have.has("aluminize_giysi") ||
      have.has("antistatik_ex_kiyafet"))
  ) {
    return true;
  }
  if (needed === "gozluk_en166" && have.has("gozluk_ir")) return true;
  return false;
}

function actorCovers(items: readonly string[], needed: string): boolean {
  return hasSuperset(items, needed) || hasSlotCoverage(items, needed);
}

function wearableEnvFromSelf(requiredSelf: readonly string[]): string[] {
  return requiredSelf.filter(
    (code) =>
      isEnvironmentalWearable(code) ||
      /* kızgın zemin: gözlemci de yürüyorsa herkese ortam */
      code === "cizme_isi_hi3"
  );
}

function fieldActors(actors: Actor[]): Actor[] {
  return actors.filter(
    (actor) => actor.type === "yuklenici" || actor.type === "isletme"
  );
}

function listedGaps(scenario: Scenario, type: Actor["type"]): string[] {
  if (type === "yuklenici") return scenario.contractor_gaps ?? [];
  if (type === "isletme") return scenario.operator_gaps ?? [];
  return [];
}

function propagateWearable(scenario: Scenario): Actor[] {
  const envCodes = wearableEnvFromSelf(scenario.required_self);
  if (envCodes.length === 0) return scenario.actors;

  return scenario.actors.map((actor) => {
    if (actor.type !== "yuklenici" && actor.type !== "isletme") return actor;

    const gaps = new Set(listedGaps(scenario, actor.type));
    let expected = unique(actor.expected_items ?? []);
    let current = unique(actor.current_items ?? []);

    for (const code of envCodes) {
      if (actorCovers(expected, code)) continue;
      expected = unique([...expected, code]);
      if (!gaps.has(code) && !actorCovers(current, code)) {
        current = unique([...current, code]);
      }
    }

    return { ...actor, expected_items: expected, current_items: current };
  });
}

/**
 * Öğretici gap yalnızca contractor_gaps / operator_gaps'te yazılı olandır.
 * expected'da olup current'da olmayan ve listede yoksa current'a eklenir.
 */
function closeUnlistedGaps(scenario: Scenario, actors: Actor[]): Actor[] {
  return actors.map((actor) => {
    if (actor.type !== "yuklenici" && actor.type !== "isletme") return actor;

    const gaps = new Set(listedGaps(scenario, actor.type));
    const expected = unique(actor.expected_items ?? []);
    let current = unique(actor.current_items ?? []);

    for (const code of expected) {
      if (gaps.has(code)) continue;
      if (actorCovers(current, code)) continue;
      current = unique([...current, code]);
    }

    return { ...actor, expected_items: expected, current_items: current };
  });
}

export function applyLayerConsistency(scenario: Scenario): Scenario {
  const propagated = propagateWearable(scenario);
  const actors = closeUnlistedGaps({ ...scenario, actors: propagated }, propagated);
  return { ...scenario, actors };
}

/** Test ve denetim: ortam kodunun üç aktörde de expected'da olup olmadığı. */
export function environmentalMissingOnActors(scenario: Scenario): string[] {
  const envCodes = wearableEnvFromSelf(scenario.required_self);
  const issues: string[] = [];
  for (const actor of fieldActors(scenario.actors)) {
    const expected = actor.expected_items ?? [];
    for (const code of envCodes) {
      if (!actorCovers(expected, code)) {
        issues.push(`${scenario.slug}:${actor.type} missing ${code}`);
      }
    }
  }
  return issues;
}

