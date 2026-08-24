"use client";

import { withBase } from "@/lib/paths";

interface OyakMarkProps {
  size?: "header" | "hero";
}

/**
 * OYAK Maden Metalürji grup logosu. Beyaz zemin üzerinde, Erdemir
 * Mühendislik / SafeWatch işaretinin yanında veya üstünde durur.
 */
export default function OyakMark({ size = "header" }: OyakMarkProps) {
  const tall = size === "hero";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withBase("/oyak-maden-metalurji.jpg")}
      alt="OYAK Maden Metalürji"
      className={`shrink-0 bg-white object-contain object-center ${
        tall ? "h-16 w-auto sm:h-[4.75rem]" : "h-12 w-auto sm:h-14"
      }`}
    />
  );
}
