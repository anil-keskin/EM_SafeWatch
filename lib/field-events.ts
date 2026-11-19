/**
 * "Durum değişti!" anlık saha olayları.
 *
 * Hazırlık sırasında, senaryonun kendi gerçek risklerinden birine bağlı bir
 * olay araya girer; oyuncu süre dolmadan karar verir. Olay ailesi, riskin
 * koduna göre seçilir (ör. co_gazi → gaz alarmı). Seçenekler kontrollük
 * yetki sınırına göre yazılmıştır.
 */

import type { Scenario } from "@/lib/types";

export type EventVerdict = "dogru" | "yetki" | "zayif" | "gecikme";

export interface EventOption {
  id: string;
  text: string;
  verdict: Exclude<EventVerdict, "gecikme">;
  feedback: string;
}

export interface FieldEvent {
  id: string;
  family: string;
  hazardCode: string;
  title: string;
  situation: string;
  /** Cihaz/ölçüm satırı (varsa ekranda büyük gösterilir). */
  reading?: string;
  seconds: number;
  options: EventOption[];
}

export interface FieldEventResult {
  id: string;
  title: string;
  situation: string;
  verdict: EventVerdict;
  answer: string;
  feedback: string;
  /** Karar süresi (ms). Süre dolduysa toplam süre. */
  ms: number;
}

export const TIMEOUT_FEEDBACK =
  "Süre doldu. Sahada karar vermemek de bir karardır: tehlike beklemez. Acil durumda ilk refleks; kendinizi ve ekibinizi güvenli konuma almak, işi durdurmak ve doğru kişiye haber vermektir.";

type Template = Omit<FieldEvent, "id" | "hazardCode" | "seconds"> & { match: RegExp };

const T = (t: Template) => t;

