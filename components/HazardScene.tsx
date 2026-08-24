"use client";

import { TriangleAlert } from "lucide-react";
import SceneBackdrop from "@/components/SceneBackdrop";
import type { Hazard } from "@/lib/types";

interface HazardSceneProps {
  zoneId: string;
  hazards: Hazard[];
  selected: string[];
  onToggle: (code: string) => void;
  /** Değerlendirme sonrası doğru/yanlış işaretlemeyi gösterir. */
  revealed?: boolean;
}

/**
 * Tehlike tanıma sahnesi.
 * Oyuncu sahnedeki risk noktalarını işaretler. Bazı noktalar bilinçli olarak
 * sahtedir; gereksiz işaretleme puanı düşürür.
 */
export default function HazardScene({
  zoneId,
  hazards,
  selected,
  onToggle,
  revealed = false,
}: HazardSceneProps) {
  const selectedSet = new Set(selected);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-erd-line bg-erd-charcoal">
      <SceneBackdrop zoneId={zoneId} />

      {hazards.length === 0 && (
        <p className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-white/80">
          Bu senaryo için risk noktaları henüz tanımlanmadı. Karar paneline geçerek
          donanım ve müdahale seçimlerini çalışabilirsiniz.
        </p>
      )}

      {hazards.map((hazard) => {
        const isSelected = selectedSet.has(hazard.code);
        const showTruth = revealed;
        const correct = showTruth && isSelected && hazard.is_real;
        const wrong = showTruth && isSelected && !hazard.is_real;
        const missed = showTruth && !isSelected && hazard.is_real;

        let ring = "bg-white/15 border-white/60 text-white";
        if (isSelected) ring = "bg-erd-red border-white text-white";
        if (correct) ring = "bg-emerald-500 border-white text-white";
        if (wrong) ring = "bg-erd-red border-white text-white";
        if (missed) ring = "bg-white/25 border-dashed border-amber-300 text-amber-100";

        return (
          <button
            key={hazard.code}
            type="button"
            onClick={() => onToggle(hazard.code)}
            disabled={revealed}
            style={{ left: `${hazard.x}%`, top: `${hazard.y}%` }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 backdrop-blur-sm
                        transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40
                        ${ring} ${!isSelected && !revealed ? "sw-hotspot-idle" : ""}`}
            aria-pressed={isSelected}
            aria-label={revealed ? hazard.label : "İncelenmemiş risk noktası"}
          >
            <span className="flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11">
              {revealed ? (
                <span className="text-sm font-bold">
                  {correct ? "✓" : wrong ? "✕" : missed ? "!" : ""}
                </span>
              ) : isSelected ? (
                <span className="text-sm font-bold">✓</span>
              ) : (
                <TriangleAlert
                  size={20}
                  strokeWidth={1.8}
                  fill="currentColor"
                  fillOpacity={0.35}
                />
              )}
            </span>

            {/* Etiket, değerlendirme sonrası veya üzerine gelince görünür */}
            <span
              className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-40 -translate-x-1/2
                          rounded-lg bg-erd-charcoal/95 px-2.5 py-1.5 text-center text-[11px]
                          font-medium leading-snug text-white shadow-lg transition-opacity
                          ${revealed ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"}`}
            >
              {hazard.label}
            </span>
          </button>
        );
      })}

      {!revealed && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-8 text-xs text-white/90 sm:text-sm">
          Sahnedeki risk noktalarına dokunarak işaretleyin. Bazı noktalar
          gerçek bir tehlike içermiyor olabilir.
        </p>
      )}
    </div>
  );
}
