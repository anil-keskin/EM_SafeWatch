interface BrandMarkProps {
  /** Üst bardaki beyaz zemin için koyu metin; kart içi büyük logo için büyük punto. */
  size?: "header" | "hero";
  dark?: boolean;
}

/**
 * Sol üst marka: şirket logosu (yazı logonun içinde) + SafeWatch yazısı.
 * Görsel `public/logo.png` dosyasından okunur. Header tüm sayfalarda bunu kullanır.
 */
export default function BrandMark({ size = "header", dark = true }: BrandMarkProps) {
  const isHero = size === "hero";
  const titleColor = dark ? "text-erd-charcoal" : "text-white";

  if (isHero) {
    return (
      <span className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png?v=2"
          alt="Erdemir Mühendislik"
          className="h-12 w-auto bg-white"
        />
        <span className="text-center leading-tight">
          <span className="block text-4xl font-bold tracking-tight sm:text-5xl">
            <span className={titleColor}>Safe</span>
            <span className="text-erd-red">Watch</span>
          </span>
          <span className="mt-1 block text-sm text-erd-gray">
            KKD ve İSG Saha Simülasyonu
          </span>
          <span className="mx-auto mt-2 block h-[3px] w-16 rounded-full bg-erd-red" />
        </span>
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png?v=2"
        alt="Erdemir Mühendislik logosu"
        className="h-10 w-auto shrink-0 bg-white object-contain sm:h-11"
      />
      <span className="hidden h-8 w-px shrink-0 bg-erd-line sm:block" aria-hidden="true" />
      <span className="min-w-0 leading-tight">
        <span className="block text-lg font-bold tracking-tight sm:text-[22px]">
          <span className={titleColor}>Safe</span>
          <span className="text-erd-red">Watch</span>
        </span>
        <span className="hidden text-[10px] text-erd-gray sm:block sm:text-[11px]">
          KKD ve İSG Saha Simülasyonu
        </span>
      </span>
    </span>
  );
}