/** Öncelik sırası: en ölümcül olay ailesi önce seçilir. */
const TEMPLATES: Template[] = [
  T({
    family: "gaz",
    match: /co_gazi|h2s|gaz_cikis|kok_gazi|dogalgaz|purge|patlayici|oksijen|kapali_hacim|kapali_ortam/,
    title: "Gaz alarmı",
    situation: "Kişisel dedektörünüz alarm vermeye başladı; değer hızla yükseliyor. Yüklenici ekip birkaç metre ileride çalışıyor.",
    reading: "CO 85 ppm ▲  ·  ALARM",
    options: [
      { id: "tahliye", verdict: "dogru", text: "Ekibimle rüzgâr üstüne, alandan çıkıyorum; yüklenici çalışmasını durdurup işletmeye ve İSG birimine haber veriyorum.", feedback: "Doğru refleks: önce tahliye ve durdurma, sonra bildirim. Gaz alarmında beklemek ya da sorgulamak zaman kaybettirir." },
      { id: "maske", verdict: "zayif", text: "Kaçış maskemi takıp gözleme devam ediyorum.", feedback: "Kaçış maskesi çalışmak için değil, alandan kaçmak içindir; sınırlı süre korur. Maskeyi takıp alanda kalmak riski büyütür." },
      { id: "sifirla", verdict: "zayif", text: "Cihaz arızalı olabilir; sıfırlayıp bir daha ölçüyorum.", feedback: "Alarmı sorgulamak tahliyeden sonra yapılır. Önce güvenli alana çıkılır, cihaz doğrulaması orada yapılır." },
      { id: "vana", verdict: "yetki", text: "Yakındaki vanayı kapatıp kaçağı kendim kesiyorum.", feedback: "Yetki aşımı ve kişisel risk. Hat izolasyonu işletmenin sorumluluğudur; gaz bulutunun içine yürümek ikinci kazazede yaratır." },
    ],
  }),
  T({
    family: "radyasyon",
    match: /radyasyon|acik_izolasyon|habersiz_personel/,
    title: "İzole alana giriş",
    situation: "Habersiz bir işletme ekibi, radyografi izolasyonunun açık kenarından alana doğru yürüyor.",
    options: [
      { id: "uzaktan", verdict: "dogru", text: "Alana girmeden, mesafeden sesli uyarıyla durduruyorum; radyografi sorumlusunu ve işletme sorumlusunu hemen arıyorum.", feedback: "Doğru. Radyasyonda tek gerçek koruma mesafedir. Uyarı mesafeden yapılır, çekim durdurulup izolasyon kapatılır." },
      { id: "pesinden", verdict: "zayif", text: "Peşlerinden içeri girip onları dışarı çıkarıyorum.", feedback: "Kurtarmaya çalışırken kendinizi de ışınlanma alanına sokarsınız. Mesafeden uyarı ve çekimin durdurulması önce gelir." },
      { id: "talimat", verdict: "yetki", text: "İşletme ekibine 'derhal geri dönün, sizi tutanağa yazıyorum' diye talimat veriyorum.", feedback: "Acil uyarı yerindedir ama tutanak tehdidiyle talimat vermek yetki dışıdır. Uyarın, sonra işletme sorumlusuna bildirin." },
      { id: "benim-degil", verdict: "zayif", text: "İşletme personeli; benim sorumluluğumda değil.", feedback: "Gördüğünüz yakın tehlikede sessiz kalmak kabul edilemez. Talimat yetkiniz olmasa da uyarı ve bildirim yükümlülüğünüz vardır." },
    ],
  }),
  T({
    family: "enerji",
    match: /yuksek_gerilim|elektrik|ark_parlamasi|enerji_|izolasyon_belirsiz|topraklama|eksik_etiket|basinc|basincli|yuksek_basinc|flans/,
    title: "İzolasyon şüphesi",
    situation: "\"Enerjisi kesildi\" denen ekipmanda gösterge hâlâ enerji/basınç var diyor. Yüklenici ekip müdahaleye hazırlanıyor.",
    reading: "GÖSTERGE: ENERJİ VAR",
    options: [
      { id: "teyit", verdict: "dogru", text: "Çalışmayı başlamadan durduruyorum; izolasyonun işletme yetkilisi tarafından yeniden yapılıp teyit edilmesini istiyorum.", feedback: "Doğru. Sözlü beyan teyit değildir. Kilit-etiket ve sıfır enerji doğrulaması işletme yetkilisince yapılmadan iş başlamaz." },
      { id: "ariza", verdict: "zayif", text: "Gösterge arızalıdır; izin imzalı, başlayabilirler.", feedback: "Şüpheli göstergeyi yok saymak ölümcül olabilir. Şüphe varsa enerji varmış gibi davranılır." },
      { id: "ben-kes", verdict: "yetki", text: "Şalteri/vanayı ben kapatıp kilitliyorum, sonra başlasınlar.", feedback: "Yetki aşımı. İzolasyon işletmenin işidir; yanlış noktayı kapatmak veya eksik kilitleme başka bir ekibi tehlikeye atar." },
    ],
  }),
  T({
    family: "yuksekte",
    match: /kot_farki|^dusme|suya_dusme|yuksek_kot|eksik_korkuluk|yasam_hatti|kirilgan|ankraj|toplu_koruma|suya_dusme/,
    title: "Düşme tehlikesi",
    situation: "Yüklenici çalışanı, emniyet kemerini bağlamadan korumasız kenara uzanıyor.",
    options: [
      { id: "durdur", verdict: "dogru", text: "Sesli uyarıyla hemen durduruyorum; bağlanana kadar çalışmayı kesiyorum, firma sorumlusuna bildirip kaydediyorum.", feedback: "Doğru. Anlık ciddi ihlalde yüklenici çalışmasını durdurma yetkiniz var. Durdur, düzelt, bildir, kaydet." },
      { id: "bir-sey-olmaz", verdict: "zayif", text: "Kemeri üzerinde, birazdan bağlar; bir şey olmaz.", feedback: "Bağlanmamış kemer koruma sağlamaz. Düşme saniyeler içinde olur; 'birazdan' güvenlik tedbiri değildir." },
      { id: "yanina", verdict: "zayif", text: "Yanına gidip kancasını ben bağlıyorum.", feedback: "İyi niyet ama sizi de düşme bölgesine sokar. Uyarı ve durdurma güvenli konumdan yapılır." },
    ],
  }),
  T({
    family: "yuk",
    match: /askida_yuk|sarj_arabasi|sondurme_arabasi|is_makinesi|kor_nokta|hareketli_serit|istif/,
    title: "Yük güzergâhında ekip",
    situation: "Vinç/iş makinesi yükü, yüklenici ekibin tam üzerinden ve kör noktasından geçirilmek üzere.",
    options: [
      { id: "acil-dur", verdict: "dogru", text: "Acil 'DUR' işaretiyle manevrayı kestiriyorum; ekibi güzergâhtan çektiriyorum ve operasyon sorumlusuna bildiriyorum.", feedback: "Doğru. Acil durdurma işaretini sahada herkes verebilir. Sonrasında manevra planı sorumlusuyla netleştirilir." },
      { id: "hizli-gecer", verdict: "zayif", text: "Hızlıca geçecek; ekibe dikkat etmelerini söylüyorum.", feedback: "Askıda yükün altında 'dikkat' tedbir değildir. Yük güzergâhı insandan arındırılmadan manevra yapılmaz." },
      { id: "kabine", verdict: "yetki", text: "Operatörün kabinine çıkıp makineyi kendim durduruyorum.", feedback: "Yetki ve güvenlik dışı. Hareketli makineye yaklaşmak sizi de tehlikeye sokar; doğru yol acil dur işareti ve sorumluya bildirimdir." },
    ],
  }),
  T({
    family: "sicak",
    match: /sivi_metal|buhar_patlamasi|sicak_su|kizgin_metal|radyan_isi|buhar_sicak|sicak_malzeme|yuksek_isi/,
    title: "Sıçrama alanı genişledi",
    situation: "Döküm/akış sırasında sıçrama alanı büyüdü; kızgın parçacıklar yüklenicinin çalıştığı yürüyüş yoluna düşüyor.",
    options: [
      { id: "geri-cek", verdict: "dogru", text: "Ekibimi ve yükleniciyi sıçrama alanından geri çektiriyorum; alanı ayırtıp işletme sorumlusuna bildiriyorum.", feedback: "Doğru. Önce insanları tehlike alanından çıkarmak, sonra alanı ayırmak ve tehlikenin sahibine bildirmek." },
      { id: "fr-var", verdict: "zayif", text: "FR elbisemiz var, yerimizde kalıyoruz.", feedback: "FR elbise sıvı metal sıçramasına karşı tam koruma değildir; asıl koruma mesafedir." },
      { id: "dokumu-durdur", verdict: "yetki", text: "İşletme operatörüne 'dökümü hemen kes' diye talimat veriyorum.", feedback: "Yetki aşımı. Döküm işletmenin prosesidir; siz ekibi çekip işletme sorumlusuna acil bildirim yaparsınız." },
    ],
  }),
  T({
    family: "yangin",
    match: /kivilcim|yangin/,
    title: "Duman yükseliyor",
    situation: "Kaynak kıvılcımı yağlı bezlere düştü; ince bir duman yükseliyor ve yangın gözcüsü görünmüyor.",
    options: [
      { id: "durdur-sondur", verdict: "dogru", text: "Sıcak işi durdurtuyorum; uygun söndürücüyle ilk müdahaleyi yaptırıp alarm veriyorum ve işletmeye bildiriyorum.", feedback: "Doğru. Sıcak iş durur, başlangıç yangınına uygun söndürücüyle müdahale edilir, alarm verilir. Gözcünün olmaması ayrıca kayda alınır." },
      { id: "kucuk", verdict: "zayif", text: "Küçük bir duman; kaynakçıya söylerim, devam etsinler.", feedback: "Başlangıç yangını saniyeler içinde büyür. Sıcak iş durmadan müdahale edilmez." },
      { id: "su", verdict: "zayif", text: "Yakındaki hortumla suyla söndürüyorum.", feedback: "Yağ ve elektrik olan alanda su yangını yayabilir veya çarpılmaya yol açabilir. Doğru sınıf söndürücü kullanılır." },
    ],
  }),
  T({
    family: "toz",
    match: /toz|dusuk_gorus|kaynak_dumani/,
    title: "Görüş kayboldu",
    situation: "Toz emiş sistemi durdu; ortamdaki toz yükseldi ve görüş birkaç metreye düştü. Yakında hareketli ekipman var.",
    options: [
      { id: "durdur", verdict: "dogru", text: "Görüş düzelene kadar yüklenici çalışmasını durdurtup alandan çıkıyoruz; emiş arızasını işletmeye bildiriyorum.", feedback: "Doğru. Düşük görüş ve hareketli ekipman birleşince çarpma riski çok artar. Emiş sistemi işletmenin sorumluluğundadır." },
      { id: "maske", verdict: "zayif", text: "FFP3 maskemiz var, devam ediyoruz.", feedback: "Maske solunumu korur ama görüş kaybını ve çarpma riskini çözmez." },
      { id: "fan", verdict: "yetki", text: "Emiş fanını ben yeniden çalıştırıyorum.", feedback: "Yetki aşımı. İşletme ekipmanına müdahale etmek sizin görev tanımınızda değildir." },
    ],
  }),
  T({
    family: "kaygan",
    match: /kaygan|kayma_yag|kimyasal_yag|kimyasal_korozif/,
    title: "Sızıntı yayılıyor",
    situation: "Bir hortumdan yağ/kimyasal sızıntısı başladı; yürüyüş yoluna yayılıyor.",
    options: [
      { id: "kapat", verdict: "dogru", text: "Alanı şeritle kapattırıp geçişi durduruyorum; sızıntıyı işletme bakımına bildiriyorum.", feedback: "Doğru. Önce kayma riskini alan kapatarak kontrol et, sonra kaynağı sahibine bildir." },
      { id: "kenardan", verdict: "zayif", text: "Kenarından dikkatli yürüyoruz, devam.", feedback: "Kayıp düşme en sık iş kazalarındandır; 'dikkatli yürümek' bir tedbir değildir." },
      { id: "vana", verdict: "yetki", text: "Hortumun vanasını ben kapatıyorum.", feedback: "Yetki aşımı ve temas riski. Basınçlı hatta müdahale işletme bakımının işidir." },
    ],
  }),
  T({
    family: "gurultu",
    match: /gurultu/,
    title: "Kulak koruyucu çıkarıldı",
    situation: "Kırıcı/fan devreye girdi. Yüklenici çalışanlarından biri kulak koruyucusunu çıkarıp telefonla konuşuyor.",
    options: [
      { id: "uyar", verdict: "dogru", text: "Koruyucuyu takmasını, konuşma için gürültü alanından çıkmasını söylüyorum; tekrarlanırsa firma sorumlusuna iletiyorum.", feedback: "Doğru. Kısa ve net uyarı, gerekiyorsa bildirim. İşitme kaybı kalıcıdır ve uyarı seslerini duymamak ek risk yaratır." },
      { id: "gormezden", verdict: "zayif", text: "Kısa sürer; görmezden geliyorum.", feedback: "Görmezden gelinen davranış normalleşir. Küçük ihlaller büyüklerin habercisidir." },
      { id: "yanina", verdict: "zayif", text: "Ben de koruyucumu çıkarıp yanına gidiyor, anlatıyorum.", feedback: "Kendi korumanızı bırakmak örnek olmaz. Uyarı işaretle veya alan dışında yapılır." },
    ],
  }),
];

