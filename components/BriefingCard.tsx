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

const CONDITION_FIELDS: Array<{ key: keyof Briefing; label: string }> = [
  { key: "hava", label: "Hava / Ortam" },
  { key: "is_izni", label: "İş İzni" },
  { key: "gaz", label: "Gaz Durumu" },
  { key: "sicaklik", label: "Sıcaklık" },
  { key: "yukseklik", label: "Yükseklik / Kot" },
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
            <Field label="Göreviniz" value={briefing.gorev} emphasis />
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
              {conditions.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl bg-erd-light px-3.5 py-2.5"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
                    {field.label}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-snug text-erd-charcoal">
                    {briefing[field.key]}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {briefing.ozel_not && (
            <div className="rounded-xl border-l-4 border-erd-red bg-red-50/60 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-erd-red">
                Özel Durum
              </p>
              <p className="mt-0.5 text-sm leading-snug text-erd-charcoal">
                {briefing.ozel_not}
              </p>
            </div>
          )}
        </div>
      </div>

      {actors.length > 0 && (
        <div className="sw-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
            Sahadaki Taraflar
          </h2>
          <ul className="mt-3 space-y-3">
            {actors.map((actor, index) => (
              <li
                key={`${actor.type}-${index}`}
                className="rounded-xl border border-erd-line p-3.5"
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
                <p className="mt-1 text-xs leading-snug text-erd-gray">
                  {actor.authority ?? actorMeta(actor.type).hint}
                </p>
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
