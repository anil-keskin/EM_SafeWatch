"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Oturum bilgisi. Giriş yoksa "Misafir" gösterilir;
 * kişiler arası sıralama yoktur, yalnızca kendi hesabı okunur.
 */
export interface AuthState {
  ready: boolean;
  user: User | null;
  displayName: string;
  isGuest: boolean;
  signOut: () => Promise<void>;
}

function displayNameFromUser(user: User): string {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  if (full.trim()) return shortenName(full.trim());

  const local = (user.email ?? "").split("@")[0].replace(/[._-]+/g, " ").trim();
  return shortenName(local || "Kullanıcı");
}

/** "Anıl Kaya" → "Anıl K."  Tek kelime olduğu gibi kalır. */
function shortenName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Kullanıcı";
  if (parts.length === 1) {
    const word = parts[0];
    return word.charAt(0).toLocaleUpperCase("tr") + word.slice(1);
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toLocaleUpperCase("tr");
  return `${first.charAt(0).toLocaleUpperCase("tr")}${first.slice(1)} ${lastInitial}.`;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user ?? null);
        setReady(true);
      })
      .catch(() => setReady(true));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    ready,
    user,
    displayName: user ? displayNameFromUser(user) : "Misafir",
    isGuest: !user,
    signOut,
  };
}
