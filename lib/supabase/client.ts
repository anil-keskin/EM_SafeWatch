"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase tarayıcı istemcisi.
 *
 * createClient yalnızca proje kök URL'sini alır
 * (`https://<ref>.supabase.co`). `/rest/v1` eklenmez; supabase-js bu yolu
 * kendisi birleştirir. Ortam değişkenine REST yolu yapıştırılırsa çift
 * `/rest/v1/rest/v1` isteği ve 404 oluşur.
 *
 * Yeni format anahtarlar (`sb_publishable_...`) JWT değildir. Bunları
 * Authorization: Bearer ile göndermek PostgREST'te "Invalid JWT" üretir.
 * Anahtar yalnızca `apikey` başlığında gider; Bearer yalnızca gerçek
 * oturum JWT'si varsa eklenir.
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

/**
 * Proje kök URL'si. Path, query ve `/rest/v1` soneki atılır.
 * createClient bu değere tekrar `rest/v1` ekleyeceği için path bırakılmaz.
 */
function normalizeProjectUrl(value: string | undefined): string {
  const trimmed = clean(value);
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed
      .replace(/\/+$/, "")
      .replace(/\/rest\/v1$/i, "")
      .replace(/\/+$/, "");
  }
}

function isUsableUrl(value: string): boolean {
  if (!value || PLACEHOLDERS.includes(value.toLowerCase())) return false;
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.pathname === "/"
    );
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

const url = normalizeProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = isUsableUrl(url) && isUsableKey(anonKey);

let cached: SupabaseClient | null = null;
let creationFailed = false;

function mergeHeaders(input: RequestInfo | URL, init?: RequestInit): Headers {
  const headers = new Headers();
  if (typeof Request !== "undefined" && input instanceof Request) {
    input.headers.forEach((value, key) => headers.set(key, value));
  }
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  return headers;
}

function withSafeAuthHeaders(
  input: RequestInfo | URL,
  init?: RequestInit
): [RequestInfo | URL, RequestInit | undefined] {
  const headers = mergeHeaders(input, init);
  if (!headers.has("apikey") && anonKey) {
    headers.set("apikey", anonKey);
  }
  if (isNewApiKey(anonKey)) {
    const auth = headers.get("Authorization");
    if (!auth || auth === `Bearer ${anonKey}`) {
      headers.delete("Authorization");
    }
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    return [new Request(input, { ...init, headers }), undefined];
  }
  return [input, { ...init, headers }];
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
          fetch: (input, init) => {
            const [nextInput, nextInit] = withSafeAuthHeaders(input, init);
            return fetch(nextInput, nextInit);
          },
        },
      });
    } catch {
      creationFailed = true;
      return null;
    }
  }
  return cached;
}
