import AppIcon from "@/components/AppIcon";
import { equipmentGlyph } from "@/lib/icon-theme";

export default function EquipmentGlyph({
  code,
  categoryId,
  size = "sm",
}: {
  code: string;
  categoryId?: string;
  size?: "xs" | "sm" | "md";
}) {
  const { icon, tone } = equipmentGlyph(code, categoryId);
  return <AppIcon icon={icon} tone={tone} size={size} />;
}
