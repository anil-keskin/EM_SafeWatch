"use client";

import { useState } from "react";
import SafeWatchWordmark from "@/components/SafeWatchWordmark";
import { withBase } from "@/lib/paths";

type Face = "logo" | "icon" | "mark";

let skipLogoPng = false;

/**
 * Üst bardaki marka alanı (eski yerleşim).
 * public/logo.png yoksa icon.svg, o da yoksa EM monogramı kullanılır.
 */
export default function Logo() {
  const [face, setFace] = useState<Face>(skipLogoPng ? "icon" : "logo");

  const handleFail = () => {
    setFace((current) => {
      if (current === "logo") {
        skipLogoPng = true;
        return "icon";
      }
      return "mark";
    });
  };

  return (
    <span className="flex min-w-0 items-center gap-3">
      {face === "mark" ? (
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-erd-red text-[11px] font-bold text-white"
          aria-hidden="true"
        >
          EM
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={face === "logo" ? withBase("/logo.png") : withBase("/icon.svg")}
          alt="Erdemir Mühendislik"
          className="h-8 w-auto shrink-0 bg-white object-contain"
          onError={handleFail}
        />
      )}
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
          Erdemir Mühendislik
        </span>
        <SafeWatchWordmark className="block text-lg font-bold tracking-tight" />
      </span>
    </span>
  );
}
