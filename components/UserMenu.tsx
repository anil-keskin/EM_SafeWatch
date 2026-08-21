"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  LogIn,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import { saveDisplayName, useUser } from "@/lib/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/ilerlemem", label: "İlerlemem", Icon: BarChart3 },
  { href: "/rozetlerim", label: "Rozetlerim", Icon: Trophy },
  { href: "/ayarlar", label: "Ayarlar", Icon: Settings },
];

/** Üst bardaki profil bloğu ve açılır menü. */
export default function UserMenu() {
  const router = useRouter();
  const { shortName, role, initials, isGuest, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Çıkış hem Supabase oturumunu hem de yerel görünen adı temizler,
  // böylece kullanıcı tekrar "Misafir" olur.
  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    saveDisplayName("");
    router.push("/");
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/10"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white ring-1 ring-white/25">
          {initials}
        </span>
        <span className="hidden min-w-0 leading-tight sm:block">
          <span className="block truncate text-sm font-semibold text-white">
            {shortName}
          </span>
          <span className="block truncate text-[10px] text-white/60">
            {isGuest ? "Girişsiz kullanım" : role}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-erd-line bg-white shadow-xl"
        >
          <div className="border-b border-erd-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-erd-charcoal">
              {shortName}
            </p>
            <p className="truncate text-xs text-erd-gray">
              {isGuest ? "Girişsiz kullanım" : role}
            </p>
          </div>

          <ul className="py-1">
            {ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-erd-charcoal transition-colors hover:bg-erd-light"
                  role="menuitem"
                >
                  <Icon className="h-4 w-4 text-erd-gray" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-erd-line py-1">
            {!isGuest ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-erd-red transition-colors hover:bg-erd-light"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </button>
            ) : (
              <Link
                href={isSupabaseConfigured ? "/giris" : "/ayarlar"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-erd-charcoal transition-colors hover:bg-erd-light"
                role="menuitem"
              >
                <LogIn className="h-4 w-4 text-erd-gray" />
                {isSupabaseConfigured ? "Giriş Yap" : "Adınızı belirleyin"}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
