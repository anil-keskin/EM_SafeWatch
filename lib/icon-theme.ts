import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Biohazard,
  ClipboardList,
  Cog,
  Construction,
  Container,
  Ear,
  Eye,
  Factory,
  Fence,
  FileText,
  Flame,
  Footprints,
  Forklift,
  Fuel,
  Glasses,
  Hand,
  HardHat,
  Megaphone,
  PersonStanding,
  Radiation,
  Radio,
  Shield,
  Ship,
  Shirt,
  Users,
  Warehouse,
  Wind,
  Zap,
} from "lucide-react";
import type { DecisionTab } from "@/lib/types";

/**
 * İkon paleti. Butonların Erdemir kırmızısına dokunulmaz;
 * ikonlar MD3 duotone kaplarda bu tonları kullanır.
 */
export type IconTone =
  | "kkd"
  | "steel"
  | "port"
  | "mill"
  | "maint"
  | "crane"
  | "fork"
  | "risk"
  | "nav";

export const ICON_TONE: Record<
  IconTone,
  { fg: string; bg: string; wash: string }
> = {
  kkd: {
    fg: "text-[#D32F2F]",
    bg: "bg-[#D32F2F]/10",
    wash: "text-[#D32F2F]",
  },
  steel: {
    fg: "text-[#8B1510]",
    bg: "bg-[#8B1510]/10",
    wash: "text-[#8B1510]",
  },
  port: {
    fg: "text-[#3D5A80]",
    bg: "bg-[#3D5A80]/10",
    wash: "text-[#3D5A80]",
  },
  mill: {
    fg: "text-[#E65100]",
    bg: "bg-[#E65100]/10",
    wash: "text-[#E65100]",
  },
  maint: {
    fg: "text-[#424242]",
    bg: "bg-[#424242]/10",
    wash: "text-[#424242]",
  },
  crane: {
    fg: "text-[#EF6C00]",
    bg: "bg-[#EF6C00]/10",
    wash: "text-[#EF6C00]",
  },
  fork: {
    fg: "text-[#F9A825]",
    bg: "bg-[#F9A825]/12",
    wash: "text-[#F9A825]",
  },
  risk: {
    fg: "text-[#D32F2F]",
    bg: "bg-[#D32F2F]/10",
    wash: "text-[#D32F2F]",
  },
  nav: {
    fg: "text-[#546E7A]",
    bg: "bg-[#546E7A]/10",
    wash: "text-[#546E7A]",
  },
};

export function zoneTone(zoneId: string): IconTone {
  switch (zoneId) {
    case "celikhane":
    case "yuksek_firin":
    case "kok_fabrikasi":
    case "sinter":
      return "steel";
    case "liman_stok":
      return "port";
    case "haddehane":
      return "mill";
    case "enerji_elektrik":
    case "yuksekte_iskele":
      return "crane";
    case "gaz_hatlari":
    case "radyografi":
      return "risk";
    default:
      return "maint";
  }
}

export function zoneGlyph(zoneId: string): LucideIcon {
  switch (zoneId) {
    case "yuksek_firin":
      return Flame;
    case "celikhane":
      return Factory;
    case "kok_fabrikasi":
      return Factory;
    case "sinter":
      return Container;
    case "haddehane":
      return Cog;
    case "enerji_elektrik":
      return Zap;
    case "gaz_hatlari":
      return Fuel;
    case "liman_stok":
      return Ship;
    case "yuksekte_iskele":
      return Construction;
    case "kapali_alan":
      return Warehouse;
    case "radyografi":
      return Radiation;
    default:
      return ClipboardList;
  }
}

export function categoryTone(categoryId: string): IconTone {
  switch (categoryId) {
    case "alan":
      return "crane";
    case "olcum":
      return "nav";
    case "dokuman":
      return "maint";
    default:
      return "kkd";
  }
}

export function categoryGlyph(categoryId: string): LucideIcon {
  switch (categoryId) {
    case "bas":
      return HardHat;
    case "goz":
      return Glasses;
    case "solunum":
      return Wind;
    case "isitme":
      return Ear;
    case "el":
      return Hand;
    case "ayak":
      return Footprints;
    case "govde":
      return Shirt;
    case "yuksekte":
      return PersonStanding;
    case "olcum":
      return Radio;
    case "alan":
      return Fence;
    case "dokuman":
      return FileText;
    default:
      return Shield;
  }
}

const EQUIPMENT_GLYPH: Record<string, LucideIcon> = {
  yangin_sondurucu: Flame,
  gaz_dedektoru_co: Radio,
  gaz_dedektoru_4li: Radio,
  alan_bariyeri: Fence,
  guvenli_mesafe: Shield,
  tam_vucut_kemeri: PersonStanding,
  kaynak_maskesi: Glasses,
  aluminize_giysi: Shirt,
  fr_kiyafet: Shirt,
  standart_is_kiyafeti: Shirt,
  radyografi_calisma_formu: Biohazard,
  dozimetre: Radiation,
  iskele_kontrol_karti: Construction,
  telsiz_atex: Radio,
  ex_el_feneri: Zap,
};

const EQUIPMENT_TONE: Record<string, IconTone> = {
  yangin_sondurucu: "risk",
  alan_bariyeri: "crane",
  radyografi_calisma_formu: "risk",
  dozimetre: "risk",
  gaz_dedektoru_co: "risk",
  gaz_dedektoru_4li: "risk",
  iskele_kontrol_karti: "crane",
};

export function equipmentGlyph(
  code: string,
  categoryId?: string
): { icon: LucideIcon; tone: IconTone } {
  return {
    icon: EQUIPMENT_GLYPH[code] ?? categoryGlyph(categoryId ?? ""),
    tone: EQUIPMENT_TONE[code] ?? categoryTone(categoryId ?? "bas"),
  };
}

/** Kart filigranı: limanda forklift, diğerlerinde bölge silueti. */
export function zoneWatermark(zoneId: string): {
  icon: LucideIcon;
  tone: IconTone;
} {
  if (zoneId === "liman_stok") return { icon: Forklift, tone: "fork" };
  return { icon: zoneGlyph(zoneId), tone: zoneTone(zoneId) };
}

export function zoneWatermarkIcon(zoneId: string): LucideIcon {
  return zoneWatermark(zoneId).icon;
}

export function tabGlyph(tab: DecisionTab): { icon: LucideIcon; tone: IconTone } {
  switch (tab) {
    case "self":
      return { icon: HardHat, tone: "kkd" };
    case "contractor":
      return { icon: Users, tone: "maint" };
    case "operator":
      return { icon: Factory, tone: "steel" };
    case "action":
      return { icon: Megaphone, tone: "risk" };
  }
}

export function actionKindGlyph(kind: string): {
  icon: LucideIcon;
  tone: IconTone;
} {
  switch (kind) {
    case "gozlem":
      return { icon: Eye, tone: "nav" };
    case "durdurma":
      return { icon: Ban, tone: "risk" };
    case "bildirim":
      return { icon: Megaphone, tone: "port" };
    case "kayit":
      return { icon: FileText, tone: "maint" };
    default:
      return { icon: ClipboardList, tone: "nav" };
  }
}
