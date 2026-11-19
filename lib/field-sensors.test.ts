import { describe, expect, it } from "vitest";
import {
  BASELINE,
  alarmFor,
  heatSources,
  noiseAlarm,
  readField,
} from "@/lib/field-sensors";
import type { Hazard } from "@/lib/types";

const hz = (code: string, is_real: boolean, x = 50, y = 50): Hazard => ({
  code,
  label: code,
  is_real,
  x,
  y,
  explanation: "",
});

describe("saha ölçüm cihazları", () => {
  it("gerçek CO kaynağının üstünde alarm, uzağında temiz okur", () => {
    const hazards = [hz("co_gazi", true, 20, 30)];
    const near = readField(20, 30, hazards);
    const far = readField(90, 90, hazards);
    expect(near.gas.co).toBeGreaterThanOrEqual(200);
    expect(alarmFor("gaz", near)).toBe("alarm");
    expect(far.gas.co).toBe(0);
    expect(alarmFor("gaz", far)).toBe("normal");
  });

  it("sahte gözlem noktası ölçümde iz bırakmaz", () => {
    const hazards = [hz("co_gazi", false), hz("radyasyon", false)];
    const r = readField(50, 50, hazards);
    expect(r.gas.co).toBe(0);
    expect(r.doseRate).toBe(BASELINE.doseRate);
  });

  it("kapalı hacimde oksijen düşer", () => {
    const r = readField(50, 50, [hz("oksijen_yetersizligi", true)]);
    expect(r.gas.o2).toBeLessThan(19.5);
    expect(alarmFor("gaz", r)).not.toBe("normal");
  });

  it("gürültü eşikleri yönetmelikteki 80/85 dB(A) değerleridir", () => {
    expect(noiseAlarm(79)).toBe("normal");
    expect(noiseAlarm(80)).toBe("dikkat");
    expect(noiseAlarm(85)).toBe("alarm");
    expect(readField(50, 50, [hz("gurultu", true)]).noise).toBeGreaterThanOrEqual(85);
  });

  it("termal kamera yalnızca gerçek ısı kaynaklarını gösterir", () => {
    const list = heatSources([hz("radyan_isi", true), hz("sicak_yuzey", false), hz("toz", true)]);
    expect(list).toHaveLength(1);
  });
});
