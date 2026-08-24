-- Kart (i) rehberi: "Neden seçmeliyim?"
-- Mevcut equipment_items tablosuna why_select ekler ve metinleri doldurur.
-- SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmaya dayanıklıdır.

alter table if exists public.equipment_items
  add column if not exists why_select text;

update public.equipment_items set why_select = $h$Sahaya adım atıyorsanız seçin. Düşen parça ve çarpma her bölgede vardır; baret temel saha kuralıdır.$h$ where code = 'baret_en397';
update public.equipment_items set why_select = $h$Eğilme, iskele, çatı veya baş aşağı çalışma varsa seçin. Kayışsız baret bu hareketlerde düşer.$h$ where code = 'baret_jugular';
update public.equipment_items set why_select = $h$Yandan darbe veya dar geçitlerde başın sıkışma riski yüksekse seçin. Rutin yürüyüş turunda genelde gerekmez.$h$ where code = 'baret_en14052';
update public.equipment_items set why_select = $h$Toz, tufal, kıvılcım veya uçuşan parça varsa seçin. Sıvı metal ve kaynak arkı için yetmez; onları ayrı kartlardan bakın.$h$ where code = 'gozluk_en166';
update public.equipment_items set why_select = $h$Kızgın yüzey, döküm kanalı veya sıvı metal ışınımı varsa seçin. Kaynak arkı için kaynakçı maskesi gerekir.$h$ where code = 'gozluk_ir';
update public.equipment_items set why_select = $h$Sıçrama veya radyan ısı yüze geliyorsa seçin. Gözlüğün üstüne ekleyin; tek başına gözü kapatmaz.$h$ where code = 'yuz_siperi';
update public.equipment_items set why_select = $h$Siz veya denetlediğiniz kişi ark kaynağı yapıyorsa seçin. Yalnızca gözlemliyorsanız seçmeyin; görüşü keser ve gerekmez.$h$ where code = 'kaynak_maskesi';
update public.equipment_items set why_select = $h$CO üretilebilecek kapalı veya gaz riskli bölgeye giriyorsanız seçin. İçeride çalışmaya devam etmek için değil, çıkış içindir.$h$ where code = 'kacis_maskesi_co';
update public.equipment_items set why_select = $h$Refrakter, silika veya ince toz varsa seçin. Gaz kokusu veya CO şüphesinde işe yaramaz.$h$ where code = 'toz_maskesi_ffp3';
update public.equipment_items set why_select = $h$Bilinen gaz/buhar ve uygun filtre varsa seçin. Oksijen düşükse veya ortam tanınmıyorsa seçmeyin.$h$ where code = 'yarim_yuz_maske';
update public.equipment_items set why_select = $h$Oksijen yetersiz veya IDLH ortam ve eğitimli kişi müdahale ediyorsa seçin. Gözlem turunda seçmeyin.$h$ where code = 'temiz_hava_solunum';
update public.equipment_items set why_select = $h$Gürültülü alandan kısa geçiş varsa seçin. Uzun süre yüksek gürültüde kulaklık daha uygundur.$h$ where code = 'kulak_tikaci';
update public.equipment_items set why_select = $h$Sürekli yüksek gürültü (fan, hadde, konveyör) varsa seçin. Baret ve maskeyle birlikte durduğunu kontrol edin.$h$ where code = 'kulaklik_en352';
update public.equipment_items set why_select = $h$Kesici kenar, tel, sac veya pürüzlü malzeme varsa seçin. Sıcak yüzey ve sıvı metalde korumaz.$h$ where code = 'eldiven_mekanik';
update public.equipment_items set why_select = $h$Sıcak yüzey, cüruf veya döküm çevresinde el teması varsa seçin. Ark kaynağı için kaynakçı eldiveni gerekir.$h$ where code = 'eldiven_isi';
update public.equipment_items set why_select = $h$Kişi fiilen kaynak yapıyorsa seçin. Gözlemci veya montaj el işi için seçmeyin.$h$ where code = 'eldiven_kaynak';
update public.equipment_items set why_select = $h$Asit, baz, solvent veya hidrolik yağ teması varsa seçin. Isı ve kesilmeye karşı yetmez.$h$ where code = 'eldiven_kimyasal';
update public.equipment_items set why_select = $h$Sahaya çıkıyorsanız seçin. Ezilme ve delinme her yerde vardır; sıvı metal sıçramasında bot yetmez.$h$ where code = 'ayakkabi_s3';
update public.equipment_items set why_select = $h$Sıvı metal, cüruf veya kızgın zemin varsa seçin. Bağcıksız, hızlı çıkarılabilir model seçilir. Ofis-saha yürüyüşünde gerekmez.$h$ where code = 'cizme_isi_hi3';
update public.equipment_items set why_select = $h$Kıvılcım, alev veya radyan ısı olan sıcak iş / döküm çevresinde seçin. Sentetik iş elbisesi tutuşur.$h$ where code = 'fr_kiyafet';
update public.equipment_items set why_select = $h$Kişi sıvı metale doğrudan müdahale ediyorsa seçin. Kontrollük gözleminde seçmeyin; hareketi keser.$h$ where code = 'aluminize_giysi';
update public.equipment_items set why_select = $h$Kaynak yapan kişide sıçrantı gövdeye geliyorsa seçin. Kaynak yapmayan gözlemci için seçmeyin.$h$ where code = 'kaynakci_onlugu';
update public.equipment_items set why_select = $h$Patlayıcı gaz/toz bölgesi (Ex) varsa seçin. Sıcak iş ısı koruması yerine geçmez.$h$ where code = 'antistatik_ex_kiyafet';
update public.equipment_items set why_select = $h$İş makinesi, vinç veya araç trafiği varsa seçin. Darbe veya ısıyı kesmez; görünürlük içindir.$h$ where code = 'reflektorlu_yelek';
update public.equipment_items set why_select = $h$Düşük enerjili tıbbi X-ışını varsa seçin. Endüstriyel gama çekiminde seçmeyin; asıl tedbir mesafe ve alan kapatmadır.$h$ where code = 'kursun_onluk';
update public.equipment_items set why_select = $h$2 m ve üzeri düşme riski varsa seçin. Bağlanacak onaylı nokta yoksa kemer tek başına işe yaramaz.$h$ where code = 'tam_vucut_kemeri';
update public.equipment_items set why_select = $h$Düşme durdurma kullanılacak ve düşme mesafesi yeterliyse seçin. Alçak platformda şok emici yere çarptırabilir.$h$ where code = 'soklu_lanyard';
update public.equipment_items set why_select = $h$Kişi yatay ilerlerken bir kancayı söküyorsa seçin. Kesintisiz bağlı kalmak (%100 tie-off) için vardır.$h$ where code = 'cift_kancali_lanyard';
update public.equipment_items set why_select = $h$Uzun hat boyunca bağlanılacak kurulu ve onaylı hat varsa seçin. Hesapsız ip/halat yaşam hattı değildir.$h$ where code = 'yatay_yasam_hatti';
update public.equipment_items set why_select = $h$CO veya oksijen kaybı olabilecek bölgeye giriyorsanız seçin. LEL / H₂S ölçmez; gaz hattında 4'lü cihaz bakın.$h$ where code = 'gaz_dedektoru_co';
update public.equipment_items set why_select = $h$Doğalgaz, kapalı hacim veya çoklu gaz riski varsa seçin. Bump testi ve kalibrasyon güncel değilse seçilmiş sayılmaz.$h$ where code = 'gaz_dedektoru_4li';
update public.equipment_items set why_select = $h$Radyografi alanına yetkili olarak yaklaşıyorsanız seçin. Koruyucu değildir; dozu kaydeder. Giriş yasağı yerine geçmez.$h$ where code = 'dozimetre';
update public.equipment_items set why_select = $h$Ex bölgede aydınlatma gerekiyorsa seçin. Sıradan fener kıvılcım kaynağıdır.$h$ where code = 'ex_el_feneri';
update public.equipment_items set why_select = $h$Ex bölgede haberleşme veya yalnız çalışma varsa seçin. Sertifikasız telefon/telsiz içeri sokulmaz.$h$ where code = 'telsiz_atex';
update public.equipment_items set why_select = $h$Ark veya sıçrantı çevredeki kişilere geliyorsa seçin. Kaynakçının KKD'sinin yerine geçmez.$h$ where code = 'kaynak_perdesi';
update public.equipment_items set why_select = $h$Yetkisiz giriş, düşme, radyografi veya sıcak iş çevreyi etkiliyorsa seçin. Şerit tek başına yetmez; giriş de kontrol edilmeli.$h$ where code = 'alan_bariyeri';
update public.equipment_items set why_select = $h$Sıcak iş izni varsa seçin. Söndürücü + yangın gözcüsü birlikte düşünülür; gözcüsüz tüp yetmez.$h$ where code = 'yangin_sondurucu';
update public.equipment_items set why_select = $h$Kapalı, gazlı veya döküm alanına girmeden önce seçin. İçeride kaldıktan sonra planlanamaz.$h$ where code = 'kacis_guzergahi';
update public.equipment_items set why_select = $h$Gaz kaçağı veya toz/duman sürüklenmesi varsa seçin. Rüzgârı arkaya alıp yukarı yönde durun; yön değişir, tekrar bakın.$h$ where code = 'ruzgar_yonu';
update public.equipment_items set why_select = $h$Korkuluk, platform veya kapak düşmeyi topluca kesiyorsa seçin. Sökülmüş korkuluk varken yalnız kemere güvenmeyin.$h$ where code = 'toplu_koruma';
update public.equipment_items set why_select = $h$Kapalı hacim veya yalnız kalınamayacak risk varsa seçin. Gözetmen dışarıda bekler; aynı anda başka iş yapmaz.$h$ where code = 'gozetmen';
update public.equipment_items set why_select = $h$Gözlemi riskin içine girmeden yapabiliyorsanız seçin. En ucuz tedbirdir; gerekmiyorsa alana yaklaşmayın.$h$ where code = 'guvenli_mesafe';
update public.equipment_items set why_select = $h$İzinli işe (sıcak iş, kapalı hacim, radyografi, kazı) bakıyorsanız seçin. İmza, sahanın o andaki halini tek başına kanıtlamaz.$h$ where code = 'is_izni';
update public.equipment_items set why_select = $h$Kapalı hacim veya gazlı alana giriş varsa seçin. Süresi geçmiş ölçüm geçersizdir, yenilenmeden girilmez.$h$ where code = 'gaz_olcum_formu';
update public.equipment_items set why_select = $h$İskeleye çıkılacak veya iskele üzerinde iş varsa seçin. Yeşil etiket yoksa veya kırmızıysa çıkılmaması gerektiğini işaretleyin.$h$ where code = 'iskele_kontrol_karti';
update public.equipment_items set why_select = $h$Endüstriyel çekim / kaynak tarama varsa seçin. Saat, sınır ve duyuru yoksa alanı kapatın; önlük bu işi çözmez.$h$ where code = 'radyografi_calisma_formu';
update public.equipment_items set why_select = $h$Vardiya veya iş başlamadan risk paylaşılmadıysa seçin. İmza listesi yetmez; ekip tedbiri anlamış olmalıdır.$h$ where code = 'toolbox';
update public.equipment_items set why_select = $h$Su kenarı, iskele üstü liman veya düşme-suya riski varsa seçin. Kara sahasında ve döküm alanında seçmeyin.$h$ where code = 'can_yelegi';

notify pgrst, 'reload schema';
