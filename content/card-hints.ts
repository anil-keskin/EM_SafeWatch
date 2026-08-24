import type { DecisionTab } from "@/lib/types";

/**
 * Karar paneli kart ipuçları.
 * Senaryonun doğru cevabını vermez; kullanıcının "bu kartı ne zaman
 * işaretlerim?" sorusuna pratik yanıt üretir. HintBox puan kademesinden ayrıdır.
 */

export const TAB_SELECT_CONTEXT: Record<DecisionTab, string> = {
  self: "Kendi üzerinizde veya sizin aldığınız tedbir olarak işaretleyin. Maruziyetiniz bu kartla kesiliyorsa seçin; görevinizde yoksa seçmeyin.",
  contractor:
    "Yüklenicide EKSİK veya uygunsuz gördüğünüzde işaretleyin. Sizde olanı değil, onda olmayanı seçin. Hepsi yerindeyse bu sekmeyi boş bırakın.",
  operator:
    "İşletme sahasında eksik veya uygunsuz gördüğünüzde işaretleyin. İşletmeye talimat vermezsiniz; tespiti işaretlersiniz. Uygunsuzluk yoksa boş bırakın.",
  action:
    "Tespitten sonra sizin atacağınız adım buysa seçin. Yetkiniz yoksa, risk yoksa veya başka bir kanal doğruysa seçmeyin.",
};

