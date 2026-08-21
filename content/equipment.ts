import type { EquipmentCategory, EquipmentItem } from "@/lib/types";

/**
 * Ekipman kategorileri ve kartları.
 * supabase/seed.sql içindeki `equipment_categories` / `equipment_items` ile aynıdır.
 */
export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  { id: "bas", name: "Baş Koruma", order_index: 1 },
  { id: "goz", name: "Göz ve Yüz Koruma", order_index: 2 },
  { id: "solunum", name: "Solunum Koruma", order_index: 3 },
  { id: "isitme", name: "İşitme Koruma", order_index: 4 },
  { id: "el", name: "El Koruma", order_index: 5 },
  { id: "ayak", name: "Ayak Koruma", order_index: 6 },
  { id: "govde", name: "Gövde ve Kıyafet", order_index: 7 },
  { id: "yuksekte", name: "Yüksekte Çalışma", order_index: 8 },
  { id: "olcum", name: "Ölçüm ve Tespit", order_index: 9 },
  { id: "alan", name: "Alan Tedbiri (KKD Dışı)", order_index: 10 },
  { id: "dokuman", name: "Doküman ve İzin", order_index: 11 },
];

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  // --- Baş -----------------------------------------------------------------
  {
    code: "baret_en397",
    name: "Endüstriyel Baret",
    category_id: "bas",
    standard: "EN 397",
    description:
      "Düşen cisim ve çarpma etkisine karşı temel baş koruması. Sahada istisnasız zorunludur.",
    used_by: "hepsi",
    not_for: "Yüksekte çalışmada çene kayışı olmadan yeterli değildir.",
    icon: "⛑️",
    order_index: 1,
  },
  {
    code: "baret_jugular",
    name: "Çene Kayışlı Baret",
    category_id: "bas",
    standard: "EN 397 / EN 12492",
    description:
      "Baş aşağı düşme ve eğilme hareketlerinde baretin düşmesini engelleyen çene kayışlı model.",
    used_by: "hepsi",
    not_for: "Yüksek ısı bölgesinde tek başına ısı koruması sağlamaz.",
    icon: "⛑️",
    order_index: 2,
  },
  {
    code: "baret_en14052",
    name: "Geniş Siperlikli Baret",
    category_id: "bas",
    standard: "EN 14052",
    description: "Yandan ve açılı darbelere karşı artırılmış koruma sağlar.",
    used_by: "hepsi",
    not_for: "Dar hacimlerde hareket kısıtlar; her işte gerekli değildir.",
    icon: "⛑️",
    order_index: 3,
  },
  // --- Göz ve yüz ----------------------------------------------------------
  {
    code: "gozluk_en166",
    name: "Koruyucu Gözlük",
    category_id: "goz",
    standard: "EN 166",
    description:
      "Toz, parçacık ve düşük enerjili darbeye karşı temel göz koruması.",
    used_by: "hepsi",
    not_for: "Radyan ısı ve kaynak arkına karşı koruma sağlamaz.",
    icon: "🥽",
    order_index: 1,
  },
  {
    code: "gozluk_ir",
    name: "IR Filtreli Gözlük",
    category_id: "goz",
    standard: "EN 171",
    description:
      "Sıvı metal ve kızgın yüzeylerin yaydığı kızılötesi ışınıma karşı filtreli gözlük.",
    used_by: "hepsi",
    not_for: "Kaynak arkı için uygun kararma derecesini sağlamaz.",
    icon: "🕶️",
    order_index: 2,
  },
  {
    code: "yuz_siperi",
    name: "Yüz Siperi",
    category_id: "goz",
    standard: "EN 166",
    description:
      "Sıçrama ve radyan ısıya karşı tüm yüzü koruyan siper. Gözlükle birlikte kullanılır.",
    used_by: "hepsi",
    not_for: "Tek başına göz koruması yerine geçmez.",
    icon: "😷",
    order_index: 3,
  },
  {
    code: "kaynak_maskesi",
    name: "Kaynakçı Maskesi",
    category_id: "goz",
    standard: "EN 175 + EN 379",
    description:
      "Kaynak arkının UV/IR ışımasına karşı otomatik kararan camlı maske. Sadece kaynak yapan kişi kullanır.",
    used_by: "yuklenici",
    not_for:
      "Kaynak yapmayan gözlemci için gereksizdir, görüş alanını daraltır.",
    icon: "🪖",
    order_index: 4,
  },
  // --- Solunum -------------------------------------------------------------
  {
    code: "kacis_maskesi_co",
    name: "Acil Kaçış Maskesi (CO)",
    category_id: "solunum",
    standard: "EN 404",
    description:
      "CO ortamında bölgeyi terk etmek için kısa süreli kaçış imkânı verir. Gaz riskli bölgede zorunludur.",
    used_by: "hepsi",
    not_for:
      "Çalışmaya devam etmek için değildir; oksijen sağlamaz, sadece kaçış içindir.",
    icon: "🎭",
    order_index: 1,
  },
  {
    code: "toz_maskesi_ffp3",
    name: "Toz Maskesi FFP3",
    category_id: "solunum",
    standard: "EN 149",
    description:
      "İnce toz ve refrakter partiküllerine karşı tek kullanımlık filtreli maske.",
    used_by: "hepsi",
    not_for: "Gaz ve buharlara karşı koruma sağlamaz.",
    icon: "😷",
    order_index: 2,
  },
  {
    code: "yarim_yuz_maske",
    name: "Yarım Yüz Maske + Filtre",
    category_id: "solunum",
    standard: "EN 140",
    description:
      "Değiştirilebilir filtreyle gaz/buhar ve partikül koruması sağlar.",
    used_by: "hepsi",
    not_for: "Oksijen yetersizliği olan ortamda kullanılamaz.",
    icon: "🎭",
    order_index: 3,
  },
  {
    code: "temiz_hava_solunum",
    name: "Temiz Hava Beslemeli Cihaz (SCBA)",
    category_id: "solunum",
    standard: "EN 137",
    description:
      "Oksijen yetersiz veya IDLH ortamda bağımsız hava kaynağı sağlar. Özel eğitim gerektirir.",
    used_by: "hepsi",
    not_for:
      "Rutin gözlem turu için gereksizdir; hareketi ciddi biçimde kısıtlar.",
    icon: "🧴",
    order_index: 4,
  },
  // --- İşitme --------------------------------------------------------------
  {
    code: "kulak_tikaci",
    name: "Kulak Tıkacı",
    category_id: "isitme",
    standard: "EN 352-2",
    description:
      "Yüksek gürültülü bölgelerde işitme koruması. Kısa süreli geçişler için pratiktir.",
    used_by: "hepsi",
    not_for: "Çok yüksek gürültüde tek başına yetersiz kalabilir.",
    icon: "🎧",
    order_index: 1,
  },
  {
    code: "kulaklik_en352",
    name: "Kulaklık (Manşon Tipi)",
    category_id: "isitme",
    standard: "EN 352-1",
    description:
      "Sürekli yüksek gürültü altında daha yüksek zayıflatma sağlar.",
    used_by: "hepsi",
    not_for: "Baret ve maske ile birlikte uyum kontrolü gerektirir.",
    icon: "🎧",
    order_index: 2,
  },
  // --- El ------------------------------------------------------------------
  {
    code: "eldiven_mekanik",
    name: "Mekanik Riske Karşı Eldiven",
    category_id: "el",
    standard: "EN 388",
    description:
      "Kesilme, delinme ve aşınmaya karşı genel amaçlı iş eldiveni.",
    used_by: "hepsi",
    not_for: "Isıya ve sıvı metale karşı koruma sağlamaz.",
    icon: "🧤",
    order_index: 1,
  },
  {
    code: "eldiven_isi",
    name: "Isıya Dayanıklı Eldiven",
    category_id: "el",
    standard: "EN 407",
    description:
      "Temas ve radyan ısıya karşı korur. Sıcak yüzey ve döküm sahası çevresinde gereklidir.",
    used_by: "hepsi",
    not_for: "Kaynak işlemi için özel kaynakçı eldiveni gerekir.",
    icon: "🧤",
    order_index: 2,
  },
  {
    code: "eldiven_kaynak",
    name: "Kaynakçı Eldiveni",
    category_id: "el",
    standard: "EN 12477",
    description:
      "Kaynak sıçrantısı, ark ısısı ve kıvılcıma karşı uzun konçlu deri eldiven.",
    used_by: "yuklenici",
    not_for: "Hassas el işleri için uygun değildir.",
    icon: "🧤",
    order_index: 3,
  },
  {
    code: "eldiven_kimyasal",
    name: "Kimyasala Dayanıklı Eldiven",
    category_id: "el",
    standard: "EN 374",
    description: "Asit, baz ve solventlere karşı geçirimsiz eldiven.",
    used_by: "hepsi",
    not_for: "Isı ve mekanik riske karşı koruma sağlamaz.",
    icon: "🧤",
    order_index: 4,
  },
  // --- Ayak ----------------------------------------------------------------
  {
    code: "ayakkabi_s3",
    name: "Çelik Burunlu İş Ayakkabısı",
    category_id: "ayak",
    standard: "EN ISO 20345 S3",
    description:
      "Ezilme, delinme ve ıslak zemine karşı temel ayak koruması. Sahada zorunludur.",
    used_by: "hepsi",
    not_for: "Sıvı metal sıçramasına karşı yeterli değildir.",
    icon: "🥾",
    order_index: 1,
  },
  {
    code: "cizme_isi_hi3",
    name: "Isıya Dayanıklı Bot (HI3)",
    category_id: "ayak",
    standard: "EN ISO 20349",
    description:
      "Sıvı metal sıçramasına ve sıcak zemine karşı, hızlı çıkarılabilir bağcıksız bot.",
    used_by: "hepsi",
    not_for: "Genel saha yürüyüşü için gerekli değildir.",
    icon: "🥾",
    order_index: 2,
  },
  // --- Gövde ---------------------------------------------------------------
  {
    code: "fr_kiyafet",
    name: "Alev Almaz (FR) İş Elbisesi",
    category_id: "govde",
    standard: "EN ISO 11612",
    description:
      "Kıvılcım, kısa süreli alev ve radyan ısıya karşı tutuşmayan iş elbisesi.",
    used_by: "hepsi",
    not_for: "Doğrudan sıvı metal sıçramasında tek başına yeterli değildir.",
    icon: "🦺",
    order_index: 1,
  },
  {
    code: "aluminize_giysi",
    name: "Alüminize Isı Giysisi",
    category_id: "govde",
    standard: "EN ISO 11612 / EN 1486",
    description:
      "Sıvı metale doğrudan müdahale eden kişinin giydiği yansıtıcı tam koruma takımı.",
    used_by: "isletme",
    not_for:
      "Gözlemci için gereksizdir; hareketi kısıtlar ve yanlış güven duygusu yaratır.",
    icon: "🥼",
    order_index: 2,
  },
  {
    code: "kaynakci_onlugu",
    name: "Kaynakçı Önlüğü ve Kolluk",
    category_id: "govde",
    standard: "EN ISO 11611",
    description:
      "Kaynak sıçrantısına karşı deri önlük, kolluk ve tozluk seti.",
    used_by: "yuklenici",
    not_for: "Kaynak yapmayan personel için gerekli değildir.",
    icon: "🥼",
    order_index: 3,
  },
  {
    code: "antistatik_ex_kiyafet",
    name: "Antistatik Kıyafet",
    category_id: "govde",
    standard: "EN 1149",
    description:
      "Patlayıcı ortamda statik elektrik birikimini engelleyen kıyafet.",
    used_by: "hepsi",
    not_for: "Isı ve alev koruması sağlamaz; FR kıyafet yerine geçmez.",
    icon: "🦺",
    order_index: 4,
  },
  {
    code: "reflektorlu_yelek",
    name: "Reflektörlü Yelek",
    category_id: "govde",
    standard: "EN ISO 20471",
    description: "Araç ve iş makinesi trafiğinde görünürlüğü artırır.",
    used_by: "hepsi",
    not_for: "Fiziksel koruma sağlamaz.",
    icon: "🦺",
    order_index: 5,
  },
  {
    code: "kursun_onluk",
    name: "Kurşun Önlük",
    category_id: "govde",
    standard: "IEC 61331",
    description:
      "Tıbbi röntgen (düşük enerjili X-ışını) uygulamalarında kullanılan koruyucu önlük.",
    used_by: "hepsi",
    not_for:
      "Endüstriyel gama radyografisinde koruma sağlamaz. Tek geçerli tedbir mesafe ve alan kontrolüdür.",
    icon: "🥼",
    order_index: 6,
  },
  // --- Yüksekte ------------------------------------------------------------
  {
    code: "tam_vucut_kemeri",
    name: "Tam Vücut Emniyet Kemeri",
    category_id: "yuksekte",
    standard: "EN 361",
    description:
      "Düşme durdurma sisteminin gövde bileşeni. Uygun bağlantı noktasıyla birlikte anlam kazanır.",
    used_by: "hepsi",
    not_for: "Bağlanacak sağlam nokta yoksa tek başına koruma sağlamaz.",
    icon: "🪢",
    order_index: 1,
  },
  {
    code: "soklu_lanyard",
    name: "Şok Emicili Lanyard",
    category_id: "yuksekte",
    standard: "EN 355",
    description:
      "Düşme anındaki darbe kuvvetini vücut için güvenli seviyeye indirir.",
    used_by: "hepsi",
    not_for: "Serbest düşme mesafesi yetersizse uygun değildir.",
    icon: "🪢",
    order_index: 2,
  },
  {
    code: "cift_kancali_lanyard",
    name: "Çift Kancalı Lanyard",
    category_id: "yuksekte",
    standard: "EN 355 + EN 362",
    description:
      "Yatay hareket sırasında kesintisiz bağlı kalmayı sağlar (%100 tie-off).",
    used_by: "hepsi",
    not_for: "Uygun mukavemette bağlantı noktası gerektirir.",
    icon: "🪢",
    order_index: 3,
  },
  {
    code: "yatay_yasam_hatti",
    name: "Yatay Yaşam Hattı",
    category_id: "yuksekte",
    standard: "EN 795",
    description:
      "Uzun mesafede güvenli bağlantı imkânı veren kalıcı/geçici hat.",
    used_by: "hepsi",
    not_for: "Mühendislik hesabı ve kurulum onayı olmadan kullanılamaz.",
    icon: "🪢",
    order_index: 4,
  },
  // --- Ölçüm ---------------------------------------------------------------
  {
    code: "gaz_dedektoru_co",
    name: "Kişisel Gaz Dedektörü (CO/O₂)",
    category_id: "olcum",
    standard: "EN 45544",
    description:
      "CO ve oksijen seviyesini sürekli izleyip alarm veren kişisel cihaz.",
    used_by: "hepsi",
    not_for: "Patlayıcı gaz (LEL) ve H₂S ölçmez.",
    icon: "📟",
    order_index: 1,
  },
  {
    code: "gaz_dedektoru_4li",
    name: "4'lü Gaz Dedektörü",
    category_id: "olcum",
    standard: "EN 60079-29-1",
    description:
      "O₂, CO, H₂S ve LEL ölçen çok sensörlü kişisel cihaz. Gaz hatlarında zorunludur.",
    used_by: "hepsi",
    not_for: "Kalibrasyonu ve bump testi güncel değilse güvenilmez.",
    icon: "📟",
    order_index: 2,
  },
  {
    code: "dozimetre",
    name: "Kişisel Dozimetre",
    category_id: "olcum",
    standard: "IEC 62387",
    description:
      "Alınan radyasyon dozunu ölçer. Radyografi bölgesine yaklaşan yetkili personel taşır.",
    used_by: "hepsi",
    not_for: "Koruyucu değildir; sadece maruziyeti kaydeder.",
    icon: "📟",
    order_index: 3,
  },
  {
    code: "ex_el_feneri",
    name: "Ex-Proof El Feneri",
    category_id: "olcum",
    standard: "ATEX",
    description: "Patlayıcı ortamda kıvılcım oluşturmayan aydınlatma.",
    used_by: "hepsi",
    not_for: "Standart el feneri patlayıcı ortamda tutuşturucu kaynaktır.",
    icon: "🔦",
    order_index: 4,
  },
  {
    code: "telsiz_atex",
    name: "ATEX Sertifikalı Telsiz",
    category_id: "olcum",
    standard: "ATEX",
    description:
      "Patlayıcı ortamda güvenli haberleşme; yalnız çalışma riskini azaltır.",
    used_by: "hepsi",
    not_for: "Sertifikasız cihazlar Ex bölgeye sokulamaz.",
    icon: "📻",
    order_index: 5,
  },
  // --- Alan tedbiri --------------------------------------------------------
  {
    code: "kaynak_perdesi",
    name: "Kaynak Perdesi / Paravan",
    category_id: "alan",
    standard: "EN ISO 25980",
    description:
      "Ark ışımasını ve sıçrantıyı çevredeki kişilerden izole eder.",
    used_by: "hepsi",
    not_for: "KKD değildir; kişisel korumanın yerine geçmez.",
    icon: "🧱",
    order_index: 1,
  },
  {
    code: "alan_bariyeri",
    name: "Alan Bariyeri ve Uyarı Levhası",
    category_id: "alan",
    standard: "—",
    description:
      "Riskli alanı fiziksel olarak sınırlar ve girişi kontrol altına alır.",
    used_by: "hepsi",
    not_for: "Sadece şerit çekmek yeterli değildir; giriş kontrolü gerekir.",
    icon: "🚧",
    order_index: 2,
  },
  {
    code: "yangin_sondurucu",
    name: "Yangın Söndürücü ve Yangın Gözcüsü",
    category_id: "alan",
    standard: "—",
    description:
      "Sıcak işlerde tutuşmayı erken müdahaleyle önler. Sıcak iş izninin şartıdır.",
    used_by: "hepsi",
    not_for:
      "Gözcü olmadan tek başına söndürücü bulundurmak yeterli değildir.",
    icon: "🧯",
    order_index: 3,
  },
  {
    code: "kacis_guzergahi",
    name: "Kaçış Güzergâhı ve Toplanma Noktası",
    category_id: "alan",
    standard: "—",
    description:
      "Bölgeye girmeden önce çıkış yolunun ve toplanma noktasının belirlenmesi.",
    used_by: "hepsi",
    not_for: "Sonradan planlanamaz; giriş öncesi belirlenmelidir.",
    icon: "🏃",
    order_index: 4,
  },
  {
    code: "ruzgar_yonu",
    name: "Rüzgâr Yönüne Göre Konumlanma",
    category_id: "alan",
    standard: "—",
    description:
      "Gaz kaçağı ihtimalinde rüzgârı arkaya alarak yukarı yönde konumlanmak.",
    used_by: "hepsi",
    not_for: "Rüzgâr yönü değişkendir; sürekli takip gerekir.",
    icon: "🧭",
    order_index: 5,
  },
  {
    code: "toplu_koruma",
    name: "Toplu Koruma (Korkuluk/Platform)",
    category_id: "alan",
    standard: "EN 13374",
    description:
      "Düşme riskinde önceliklidir; kişisel koruyucudan önce gelir.",
    used_by: "hepsi",
    not_for: "Eksik veya sökülmüş korkuluk yanıltıcı güven verir.",
    icon: "🛡️",
    order_index: 6,
  },
  {
    code: "gozetmen",
    name: "Gözetmen (Stand-by Watch)",
    category_id: "alan",
    standard: "—",
    description:
      "Kapalı/riskli hacimde dışarıda bekleyerek acil durumda müdahaleyi başlatan kişi.",
    used_by: "hepsi",
    not_for: "Gözetmen aynı anda başka iş yapamaz.",
    icon: "👁️",
    order_index: 7,
  },
  {
    code: "guvenli_mesafe",
    name: "Güvenli Mesafede Konumlanma",
    category_id: "alan",
    standard: "—",
    description:
      "Gözlemi risk alanının dışından yapmak. En etkili ve en çok unutulan tedbirdir.",
    used_by: "hepsi",
    not_for: "Görüş açısı yetersizse alternatif gözlem noktası planlanmalıdır.",
    icon: "📏",
    order_index: 8,
  },
  // --- Doküman -------------------------------------------------------------
  {
    code: "is_izni",
    name: "İş İzin Formu Kontrolü",
    category_id: "dokuman",
    standard: "—",
    description:
      "İşin izin kapsamında, tarif edilen yer ve şartlarda yapıldığının doğrulanması.",
    used_by: "hepsi",
    not_for: "İmzalı form tek başına sahanın güvenli olduğunu göstermez.",
    icon: "📄",
    order_index: 1,
  },
  {
    code: "gaz_olcum_formu",
    name: "Giriş Öncesi Gaz Ölçüm Kaydı",
    category_id: "dokuman",
    standard: "—",
    description:
      "Bölgeye girmeden önce yapılan ölçümün kaydı. Geçerlilik süresi sınırlıdır.",
    used_by: "hepsi",
    not_for: "Süresi geçmiş ölçüm geçersizdir, yenilenmelidir.",
    icon: "📄",
    order_index: 2,
  },
  {
    code: "iskele_kontrol_karti",
    name: "İskele Kontrol Kartı",
    category_id: "dokuman",
    standard: "TS EN 12811",
    description:
      "İskelenin yetkili kişi tarafından kontrol edildiğini gösteren yeşil etiket.",
    used_by: "hepsi",
    not_for: "Kırmızı etiketli veya etiketsiz iskeleye çıkılmaz.",
    icon: "🏷️",
    order_index: 3,
  },
  {
    code: "radyografi_calisma_formu",
    name: "Radyografi Çalışma Bildirim Formu",
    category_id: "dokuman",
    standard: "—",
    description:
      "Çekim saati, kaynak aktivitesi ve izolasyon sınırlarını gösteren bildirim.",
    used_by: "hepsi",
    not_for: "Bildirimsiz çekim yapılamaz; saha personeline duyurulmalıdır.",
    icon: "📄",
    order_index: 4,
  },
  {
    code: "toolbox",
    name: "Başlangıç Toplantısı (Toolbox)",
    category_id: "dokuman",
    standard: "—",
    description:
      "İşe başlamadan önce riskleri ve tedbirleri ekiple paylaşan kısa saha toplantısı.",
    used_by: "hepsi",
    not_for: "İmza toplamak yeterli değildir; içerik anlaşılmalıdır.",
    icon: "🗣️",
    order_index: 5,
  },
];

export const EQUIPMENT_BY_CODE = new Map(
  EQUIPMENT_ITEMS.map((item) => [item.code, item])
);

export function equipmentName(code: string): string {
  return EQUIPMENT_BY_CODE.get(code)?.name ?? code;
}
