"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase tarayıcı istemcisi.
 *
 * Ortam değişkenleri `.env.local` dosyasından okunur. Değerler boşsa veya
 * şablondaki örnek metin olduğu gibi bırakılmışsa uygulama Supabase'siz,
 * `content/` altındaki yerel içerikle çalışmaya devam eder.
 */

/** Şablondan kopyalanıp doldurulmamış örnek değerler. */
const PLACEHOLDERS = [
  "https://xxxxxxxxxxxx.supabase.co",
  "eyjhbgcioi...",
  "buraya_project_url",
  "buraya_anon_key",
];

function clean(value: string | undefined): string {
  // Kopyala-yapıştır sırasında araya karışan tırnak ve boşlukları temizler.
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
  // Supabase anahtarları uzun tokenlardır; kısa veya örnek değerler elenir.
  return value.length > 20 && !PLACEHOLDERS.includes(value.toLowerCase());
}

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Supabase kullanılabilir durumda mı?
 * Giriş ekranının ve bulut senkronizasyonunun açılıp kapanmasını belirler.
 */
export const isSupabaseConfigured = isUsableUrl(url) && isUsableKey(anonKey);

let cached: SupabaseClient | null = null;
let creationFailed = false;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured || creationFailed) return null;
  if (!cached) {
    try {
      cached = createBrowserClient(url, anonKey);
    } catch {
      // Hatalı anahtar girilmişse uygulama çökmez, yerel moda düşer.
      creationFailed = true;
      return null;
    }
  }
  return cached;
}