/** Ekipman / tedbir kartları: ne zaman seçilir. */
export const EQUIPMENT_WHY_SELECT: Record<string, string> = {
  baret_en397:
    "Sahaya adım atıyorsanız seçin. Düşen parça ve çarpma her bölgede vardır; baret temel saha kuralıdır.",
  baret_jugular:
    "Eğilme, iskele, çatı veya baş aşağı çalışma varsa seçin. Kayışsız baret bu hareketlerde düşer.",
  baret_en14052:
    "Yandan darbe veya dar geçitlerde başın sıkışma riski yüksekse seçin. Rutin yürüyüş turunda genelde gerekmez.",
  gozluk_en166:
    "Toz, tufal, kıvılcım veya uçuşan parça varsa seçin. Sıvı metal ve kaynak arkı için yetmez; onları ayrı kartlardan bakın.",
  gozluk_ir:
    "Kızgın yüzey, döküm kanalı veya sıvı metal ışınımı varsa seçin. Kaynak arkı için kaynakçı maskesi gerekir.",
  yuz_siperi:
    "Sıçrama veya radyan ısı yüze geliyorsa seçin. Gözlüğün üstüne ekleyin; tek başına gözü kapatmaz.",
  kaynak_maskesi:
    "Siz veya denetlediğiniz kişi ark kaynağı yapıyorsa seçin. Yalnızca gözlemliyorsanız seçmeyin; görüşü keser ve gerekmez.",
  kacis_maskesi_co:
    "CO üretilebilecek kapalı veya gaz riskli bölgeye giriyorsanız seçin. İçeride çalışmaya devam etmek için değil, çıkış içindir.",
  toz_maskesi_ffp3:
    "Refrakter, silika veya ince toz varsa seçin. Gaz kokusu veya CO şüphesinde işe yaramaz.",
  yarim_yuz_maske:
    "Bilinen gaz/buhar ve uygun filtre varsa seçin. Oksijen düşükse veya ortam tanınmıyorsa seçmeyin.",
  temiz_hava_solunum:
    "Oksijen yetersiz veya IDLH ortam ve eğitimli kişi müdahale ediyorsa seçin. Gözlem turunda seçmeyin.",
  kulak_tikaci:
    "Gürültülü alandan kısa geçiş varsa seçin. Uzun süre yüksek gürültüde kulaklık daha uygundur.",
  kulaklik_en352:
    "Sürekli yüksek gürültü (fan, hadde, konveyör) varsa seçin. Baret ve maskeyle birlikte durduğunu kontrol edin.",
  eldiven_mekanik:
    "Kesici kenar, tel, sac veya pürüzlü malzeme varsa seçin. Sıcak yüzey ve sıvı metalde korumaz.",
  eldiven_isi:
    "Sıcak yüzey, cüruf veya döküm çevresinde el teması varsa seçin. Ark kaynağı için kaynakçı eldiveni gerekir.",
  eldiven_kaynak:
    "Kişi fiilen kaynak yapıyorsa seçin. Gözlemci veya montaj el işi için seçmeyin.",
  eldiven_kimyasal:
    "Asit, baz, solvent veya hidrolik yağ teması varsa seçin. Isı ve kesilmeye karşı yetmez.",
  ayakkabi_s3:
    "Sahaya çıkıyorsanız seçin. Ezilme ve delinme her yerde vardır; sıvı metal sıçramasında bot yetmez.",
  cizme_isi_hi3:
    "Sıvı metal, cüruf veya kızgın zemin varsa seçin. Bağcıksız, hızlı çıkarılabilir model seçilir. Ofis-saha yürüyüşünde gerekmez.",
  fr_kiyafet:
    "Kıvılcım, alev veya radyan ısı olan sıcak iş / döküm çevresinde seçin. Sentetik iş elbisesi tutuşur.",
  aluminize_giysi:
    "Kişi sıvı metale doğrudan müdahale ediyorsa seçin. Kontrollük gözleminde seçmeyin; hareketi keser.",
  kaynakci_onlugu:
    "Kaynak yapan kişide sıçrantı gövdeye geliyorsa seçin. Kaynak yapmayan gözlemci için seçmeyin.",
  antistatik_ex_kiyafet:
    "Patlayıcı gaz/toz bölgesi (Ex) varsa seçin. Sıcak iş ısı koruması yerine geçmez.",
  reflektorlu_yelek:
    "İş makinesi, vinç veya araç trafiği varsa seçin. Darbe veya ısıyı kesmez; görünürlük içindir.",
  kursun_onluk:
    "Düşük enerjili tıbbi X-ışını varsa seçin. Endüstriyel gama çekiminde seçmeyin; asıl tedbir mesafe ve alan kapatmadır.",
  tam_vucut_kemeri:
    "2 m ve üzeri düşme riski varsa seçin. Bağlanacak onaylı nokta yoksa kemer tek başına işe yaramaz.",
  soklu_lanyard:
    "Düşme durdurma kullanılacak ve düşme mesafesi yeterliyse seçin. Alçak platformda şok emici yere çarptırabilir.",
  cift_kancali_lanyard:
    "Kişi yatay ilerlerken bir kancayı söküyorsa seçin. Kesintisiz bağlı kalmak (%100 tie-off) için vardır.",
  yatay_yasam_hatti:
    "Uzun hat boyunca bağlanılacak kurulu ve onaylı hat varsa seçin. Hesapsız ip/halat yaşam hattı değildir.",
  gaz_dedektoru_co:
    "CO veya oksijen kaybı olabilecek bölgeye giriyorsanız seçin. LEL / H₂S ölçmez; gaz hattında 4'lü cihaz bakın.",
  gaz_dedektoru_4li:
    "Doğalgaz, kapalı hacim veya çoklu gaz riski varsa seçin. Bump testi ve kalibrasyon güncel değilse seçilmiş sayılmaz.",
  dozimetre:
    "Radyografi alanına yetkili olarak yaklaşıyorsanız seçin. Koruyucu değildir; dozu kaydeder. Giriş yasağı yerine geçmez.",
  ex_el_feneri:
    "Ex bölgede aydınlatma gerekiyorsa seçin. Sıradan fener kıvılcım kaynağıdır.",
  telsiz_atex:
    "Ex bölgede haberleşme veya yalnız çalışma varsa seçin. Sertifikasız telefon/telsiz içeri sokulmaz.",
  kaynak_perdesi:
    "Ark veya sıçrantı çevredeki kişilere geliyorsa seçin. Kaynakçının KKD'sinin yerine geçmez.",
  alan_bariyeri:
    "Yetkisiz giriş, düşme, radyografi veya sıcak iş çevreyi etkiliyorsa seçin. Şerit tek başına yetmez; giriş de kontrol edilmeli.",
  yangin_sondurucu:
    "Sıcak iş izni varsa seçin. Söndürücü + yangın gözcüsü birlikte düşünülür; gözcüsüz tüp yetmez.",
  kacis_guzergahi:
    "Kapalı, gazlı veya döküm alanına girmeden önce seçin. İçeride kaldıktan sonra planlanamaz.",
  ruzgar_yonu:
    "Gaz kaçağı veya toz/duman sürüklenmesi varsa seçin. Rüzgârı arkaya alıp yukarı yönde durun; yön değişir, tekrar bakın.",
  toplu_koruma:
    "Korkuluk, platform veya kapak düşmeyi topluca kesiyorsa seçin. Sökülmüş korkuluk varken yalnız kemere güvenmeyin.",
  gozetmen:
    "Kapalı hacim veya yalnız kalınamayacak risk varsa seçin. Gözetmen dışarıda bekler; aynı anda başka iş yapmaz.",
  guvenli_mesafe:
    "Gözlemi riskin içine girmeden yapabiliyorsanız seçin. En ucuz tedbirdir; gerekmiyorsa alana yaklaşmayın.",
  is_izni:
    "İzinli işe (sıcak iş, kapalı hacim, radyografi, kazı) bakıyorsanız seçin. İmza, sahanın o andaki halini tek başına kanıtlamaz.",
  gaz_olcum_formu:
    "Kapalı hacim veya gazlı alana giriş varsa seçin. Süresi geçmiş ölçüm geçersizdir, yenilenmeden girilmez.",
  iskele_kontrol_karti:
    "İskeleye çıkılacak veya iskele üzerinde iş varsa seçin. Yeşil etiket yoksa veya kırmızıysa çıkılmaması gerektiğini işaretleyin.",
  radyografi_calisma_formu:
    "Endüstriyel çekim / kaynak tarama varsa seçin. Saat, sınır ve duyuru yoksa alanı kapatın; önlük bu işi çözmez.",
  toolbox:
    "Vardiya veya iş başlamadan risk paylaşılmadıysa seçin. İmza listesi yetmez; ekip tedbiri anlamış olmalıdır.",
  can_yelegi:
    "Su kenarı, iskele üstü liman veya düşme-suya riski varsa seçin. Kara sahasında ve döküm alanında seçmeyin.",
};

