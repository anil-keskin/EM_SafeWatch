import AppIcon, { IconWatermark } from "@/components/AppIcon";
import { zoneGlyph, zoneTone, zoneWatermark } from "@/lib/icon-theme";

interface ZoneIconProps {
  zoneId: string;
  className?: string;
  /** Kart zeminine düşük opaklıklı siluet. */
  watermark?: boolean;
}

/** Bölge ikonu: dolu/duotone, bölgeye özel endüstriyel renk. */
export default function ZoneIcon({
  zoneId,
  className = "",
  watermark = false,
}: ZoneIconProps) {
  if (watermark) {
    const mark = zoneWatermark(zoneId);
    return <IconWatermark icon={mark.icon} tone={mark.tone} />;
  }

  return (
    <AppIcon
      icon={zoneGlyph(zoneId)}
      tone={zoneTone(zoneId)}
      size="lg"
      className={className}
    />
  );
}
