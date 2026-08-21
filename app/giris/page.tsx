"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "giris" | "kayit";

/**
 * Basit e-posta / parola girişi.
 * Giriş zorunlu değildir: giriş yapmadan da oynanabilir, ilerleme tarayıcıda
 * saklanır. Giriş yapıldığında ilerleme Supabase'e de yazılır.
 */
export default function GirisPage() {
  const [mode, setMode] = useState<Mode>("giris");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }) => setCurrentEmail(data.user?.email ?? null))
      .catch(() => setCurrentEmail(null));
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <PageShell>
      <div className="sw-card mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-bold text-erd-charcoal">
          Giriş şu an devre dışı
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-erd-gray">
          Supabase bağlantısı yapılandırılmamış. Uygulamayı giriş yapmadan
          kullanabilirsiniz; ilerlemeniz bu tarayıcıda saklanır.
        </p>
        <p className="mt-3 rounded-xl bg-erd-light px-3 py-2.5 text-xs leading-snug text-erd-gray">
          Bulut kaydını açmak için <code>.env.local</code> dosyasına
          <code className="mx-1">NEXT_PUBLIC_SUPABASE_URL</code> ve
          <code className="mx-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          değerlerini ekleyin.
        </p>
        <Link href="/saha" className="sw-btn-primary mt-5">
          Oynamaya Devam Et
        </Link>
      </div>
      </PageShell>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;

    setBusy(true);
    setError(null);
    setStatus(null);

    const result =
      mode === "giris"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "kayit" && !result.data.session) {
      setStatus(
        "Kayıt alındı. E-posta adresinize gönderilen doğrulama bağlantısına tıklayın."
      );
      return;
    }

    setCurrentEmail(result.data.user?.email ?? email);
    setStatus("Giriş yapıldı. İlerlemeniz artık hesabınıza da kaydedilecek.");
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setCurrentEmail(null);
    setStatus("Çıkış yapıldı.");
  };

  return (
    <PageShell>
    <div className="mx-auto max-w-md space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-erd-charcoal">
          Giriş
        </h1>
        <p className="mt-1 text-sm text-erd-gray">
          Giriş yapmak zorunlu değildir. Hesap açarsanız ilerlemeniz
          cihazlar arasında taşınır.
        </p>
      </header>

      {currentEmail ? (
        <div className="sw-card p-5">
          <p className="text-sm text-erd-charcoal">
            <span className="font-semibold">{currentEmail}</span> olarak giriş
            yaptınız.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/saha" className="sw-btn-primary">
              Saha Seçimi
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="sw-btn-ghost"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="sw-card space-y-4 p-5">
          <div className="flex gap-1 rounded-xl bg-erd-light p-1">
            {(["giris", "kayit"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === m
                    ? "bg-white text-erd-charcoal"
                    : "text-erd-gray hover:text-erd-charcoal"
                }`}
              >
                {m === "giris" ? "Giriş Yap" : "Hesap Aç"}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-erd-gray">
              E-posta
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-erd-line px-3.5 py-2.5 text-sm outline-none focus:border-erd-red/50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-erd-gray">
              Parola
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "giris" ? "current-password" : "new-password"
              }
              className="mt-1 w-full rounded-xl border border-erd-line px-3.5 py-2.5 text-sm outline-none focus:border-erd-red/50"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-snug text-erd-red">
              {error}
            </p>
          )}
          {status && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs leading-snug text-emerald-800">
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="sw-btn-primary w-full disabled:opacity-60"
          >
            {busy
              ? "İşleniyor…"
              : mode === "giris"
                ? "Giriş Yap"
                : "Hesap Aç"}
          </button>

          <Link
            href="/saha"
            className="block text-center text-xs font-medium text-erd-gray underline underline-offset-2"
          >
            Girişsiz devam et
          </Link>
        </form>
      )}
    </div>
    </PageShell>
  );
}