/** Müdahale kartları: ne zaman seçilir. */
export const ACTION_WHY_SELECT: Record<string, string> = {
  gozleme_devam:
    "Kayda değer bir eksik veya anlık tehlike yoksa seçin. Ciddi risk varken 'biraz daha bakayım' demek müdahale değildir.",
  durdur_muteahhit:
    "Yüklenici işinde anlık ciddi risk varsa ve sözleşmede durdurma yetkiniz varsa seçin. İşletme personeline bu kartı kullanmayın.",
  bildir_firma:
    "Yüklenicideki eksiği firmanın kendi saha sorumlusu giderecekse seçin. Siz takımı dağıtmak yerine sorumluluğu ona verin.",
  bildir_isletme:
    "Uygunsuzluk işletme personelindeyse seçin. Bu kişilere doğrudan talimat veremezsiniz; ilgili işletme sorumlusuna iletin.",
  bildir_isg:
    "İşletme kaynaklı ciddi veya tekrarlayan risk tesis İSG'sini ilgilendiriyorsa seçin. Küçük yüklenici eksiğinde ilk adım bu değildir.",
  ekibi_cikar:
    "Kendi kontrollük ekibinizin maruziyeti durmuyorsa seçin. Bu kişilere yetkiniz tamdır; riski gideremiyorsanız ekibi çekin.",
  izin_kontrol:
    "İş izin şartı, ölçüm süresi veya kapsam sahayla uyuşmuyorsa seçin. Form var diye bakmadan geçmeyin.",
  kayit_al:
    "Tespit ettiğiniz her uygunsuzlukta seçin. Tarih, yer ve kanıt olmadan tekrarını izleyemezsiniz; bildirimle birlikte yürür.",
};

export function whySelectFor(code: string, fallback = ""): string {
  return EQUIPMENT_WHY_SELECT[code] ?? ACTION_WHY_SELECT[code] ?? fallback;
}
