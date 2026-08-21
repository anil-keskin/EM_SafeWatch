"use client";

import { useState } from "react";

/**
 * Üst bardaki marka alanı.
 * `/public/logo.png` eklendiğinde otomatik görünür; yoksa yazı gösterilir.
 */
export default function Logo() {
  const [hasLogo, setHasLogo] = useState(true);

  return (
    <span className="flex items-center gap-3 min-w-0">
      {hasLogo && (
        // Logo dosyası opsiyoneldir; next/image yerine <img> kullanılarak
        // dosya yokken sessizce yazı gösterimine düşülür.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="Erdemir Mühendislik"
          className="h-8 w-auto shrink-0"
          onError={() => setHasLogo(false)}
        />
      )}
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
          Erdemir Mühendislik
        </span>
        <span className="block text-lg font-bold tracking-tight text-white">
          SafeWatch
        </span>
      </span>
    </span>
  );
}
