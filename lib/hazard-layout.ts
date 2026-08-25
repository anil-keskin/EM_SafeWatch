import type { Hazard } from "@/lib/types";

const STORAGE_PREFIX = "safewatch:hazard-layout:";

/** Sahnede butonların kesilmemesi için yüzde cinsinden güvenli alan. */
const X_MIN = 12;
const X_MAX = 88;
const Y_MIN = 16;
const Y_MAX = 76;
/** İki nokta merkezi arasındaki asgari uzaklık (yüzde). */
const MIN_SEPARATION = 16;

export function hazardLayoutStorageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function createHazardLayoutSeed(slug: string): number {
  const seed = ((Math.random() * 0x7fffffff) | 0) + 1;
  try {
    sessionStorage.setItem(hazardLayoutStorageKey(slug), String(seed));
  } catch {
    /* gizli tarama / kota */
  }
  return seed;
}

export function readHazardLayoutSeed(slug: string): number | null {
  try {
    const raw = sessionStorage.getItem(hazardLayoutStorageKey(slug));
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) && value !== 0 ? value : null;
  } catch {
    return null;
  }
}

/**
 * Mulberry32 — aynı tohum aynı yerleşimi üretir (oturum içinde ve sonuç tekrarında).
 */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function farEnough(
  x: number,
  y: number,
  placed: Array<{ x: number; y: number }>
): boolean {
  const min2 = MIN_SEPARATION * MIN_SEPARATION;
  return placed.every((point) => {
    const dx = point.x - x;
    const dy = point.y - y;
    return dx * dx + dy * dy >= min2;
  });
}

function fallbackSlot(index: number, total: number): { x: number; y: number } {
  const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(total))));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const rows = Math.max(1, Math.ceil(total / cols));
  const x = X_MIN + ((col + 0.5) / cols) * (X_MAX - X_MIN);
  const y = Y_MIN + ((row + 0.5) / rows) * (Y_MAX - Y_MIN);
  return { x, y };
}

/**
 * Risk noktalarının kimliğini ve gerçek/sahte ayrımını korur;
 * yalnızca x/y konumunu bu denemeye özel rastgeleler.
 */
export function scatterHazards(hazards: Hazard[], seed: number): Hazard[] {
  if (hazards.length === 0) return hazards;

  const rand = mulberry32(seed >>> 0 || 1);
  const placed: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < hazards.length; i += 1) {
    let next = fallbackSlot(i, hazards.length);
    for (let attempt = 0; attempt < 48; attempt += 1) {
      const x = X_MIN + rand() * (X_MAX - X_MIN);
      const y = Y_MIN + rand() * (Y_MAX - Y_MIN);
      if (farEnough(x, y, placed)) {
        next = { x, y };
        break;
      }
    }
    placed.push(next);
  }

  return hazards.map((hazard, index) => ({
    ...hazard,
    x: Math.round(placed[index].x * 10) / 10,
    y: Math.round(placed[index].y * 10) / 10,
  }));
}
