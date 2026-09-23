import type { Scenario, ScenarioType } from "@/lib/types";

/**
 * Zaman Makinesi yardımcıları.
 *
 * Olay tarihi veritabanında ISO (YYYY-MM-DD) tutulur; arayüzde gg.aa.yyyy
 * gösterilir. Oyuncu olayın **bir gün öncesine** döndüğü için buton ve geçiş
 * bandı metinleri `incident_date - 1 gün` üzerinden üretilir.
 *
 * Tarih aritmetiği yerel saat diliminden etkilenmemelidir: 2026-08-21 için
 * new Date(...) yerel gece yarısını verir ve UTC+3'te bir gün kayabilir.
 * Bu yüzden parçalara ayırıp UTC üzerinden hesaplanır.
 */

export const TRAINING: ScenarioType = "training";
export const TIME_MACHINE: ScenarioType = "time_machine";

/** Alan yoksa senaryo eğitim havuzundadır (eski kayıt uyumu). */
export function scenarioType(scenario: Pick<Scenario, "scenario_type">): ScenarioType {
  return scenario.scenario_type === TIME_MACHINE ? TIME_MACHINE : TRAINING;
}

export function isTimeMachine(scenario: Pick<Scenario, "scenario_type">): boolean {
  return scenarioType(scenario) === TIME_MACHINE;
}

/** is_published alanı yoksa yayında sayılır (mevcut 30 senaryo bozulmasın). */
export function isPublished(scenario: Pick<Scenario, "is_published">): boolean {
  return scenario.is_published !== false;
}

function parseIso(value: string | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatUtc(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${date.getUTCFullYear()}`;
}

/** "2026-08-21" → "21.08.2026". Geçersizse boş string. */
export function formatIncidentDate(value: string | undefined): string {
  const date = parseIso(value);
  return date ? formatUtc(date) : "";
}

/** "2026-08-21" → "20.08.2026" (olaydan bir gün önce). Geçersizse boş string. */
export function formatDayBefore(value: string | undefined): string {
  const date = parseIso(value);
  if (!date) return "";
  date.setUTCDate(date.getUTCDate() - 1);
  return formatUtc(date);
}

/** Liste kartındaki eylem butonu: "20.08.2026'ya dön". */
export function timeTravelLabel(value: string | undefined): string {
  const day = formatDayBefore(value);
  return day ? `${day}'ya dön` : "Senaryoya gir";
}

/**
 * Kart üzerinde gösterilecek 2-3 kısa risk etiketi.
 * Önce competency_tags, yoksa gerçek tehlikelerin etiketleri kullanılır.
 */
export function riskTags(
  scenario: Pick<Scenario, "competency_tags" | "hazards">,
  labelFor: (code: string) => string,
  limit = 3
): string[] {
  const tags = (scenario.competency_tags ?? []).filter(Boolean);
  if (tags.length > 0) return tags.slice(0, limit).map(labelFor);
  return (scenario.hazards ?? [])
    .filter((hazard) => hazard.is_real)
    .slice(0, limit)
    .map((hazard) => hazard.label);
}
