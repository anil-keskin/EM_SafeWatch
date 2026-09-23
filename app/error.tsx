"use client";

import Link from "next/link";
import { useEffect } from "react";
import PageShell from "@/components/PageShell";

/**
 * Rota düzeyi hata sınırı.
 *
 * Bu dosya olmadan, istemci tarafında oluşan herhangi bir istisna Next.js'in
 * çıplak "Application error: a client-side exception has occurred" ekranını
 * üretir: sayfa tamamen boş kalır, kullanıcı için kurtarma yolu yoktur ve
 * geriye hiçbir teşhis bilgisi kalmaz.
 *
 * Burada hata yakalanır, kurumsal dille gösterilir, `reset()` ile yeniden
 * denemeye izin verilir ve Next'in ürettiği `digest` ekranda gösterilir.
 * Digest, sorun tekrarlarsa hangi hatanın oluştuğunu tespit etmeyi sağlar.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Konsolda tam yığın izi kalsın; kullanıcıya teknik ayrıntı gösterilmez.
    console.error("SafeWatch route error:", error);
  }, [error]);

  return (
    <PageShell>
      <div className="sw-card mx-auto max-w-md p-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-erd-gray">
          Beklenmeyen durum
        </p>
        <h1 className="mt-2 text-xl font-bold text-erd-charcoal">
          Bu ekran yüklenemedi
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-erd-gray">
          Sayfa açılırken bir sorun oluştu. İlerlemeniz kaybolmadı; tekrar
          deneyebilir veya başka bir ekrana geçebilirsiniz.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="sw-btn-primary">
            Tekrar Dene
          </button>
          <Link href="/" className="sw-btn-ghost">
            Ana Menü
          </Link>
          <Link href="/saha" className="sw-btn-ghost">
            Saha Seçimi
          </Link>
        </div>

        {error.digest && (
          <p className="mt-5 break-all border-t border-erd-line pt-4 text-[11px] leading-snug text-erd-gray">
            Hata kodu: <span className="font-mono">{error.digest}</span>
            <br />
            Sorun tekrarlarsa bu kodu geri bildirimde paylaşabilirsiniz.
          </p>
        )}
      </div>
    </PageShell>
  );
}
