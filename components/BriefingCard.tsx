import { ArrowUpFromLine, CloudSun, FileCheck2, Gauge, ShieldAlert, Target, Thermometer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ActorBadge, { actorMeta } from "@/components/ActorBadge";
import AppIcon from "@/components/AppIcon";
import { zoneGlyph, zoneTone } from "@/lib/icon-theme";
import type { Actor, Briefing } from "@/lib/types";

interface BriefingCardProps {
  title: string;
  zoneId?: string;
  zoneName: string;
  briefing: Briefing;
  actors: Actor[];
}

const CONDITION_FIELDS: Array<{ key: keyof Briefing; label: string; icon: LucideIcon; tint: string }> = [
  { key: "hava", label: "Hava / Ortam", icon: CloudSun, tint: "bg-sky-100 text-sky-700" },
  { key: "is_izni", label: "İş İzni", icon: FileCheck2, tint: "bg-violet-100 text-violet-700" },
  { key: "gaz", label: "Gaz Durumu", icon: Gauge, tint: "bg-emerald-100 text-emerald-700" },
  { key: "sicaklik", label: "Sıcaklık", icon: Thermometer, tint: "bg-orange-100 text-orange-700" },
  { key: "yukseklik", label: "Yükseklik / Kot", icon: ArrowUpFromLine, tint: "bg-amber-100 text-amber-700" },
];

/** Senaryonun ilk ekranı: görev kartı. */
export default function BriefingCard({
  title,
  zoneId,
  zoneName,
  briefing,
  actors,
}: BriefingCardProps) {
  const conditions = CONDITION_FIELDS.filter(
    (field) => briefing[field.key]
  );

  return (
    <div className="space-y-4">
      <div className="sw-card overflow-hidden">
        <div className="flex items-start gap-3 border-b border-erd-line bg-erd-charcoal px-5 py-4">
          {zoneId && (
            <AppIcon icon={zoneGlyph(zoneId)} tone={zoneTone(zoneId)} size="md" onDark />
          )}
          <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            Görev Kartı · {zoneName}
          </p>
          <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            {title}
          </h1>
          {briefing.konum && (
            <p className="mt-1 text-sm text-white/70">{briefing.konum}</p>
          )}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {briefing.gorev && (
            <div className="sw-rise flex gap-3 rounded-2xl bg-gradient-to-r from-erd-red to-[#b51d15] p-4 text-white shadow-[0_10px_30px_-12px_rgba(225,37,27,0.7)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Target size={22} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Göreviniz</p>
                <p className="mt-0.5 text-base font-semibold leading-snug">{briefing.gorev}</p>
              </div>
            </div>
          )}
          {!briefing.gorev &&
            !briefing.isletme_faaliyeti &&
            !briefing.yuklenici_faaliyeti && (
              <p className="rounded-xl bg-erd-light px-3.5 py-3 text-sm leading-snug text-erd-gray">
                Bu senaryonun görev metni henüz doldurulmamış. Sahaya çıkıp
                mevcut kartlarla antrenmana devam edebilirsiniz.
              </p>
            )}
          {briefing.isletme_faaliyeti && (
            <Field
              label="İşletme ne yapıyor?"
              value={briefing.isletme_faaliyeti}
            />
          )}
          {briefing.yuklenici_faaliyeti && (
            <Field
              label="Müteahhit ne yapıyor?"
              value={briefing.yuklenici_faaliyeti}
            />
          )}

          {conditions.length > 0 && (
            <dl className="grid gap-2 sm:grid-cols-2">
              {conditions.map((field, i) => (
                <div
                  key={field.key}
                  className="sw-rise flex gap-3 rounded-xl border border-erd-line bg-white px-3.5 py-2.5"
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${field.tint}`}>
                    <field.icon size={18} />
                  </span>
                  <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
                    {field.label}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-snug text-erd-charcoal">
                    {briefing[field.key]}
                  </dd>
                  </div>
                </div>
              ))}
            </dl>
          )}

          {briefing.ozel_not && (
            <div className="flex gap-3 rounded-xl border-l-4 border-erd-red bg-red-50/60 px-4 py-3">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-erd-red sw-flag" />
              <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-erd-red">
                Özel Durum
              </p>
              <p className="mt-0.5 text-sm leading-snug text-erd-charcoal">
                {briefing.ozel_not}
              </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {actors.length > 0 && (
        <div className="sw-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
            Sahadaki Taraflar
          </h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {actors.map((actor, index) => (
              <li
                key={`${actor.type}-${index}`}
                className={`rounded-xl border p-3.5 ${
                  actor.type === "kontrolluk"
                    ? "border-erd-red/30 bg-red-50/40"
                    : actor.type === "yuklenici"
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ActorBadge type={actor.type} />
                  <span className="text-sm font-semibold text-erd-charcoal">
                    {actor.employer}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-snug text-erd-charcoal">
                  {actor.activity}
                </p>
                {actor.type === "kontrolluk" ? (
                  <p className="mt-2 rounded-lg bg-white px-2.5 py-2 text-xs leading-snug text-erd-charcoal ring-1 ring-erd-red/20">
                    <span className="font-bold text-erd-red">Yetki sınırınız: </span>
                    {actor.authority ?? actorMeta(actor.type).hint}
                  </p>
                ) : (
                  <p className="mt-1 text-xs leading-snug text-erd-gray">
                    {actor.authority ?? actorMeta(actor.type).hint}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
        {label}
      </p>
      <p
        className={`mt-0.5 leading-snug text-erd-charcoal ${
          emphasis ? "text-base font-medium" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
