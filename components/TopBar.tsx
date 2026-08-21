"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

const NAV = [
  { href: "/saha", label: "Saha Seçimi" },
  { href: "/gelisim", label: "Gelişim Raporum" },
  { href: "/nasil-oynanir", label: "Nasıl Oynanır" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-erd-charcoal">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0 shrink">
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isSupabaseConfigured && (
          <Link
            href="/giris"
            className="ml-auto shrink-0 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white md:ml-2"
          >
            {email ? email.split("@")[0] : "Giriş"}
          </Link>
        )}
      </div>

      {/* Mobil gezinme: alt satırda yatay kaydırmalı */}
      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 pb-2 pt-1 md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                active ? "bg-white/10 text-white" : "text-white/65"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