export const EVENT_SECONDS = 15;

/**
 * Senaryonun gerçek risklerine uyan olay aileleri arasından, senaryoya göre
 * sabit ama senaryodan senaryoya değişen birini seçer (hep gaz alarmı
 * çıkmasın diye).
 */
export function buildFieldEvent(scenario: Scenario): FieldEvent | null {
  const real = scenario.hazards.filter((h) => h.is_real).map((h) => h.code);
  const candidates = TEMPLATES.map((t) => ({ t, code: real.find((c) => t.match.test(c)) })).filter(
    (x): x is { t: Template; code: string } => Boolean(x.code)
  );
  if (candidates.length === 0) return null;
  let h = 7;
  for (const ch of scenario.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const { t, code } = candidates[h % candidates.length];
  {
    const { match: _match, ...rest } = t;
    void _match;
    const reading =
      t.family === "gaz" && /patlayici|dogalgaz|purge/.test(code)
        ? "LEL %18 ▲  ·  ALARM"
        : t.family === "gaz" && /oksijen|kapali/.test(code)
          ? "O₂ %18,2 ▼  ·  ALARM"
          : t.family === "gaz" && /h2s/.test(code)
            ? "H₂S 15 ppm ▲  ·  ALARM"
            : rest.reading;
    return {
      ...rest,
      reading,
      id: `${t.family}:${code}`,
      hazardCode: code,
      seconds: EVENT_SECONDS,
      options: shuffle(rest.options, scenario.slug),
    };
  }
}

function shuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed + "ev") h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function resolveFieldEvent(
  event: FieldEvent,
  optionId: string | null,
  ms: number
): FieldEventResult {
  const option = optionId ? event.options.find((o) => o.id === optionId) : undefined;
  return {
    id: event.id,
    title: event.title,
    situation: event.situation,
    verdict: option ? option.verdict : "gecikme",
    answer: option ? option.text : "Süre içinde karar verilmedi.",
    feedback: option ? option.feedback : TIMEOUT_FEEDBACK,
    ms,
  };
}
