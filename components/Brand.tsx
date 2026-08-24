"use client";

import { useState } from "react";
import { withBase } from "@/lib/paths";

/**
 * Marka bloğu. "Safe" koyu, "Watch" kırmızı yazılır.
 *
 * `/public/logo.png` eklendiğinde otomatik görünür; dosya yoksa yerine
 * sade bir SVG işaret çizilir, böylece tasarım hiçbir zaman boş kalmaz.
 */

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  const [hasLogo, setHasLogo] = useState(true);

  if (hasLogo) {
    return (
      // Logo dosyası opsiyoneldir; next/image yerine <img> kullanılarak
      // dosya yokken sessizce yedek işarete düşülür.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={withBase("/logo.png")}
        alt="Erdemir Mühendislik"
        className={`${className} object-contain`}
        onError={() => setHasLogo(false)}
      />
    );
  }

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 3 L35 9 V21 c0 9-6.5 14-15 17-8.5-3-15-8-15-17V9z"
        fill="#E1251B"
      />
      <path
        d="M20 13c-5 0-9.3 2.8-11.5 6.7C10.7 23.6 15 26.4 20 26.4s9.3-2.8 11.5-6.7C29.3 15.8 25 13 20 13zm0 10.6a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8z"
        fill="#fff"
      />
    </svg>
  );
}

interface WordmarkProps {
  size?: "sm" | "lg" | "xl";
  subtitle?: boolean;
  className?: string;
}

const SIZES = {
  sm: "text-xl",
  lg: "text-4xl",
  xl: "text-5xl sm:text-6xl",
} as const;

export function Wordmark({
  size = "sm",
  subtitle = false,
  className = "",
}: WordmarkProps) {
  return (
    <span className={`block leading-none ${className}`}>
      <span className={`block font-extrabold tracking-tight ${SIZES[size]}`}>
        <span className="text-erd-charcoal">Safe</span>
        <span className="text-erd-red">Watch</span>
      </span>
      {subtitle && (
        <span
          className={`mt-1 block font-medium text-erd-gray ${
            size === "sm" ? "text-[10px]" : "text-sm"
          }`}
        >
          KKD ve İSG Saha Simülasyonu
        </span>
      )}
    </span>
  );
}

/** Üst barda kullanılan yatay marka bloğu: logo + ayraç + yazı. */
export default function Brand() {
  return (
    <span className="flex items-center gap-3">
      <BrandMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span className="h-9 w-px shrink-0 bg-erd-line" aria-hidden="true" />
      <Wordmark size="sm" subtitle />
    </span>
  );
}
