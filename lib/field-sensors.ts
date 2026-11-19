/**
 * Saha ölçüm cihazları — sahne üzerindeki bir noktada okunan değerler.
 *
 * Yalnızca GERÇEK tehlikeler (is_real) alan üretir. Sahte gözlem noktası
 * ölçümde "temiz" çıkar: oyuncu, ölçüm yaparak varsayımını doğrulamayı öğrenir.
 * Değerler eğitim amaçlı temsilidir; cihaz eşikleri örnek cihaz ayarıdır.
 * Gürültü eşikleri Gürültü Yönetmeliği'ndeki 80 / 85 / 87 dB(A) değerleridir.
 */

import type { Hazard } from "@/lib/types";

export type InstrumentId = "gaz" | "doz" | "ses" | "termal";

export type AlarmLevel = "normal" | "dikkat" | "alarm";

export interface GasReading {
  co: number; // ppm
  h2s: number; // ppm
  lel: number; // %LEL
  o2: number; // %vol
}

export interface FieldReading {
  gas: GasReading;
  doseRate: number; // µSv/h
  noise: number; // dB(A)
  temperature: number; // °C
}

/** Kod → tepe değer. Kodlar veritabanındaki tehlike kodlarıyla aynıdır. */
const CO_SOURCES: Record<string, number> = {
  co_gazi: 320,
  kok_gazi_pah: 420,
  gaz_bogucu: 220,
  flans_butunlugu: 180,
  purge_cikis: 260,
  gaz_cikis_camur: 160,
};
const H2S_SOURCES: Record<string, number> = { h2s: 28, kok_gazi_pah: 12 };
const LEL_SOURCES: Record<string, number> = {
  patlayici_ortam: 38,
  dogalgaz: 32,
  kok_gazi_pah: 22,
  purge_cikis: 18,
};
/** Oksijen düşüşü (puan). */
const O2_SINKS: Record<string, number> = {
  oksijen_yetersizligi: 4.8,
  gaz_bogucu: 3.2,
  kapali_hacim: 2.4,
  kapali_ortam: 2.4,
};
const DOSE_SOURCES: Record<string, number> = { radyasyon: 85 };
const NOISE_SOURCES: Record<string, number> = {
  gurultu: 104,
  elek_titresim: 96,
  basincli_hat: 92,
  buhar_patlamasi: 98,
};
const HEAT_SOURCES: Record<string, number> = {
  sivi_metal_sicrama: 1450,
  kizgin_metal_firlama: 1100,
  radyan_isi: 620,
  yuksek_isi: 480,
  sicak_yuzey: 260,
  sicak_malzeme: 400,
  buhar_sicak_su: 140,
  sicak_su_sicrama: 95,
  buhar_patlamasi: 160,
  kivilcim_yangin: 300,
};

export const BASELINE: FieldReading = {
  gas: { co: 0, h2s: 0, lel: 0, o2: 20.9 },
  doseRate: 0.12,
  noise: 74,
  temperature: 31,
};

/** Sahne en-boy oranı 16:10; mesafe yatayda düzeltilir. */
const ASPECT = 1.6;
const SIGMA = 11; // yüzde birimi

function falloff(px: number, py: number, h: Pick<Hazard, "x" | "y">): number {
  const dx = (px - h.x) * ASPECT;
  const dy = py - h.y;
  return Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA));
}

function peakField(
  px: number,
  py: number,
  hazards: Hazard[],
  sources: Record<string, number>
): number {
  let total = 0;
  for (const h of hazards) {
    if (!h.is_real) continue;
    const peak = sources[h.code];
    if (peak) total += peak * falloff(px, py, h);
  }
  return total;
}

function maxField(
  px: number,
  py: number,
  hazards: Hazard[],
  sources: Record<string, number>
): number {
  let best = 0;
  for (const h of hazards) {
    if (!h.is_real) continue;
    const peak = sources[h.code];
    if (peak) best = Math.max(best, peak * falloff(px, py, h));
  }
  return best;
}

const round = (v: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

/** (px, py) yüzde koordinatında okunan değerler. */
export function readField(px: number, py: number, hazards: Hazard[]): FieldReading {
  const noisePeak = maxField(px, py, hazards, NOISE_SOURCES);
  const heat = maxField(px, py, hazards, HEAT_SOURCES);
  return {
    gas: {
      co: round(peakField(px, py, hazards, CO_SOURCES)),
      h2s: round(peakField(px, py, hazards, H2S_SOURCES), 1),
      lel: round(Math.min(100, peakField(px, py, hazards, LEL_SOURCES))),
      o2: round(Math.max(15, BASELINE.gas.o2 - peakField(px, py, hazards, O2_SINKS)), 1),
    },
    doseRate: round(BASELINE.doseRate + peakField(px, py, hazards, DOSE_SOURCES), 2),
    // Kaynak tepe değerine doğru logaritmik olmayan basit yaklaşım.
    noise: round(
      noisePeak > 0
        ? Math.max(BASELINE.noise, BASELINE.noise + (noisePeak - BASELINE.noise) * Math.min(1, noisePeak / 100))
        : BASELINE.noise
    ),
    temperature: round(Math.max(BASELINE.temperature, heat)),
  };
}

export function gasAlarm(g: GasReading): AlarmLevel {
  if (g.co >= 200 || g.h2s >= 15 || g.lel >= 20 || g.o2 < 18) return "alarm";
  if (g.co >= 35 || g.h2s >= 10 || g.lel >= 10 || g.o2 < 19.5) return "dikkat";
  return "normal";
}

export function doseAlarm(v: number): AlarmLevel {
  if (v >= 20) return "alarm";
  if (v >= 2.5) return "dikkat";
  return "normal";
}

export function noiseAlarm(v: number): AlarmLevel {
  if (v >= 85) return "alarm";
  if (v >= 80) return "dikkat";
  return "normal";
}

export function heatAlarm(v: number): AlarmLevel {
  if (v >= 200) return "alarm";
  if (v >= 60) return "dikkat";
  return "normal";
}

export function alarmFor(id: InstrumentId, r: FieldReading): AlarmLevel {
  switch (id) {
    case "gaz":
      return gasAlarm(r.gas);
    case "doz":
      return doseAlarm(r.doseRate);
    case "ses":
      return noiseAlarm(r.noise);
    case "termal":
      return heatAlarm(r.temperature);
  }
}

/** Termal kamerada görünecek ısı kaynakları (yalnızca gerçek olanlar). */
export function heatSources(hazards: Hazard[]): { x: number; y: number; intensity: number }[] {
  return hazards
    .filter((h) => h.is_real && HEAT_SOURCES[h.code])
    .map((h) => ({
      x: h.x,
      y: h.y,
      intensity: Math.min(1, 0.35 + HEAT_SOURCES[h.code] / 1500),
    }));
}
