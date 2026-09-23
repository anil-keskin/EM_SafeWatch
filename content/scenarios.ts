import type { Scenario } from "@/lib/types";

/**
 * Senaryo içerikleri. supabase/seed.sql ile aynı verinin TypeScript karşılığıdır.
 * Supabase yapılandırılmadığında uygulama bu listeyi kullanır, böylece proje
 * veritabanı bağlanmadan da çalışır.
 *
 * 30 senaryonun tamamı açıktır. İçeriği henüz ince olanlar da oynanabilir;
 * sonradan doldurulabilir.
 */

const openScenario = (
  slug: string,
  zone_id: string,
  order_index: number,
  title: string
): Scenario => ({
  slug,
  zone_id,
  order_index,
  title,
  is_draft: false,
  briefing: {},
  hazards: [],
  actors: [],
  required_self: [],
  forbidden_self: [],
  contractor_gaps: [],
  operator_gaps: [],
  correct_actions: [],
  wrong_actions: [],
  hints: [],
  explanation: "",
  competency_tags: [],
});

export const SCENARIOS: Scenario[] = [
  // =========================================================================
  // 1 — Yüksek Fırın: Döküm Kanalı Gözlemi
  // =========================================================================
  {
    slug: "yf-dokum-kanali",
    zone_id: "yuksek_firin",
    order_index: 1,
    title: "Döküm Kanalı Gözlemi",
    is_draft: false,
    briefing: {
      konum: "Yüksek Fırın 2 — Döküm Sahası, +8.50 kotu",
      gorev:
        "Refrakter tamiratının şartnameye uygunluğunu yerinde gözlemlemek ve ilerleme kaydı almak.",
      isletme_faaliyeti:
        "İşletme ekibi döküm sonrası cüruf kanalını temizliyor, tapa makinesi hazırlığı sürüyor.",
      yuklenici_faaliyeti:
        "Müteahhit refrakter ekibi kanal yan duvarına döküm harcı uyguluyor.",
      hava: "Rüzgâr güneybatıdan hafif esiyor. Dış ortam sıcaklığı 31°C.",
      is_izni:
        "Sıcak iş izni açık. Gaz ölçümü 2 saat 40 dakika önce yapılmış.",
      gaz: "CO birikme ihtimali olan kapalı geçit güzergâh üzerinde.",
      sicaklik:
        "Döküm arası dönem; kanal ve refrakter yüzeyleri hâlâ kızgın.",
      yukseklik: "Kot farkı var, kanal kenarı korkuluksuz.",
      ozel_not:
        "Gözlem güzergâhınız CO birikmesine açık kapalı geçitten geçiyor.",
    },
    hazards: [
      {
        code: "co_gazi",
        label: "Karbonmonoksit (CO) birikmesi",
        is_real: true,
        x: 20,
        y: 34,
        explanation:
          "CO renksiz ve kokusuzdur. Kapalı geçitte birikir; ancak kişisel dedektörle fark edilir.",
      },
      {
        code: "radyan_isi",
        label: "Radyan ısı (kızgın kanal)",
        is_real: true,
        x: 54,
        y: 56,
        explanation:
          "Sıvı metal ve kızgın refrakter yüzeyler doğrudan temas olmadan da ısı yükü oluşturur.",
      },
      {
        code: "sicak_yuzey",
        label: "Sıcak yüzey teması",
        is_real: true,
        x: 72,
        y: 66,
        explanation:
          "Kızgın refrakter ve tapa donanımı temas yanığı riski taşır.",
      },
      {
        code: "kot_farki",
        label: "Kot farkı / korkuluksuz kanal kenarı",
        is_real: true,
        x: 36,
        y: 78,
        explanation:
          "Açık kanal kenarında düşme riski var; güzergâh kenardan uzak planlanmalı.",
      },
      {
        code: "gurultu",
        label: "Yüksek gürültü",
        is_real: true,
        x: 86,
        y: 24,
        explanation: "Tapa makinesi ve havalandırma sürekli gürültü üretir.",
      },
      {
        code: "toz",
        label: "Refrakter tozu",
        is_real: true,
        x: 62,
        y: 42,
        explanation:
          "Harç uygulaması ve kanal temizliği ince toz açığa çıkarır.",
      },
      {
        code: "askida_yuk",
        label: "Askıda yük",
        is_real: false,
        x: 14,
        y: 16,
        explanation:
          "Bu vardiyada döküm sahasında vinç operasyonu yok. Gerçek bir risk noktası değil.",
      },
      {
        code: "kimyasal_sicrama",
        label: "Kimyasal sıçrama",
        is_real: false,
        x: 90,
        y: 76,
        explanation:
          "Bu senaryoda kimyasal kullanımı yok. Gerçek bir risk noktası değil.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity: "Refrakter tamiratını gözlemliyor, ilerleme kaydı alıyor.",
        authority:
          "Kendi ekibi üzerinde tam yetkili. Yüklenicide sözleşme kapsamında durdurma yetkisi var. İşletme personeline doğrudan talimat veremez.",
        expected_items: [
          "gaz_dedektoru_co",
          "kacis_maskesi_co",
          "fr_kiyafet",
          "baret_en397",
          "gozluk_ir",
          "eldiven_isi",
          "ayakkabi_s3",
          "kulak_tikaci",
          "gaz_olcum_formu",
        ],
      },
      {
        type: "yuklenici",
        employer: "Refrakter yüklenicisi",
        activity: "Kanal yan duvarına döküm harcı uyguluyor.",
        expected_items: [
          "gaz_dedektoru_co",
          "kacis_maskesi_co",
          "baret_en397",
          "gozluk_en166",
          "toz_maskesi_ffp3",
          "eldiven_isi",
          "fr_kiyafet",
          "ayakkabi_s3",
          "kulak_tikaci",
        ],
        current_items: [
          "gaz_dedektoru_co",
          "kacis_maskesi_co",
          "baret_en397",
          "eldiven_mekanik",
          "fr_kiyafet",
          "ayakkabi_s3",
          "kulak_tikaci",
        ],
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity: "Cüruf kanalı temizliği ve tapa makinesi hazırlığı.",
        expected_items: [
          "gaz_dedektoru_co",
          "kacis_maskesi_co",
          "baret_en397",
          "gozluk_ir",
          "fr_kiyafet",
          "eldiven_isi",
          "ayakkabi_s3",
          "kulak_tikaci",
          "toz_maskesi_ffp3",
        ],
        current_items: [
          "gaz_dedektoru_co",
          "kacis_maskesi_co",
          "baret_en397",
          "gozluk_ir",
          "fr_kiyafet",
          "eldiven_isi",
          "ayakkabi_s3",
          "kulak_tikaci",
          "toz_maskesi_ffp3",
        ],
      },
    ],
    required_self: [
      "gaz_dedektoru_co",
      "kacis_maskesi_co",
      "fr_kiyafet",
      "baret_en397",
      "gozluk_ir",
      "eldiven_isi",
      "ayakkabi_s3",
      "kulak_tikaci",
      "gaz_olcum_formu",
    ],
    forbidden_self: [
      "standart_is_kiyafeti",
      "kaynak_maskesi",
      "aluminize_giysi",
      "tam_vucut_kemeri",
      "eldiven_kimyasal",
      "dozimetre",
      "temiz_hava_solunum",
      "kursun_onluk",
    ],
    contractor_gaps: ["gozluk_en166", "toz_maskesi_ffp3", "eldiven_isi"],
    operator_gaps: [],
    correct_actions: ["izin_kontrol", "bildir_firma", "kayit_al"],
    wrong_actions: ["gozleme_devam"],
    hints: [
      "Bu bölgedeki en kritik risk gözle görülmez, kokusu ve rengi yoktur. Onu fark etmenin tek yolu yanınızda taşıdığınız bir cihazdır.",
      "Kaçış maskesi ile temiz hava beslemeli cihaz aynı şey değildir. Biri yalnızca bölgeyi terk etmenize yeter, diğeri ortamda çalışmak içindir. Rutin gözlem turunda hangisi doğru?",
      "İş izni notuna tekrar bakın: gaz ölçümünün üzerinden 2 saat 40 dakika geçmiş. Ölçümlerin geçerlilik süresi sınırlıdır — girmeden önce yenilenmesini istemelisiniz.",
    ],
    explanation:
      "Bu senaryonun özü, görünmeyen riski yönetmektir. Döküm sahasında ısı ve toz kolayca fark edilir; asıl belirleyici olan CO maruziyetidir. Kişisel gaz dedektörü ve acil kaçış maskesi bu bölgede pazarlık konusu değildir. Alev almaz iş elbisesi, IR filtreli gözlük ve ısıya dayanıklı eldiven radyan ısı yükünü karşılar. Buna karşılık kaynakçı maskesi, alüminize giysi veya temiz hava beslemeli cihaz bu görev için gereksizdir; hareketinizi kısıtlar ve yanlış bir güven duygusu yaratır. Gerekenden fazla KKD seçmek de bir uygunsuzluktur. Yüklenici refrakter ekibinde göz koruması ve toz maskesi eksik, eldiven seçimi işin ısısına uygun değil. Bu, işi anında durdurmayı gerektiren kritik bir ihlal olmamakla birlikte firma saha sorumlusuna bildirilmesi ve kayıt altına alınması gereken bir eksikliktir. İşletme personelinde bu vardiyada bir uygunsuzluk gözlenmemiştir; eksik olmadığını söylemek de doğru bir denetim sonucudur. Son olarak gaz ölçümünün üzerinden geçen süre nedeniyle iş izin şartlarının yeniden kontrol ettirilmesi, bu senaryodaki en değerli kontrollük davranışıdır.",
    competency_tags: [
      "gaz_guvenligi",
      "kkd_secimi",
      "is_izni_yonetimi",
      "kontrolluk_davranisi",
      "tehlike_tanima",
    ],
  },

  // =========================================================================
  // 2 — Çelikhane: Döküm Platformu (işletme personelinde uygunsuzluk)
  // =========================================================================
  {
    slug: "ch-dokum-platformu",
    zone_id: "celikhane",
    order_index: 1,
    title: "Döküm Platformu — İşletmede Uygunsuzluk",
    is_draft: false,
    briefing: {
      konum: "Çelikhane — Sürekli Döküm Platformu, pota kulesi altı",
      gorev:
        "Platform çevresindeki yürüyüş yolu yenileme işinin ilerlemesini gözlemlemek.",
      isletme_faaliyeti:
        "İşletme personeli sıvı metal kaçağına müdahale ediyor; tandiş çevresinde çalışıyor.",
      yuklenici_faaliyeti:
        "Müteahhit ekibi platformun 15 metre uzağında yürüyüş yolu montajı yapıyor.",
      hava: "Kapalı hacim, ortam sıcaklığı 42°C.",
      is_izni: "Genel çalışma izni açık, sıcak iş kapsamı dışında.",
      sicaklik:
        "Sıvı çelik sıcaklığı yaklaşık 1550°C. Sıçrama alanı belirgin.",
      ozel_not:
        "Sıvı metale müdahale eden işletme personelinde koruma eksikliği gözlemliyorsunuz.",
    },
    hazards: [
      {
        code: "sivi_metal_sicrama",
        label: "Sıvı metal sıçraması",
        is_real: true,
        x: 48,
        y: 50,
        explanation:
          "Tandiş müdahalesi sırasında sıçrama alanı genişler; giysinin altına giren damla ağır yanık yapar.",
      },
      {
        code: "radyan_isi",
        label: "Yoğun radyan ısı",
        is_real: true,
        x: 58,
        y: 40,
        explanation:
          "1550°C sıvı çelik, temas olmadan da ciddi ısı yükü oluşturur.",
      },
      {
        code: "sicak_yuzey",
        label: "Sıcak platform yüzeyi",
        is_real: true,
        x: 66,
        y: 72,
        explanation:
          "Platform sacları ve döküntü metal parçaları kızgın olabilir.",
      },
      {
        code: "askida_yuk",
        label: "Pota vinci — askıda yük",
        is_real: true,
        x: 30,
        y: 18,
        explanation:
          "Pota kulesi altında yük geçiş güzergâhı var; altında durulmaz.",
      },
      {
        code: "gurultu",
        label: "Yüksek gürültü",
        is_real: true,
        x: 84,
        y: 30,
        explanation: "Vakum ve fan sistemleri sürekli gürültü üretir.",
      },
      {
        code: "kot_farki",
        label: "Platform kenarı kot farkı",
        is_real: true,
        x: 22,
        y: 74,
        explanation: "Platform kenarında düşme riski bulunuyor.",
      },
      {
        code: "co_gazi",
        label: "Karbonmonoksit birikmesi",
        is_real: false,
        x: 12,
        y: 44,
        explanation:
          "Bu platform açık havalandırmalıdır; CO birikmesi bu senaryonun riski değildir.",
      },
      {
        code: "radyasyon",
        label: "İyonlaştırıcı radyasyon",
        is_real: false,
        x: 90,
        y: 60,
        explanation: "Bu bölgede radyografi çalışması yoktur.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity:
          "Yürüyüş yolu montajını gözlemliyor, ilerleme kaydı alıyor.",
        authority:
          "İşletme personeline doğrudan talimat verme yetkisi YOKTUR. Gözlemini işletme sorumlusuna ve İSG birimine bildirir. Kendi ekibini risk alanından çekme yetkisi tamdır.",
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity: "Tandiş çevresinde sıvı metal kaçağına müdahale ediyor.",
        expected_items: [
          "aluminize_giysi",
          "yuz_siperi",
          "cizme_isi_hi3",
          "eldiven_isi",
          "baret_en397",
          "kulak_tikaci",
        ],
        current_items: [
          "fr_kiyafet",
          "gozluk_en166",
          "ayakkabi_s3",
          "eldiven_mekanik",
          "baret_en397",
          "kulak_tikaci",
        ],
      },
      {
        type: "yuklenici",
        employer: "Mekanik montaj yüklenicisi",
        activity: "Platformun 15 m uzağında yürüyüş yolu montajı.",
        expected_items: [
          "baret_en397",
          "gozluk_en166",
          "eldiven_mekanik",
          "eldiven_isi",
          "fr_kiyafet",
          "ayakkabi_s3",
          "kulak_tikaci",
        ],
        current_items: [
          "baret_en397",
          "gozluk_en166",
          "eldiven_mekanik",
          "eldiven_isi",
          "fr_kiyafet",
          "ayakkabi_s3",
          "kulak_tikaci",
        ],
      },
    ],
    required_self: [
      "baret_en397",
      "gozluk_ir",
      "fr_kiyafet",
      "eldiven_isi",
      "ayakkabi_s3",
      "kulak_tikaci",
      "guvenli_mesafe",
    ],
    forbidden_self: [
      "standart_is_kiyafeti",
      "aluminize_giysi",
      "kaynak_maskesi",
      "tam_vucut_kemeri",
      "temiz_hava_solunum",
      "eldiven_kimyasal",
      "kursun_onluk",
      "dozimetre",
    ],
    contractor_gaps: [],
    operator_gaps: [
      "aluminize_giysi",
      "yuz_siperi",
      "cizme_isi_hi3",
      "eldiven_isi",
    ],
    correct_actions: [
      "bildir_isletme",
      "bildir_isg",
      "ekibi_cikar",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam", "durdur_muteahhit", "bildir_firma"],
    hints: [
      "Gördüğünüz uygunsuzluk sizde değil, karşınızdaki kişide. Önce şunu sorun: bu kişi kimin çalışanı?",
      "Alüminize giysi sıvı metale doğrudan müdahale edenin kıyafetidir. Siz müdahale etmiyorsunuz — onu kendinize giymek çözüm değildir.",
      "İşletme personeline doğrudan dur diyemezsiniz. Ama bu, hiçbir şey yapmayacağınız anlamına gelmez: doğru kanal işletme sorumlusu ve İSG birimidir. Bu arada kendi ekibinizi sıçrama alanından çekmelisiniz.",
    ],
    explanation:
      "Bu senaryo yetki sınırını öğretir. Gözlemlediğiniz uygunsuzluk gerçektir ve ciddidir: sıvı metale müdahale eden işletme personeli alüminize koruyucu giysi, yüz siperi ve ısıya dayanıklı bot yerine standart alev almaz elbise, koruyucu gözlük ve normal iş ayakkabısı kullanıyor. Ancak bu kişi sizin denetiminizdeki bir müteahhit çalışanı değil, işletmenin kendi personelidir. Ona doğrudan talimat vermek ya da işini durdurmak yetki sınırınızın dışındadır. Doğru davranış üç adımdır: durumu işletme sorumlusuna ve demir çelik İSG birimine bildirmek, kendi kontrollük ekibinizi sıçrama alanının dışına çekmek ve gözlemi kayıt altına almak. Kendi donanımınız açısından gözlem mesafesine uygun temel set yeterlidir: baret, IR filtreli gözlük, alev almaz elbise, ısıya dayanıklı eldiven, iş ayakkabısı ve kulak koruyucu. Alüminize giysiyi kendinize giymek yaygın bir hatadır; bu giysi müdahale edenin ekipmanıdır, gözlemcinin değil. En güçlü tedbiriniz bir KKD değil, güvenli mesafedir. Müteahhit ekibinde bu senaryoda bir eksiklik yoktur; onların işini durdurmak hem gereksiz hem de orantısız bir müdahale olurdu.",
    competency_tags: [
      "yetki_sinirlari",
      "bildirim_kanallari",
      "kkd_secimi",
      "isi_sicrama_korunmasi",
      "kontrolluk_davranisi",
    ],
  },

  // =========================================================================
  // 3 — Çelikhane: Kaynaklı Tadilat (müteahhit denetimi)
  // =========================================================================
  {
    slug: "ch-kaynakli-tadilat",
    zone_id: "celikhane",
    order_index: 2,
    title: "Kaynaklı Tadilat — Müteahhit Denetimi",
    is_draft: false,
    briefing: {
      konum: "Çelikhane — Cüruf potası taşıma yolu yanı, bakım nişi",
      gorev:
        "Müteahhit kaynak ekibinin çalışma şartlarını ve KKD uygunluğunu denetlemek.",
      isletme_faaliyeti:
        "İşletme ekibi 20 m ötede cüruf potası taşıma hazırlığı yapıyor.",
      yuklenici_faaliyeti:
        "Müteahhit kaynakçı, taşıyıcı konsol üzerinde elektrik ark kaynağı yapıyor.",
      hava: "Kapalı hacim, sınırlı doğal havalandırma.",
      is_izni:
        "Sıcak iş izni açık. İzin formunda yangın gözcüsü şartı yazılı.",
      ozel_not:
        "Kaynak alanının 3 m yakınında hidrolik hortum güzergâhı ve ahşap palet yığını var.",
    },
    hazards: [
      {
        code: "ark_isimasi",
        label: "Kaynak arkı UV/IR ışıması",
        is_real: true,
        x: 46,
        y: 48,
        explanation:
          "Ark ışıması çevredeki kişilerde de göz yanığı (ark gözü) yapar. Perde ile izole edilmelidir.",
      },
      {
        code: "kivilcim_yangin",
        label: "Kıvılcım ve yangın riski",
        is_real: true,
        x: 58,
        y: 62,
        explanation:
          "3 m yakındaki ahşap palet ve hidrolik hortum tutuşabilir. Yangın gözcüsü izin şartıdır.",
      },
      {
        code: "kaynak_dumani",
        label: "Kaynak dumanı",
        is_real: true,
        x: 40,
        y: 34,
        explanation:
          "Sınırlı havalandırmada kaynak dumanı birikir; lokal emiş veya solunum koruması gerekir.",
      },
      {
        code: "elektrik",
        label: "Elektrik çarpması",
        is_real: true,
        x: 72,
        y: 56,
        explanation:
          "Kaynak kablosu izolasyonu ve topraklama kontrol edilmelidir.",
      },
      {
        code: "askida_yuk",
        label: "Cüruf potası taşıma güzergâhı",
        is_real: true,
        x: 20,
        y: 22,
        explanation:
          "20 m ötedeki taşıma güzergâhı çalışma alanını etkileyebilir.",
      },
      {
        code: "kot_farki",
        label: "Konsol üzerinde kot farkı",
        is_real: true,
        x: 52,
        y: 76,
        explanation: "Kaynakçı yerden yükseltilmiş konsolda çalışıyor.",
      },
      {
        code: "gaz_bogucu",
        label: "Boğucu gaz sızıntısı",
        is_real: false,
        x: 88,
        y: 40,
        explanation:
          "Bu nişte gaz hattı bulunmuyor. Gerçek bir risk noktası değil.",
      },
      {
        code: "radyasyon",
        label: "İyonlaştırıcı radyasyon",
        is_real: false,
        x: 14,
        y: 68,
        explanation: "Bu vardiyada radyografi planlanmamıştır.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity: "Kaynak işinin şartname ve İSG uygunluğunu denetliyor.",
        authority:
          "Yüklenici üzerinde sözleşme kapsamında işi durdurma yetkisi vardır. Kritik ihlalde durdurup firma saha sorumlusuna bildirir.",
      },
      {
        type: "yuklenici",
        employer: "Mekanik tadilat yüklenicisi",
        activity: "Taşıyıcı konsol üzerinde elektrik ark kaynağı.",
        expected_items: [
          "kaynak_maskesi",
          "eldiven_kaynak",
          "kaynakci_onlugu",
          "fr_kiyafet",
          "ayakkabi_s3",
          "baret_en397",
          "kulak_tikaci",
          "kaynak_perdesi",
          "yangin_sondurucu",
        ],
        current_items: [
          "baret_en397",
          "fr_kiyafet",
          "ayakkabi_s3",
          "eldiven_mekanik",
          "kulak_tikaci",
        ],
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity: "20 m ötede cüruf potası taşıma hazırlığı.",
        expected_items: [
          "baret_en397",
          "gozluk_ir",
          "fr_kiyafet",
          "eldiven_isi",
          "ayakkabi_s3",
          "kulak_tikaci",
        ],
        current_items: [
          "baret_en397",
          "gozluk_ir",
          "fr_kiyafet",
          "eldiven_isi",
          "ayakkabi_s3",
          "kulak_tikaci",
        ],
      },
    ],
    required_self: [
      "baret_en397",
      "gozluk_en166",
      "fr_kiyafet",
      "eldiven_mekanik",
      "ayakkabi_s3",
      "kulak_tikaci",
      "is_izni",
    ],
    forbidden_self: [
      "standart_is_kiyafeti",
      "kaynak_maskesi",
      "aluminize_giysi",
      "tam_vucut_kemeri",
      "temiz_hava_solunum",
      "kursun_onluk",
      "dozimetre",
      "cizme_isi_hi3",
    ],
    contractor_gaps: [
      "kaynak_maskesi",
      "eldiven_kaynak",
      "kaynakci_onlugu",
      "kaynak_perdesi",
      "yangin_sondurucu",
    ],
    operator_gaps: [],
    correct_actions: [
      "durdur_muteahhit",
      "bildir_firma",
      "izin_kontrol",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam"],
    hints: [
      "Kaynakçının kendisine bakın: hangi koruyucular işin cinsine göre olması gerektiği gibi değil?",
      "Eksik olan yalnızca kişisel koruyucular değil. İş izin formunda yazan bir alan tedbiri de sahada yok.",
      "Göz koruması olmadan ark kaynağı yapmak kritik ve anlık bir ihlaldir. Bildirim yetmez; bu durumda işi durdurmak sözleşme kapsamındaki yetkinizdir.",
    ],
    explanation:
      "Bu senaryoda denetlediğiniz kişi sizin yükleniciniz, dolayısıyla müdahale yetkiniz açıktır. Kaynakçıda üç kişisel koruyucu eksik: kaynakçı maskesi, kaynakçı eldiveni ve deri önlük. Bunlardan göz ve yüz korumasının hiç bulunmaması anlık ve geri dönüşsüz zarar doğurabilecek kritik bir ihlaldir; işi durdurmayı gerektirir. Eksikler kişisel koruyucularla da sınırlı değildir: ark ışımasını çevredeki personelden izole edecek kaynak perdesi ve sıcak iş izninin açık şartı olan yangın söndürücü ile yangın gözcüsü sahada yoktur. Kaynak alanının üç metre yakınındaki ahşap palet ve hidrolik hortum güzergâhı bu eksikliği daha da kritik hale getirir. Doğru sıralama şudur: işi durdurun, firma saha sorumlusunu çağırın, iş izin şartlarının yeniden gözden geçirilmesini isteyin ve uygunsuzluğu kayıt altına alın. Kendi donanımınız açısından ise dikkat edilecek nokta şudur: kaynak yapan siz değilsiniz. Kaynakçı maskesini kendinize takmak gereksizdir; koruyucu gözlük yeterlidir. Gözlem mesafenizi ark ışımasından koruyacak şekilde ayarlamanız daha doğrudur.",
    competency_tags: [
      "muteahhit_denetimi",
      "kkd_secimi",
      "sicak_is_yonetimi",
      "isi_durdurma_karari",
      "kontrolluk_davranisi",
    ],
  },

  // =========================================================================
  // 4 — Gaz Hatları: Saha İncelemesi
  // =========================================================================
  {
    slug: "gh-saha-incelemesi",
    zone_id: "gaz_hatlari",
    order_index: 1,
    title: "Gaz Hattı Saha İncelemesi",
    is_draft: false,
    briefing: {
      konum: "Kok gazı ana hattı — kompansatör bölgesi, boru köprüsü altı",
      gorev:
        "Kompansatör yenileme işi öncesi saha ön incelemesi yapmak ve ölçüm noktalarını belirlemek.",
      isletme_faaliyeti:
        "İşletme ekibi hat basıncını düşürme çalışması yapıyor; blindaj henüz takılmamış.",
      yuklenici_faaliyeti:
        "Müteahhit ekibi henüz sahaya girmedi, giriş için sizin onayınızı bekliyor.",
      hava: "Rüzgâr kuzeydoğudan 4 m/s. Hafif yağmur.",
      is_izni:
        "İş izni HAZIRLIK aşamasında. Hat henüz gaz sızdırmaz hale getirilmemiş.",
      gaz: "Kok gazı: CO, H₂S ve patlayıcı karışım (LEL) riski bir arada.",
      ozel_not:
        "Sahada iki gün önce hafif kaçak bildirimi yapılmış, kalıcı onarım tamamlanmamış.",
    },
    hazards: [
      {
        code: "co_gazi",
        label: "Karbonmonoksit (CO)",
        is_real: true,
        x: 30,
        y: 40,
        explanation:
          "Kok gazının ana bileşenlerinden biri; renksiz, kokusuz ve öldürücüdür.",
      },
      {
        code: "h2s",
        label: "Hidrojen sülfür (H₂S)",
        is_real: true,
        x: 44,
        y: 30,
        explanation:
          "Düşük konsantrasyonda çürük yumurta kokar; yüksek konsantrasyonda koku alma duyusunu felce uğratır.",
      },
      {
        code: "patlayici_ortam",
        label: "Patlayıcı ortam (LEL)",
        is_real: true,
        x: 56,
        y: 52,
        explanation:
          "Kok gazı hava ile patlayıcı karışım oluşturur. Kıvılcım kaynağı sokulamaz.",
      },
      {
        code: "oksijen_yetersizligi",
        label: "Oksijen yetersizliği",
        is_real: true,
        x: 22,
        y: 62,
        explanation:
          "Boru köprüsü altındaki çukur bölgede gaz birikip oksijeni yerinden edebilir.",
      },
      {
        code: "basincli_hat",
        label: "Basınç altındaki hat",
        is_real: true,
        x: 68,
        y: 44,
        explanation:
          "Hat henüz izole edilmemiş; blindaj takılmadan iş güvenli sayılmaz.",
      },
      {
        code: "kaygan_zemin",
        label: "Kaygan zemin (yağmur)",
        is_real: true,
        x: 38,
        y: 80,
        explanation:
          "Yağmur nedeniyle metal platform ve merdivenler kaygan.",
      },
      {
        code: "radyan_isi",
        label: "Radyan ısı",
        is_real: false,
        x: 86,
        y: 24,
        explanation: "Bu bölgede sıvı metal veya kızgın yüzey yoktur.",
      },
      {
        code: "askida_yuk",
        label: "Askıda yük",
        is_real: false,
        x: 12,
        y: 18,
        explanation: "Vinç operasyonu henüz başlamamıştır.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity: "Kompansatör yenileme işi öncesi saha ön incelemesi.",
        authority:
          "Kendi ekibinin sahaya girip girmeyeceğine karar verme yetkisi tamdır. Yüklenicinin giriş onayını verme veya erteleme yetkisi vardır. Hattın izolasyonu işletmenin sorumluluğundadır.",
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity: "Hat basıncını düşürme, blindaj hazırlığı.",
        expected_items: [
          "gaz_dedektoru_4li",
          "kacis_maskesi_co",
          "antistatik_ex_kiyafet",
          "fr_kiyafet",
          "baret_en397",
          "ayakkabi_s3",
          "ex_el_feneri",
          "telsiz_atex",
        ],
        current_items: [
          "gaz_dedektoru_4li",
          "kacis_maskesi_co",
          "antistatik_ex_kiyafet",
          "fr_kiyafet",
          "baret_en397",
          "ayakkabi_s3",
          "ex_el_feneri",
          "telsiz_atex",
        ],
      },
      {
        type: "yuklenici",
        employer: "Boru ve kaynak yüklenicisi",
        activity: "Sahaya giriş için onay bekliyor.",
        expected_items: [
          "gaz_dedektoru_4li",
          "kacis_maskesi_co",
          "antistatik_ex_kiyafet",
          "baret_en397",
          "ayakkabi_s3",
          "fr_kiyafet",
          "ex_el_feneri",
          "telsiz_atex",
        ],
        current_items: [
          "baret_en397",
          "ayakkabi_s3",
          "fr_kiyafet",
          "ex_el_feneri",
          "telsiz_atex",
        ],
      },
    ],
    required_self: [
      "gaz_dedektoru_4li",
      "kacis_maskesi_co",
      "antistatik_ex_kiyafet",
      "fr_kiyafet",
      "baret_en397",
      "ayakkabi_s3",
      "ex_el_feneri",
      "telsiz_atex",
      "ruzgar_yonu",
      "kacis_guzergahi",
      "gozetmen",
    ],
    forbidden_self: [
      "standart_is_kiyafeti",
      "kaynak_maskesi",
      "aluminize_giysi",
      "dozimetre",
      "toz_maskesi_ffp3",
      "kursun_onluk",
      "tam_vucut_kemeri",
      "cizme_isi_hi3",
      "gaz_dedektoru_co",
    ],
    contractor_gaps: [
      "gaz_dedektoru_4li",
      "kacis_maskesi_co",
      "antistatik_ex_kiyafet",
    ],
    operator_gaps: [],
    correct_actions: [
      "ekibi_cikar",
      "izin_kontrol",
      "bildir_isletme",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam", "durdur_muteahhit"],
    hints: [
      "Kok gazında tek bir tehlikeli bileşen yoktur. Yanınızdaki dedektör hangi gazları ölçüyor? Sadece CO ölçen bir cihaz burada size yalancı bir güven verir.",
      "İş izni notunu tekrar okuyun: hat henüz izole edilmemiş, blindaj takılmamış ve iki gün önce kaçak bildirimi yapılmış. Bu şartlarda doğru KKD listesini yapmak yeterli midir?",
      "Bazı senaryolarda en doğru karar KKD giyip girmek değil, girmemektir. Şartlar sağlanana kadar ekibinizi geri çekip izin sürecinin tamamlanmasını istemek burada en güçlü davranıştır.",
    ],
    explanation:
      "Bu senaryonun doğru cevabı bir KKD listesi değil, bir karardır. Hat izole edilmemiş, blindaj takılmamış, iş izni hâlâ hazırlık aşamasında ve iki gün önceki kaçağın kalıcı onarımı tamamlanmamış. Bu şartlar altında sahaya girmek, ne kadar iyi donanmış olursanız olun kabul edilemez. Doğru davranış kendi ekibinizi bölgeden çekmek, iş izin şartlarının tamamlanmasını istemek, durumu işletme sorumlusuna bildirmek ve tespiti kayıt altına almaktır. Yüklenicinin giriş onayını bu şartlar sağlanana kadar vermemelisiniz; bu bir işi durdurmak değil, henüz başlamamış bir işe onay vermemektir. Donanım tarafında kritik ayrım şudur: kok gazı yalnızca CO değildir. İçinde H₂S ve patlayıcı karışım da bulunur; bu nedenle sadece CO ve oksijen ölçen kişisel dedektör burada yanıltıcıdır, dört gazlı cihaz gerekir. Patlayıcı ortam nedeniyle tüm elektrikli ekipmanın Ex sertifikalı olması, kıyafetin antistatik olması ve rüzgâr yönüne göre yukarı yönde konumlanılması zorunludur. Kaçış güzergâhı bölgeye girmeden önce belirlenmelidir; sonradan planlanmaz. Yüklenici ekibinde ise gaz ölçüm cihazı, kaçış maskesi ve antistatik kıyafet hiç yok; bu haliyle sahaya alınmaları söz konusu bile olamaz.",
    competency_tags: [
      "gaz_guvenligi",
      "girmeme_karari",
      "is_izni_yonetimi",
      "kkd_secimi",
      "kontrolluk_davranisi",
      "tehlike_tanima",
    ],
  },

  // =========================================================================
  // 5 — Yüksekte / İskele: Kalite Kontrolü
  // =========================================================================
  {
    slug: "yi-iskele-kalite",
    zone_id: "yuksekte_iskele",
    order_index: 1,
    title: "İskelede Kaynak Dikişi Kalite Kontrolü",
    is_draft: false,
    briefing: {
      konum: "Kazan dairesi dış cephe — cephe iskelesi, +12.00 kotu",
      gorev:
        "Boru askı konsollarındaki kaynak dikişlerini iskele üzerinde gözle muayene etmek.",
      isletme_faaliyeti: "İşletme ekibinin bu bölgede aktif çalışması yok.",
      yuklenici_faaliyeti:
        "Müteahhit ekibi iskele üzerinde boru askı montajına devam ediyor.",
      hava: "Rüzgâr 9 m/s, aralıklı sağanak. Zemin ıslak.",
      is_izni: "Yüksekte çalışma izni açık.",
      yukseklik:
        "Çalışma kotu +12.00 m. İskelenin bir bölümünde ara korkuluk sökülmüş.",
      ozel_not:
        "İskele giriş kapısındaki kontrol kartı KIRMIZI etiketli ve tarih üç hafta önce.",
    },
    hazards: [
      {
        code: "dusme",
        label: "Yüksekten düşme",
        is_real: true,
        x: 40,
        y: 40,
        explanation:
          "+12.00 kotta ara korkuluğu sökülmüş açıklık var. Düşme riski doğrudan ölümcüldür.",
      },
      {
        code: "eksik_korkuluk",
        label: "Sökülmüş ara korkuluk",
        is_real: true,
        x: 54,
        y: 34,
        explanation:
          "Toplu koruma eksik. Kişisel koruyucudan önce toplu koruma tamamlanmalıdır.",
      },
      {
        code: "kirmizi_etiket",
        label: "Kırmızı etiketli iskele kartı",
        is_real: true,
        x: 18,
        y: 70,
        explanation:
          "Kırmızı etiket iskelenin kullanıma UYGUN OLMADIĞINI gösterir. Üzerine çıkılmaz.",
      },
      {
        code: "malzeme_dusmesi",
        label: "Yüksekten malzeme düşmesi",
        is_real: true,
        x: 66,
        y: 60,
        explanation:
          "Platform üzerinde bağlanmamış el aleti ve boru parçaları var; alt kot korunmalı.",
      },
      {
        code: "ruzgar",
        label: "Yüksek rüzgâr (9 m/s)",
        is_real: true,
        x: 80,
        y: 22,
        explanation:
          "Rüzgâr hızı yüksekte çalışma için sınır değere yaklaşıyor; malzeme taşımayı riskli kılar.",
      },
      {
        code: "kaygan_zemin",
        label: "Islak ve kaygan platform",
        is_real: true,
        x: 32,
        y: 82,
        explanation: "Sağanak sonrası iskele platformu kaygan.",
      },
      {
        code: "co_gazi",
        label: "Karbonmonoksit",
        is_real: false,
        x: 88,
        y: 50,
        explanation:
          "Dış cephede açık havada gaz birikmesi bu senaryonun riski değildir.",
      },
      {
        code: "sivi_metal_sicrama",
        label: "Sıvı metal sıçraması",
        is_real: false,
        x: 10,
        y: 30,
        explanation: "Bu bölgede sıvı metal işlemi yoktur.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity:
          "Kaynak dikişlerini iskele üzerinde gözle muayene edecek.",
        authority:
          "Kendi güvenliğinden tam sorumludur. Yüklenici üzerinde işi durdurma yetkisi vardır. İskelenin uygunluğunu onaylamak yetkili iskele kurulum sorumlusunun işidir.",
      },
      {
        type: "yuklenici",
        employer: "Mekanik montaj yüklenicisi",
        activity: "İskele üzerinde boru askı montajı.",
        expected_items: [
          "standart_is_kiyafeti",
          "baret_en397",
          "tam_vucut_kemeri",
          "soklu_lanyard",
          "eldiven_mekanik",
          "ayakkabi_s3",
          "gozluk_en166",
        ],
        current_items: [
          "standart_is_kiyafeti",
          "baret_en397",
          "eldiven_mekanik",
          "ayakkabi_s3",
          "gozluk_en166",
        ],
      },
    ],
    required_self: [
      "standart_is_kiyafeti",
      "baret_jugular",
      "tam_vucut_kemeri",
      "cift_kancali_lanyard",
      "ayakkabi_s3",
      "gozluk_en166",
      "eldiven_mekanik",
      "iskele_kontrol_karti",
      "toplu_koruma",
    ],
    forbidden_self: [
      "aluminize_giysi",
      "kaynak_maskesi",
      "temiz_hava_solunum",
      "gaz_dedektoru_4li",
      "dozimetre",
      "kursun_onluk",
      "cizme_isi_hi3",
      "eldiven_kimyasal",
    ],
    contractor_gaps: ["tam_vucut_kemeri", "soklu_lanyard"],
    operator_gaps: [],
    correct_actions: [
      "durdur_muteahhit",
      "bildir_firma",
      "ekibi_cikar",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam"],
    hints: [
      "İskeleye çıkmadan önce bakmanız gereken bir şey var ve o bir KKD değil. Giriş kapısında duruyor.",
      "Kırmızı etiket dikkatli ol demek değildir; bu iskele kullanılamaz demektir. Kemer takmak bu durumu düzeltmez.",
      "Düşme riskinde sıralama nettir: önce toplu koruma (korkuluk), sonra kişisel koruyucu. Sökülmüş korkuluk tamamlanmadan ve iskele yeşil etiketlenmeden ne siz çıkmalısınız ne de yüklenici çalışmaya devam etmelidir.",
    ],
    explanation:
      "Bu senaryonun kilit noktası, iskeleye çıkmadan önce verilen karardır. Giriş kapısındaki kontrol kartı kırmızı etiketli ve üç hafta öncesine ait; bu, iskelenin kullanıma uygun olmadığını gösterir. Kemer takmak, lanyard bağlamak ya da dikkatli olmak bu durumu ortadan kaldırmaz. Üstelik ara korkuluğun bir bölümü sökülmüş durumda. Düşme riskinde koruma sıralaması nettir: önce toplu koruma gelir, kişisel koruyucu sonra devreye girer. Doğru davranış yüklenicinin çalışmasını durdurmak, firma saha sorumlusunu çağırmak, kendi ekibinizi iskeleden ve alt kottan uzak tutmak ve durumu kayıt altına almaktır. İskele yetkili kişi tarafından yeniden kontrol edilip yeşil etiketlenene kadar hiç kimse çıkmamalıdır. Yüklenici ekibinde tam vücut kemeri ve şok emicili lanyard eksiktir; bu haliyle 12 metrede çalışıyor olmaları başlı başına kritik bir ihlaldir. Baret tipi (endüstriyel veya çene kayışlı) saha standardıdır, eksik sayılmaz. Kendi donanımınıza gelince: ısı ve kıvılcım yoksa standart iş kıyafeti yeter; iskeleye çıkılacaksa baret, tam vücut kemeri ve yatay hareket için çift kancalı lanyard gerekir. Bu bölgede gaz dedektörü, alüminize giysi veya dozimetre gibi ekipmanlar gereksizdir; dikkati dağıtır ve hareketi kısıtlar.",
    competency_tags: [
      "yuksekte_calisma",
      "toplu_koruma_onceligi",
      "iskele_kontrolu",
      "isi_durdurma_karari",
      "kontrolluk_davranisi",
    ],
  },

  // =========================================================================
  // 6 — Radyografi: Sahaya Yaklaşım
  // =========================================================================
  {
    slug: "rg-sahaya-yaklasim",
    zone_id: "radyografi",
    order_index: 1,
    title: "Radyografi Sahasına Yaklaşım",
    is_draft: false,
    briefing: {
      konum: "Boru köprüsü B hattı — tahribatsız muayene çalışma alanı",
      gorev:
        "Kaynak dikişlerinin radyografik muayene sonuçlarını yerinde takip etmek.",
      isletme_faaliyeti:
        "İşletme ekibi komşu hatta rutin tur atıyor; radyografiden haberdar değil görünüyor.",
      yuklenici_faaliyeti:
        "Müteahhit NDT ekibi gama kaynağı ile film çekimi yapıyor; kaynak dışarıda.",
      hava: "Açık hava, gündüz vardiyası.",
      is_izni:
        "Radyografi çalışma bildirim formu düzenlenmiş ancak saha personeline duyurulmamış.",
      ozel_not:
        "İzole alan şeridi çekilmiş fakat bir kenarı açık; uyarı levhası yerde duruyor. İkaz lambası yanıyor.",
    },
    hazards: [
      {
        code: "radyasyon",
        label: "İyonlaştırıcı radyasyon (gama)",
        is_real: true,
        x: 50,
        y: 46,
        explanation:
          "Gama kaynağı dışarıda ve aktif. Görülmez, hissedilmez; tek etkili tedbir mesafe, süre ve zırhlamadır.",
      },
      {
        code: "acik_izolasyon",
        label: "İzole alanın açık kenarı",
        is_real: true,
        x: 30,
        y: 62,
        explanation:
          "Bariyerin bir kenarı açık; habersiz kişiler alana girebilir.",
      },
      {
        code: "eksik_isaretleme",
        label: "Yerde duran uyarı levhası",
        is_real: true,
        x: 68,
        y: 74,
        explanation:
          "Uyarı levhası görev yapmıyor. İşaretleme, alan kontrolünün ayrılmaz parçasıdır.",
      },
      {
        code: "habersiz_personel",
        label: "Habersiz işletme personeli",
        is_real: true,
        x: 80,
        y: 36,
        explanation:
          "Komşu hatta tur atan ekip çekimden haberdar değil; bildirim yapılmamış.",
      },
      {
        code: "yuksek_kot",
        label: "Boru köprüsü kot farkı",
        is_real: true,
        x: 42,
        y: 22,
        explanation: "Boru köprüsü üzerinde çalışma yüksekte yapılıyor.",
      },
      {
        code: "co_gazi",
        label: "Karbonmonoksit",
        is_real: false,
        x: 14,
        y: 40,
        explanation:
          "Açık havada boru köprüsünde gaz birikmesi bu senaryonun riski değildir.",
      },
      {
        code: "radyan_isi",
        label: "Radyan ısı",
        is_real: false,
        x: 90,
        y: 66,
        explanation: "Bu bölgede sıcak proses yoktur.",
      },
      {
        code: "kaynak_dumani",
        label: "Kaynak dumanı",
        is_real: false,
        x: 20,
        y: 16,
        explanation: "Çekim sırasında kaynak yapılmamaktadır.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity: "Radyografik muayene sonuçlarını takip edecek.",
        authority:
          "Alana girmeme kararı tamamen kendisine aittir. Yüklenici NDT ekibinin çalışmasını durdurma yetkisi vardır. İşletme personelini uyarmak için işletme sorumlusuna bildirim yapar.",
      },
      {
        type: "yuklenici",
        employer: "Tahribatsız muayene yüklenicisi",
        activity: "Gama kaynağı ile film çekimi.",
        expected_items: [
          "dozimetre",
          "alan_bariyeri",
          "radyografi_calisma_formu",
          "guvenli_mesafe",
          "baret_en397",
          "ayakkabi_s3",
          "standart_is_kiyafeti",
        ],
        current_items: [
          "dozimetre",
          "baret_en397",
          "ayakkabi_s3",
          "guvenli_mesafe",
          "standart_is_kiyafeti",
        ],
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity: "Komşu hatta rutin tur.",
        expected_items: [
          "baret_en397",
          "ayakkabi_s3",
          "reflektorlu_yelek",
          "standart_is_kiyafeti",
        ],
        current_items: [
          "baret_en397",
          "ayakkabi_s3",
          "reflektorlu_yelek",
          "standart_is_kiyafeti",
        ],
      },
    ],
    required_self: [
      "standart_is_kiyafeti",
      "guvenli_mesafe",
      "alan_bariyeri",
      "radyografi_calisma_formu",
      "dozimetre",
      "baret_en397",
      "ayakkabi_s3",
    ],
    forbidden_self: [
      "kursun_onluk",
      "temiz_hava_solunum",
      "aluminize_giysi",
      "kaynak_maskesi",
      "tam_vucut_kemeri",
      "gaz_dedektoru_4li",
      "toz_maskesi_ffp3",
      "yuz_siperi",
    ],
    contractor_gaps: ["alan_bariyeri", "radyografi_calisma_formu"],
    operator_gaps: [],
    correct_actions: [
      "ekibi_cikar",
      "durdur_muteahhit",
      "bildir_isletme",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam"],
    hints: [
      "Ekipman listesine bakmadan önce şunu düşünün: bu tehlikeye karşı giyilebilecek bir KKD var mı?",
      "Kurşun önlük tıbbi röntgen içindir. Endüstriyel gama kaynağının enerjisi bambaşkadır; o önlük burada sizi korumaz, sadece korunduğunuzu sanmanıza yol açar.",
      "Radyasyonda üç tedbir vardır: mesafe, süre ve zırhlama. Sizin elinizdeki tek gerçek tedbir mesafedir, yani alana GİRMEMEK. Ayrıca izolasyonun açık kenarı ve habersiz işletme ekibi acil müdahale gerektirir.",
    ],
    explanation:
      "Bu senaryodaki en yaygın hata, hangi koruyucuyu giyip gireyim sorusuyla başlamaktır. Doğru soru şudur: girmeli miyim? İyonlaştırıcı radyasyona karşı sahada giyilebilecek etkili bir kişisel koruyucu yoktur. Kurşun önlük tıbbi röntgen enerjileri için tasarlanmıştır; endüstriyel gama kaynağı karşısında koruma sağlamaz ve yalnızca yanlış bir güven duygusu üretir. Elinizdeki gerçek tedbirler mesafe, maruziyet süresi ve zırhlamadır. Dolayısıyla doğru karar izole alana girmemek ve kendi ekibinizi güvenli mesafeye çekmektir. Sahada ayrıca iki ciddi eksik var: izolasyon bariyerinin bir kenarı açık ve uyarı levhası yerde duruyor; ayrıca radyografi bildirim formu düzenlenmiş olmasına rağmen saha personeline duyurulmamış, komşu hatta tur atan işletme ekibi durumdan habersiz. Bu koşullarda NDT ekibinin çalışmasını durdurmak, alan izolasyonu ve bildirim tamamlanana kadar çekime izin vermemek gerekir. Habersiz işletme personeli için doğru kanal, doğrudan müdahale değil işletme sorumlusuna acil bildirimdir. Dozimetre taşımak bir koruma değil kayıt aracıdır; alana yaklaşan yetkili personelin maruziyetini izlemesini sağlar. Tüm bu tespitlerin kayıt altına alınması, benzer bir eksikliğin tekrarını önlemenin en etkili yoludur.",
    competency_tags: [
      "radyasyon_guvenligi",
      "girmeme_karari",
      "alan_izolasyonu",
      "bildirim_kanallari",
      "kontrolluk_davranisi",
    ],
  },

  // =========================================================================
  // Kalan senaryolar — tamamı açık ve oynanabilir
  // =========================================================================
  // Yüksek Fırın (toplam 5)
  openScenario("yf-tapa-makinesi", "yuksek_firin", 2, "Tapa Makinesi Bakım Denetimi"),
  openScenario("yf-cruf-granulasyon", "yuksek_firin", 3, "Cüruf Granülasyon Hattı Turu"),
  openScenario("yf-sarj-kati", "yuksek_firin", 4, "Şarj Katı Malzeme Besleme"),
  openScenario("yf-toz-tutma", "yuksek_firin", 5, "Toz Tutma Ünitesi Bakımı"),

  // Çelikhane (toplam 5)
  openScenario("ch-pota-ocagi", "celikhane", 3, "Pota Ocağı Elektrot Değişimi"),
  openScenario("ch-konvertor-refrakter", "celikhane", 4, "Konvertör Refrakter Örümü"),
  openScenario("ch-surekli-dokum", "celikhane", 5, "Sürekli Döküm Segment Değişimi"),

  // Kok Fabrikası (toplam 3)
  openScenario("kk-batarya-ustu", "kok_fabrikasi", 1, "Kok Bataryası Üstü Turu"),
  openScenario("kk-sondurme-kulesi", "kok_fabrikasi", 2, "Söndürme Kulesi İncelemesi"),
  openScenario("kk-gaz-arindirma", "kok_fabrikasi", 3, "Gaz Arıtma Ünitesi Bakımı"),

  // Sinter (toplam 2)
  openScenario("sn-eleme-hatti", "sinter", 1, "Eleme Hattı Toz Kontrolü"),
  openScenario("sn-konveyor-bakim", "sinter", 2, "Konveyör Bant Bakımı"),

  // Haddehane (toplam 4)
  openScenario("hd-sicak-serit", "haddehane", 1, "Sıcak Şerit Hattı Gözlemi"),
  openScenario("hd-merdane-degisimi", "haddehane", 2, "Merdane Değişimi Denetimi"),
  openScenario("hd-hidrolik-unite", "haddehane", 3, "Hidrolik Ünite Bakımı"),
  openScenario("hd-tav-firini", "haddehane", 4, "Tav Fırını Bakım Denetimi"),

  // Enerji Merkezi (toplam 2)
  openScenario("en-salt-sahasi", "enerji_elektrik", 1, "Şalt Sahası Yaklaşma Mesafesi"),
  openScenario("en-trafo-binasi", "enerji_elektrik", 2, "Trafo Binası Bakım Denetimi"),

  // Gaz Hatları (toplam 3)
  openScenario("gh-vana-istasyonu", "gaz_hatlari", 2, "Vana İstasyonu Devreye Alma"),
  openScenario("gh-kacak-mudahale", "gaz_hatlari", 3, "Gaz Kaçağı İhbarına Müdahale"),

  // Liman (toplam 2)
  openScenario("lm-gemi-bosaltma", "liman_stok", 1, "Gemi Boşaltma Operasyonu"),
  openScenario("lm-stok-sahasi-trafik", "liman_stok", 2, "Stok Sahası Araç Trafiği"),

  // Yüksekte/İskele (toplam 2)
  openScenario("yi-cati-calismasi", "yuksekte_iskele", 2, "Çatı Üzeri Sac Yenileme"),

  // Kapalı Alan (toplam 1)
  openScenario("ka-tank-girisi", "kapali_alan", 1, "Gaz Tankı İçi Kapalı Hacim Girişi"),
];

/**
 * Zaman Makinesi senaryoları — gerçek olaylardan türetilir.
 *
 * Eğitim müfredatından ayrı bir havuzdur: bölge kartlarında listelenmez ve
 * "30 Senaryo" metriğini artırmaz. `zone_id` yalnızca veri bütünlüğü ve
 * tehlike sahnesi teması için doldurulur, arayüzde kategori olarak kullanılmaz.
 *
 * Anlatım rol üzerinden kurulur: kişi adı, sicil numarası ve firma adı geçmez.
 */
export const TIME_MACHINE_SCENARIOS: Scenario[] = [
  // =========================================================================
  // TM-1 — Kok gazı hattında flanş bütünlüğü (21.08.2026)
  // =========================================================================
  {
    slug: "tm-kok-gazi-flans-butunlugu",
    zone_id: "haddehane",
    order_index: 1,
    title: "Kok Gazı Hattı — Flanş Bütünlüğü Riski",
    is_draft: false,
    scenario_type: "time_machine",
    incident_date: "2026-08-21",
    incident_unit: "Sıcak Haddehane Müdürlüğü",
    briefing: {
      konum:
        "Slab fırınları arası kok gazı ana hattı — basınç transmitteri bölgesi",
      gorev:
        "Basınç dalgalanması bildirilen kok gazı hattında yüklenici ekibinin yaklaşma hazırlığını denetlemek ve girişe onay verip vermeyeceğine karar vermek.",
      isletme_faaliyeti:
        "İşletme ekibi transmitter okumalarını panelden izliyor; hattın basıncı henüz düşürülmedi, blindaj takılmadı.",
      yuklenici_faaliyeti:
        "Müteahhit ekibi temiz hava solunum maskesi, poşet ve tel ile hatta yaklaşıp geçici sızdırmazlık uygulamaya hazırlanıyor.",
      hava: "Rüzgâr batıdan 3 m/s, değişken. Dış ortam sıcaklığı 29°C.",
      is_izni:
        "Gazlı sahada çalışma izni HENÜZ TAMAMLANMADI. Hat basınç altında, izolasyon yok.",
      gaz: "Kok gazı: CO, H₂S ve patlayıcı karışım (LEL) riski bir arada.",
      sicaklik:
        "Slab fırınları çalışıyor; hat güzergâhında yüzey sıcaklıkları yüksek.",
      ozel_not:
        "Basınç transmitterlerinde dalgalanma tespit edildi. Dalgalanma, hattın kendisiyle ilgili bir uyarıdır; ölçüm cihazı arızası varsayılarak yaklaşılmamalıdır.",
    },
    hazards: [
      {
        code: "basincli_hat",
        label: "Basınç altındaki hat",
        is_real: true,
        x: 52,
        y: 44,
        explanation:
          "Hat izole edilmemiş ve blindaj takılmamıştır. Basınç altındaki bir bağlantı, üzerinde çalışılabilir bir ekipman değildir.",
      },
      {
        code: "flans_butunlugu",
        label: "Flanş / bağlantı bütünlüğü şüphesi",
        is_real: true,
        x: 62,
        y: 36,
        explanation:
          "Basınç dalgalanması, korozyon veya mekanik yorulma nedeniyle zayıflamış bir bağlantının habercisi olabilir. Ani kırılma riski vardır.",
      },
      {
        code: "co_gazi",
        label: "Karbonmonoksit (CO)",
        is_real: true,
        x: 30,
        y: 52,
        explanation:
          "Kok gazının ana bileşenlerinden biridir; renksiz, kokusuz ve öldürücüdür.",
      },
      {
        code: "h2s",
        label: "Hidrojen sülfür (H₂S)",
        is_real: true,
        x: 40,
        y: 28,
        explanation:
          "Yüksek konsantrasyonda koku alma duyusunu felce uğratır; kokunun kesilmesi tehlikenin bittiği anlamına gelmez.",
      },
      {
        code: "patlayici_ortam",
        label: "Patlayıcı ortam (LEL)",
        is_real: true,
        x: 70,
        y: 58,
        explanation:
          "Kok gazı hava ile patlayıcı karışım oluşturur. Ex sertifikasız ekipman ve statik yük taşıyan kıyafet sokulamaz.",
      },
      {
        code: "radyan_isi",
        label: "Radyan ısı (slab fırınları)",
        is_real: true,
        x: 18,
        y: 34,
        explanation:
          "Fırınlar çalışır durumdadır; güzergâhtaki yüzey sıcaklıkları temas yanığı üretebilir.",
      },
      {
        code: "askida_yuk",
        label: "Askıda yük",
        is_real: false,
        x: 86,
        y: 20,
        explanation:
          "Bu bölgede vinç operasyonu yoktur; malzeme elle taşınmaktadır.",
      },
      {
        code: "dusme_riski",
        label: "Yüksekten düşme",
        is_real: false,
        x: 12,
        y: 76,
        explanation:
          "Çalışma zemin kotundadır; kot farkı veya açık boşluk bulunmamaktadır.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity:
          "Yüklenici ekibinin hatta yaklaşma hazırlığını denetlemek ve giriş onayı kararını vermek.",
        authority:
          "Kendi ekibiniz üzerinde tam yetkilisiniz. Yüklenici çalışmasını durdurma yetkiniz sözleşme kapsamındadır. Hattın basıncını düşürmek ve izole etmek işletmenin sorumluluğundadır; işletme personeline doğrudan talimat veremezsiniz.",
      },
      {
        type: "yuklenici",
        employer: "Müteahhit firma",
        activity:
          "Temiz hava solunum maskesi, poşet ve tel ile hatta yaklaşıp geçici sızdırmazlık uygulamak.",
        expected_items: [
          "gaz_dedektoru_4li",
          "antistatik_ex_kiyafet",
          "temiz_hava_solunum",
          "baret_en397",
          "ayakkabi_s3",
          "alan_bariyeri",
        ],
        current_items: ["temiz_hava_solunum", "baret_en397", "ayakkabi_s3"],
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity:
          "Transmitter okumalarını panelden izlemek, basınç düşürme ve blindaj hazırlığını yürütmek.",
        expected_items: [
          "gaz_dedektoru_4li",
          "kacis_maskesi_co",
          "antistatik_ex_kiyafet",
          "baret_en397",
          "ayakkabi_s3",
        ],
        current_items: [
          "gaz_dedektoru_4li",
          "kacis_maskesi_co",
          "antistatik_ex_kiyafet",
          "baret_en397",
          "ayakkabi_s3",
        ],
      },
    ],
    required_self: [
      "gaz_dedektoru_4li",
      "kacis_maskesi_co",
      "antistatik_ex_kiyafet",
      "fr_kiyafet",
      "baret_en397",
      "ayakkabi_s3",
      "ex_el_feneri",
      "telsiz_atex",
      "ruzgar_yonu",
      "kacis_guzergahi",
      "guvenli_mesafe",
      "gozetmen",
    ],
    forbidden_self: [
      "standart_is_kiyafeti",
      "gaz_dedektoru_co",
      "toz_maskesi_ffp3",
      "kaynak_maskesi",
      "aluminize_giysi",
      "kursun_onluk",
      "dozimetre",
      "tam_vucut_kemeri",
      "can_yelegi",
      "cizme_isi_hi3",
    ],
    contractor_gaps: [
      "gaz_dedektoru_4li",
      "antistatik_ex_kiyafet",
      "alan_bariyeri",
    ],
    operator_gaps: [],
    correct_actions: [
      "durdur_muteahhit",
      "ekibi_cikar",
      "bildir_isletme",
      "izin_kontrol",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam"],
    hints: [
      "Basınç dalgalanması neyin habercisidir? Ölçüm cihazının arızası mı, yoksa ölçtüğü hattın kendisinin bir sorunu mu? Bu ayrım, yaklaşıp yaklaşmama kararının tamamını belirler.",
      "Yüklenicinin hazırlığına bakın: temiz hava solunum maskesi neye karşı korur? Solunan gaza mı, yoksa basınç altındaki bir bağlantının ani kırılmasına mı? Doğru KKD yanlış bir kararı güvenli hale getirmez.",
      "Gazlı sahada çalışma izni henüz tamamlanmadı ve hat basınç altında. Bu şartlarda en güçlü kontrollük davranışı, donanımı tamamlatıp yaklaşmak değil; yaklaşımı durdurup ekibi geri çekmek ve hattın basıncının düşürülmesini istemektir.",
    ],
    explanation:
      "Bu senaryonun doğru cevabı bir KKD listesi değil, bir yaklaşma kararıdır. Basınç transmitterindeki dalgalanma, ölçüm cihazının değil ölçtüğü hattın bir uyarısıdır: korozyon veya mekanik yorulma nedeniyle zayıflamış bir bağlantı, basınç altında herhangi bir anda kırılabilir. Temiz hava solunum maskesi gaz solunmasına karşı gerçekten koruyucudur; ancak ani mekanik kırılmaya, basınçla savrulan parçaya ve anlık yüksek konsantrasyon bulutuna karşı hiçbir koruma sağlamaz. Bu yüzden maskeyi takıp yaklaşma akıl yürütmesi burada hatalıdır. Doğru davranış zinciri şudur: yüklenicinin yaklaşımını durdurmak, kendi ekibinizi güvenli mesafeye çekmek, hattın basıncının düşürülmesi ve izolasyonun sağlanması için işletme sorumlusuna bildirim yapmak, gazlı sahada çalışma izninin şartlarını yeniden kontrol ettirmek ve tespiti kayıt altına almak. Gözleme devam etmek, riskin kendiliğinden geçmesini beklemek anlamına gelir ve bu senaryoda açıkça yanlıştır. Donanım tarafında kritik ayrım, kok gazının yalnızca CO olmadığıdır: içinde H₂S ve patlayıcı karışım da bulunur, bu nedenle tek gazlı dedektör yanıltıcıdır ve dört gazlı cihaz gerekir. Patlayıcı ortam nedeniyle kıyafetin antistatik, elektrikli ekipmanın Ex sertifikalı olması zorunludur. Yüklenici ekibinde gaz ölçüm cihazı, antistatik kıyafet ve alan bariyeri hiç yoktur; bu haliyle hatta yaklaşmaları söz konusu olamaz.",
    competency_tags: [
      "gaz_guvenligi",
      "tehlike_tanima",
      "isi_durdurma_karari",
      "is_izni_yonetimi",
      "muteahhit_denetimi",
      "kontrolluk_davranisi",
    ],
    incident_outcome:
      "Basınç dalgalanması tespit edildikten sonra kontrol amacıyla bölgeye gidildi. Temiz hava solunum maskesi, poşet ve tel talep edildi. Malzemeler getirilirken basınç transmitterinin bağlı olduğu boru/flanş bağlantısı kırıldı. Ortama yayılan gazdan üç çalışan etkilendi.",
    incident_lesson:
      "Basınç dalgalanması, korozyon veya mekanik yorulma nedeniyle zayıflamış bir bağlantının habercisi olabilir. Solunum koruması gaz maruziyetine karşı işe yarar, ancak ani mekanik kırılmaya karşı koruma sağlamaz. Doğru davranış yaklaşmayı durdurmak, hattı basınçsız hale getirtmek ve ekipman bütünlüğünü doğrulatmaktır.",
    is_published: true,
  },

  // =========================================================================
  // TM-2 — Zemin sacı çökmesi (18.07.2026)
  // =========================================================================
  {
    slug: "tm-zemin-saci-cokmesi",
    zone_id: "kok_fabrikasi",
    order_index: 2,
    title: "Zemin Sacı Çökmesi — Gizli Yapısal Hasar",
    is_draft: false,
    scenario_type: "time_machine",
    incident_date: "2026-07-18",
    incident_unit: "Kok Fabrikası Müdürlüğü",
    briefing: {
      konum: "1 ve 2 numaralı tanklar arası üst kat platformu, +6,30 kotu",
      gorev:
        "Hasarlı zemin sacının değişimi öncesi yapılan izolasyon söküm çalışmasını denetlemek ve çalışma alanının güvenli olup olmadığına karar vermek.",
      isletme_faaliyeti:
        "İşletme ekibi alt kotta tank çevresi rutin kontrolünü sürdürüyor; üst kat çalışmasına müdahil değil.",
      yuklenici_faaliyeti:
        "Müteahhit ekibi zemin sacı değişimi için üst katta izolasyon sökümü yapıyor; malzemeyi taşırken zemin üzerinde serbestçe hareket ediyor.",
      hava: "Kapalı, nemli. Platform yüzeyinde yer yer nem birikmesi var.",
      is_izni:
        "Yüksekte çalışma izni açık; ancak zeminin yapısal doğrulaması izin kapsamında YER ALMIYOR.",
      yukseklik:
        "Çalışma kotu +6,30 m. Alt kot beton zemin; araya yakalayıcı platform veya ağ konulmamış.",
      ozel_not:
        "Zemin sacında hasar olduğu biliniyor — zaten bu yüzden değiştirilecek. Şüpheli bölge bariyerle çevrilmemiş ve yetkili kişi tarafından yapısal doğrulamadan geçmemiş.",
    },
    hazards: [
      {
        code: "yapisal_butunluk",
        label: "Zemin sacında gizli yapısal hasar",
        is_real: true,
        x: 46,
        y: 58,
        explanation:
          "Gözle sağlam görünen sac, alt yüzeydeki korozyon veya ısıl yorulma nedeniyle taşıma kapasitesini kaybetmiş olabilir. Üstüne basılarak test edilmez.",
      },
      {
        code: "dusme_riski",
        label: "Yüksekten düşme (+6,30 m)",
        is_real: true,
        x: 58,
        y: 44,
        explanation:
          "Zemin çökmesi durumunda alt kota serbest düşme gerçekleşir; bu yükseklik ağır yaralanma için fazlasıyla yeterlidir.",
      },
      {
        code: "toplu_koruma_yoklugu",
        label: "Toplu koruma yok (bariyer / ağ / yakalayıcı platform)",
        is_real: true,
        x: 30,
        y: 66,
        explanation:
          "Şüpheli bölge çevrelenmemiş ve altına yakalayıcı sistem konmamıştır. Toplu koruma, kişisel korumadan önce gelir.",
      },
      {
        code: "ankraj_yoklugu",
        label: "Bağlanacak ankraj / yaşam hattı yok",
        is_real: true,
        x: 70,
        y: 30,
        explanation:
          "Kemer takmak tek başına yeterli değildir; bağlanacak uygun bir ankraj noktası veya yatay yaşam hattı bulunmalıdır.",
      },
      {
        code: "kaygan_zemin",
        label: "Nemli / kaygan platform yüzeyi",
        is_real: true,
        x: 22,
        y: 80,
        explanation:
          "Nem birikmesi metal yüzeyde tutunmayı azaltır; dengesini kaybeden bir kişi hasarlı bölgeye basabilir.",
      },
      {
        code: "malzeme_dusmesi",
        label: "Alt kota malzeme düşmesi",
        is_real: true,
        x: 82,
        y: 70,
        explanation:
          "Sökülen izolasyon parçaları alt kota düşebilir; alt kotta işletme ekibi çalışmaktadır.",
      },
      {
        code: "patlayici_ortam",
        label: "Patlayıcı ortam (LEL)",
        is_real: false,
        x: 12,
        y: 24,
        explanation:
          "Tanklar boşaltılmış ve havalandırılmıştır; bu çalışma için gazlı ortam şartı oluşmamıştır.",
      },
      {
        code: "radyan_isi",
        label: "Radyan ısı",
        is_real: false,
        x: 90,
        y: 16,
        explanation:
          "Bu platformda kızgın yüzey veya sıvı metal bulunmamaktadır.",
      },
    ],
    actors: [
      {
        type: "kontrolluk",
        employer: "Erdemir Mühendislik",
        activity:
          "Zemin sacı değişimi öncesi izolasyon söküm çalışmasını denetlemek.",
        authority:
          "Yüklenici çalışmasını durdurma yetkiniz sözleşme kapsamındadır. Zeminin yapısal doğrulamasını yaptırma talebini yüklenici firma saha sorumlusuna iletirsiniz. İşletme personelinin alt kottaki çalışmasına doğrudan talimat veremezsiniz.",
      },
      {
        type: "yuklenici",
        employer: "Müteahhit firma",
        activity:
          "Üst katta izolasyon sökümü ve hasarlı zemin sacının değişime hazırlanması.",
        expected_items: [
          "tam_vucut_kemeri",
          "cift_kancali_lanyard",
          "yatay_yasam_hatti",
          "toplu_koruma",
          "alan_bariyeri",
          "baret_jugular",
          "ayakkabi_s3",
          "eldiven_mekanik",
        ],
        current_items: [
          "baret_jugular",
          "ayakkabi_s3",
          "eldiven_mekanik",
          "alan_bariyeri",
        ],
      },
      {
        type: "isletme",
        employer: "Demir çelik işletmesi",
        activity: "Alt kotta tank çevresi rutin kontrolü.",
        expected_items: ["baret_en397", "ayakkabi_s3", "standart_is_kiyafeti"],
        current_items: ["baret_en397", "ayakkabi_s3", "standart_is_kiyafeti"],
      },
    ],
    required_self: [
      "baret_jugular",
      "gozluk_en166",
      "eldiven_mekanik",
      "ayakkabi_s3",
      "standart_is_kiyafeti",
      "tam_vucut_kemeri",
      "cift_kancali_lanyard",
      "yatay_yasam_hatti",
      "toplu_koruma",
      "alan_bariyeri",
      "gozetmen",
    ],
    forbidden_self: [
      "kaynak_maskesi",
      "aluminize_giysi",
      "kaynakci_onlugu",
      "kursun_onluk",
      "dozimetre",
      "cizme_isi_hi3",
      "can_yelegi",
      "temiz_hava_solunum",
      "eldiven_kaynak",
    ],
    contractor_gaps: [
      "tam_vucut_kemeri",
      "cift_kancali_lanyard",
      "yatay_yasam_hatti",
      "toplu_koruma",
    ],
    operator_gaps: [],
    correct_actions: [
      "durdur_muteahhit",
      "izin_kontrol",
      "bildir_firma",
      "kayit_al",
    ],
    wrong_actions: ["gozleme_devam"],
    hints: [
      "Çalışmanın konusunu tekrar okuyun: değiştirilecek olan şey, üzerinde durulan zeminin kendisi. Hasarlı olduğu zaten biliniyorsa, o zemine basılarak çalışılabilir mi?",
      "İş izni yüksekte çalışma için açık; ancak izin kapsamında ne YOK? Zeminin taşıma kapasitesini kimin doğruladığı yazıyor mu? İzni olan her iş, her koşulda güvenli değildir.",
      "Sıralamayı düşünün: önce toplu koruma mı, önce kişisel koruma mı? Şüpheli bölge bariyerle çevrilmeden ve yapısal doğrulama yapılmadan kemer takmak, riski ortadan kaldırmaz; yalnızca sonucunu hafifletmeyi umar.",
    ],
    explanation:
      "Bu senaryoda tehlike, görülmesi en zor olan türdendir: zemin gözle sağlam görünür, ama alt yüzeyindeki korozyon ve ısıl yorulma taşıma kapasitesini çoktan bitirmiş olabilir. Kritik mantık hatası, hasarlı olduğu bilinen bir zeminin üzerinde durarak o zemini değiştirmeye çalışmaktır. Doğru sıralama toplu korumanın kişisel korumadan önce gelmesidir: şüpheli bölge işe başlamadan önce bariyerle çevrilmeli, yetkili kişi tarafından yapısal doğrulama yapılmalı, gerekiyorsa alta yakalayıcı platform veya ağ kurulmalıdır. Kişisel koruma bunların yerine geçmez, üzerine eklenir; üstelik tam vücut kemeri ancak bağlanacak uygun bir ankraj veya yatay yaşam hattı varsa anlamlıdır, ki burada o da yoktur. Yüksekte çalışma izninin açık olması yanıltıcıdır: izin kapsamında zeminin taşıma kapasitesinin doğrulanması yer almamaktadır, dolayısıyla izin bu riski karşılamamaktadır. Doğru kontrollük davranışı yüklenici çalışmasını durdurmak, iş izin şartlarını yapısal doğrulamayı da kapsayacak şekilde yeniden kontrol ettirmek, eksikliğin giderilmesi sorumluluğunu yüklenici firma saha sorumlusuna vermek ve tespiti kayıt altına almaktır. Alt kotta işletme ekibi bulunduğundan malzeme düşmesine karşı alan izolasyonu da ihmal edilmemelidir.",
    competency_tags: [
      "yuksekte_calisma",
      "toplu_koruma_onceligi",
      "tehlike_tanima",
      "alan_izolasyonu",
      "isi_durdurma_karari",
      "muteahhit_denetimi",
    ],
    incident_outcome:
      "Hasarlı zemin sacının değişimi için izolasyon sökümü yapılırken, çalışan hasarlı zemin sacına bastı. Sac çöktü ve yaklaşık 6,3 metre yükseklikten düşme gerçekleşti.",
    incident_lesson:
      "Görünüşte sağlam duran zemin sacları, alt yüzeydeki korozyon veya ısıl yorulma nedeniyle taşıma kapasitesini kaybetmiş olabilir. Çalışma alanının yapısal bütünlüğü işe başlamadan önce yetkili kişi tarafından doğrulanmalı, şüpheli bölgeler bariyerle çevrilmeli ve düşmeye karşı toplu koruma sağlanmalıdır.",
    is_published: true,
  },
];

SCENARIOS.push(...TIME_MACHINE_SCENARIOS);

export const SCENARIO_BY_SLUG = new Map(SCENARIOS.map((s) => [s.slug, s]));

export const PLAYABLE_SCENARIOS = SCENARIOS;

/** Yetkinlik kodlarının okunabilir Türkçe karşılıkları (Gelişim Raporu için). */
export const COMPETENCY_LABELS: Record<string, string> = {
  gaz_guvenligi: "Gaz güvenliği ve ölçüm",
  kkd_secimi: "Doğru KKD seçimi",
  is_izni_yonetimi: "İş izni ve şart doğrulama",
  kontrolluk_davranisi: "Kontrollük davranışı",
  tehlike_tanima: "Tehlike tanıma",
  yetki_sinirlari: "Yetki sınırlarını gözetme",
  bildirim_kanallari: "Doğru bildirim kanalı seçimi",
  isi_sicrama_korunmasi: "Isı ve sıçrama korunması",
  muteahhit_denetimi: "Müteahhit denetimi",
  sicak_is_yonetimi: "Sıcak iş yönetimi",
  isi_durdurma_karari: "İşi durdurma kararı",
  girmeme_karari: "Alana girmeme kararı",
  yuksekte_calisma: "Yüksekte çalışma",
  toplu_koruma_onceligi: "Toplu koruma önceliği",
  iskele_kontrolu: "İskele kontrolü",
  radyasyon_guvenligi: "Radyasyon güvenliği",
  alan_izolasyonu: "Alan izolasyonu ve işaretleme",
};

export function competencyLabel(code: string): string {
  return COMPETENCY_LABELS[code] ?? code;
}
