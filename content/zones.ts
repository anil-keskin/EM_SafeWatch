import type { Zone } from "@/lib/types";

/**
 * Saha bölgeleri. supabase/seed.sql içindeki `zones` tablosuyla aynı içeriktedir;
 * Supabase yapılandırılmadığında uygulama bu listeyi kullanır.
 *
 * Toplam 30 senaryo bu 11 bölgeye dağıtılır.
 */
export const ZONES: Zone[] = [
  {
    id: "yuksek_firin",
    name: "Yüksek Fırın",
    icon: "🔥",
    description:
      "Döküm sahası, tapa makinesi, cüruf kanalları. CO gazı ve radyan ısı baskın risk.",
    order_index: 1,
  },
  {
    id: "celikhane",
    name: "Çelikhane",
    icon: "🫗",
    description:
      "Konvertör, pota ocağı ve sürekli döküm. Sıvı metal sıçraması ve yüksek ısı.",
    order_index: 2,
  },
  {
    id: "kok_fabrikasi",
    name: "Kok Fabrikası",
    icon: "🏭",
    description:
      "Kok bataryaları ve söndürme kulesi. Sıcaklık, kok gazı ve PAH maruziyeti.",
    order_index: 3,
  },
  {
    id: "sinter",
    name: "Sinter",
    icon: "🪨",
    description:
      "Karışım, sinterleme ve eleme hatları. Yoğun toz ve konveyör riskleri.",
    order_index: 4,
  },
  {
    id: "haddehane",
    name: "Haddehane",
    icon: "⚙️",
    description:
      "Sıcak ve soğuk hadde hatları. Hareketli ekipman, sıcak şerit, hidrolik enerji.",
    order_index: 5,
  },
  {
    id: "enerji_elektrik",
    name: "Enerji Merkezi",
    icon: "⚡",
    description:
      "Şalt sahaları ve trafo binaları. Ark parlaması ve enerji izolasyonu.",
    order_index: 6,
  },
  {
    id: "gaz_hatlari",
    name: "Gaz Hatları",
    icon: "🧯",
    description:
      "Kok gazı, yüksek fırın gazı ve doğalgaz hatları. Boğucu/patlayıcı ortam riski.",
    order_index: 7,
  },
  {
    id: "liman_stok",
    name: "Liman",
    icon: "🚢",
    description:
      "Boşaltma, stoklama ve saha trafiği. Askıda yük ve iş makinesi trafiği.",
    order_index: 8,
  },
  {
    id: "yuksekte_iskele",
    name: "Yüksekte/İskele",
    icon: "🪜",
    description:
      "İskele, platform ve çatı çalışmaları. Düşme ve malzeme düşmesi riski.",
    order_index: 9,
  },
  {
    id: "kapali_alan",
    name: "Kapalı Alan",
    icon: "🕳️",
    description:
      "Tank, silo ve kapalı hacim girişleri. Boğulma, gaz birikmesi ve kurtarma zorluğu.",
    order_index: 10,
  },
  {
    id: "radyografi",
    name: "Radyografi",
    icon: "☢️",
    description:
      "Tahribatsız muayene, gama kaynağı ile film çekimi. İyonlaştırıcı radyasyon.",
    order_index: 11,
  },
];

export const ZONE_BY_ID = new Map(ZONES.map((z) => [z.id, z]));
