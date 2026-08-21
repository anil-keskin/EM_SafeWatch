"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase tarayıcı istemcisi.
 *
 * Ortam değişkenleri `.env.local` dosyasından okunur. Değerler boşsa veya
 * şablondaki örnek metin olduğu gibi bırakılmışsa uygulama Supabase'siz,
 * `content/` altındaki yerel içerikle çalışmaya devam eder.
 *
 * Yeni format anahtarlar (`sb_publishable_...`) JWT değildir. Bunları
 * Authorization: Bearer ile göndermek PostgREST'te "Invalid JWT" üretir ve
 * tüm tablolar okunamaz. Bu istemci anahtarı yalnızca `apikey` başlığında
 * gönderir; Bearer yalnızca gerçek oturum JWT'si varsa eklenir.
 */

const PLACEHOLDERS = [
  "https://xxxxxxxxxxxx.supabase.co",
  "eyjhbgcioi...",
  "buraya_project_url",
  "buraya_anon_key",
];

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function isUsableUrl(value: string): boolean {
  if (!value || PLACEHOLDERS.includes(value.toLowerCase())) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isUsableKey(value: string): boolean {
  return value.length > 20 && !PLACEHOLDERS.includes(value.toLowerCase());
}

function isNewApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = isUsableUrl(url) && isUsableKey(anonKey);

let cached: SupabaseClient | null = null;
let creationFailed = false;

function withSafeAuthHeaders(input: RequestInfo | URL, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  if (!headers.has("apikey") && anonKey) {
    headers.set("apikey", anonKey);
  }
  if (isNewApiKey(anonKey)) {
    const auth = headers.get("Authorization");
    if (!auth || auth === `Bearer ${anonKey}`) {
      headers.delete("Authorization");
    }
  }
  return { ...init, headers };
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured || creationFailed) return null;
  if (!cached) {
    try {
      cached = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        global: {
          fetch: (input, init) => fetch(input, withSafeAuthHeaders(input, init)),
        },
      });
    } catch {
      creationFailed = true;
      return null;
    }
  }
  return cached;
}
