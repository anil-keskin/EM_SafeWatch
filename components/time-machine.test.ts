import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TimeMachineBand from "@/components/TimeMachineBand";
import IncidentOutcome from "@/components/IncidentOutcome";
import ProgressBar from "@/components/ProgressBar";
import { SCENARIOS, TIME_MACHINE_SCENARIOS } from "@/content/scenarios";
import { timeMachineScenarios, trainingScenarios } from "@/lib/data";
import { isTimeMachine } from "@/lib/incident";
import { completedIn } from "@/lib/progress";
import type { ProgressEntry, ProgressMap } from "@/lib/types";

const render = (el: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(el);

function doneEntry(): ProgressEntry {
  return {
    status: "tamamlandi",
    best_technical: 90,
    best_behavior: 95,
    attempts: 1,
    hints_used: 0,
    updated_at: new Date().toISOString(),
  } as ProgressEntry;
}

describe("geçiş bandı", () => {
  it("olay tarihinin bir gün öncesini ve sabit metni gösterir", () => {
    const html = render(
      createElement(TimeMachineBand, { incidentDate: "2026-08-21" })
    );
    expect(html).toContain("20.08.2026");
    expect(html).toContain("Olaydan 1 gün önce. Henüz hiçbir şey olmadı.");
  });

  it("ikinci senaryoda da doğru tarihi üretir", () => {
    const html = render(
      createElement(TimeMachineBand, { incidentDate: "2026-07-18" })
    );
    expect(html).toContain("17.07.2026");
  });

  it("olay tarihi yoksa hiç render edilmez", () => {
    expect(render(createElement(TimeMachineBand, {}))).toBe("");
    expect(
      render(createElement(TimeMachineBand, { incidentDate: "" }))
    ).toBe("");
  });

  it("eğitim senaryolarının hiçbirinde bant çıkmaz", () => {
    for (const s of trainingScenarios(SCENARIOS)) {
      expect(isTimeMachine(s)).toBe(false);
      expect(
        render(createElement(TimeMachineBand, { incidentDate: s.incident_date }))
      ).toBe("");
    }
  });
});

describe("ilerleme — iki havuz ayrı sayılır", () => {
  const training = trainingScenarios(SCENARIOS);
  const timeMachine = timeMachineScenarios(SCENARIOS);

  it("eğitim havuzunun paydası 30, zaman makinesininki 2'dir", () => {
    const html =
      render(
        createElement(ProgressBar, {
          value: completedIn({}, training),
          total: training.length,
          label: "Eğitim Senaryoları",
        })
      ) +
      render(
        createElement(ProgressBar, {
          value: completedIn({}, timeMachine),
          total: timeMachine.length,
          label: "Zaman Makinesi",
        })
      );
    expect(html).toContain("Eğitim Senaryoları");
    expect(html).toContain("0/30");
    expect(html).toContain("Zaman Makinesi");
    expect(html).toContain("0/2");
  });

  it("zaman makinesi tamamlamak eğitim sayacını artırmaz", () => {
    const progress: ProgressMap = {
      "tm-kok-gazi-flans-butunlugu": doneEntry(),
      "tm-zemin-saci-cokmesi": doneEntry(),
    };
    expect(completedIn(progress, timeMachine)).toBe(2);
    expect(completedIn(progress, training)).toBe(0);
  });

  it("eğitim senaryosu tamamlamak zaman makinesi sayacını artırmaz", () => {
    const progress: ProgressMap = {
      "yf-dokum-kanali": doneEntry(),
      "gh-saha-incelemesi": doneEntry(),
    };
    expect(completedIn(progress, training)).toBe(2);
    expect(completedIn(progress, timeMachine)).toBe(0);
  });
});

describe("olay metinleri — sonuç ekranı verisi", () => {
  it("time_machine senaryolarında blok için gereken alanlar dolu", () => {
    for (const s of TIME_MACHINE_SCENARIOS) {
      expect(isTimeMachine(s)).toBe(true);
      expect(s.incident_outcome).toBeTruthy();
      expect(s.incident_lesson).toBeTruthy();
      expect(s.incident_unit).toBeTruthy();
    }
  });

  it("eğitim senaryolarında blok için gereken alanların hiçbiri yok", () => {
    for (const s of trainingScenarios(SCENARIOS)) {
      expect(isTimeMachine(s)).toBe(false);
      expect(s.incident_outcome).toBeFalsy();
      expect(s.incident_lesson).toBeFalsy();
    }
  });
});

describe("sonuç ekranı — Peki gerçekte ne oldu? bloğu", () => {
  it("time_machine senaryoda tarih, birim, sonuç ve ders ile render edilir", () => {
    const [gas] = TIME_MACHINE_SCENARIOS;
    const html = render(createElement(IncidentOutcome, { scenario: gas }));
    expect(html).toContain("Peki gerçekte ne oldu?");
    expect(html).toContain("21.08.2026 — Sıcak Haddehane Müdürlüğü");
    expect(html).toContain("Çıkarılan ders");
    expect(html).toContain(gas.incident_outcome!);
    expect(html).toContain(gas.incident_lesson!);
  });

  it("ikinci senaryoda olay tarihi (bir gün öncesi DEĞİL) gösterilir", () => {
    const [, floor] = TIME_MACHINE_SCENARIOS;
    const html = render(createElement(IncidentOutcome, { scenario: floor }));
    expect(html).toContain("18.07.2026 — Kok Fabrikası Müdürlüğü");
    expect(html).not.toContain("17.07.2026");
  });

  it("eğitim senaryolarının hiçbirinde blok render edilmez", () => {
    for (const s of trainingScenarios(SCENARIOS)) {
      expect(render(createElement(IncidentOutcome, { scenario: s }))).toBe("");
    }
  });
});
