import type { ActorType } from "@/lib/types";

const STYLES: Record<
  ActorType,
  { label: string; className: string; hint: string }
> = {
  kontrolluk: {
    label: "Kontrollük",
    className: "bg-blue-50 text-blue-800 border border-blue-200",
    hint: "Siz — Erdemir Mühendislik personeli",
  },
  yuklenici: {
    label: "Yüklenici",
    className: "bg-erd-light text-erd-charcoal border border-erd-line",
    hint: "Denetlediğiniz müteahhit çalışanı",
  },
  isletme: {
    label: "İşletme",
    className: "bg-red-50 text-erd-red border border-red-200",
    hint: "Demir çelik fabrika personeli — doğrudan talimat veremezsiniz",
  },
};

export function actorMeta(type: ActorType) {
  return STYLES[type];
}

export default function ActorBadge({ type }: { type: ActorType }) {
  const meta = STYLES[type];
  return (
    <span className={`sw-badge ${meta.className}`} title={meta.hint}>
      {meta.label}
    </span>
  );
}
