"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  Home,
  LogOut,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import OyakMark from "@/components/OyakMark";
import { useAuth } from "@/lib/auth";
import { withBase } from "@/lib/paths";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const NAV = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/ilerlemem", label: "İlerlemem", icon: BarChart3 },
  { href: "/rozetlerim", label: "Rozetlerim", icon: Trophy },
  { href: "/yardim", label: "Yardım", icon: CircleHelp },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, isGuest, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 flex h-[4.5rem] border-b border-erd-line bg-erd-charcoal">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 bg-white px-3 py-2 sm:gap-3.5 sm:px-4"
        aria-label="SafeWatch ana sayfa"
      >
        <OyakMark size="header" />
        <span className="h-8 w-px shrink-0 bg-erd-line" aria-hidden />
        <BrandMark size="header" dark />
      </Link>

      <div className="flex min-w-0 flex-1 items-stretch justify-between gap-2">
        <nav className="hidden shrink-0 items-center gap-1 self-center px-3 md:flex" aria-label="Ana menü">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative hidden min-w-0 flex-1 overflow-hidden md:block">
          <img
            src={withBase("/header-safety.jpg")}
            alt=""
            className="h-full w-full object-cover object-[center_35%]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-erd-charcoal via-erd-charcoal/25 to-erd-charcoal"
            aria-hidden
          />
        </div>

        <nav
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto self-center px-2 md:hidden"
          aria-label="Ana menü"
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${
                  active ? "bg-white/10 text-white" : "text-white/70"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative shrink-0 self-center px-3 sm:px-5" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
              <UserRound size={18} strokeWidth={1.8} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-white">{displayName}</span>
              <span className="block text-[11px] text-white/60">
                Kontrollük Personeli
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`hidden text-white/70 sm:block ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-erd-line bg-white py-1 shadow-lg"
            >
              <MenuLink href="/ilerlemem" icon={BarChart3} label="İlerlemem" />
              <MenuLink href="/rozetlerim" icon={Trophy} label="Rozetlerim" />
              <MenuLink href="/ayarlar" icon={Settings} label="Ayarlar" />
              <div className="my-1 border-t border-erd-line" />
              {isGuest ? (
                isSupabaseConfigured ? (
                  <MenuLink href="/giris" icon={UserRound} label="Giriş Yap" />
                ) : (
                  <p className="px-3 py-2 text-xs text-erd-gray">
                    Giriş için Supabase yapılandırması gerekir.
                  </p>
                )
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-erd-charcoal hover:bg-erd-light"
                >
                  <LogOut size={16} />
                  Çıkış
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2 px-3 py-2 text-sm text-erd-charcoal hover:bg-erd-light"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
