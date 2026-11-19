import { describe, expect, it, vi } from "vitest";

describe("Supabase adresi", () => {
  it("https:// olmadan girilen adresi de yapılandırılmış sayar", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "abcdefghijklmnop.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_abcdefghijklmnopqrstuvwxyz");
    const mod = await import("@/lib/supabase/client");
    expect(mod.isSupabaseConfigured).toBe(true);
    vi.unstubAllEnvs();
  });
});
