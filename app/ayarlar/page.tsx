"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import DataSourceNote from "@/components/DataSourceNote";
import { useAuth } from "@/lib/auth";
import { useSafeWatchData } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function AyarlarPage() {
  const { displayName, isGuest, signOut } = useAuth();
  const { reset } = useProgress();
  const { source, sourceDetail } = useSafeWatchData();

  return (
    <PageShell>
      <h1 className="flex items-center gap-3 text-2xl font-bold text-erd-charcoal">
        <span className="h-7 w-1 rounded-full bg-erd-red" aria-hidden="true" />
        Ayarlar
      </h1>
      <p className="mt-1 text-sm text-erd-gray">
        Hesap ve bu cihazdaki ilerleme ayarları. Kişiler arası sıralama yoktur.
      </p>

      <section className="sw-card mt-6 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Profil
        </h2>
        <p className="mt-2 text-sm text-erd-charcoal">
          <span className="font-semibold">{displayName}</span>
          <span className="ml-2 text-erd-gray">
            {isGuest ? "Misafir" : "Kontrollük Personeli"}
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {isGuest ? (
            isSupabaseConfigured && (
              <Link href="/giris" className="sw-btn-primary">
                Giriş Yap
              </Link>
            )
          ) : (
            <button type="button" onClick={() => void signOut()} className="sw-btn-ghost">
              Çıkış Yap
            </button>
          )}
        </div>
      </section>

      <section className="sw-card mt-4 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Bu cihazdaki ilerleme
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-erd-gray">
          İlerlemeniz tarayıcıda saklanır. Sıfırlarsanız skorlar, gelişim özeti ve
          rozetler silinir. Bu işlem geri alınamaz.
        </p>
        <button
          type="button"
          className="sw-btn-ghost mt-4 text-xs"
          onClick={() => {
            if (
              window.confirm(
                "Tüm ilerlemeniz ve gelişim özetiniz silinecek. Devam edilsin mi?"
              )
            ) {
              reset();
            }
          }}
        >
          İlerlemeyi Sıfırla
        </button>
      </section>

      <section className="mt-4">
        <DataSourceNote source={source} detail={sourceDetail} />
      </section>
    </PageShell>
  );
}
