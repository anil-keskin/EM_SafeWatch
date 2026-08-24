"use client";

import type { DataSource } from "@/lib/data";

const MESSAGES: Record<
  DataSource,
  { dot: string; title: string; body: string }
> = {
  local: {
    dot: "bg-erd-gray",
    title: "Veri kaynağı: yerel içerik",
    body: "Supabase bağlı değil. İlerlemeniz yalnızca bu tarayıcıda saklanıyor.",
  },
  loading: {
    dot: "bg-erd-red animate-pulse",
    title: "Supabase'e bağlanılıyor…",
    body: "Veritabanından içerik çekiliyor.",
  },
  database: {
    dot: "bg-emerald-500",
    title: "Veri kaynağı: Supabase",
    body: "Bölgeler, ekipman kartları ve senaryolar veritabanından okunuyor.",
  },
  error: {
    dot: "bg-erd-red",
    title: "Supabase'e ulaşılamadı",
    body: "Anahtarlar tanımlı ancak veri okunamadı. Uygulama yerel içerikle çalışmaya devam ediyor. URL'de /rest/v1 olmamalı; publishable anahtar JWT gibi Bearer ile gitmemeli.",
  },
};

export default function DataSourceNote({
  source,
  detail,
}: {
  source: DataSource;
  detail?: string;
}) {
  const message = MESSAGES[source];

  return (
    <div className="sw-card flex items-start gap-2.5 p-3.5">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${message.dot}`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-erd-charcoal">
          {message.title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-erd-gray">
          {message.body}
        </p>
        {source === "error" && detail && (
          <p className="mt-1 break-all text-[11px] leading-snug text-erd-red/80">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
