"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Oturum ve görünen ad yönetimi.
 *
 * Giriş zorunlu değildir. Giriş yapılmamışsa kullanıcı "Misafir" olarak
 * gösterilir; Ayarlar sayfasından kendine bir görünen ad verebilir ve bu ad
 * tarayıcıda saklanır. Supabase oturumu varsa e-postadan türetilen ad öncelikli
 * değil, kullanıcının seçtiği ad her zaman önce gelir.
 */

const DISPLAY_NAME_KEY = "safewatch:displayName";

export const GUEST_NAME = "Misafir";
export const USER_ROLE = "Kontrollük Personeli";

export interface SafeWatchUser {
  /** Ekranda gösterilecek ad. Giriş yoksa ve ad verilmemişse "Misafir". */
  name: string;
  /** Üst bardaki dar alan için kısaltılmış ad: "Anıl K." */
  shortName: string;
  role: string;
  email: string | null;
  isGuest: boolean;
  /** Avatar için baş harfler. */
  initials: string;
  ready: boolean;
}

function readDisplayName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(DISPLAY_NAME_KEY);
    return value && value.trim().length > 0 ? value.trim() : null;
  } catch {
    return null;
  }
}

export function saveDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      window.localStorage.removeItem(DISPLAY_NAME_KEY);
    } else {
      window.localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
    }
    window.dispatchEvent(new Event("safewatch:user-changed"));
  } catch {
    // Depolama kullanılamıyorsa ad yalnızca bu oturumda geçerli olmaz.
  }
}

/** "anil.kaya@ornek.com" -> "Anil Kaya" */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr") + part.slice(1))
    .join(" ");
}

/** "Anıl Kaya" -> "Anıl K." */
function toShortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? name;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toLocaleUpperCase("tr")}.`;
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toLocaleUpperCase("tr");
  return (
    parts[0].charAt(0).toLocaleUpperCase("tr") +
    parts[parts.length - 1].charAt(0).toLocaleUpperCase("tr")
  );
}

export function useUser(): SafeWatchUser & { signOut: () => Promise<void> } {
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDisplayName(readDisplayName());
    setReady(true);

    const onChange = () => setDisplayName(readDisplayName());
    window.addEventListener("safewatch:user-changed", onChange);
    window.addEventListener("storage", onChange);

    return () => {
      window.removeEventListener("safewatch:user-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

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

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setEmail(null);
  }, []);

  const isGuest = !email && !displayName;
  const name = displayName ?? (email ? nameFromEmail(email) : GUEST_NAME);

  return {
    name,
    shortName: toShortName(name),
    role: USER_ROLE,
    email,
    isGuest,
    initials: isGuest ? "M" : toInitials(name),
    ready,
    signOut,
  };
}

export { isSupabaseConfigured };
