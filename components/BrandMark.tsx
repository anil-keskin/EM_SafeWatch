"use client";

import { useState } from "react";
import { withBase } from "@/lib/paths";

interface BrandMarkProps {
  /** Üst bardaki beyaz zemin için koyu metin; kart içi büyük logo için büyük punto. */
  size?: "header" | "hero";
  dark?: boolean;
}

type Face = "logo" | "icon" | "mark";

/** İlk 404'ten sonra aynı oturumda logo.png tekrar istenmez. Tam yenilemede yeniden denenir. */
let skipLogoPng = false;

function EmMonogram({ large }: { large: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-erd-red font-bold tracking-tight text-white ${
        large ? "h-12 w-12 text-lg" : "h-10 w-10 text-sm sm:h-11 sm:w-11"
      }`}
      aria-hidden="true"
    >
      EM
    </span>
  );
}

function BrandImage({
  face,
  large,
  onFail,
}: {
  face: Face;
  large: boolean;
  onFail: () => void;
}) {
  if (face === "mark") {
    return <EmMonogram large={large} />;
  }

  const src = face === "logo" ? withBase("/logo.png") : withBase("/icon.svg");
  const className = large
    ? "h-12 w-auto bg-white object-contain"
    : "h-10 w-auto shrink-0 bg-white object-contain sm:h-11";

  return (
    // Logo dosyası opsiyoneldir; yoksa icon.svg, o da yoksa EM monogramı.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Erdemir Mühendislik"
      className={className}
      onError={onFail}
    />
  );
}

/**
 * Sol üst marka: logo (varsa) + SafeWatch yazısı.
 * public/logo.png sonradan eklenirse kod değiştirmeden kullanılır.
 */
export default function BrandMark({ size = "header", dark = true }: BrandMarkProps) {
  const isHero = size === "hero";
  const titleColor = dark ? "text-erd-charcoal" : "text-white";
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

  const wordmark = (
    <span className={isHero ? "text-center leading-tight" : "min-w-0 leading-tight"}>
      {face === "mark" && (
        <span
          className={`block font-medium text-erd-gray ${
            isHero ? "text-sm" : "text-[10px] sm:text-[11px]"
          }`}
        >
          Erdemir Mühendislik
        </span>
      )}
      <span
        className={`block font-bold tracking-tight ${
          isHero ? "text-4xl sm:text-5xl" : "text-lg sm:text-[22px]"
        }`}
      >
        <span className={titleColor}>Safe</span>
        <span className="text-erd-red">Watch</span>
      </span>
      <span
        className={`text-erd-gray ${
          isHero
            ? "mt-1 block text-sm"
            : "hidden text-[10px] sm:block sm:text-[11px]"
        }`}
      >
        KKD ve İSG Saha Simülasyonu
      </span>
      {isHero && (
        <span className="mx-auto mt-2 block h-[3px] w-16 rounded-full bg-erd-red" />
      )}
    </span>
  );

  if (isHero) {
    return (
      <span className="flex flex-col items-center gap-2">
        <BrandImage face={face} large onFail={handleFail} />
        {wordmark}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-3">
      <BrandImage face={face} large={false} onFail={handleFail} />
      <span className="hidden h-8 w-px shrink-0 bg-erd-line sm:block" aria-hidden="true" />
      {wordmark}
    </span>
  );
}
