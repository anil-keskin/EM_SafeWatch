# SafeWatch — Erdemir Mühendislik

KKD ve İSG saha simülasyonu. Demir çelik sahasında kontrollük görevi yapan
personelin kendi saha hazırlığını yapmasını, müteahhit çalışanlarını
denetlemesini ve işletmede gördüğü uygunsuzlukları yetki sınırlarına uygun
kanallardan bildirmesini öğreten görsel bir antrenman aracıdır.

Bu bir sınav değildir. Can sistemi yoktur, oyun asla başarısızlıkla bitmez ve
sistem tanı koymaz; yalnızca gelişim göstergesi üretir.

## Teknoloji

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth) — opsiyonel
- PWA (manifest + service worker)

## Hızlı Başlangıç

```bash
npm install
npm run dev
```

Tarayıcıda <http://localhost:3000> adresini açın.

Supabase yapılandırılmadan da uygulama çalışır: bölgeler, ekipman kartları ve
senaryolar `content/` klasöründeki yerel veriden okunur, ilerleme tarayıcıda
(`localStorage`) saklanır.

## Supabase Bağlantısı (opsiyonel)

Bulut kaydı ve çoklu cihaz desteği için:

1. Supabase panelinde **SQL Editor**'ı açın ve sırasıyla çalıştırın:
   - `supabase/migrations/0001_init.sql` (tablolar, Row Level Security)
   - `supabase/seed.sql` (11 bölge, ekipman kartları, 6 tam + 24 taslak senaryo)
2. **Project Settings > API** sayfasından `Project URL` ve `anon public`
   anahtarını kopyalayın.
3. Proje kökündeki `.env.local` dosyasını açıp iki satırı doldurun:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Değerlerin başına/sonuna tırnak veya boşluk koymayın.

4. Dev sunucusunu yeniden başlatın (`Ctrl+C`, ardından `npm run dev`).
   Next.js ortam değişkenlerini yalnızca başlangıçta okur.

Bağlantının çalışıp çalışmadığını ana menünün altındaki durum satırından
görebilirsiniz:

| Gösterge          | Anlamı                                                       |
| ----------------- | ------------------------------------------------------------ |
| Gri — yerel içerik | Anahtarlar boş; uygulama `content/` verisiyle çalışıyor       |
| Yeşil — Supabase   | Veriler veritabanından okunuyor, kurulum tamam                |
| Kırmızı — hata     | Anahtar var ama okunamadı; SQL dosyalarını çalıştırın         |

Her iki SQL dosyası da tekrar tekrar çalıştırılabilir; mevcut kayıtları
günceller, çakışma üretmez. Anahtarlar hatalı veya eksikse uygulama çökmez,
yerel içeriğe düşer.

## Klasör Yapısı

```
app/                    Sayfalar (App Router)
  page.tsx              Ana menü
  saha/                 Saha (bölge) seçimi
  senaryo/[id]/         Senaryo oyun ekranı
  sonuc/[id]/           Sonuç ve değerlendirme
  gelisim/              Gelişim Raporum
  nasil-oynanir/        Kurallar
  giris/                Supabase e-posta/parola girişi
components/             Arayüz bileşenleri
content/                Yerel içerik (bölge, ekipman, senaryo, aksiyon)
lib/                    Tipler, puanlama motoru, ilerleme deposu, veri katmanı
supabase/               SQL şeması ve seed verisi
public/                 PWA manifest, service worker, ikonlar
```

## Logo

Erdemir Mühendislik logosunu `public/logo.png` olarak ekleyin; üst barda
otomatik görünür. Dosya yoksa yazı gösterimi kullanılır.

## Senaryo İçeriği

İlk 6 senaryo tam içerikle hazırdır:

1. Yüksek Fırın — Döküm Kanalı Gözlemi
2. Çelikhane — Döküm Platformu (işletmede uygunsuzluk)
3. Çelikhane — Kaynaklı Tadilat (müteahhit denetimi)
4. Gaz Hatları — Saha İncelemesi
5. Yüksekte/İskele — Kaynak Dikişi Kalite Kontrolü
6. Radyografi — Sahaya Yaklaşım

Kalan 24 senaryo aynı formatta taslak olarak durur ve saha seçiminde "Yakında"
etiketiyle görünür. Bir taslağı doldurmak için:

- Yerel içerik: `content/scenarios.ts` içindeki `draft(...)` satırını tam bir
  senaryo nesnesiyle değiştirin.
- Veritabanı: `scenarios` tablosunda ilgili `slug` kaydının jsonb alanlarını
  doldurup `is_draft` değerini `false` yapın.

## Puanlama

İki eksen ayrı ayrı hesaplanır ve sonuç ekranında ayrı gösterilir:

- **Teknik doğruluk**: tehlike tanıma (%30), kendi donanımı (%40), yüklenici
  denetimi (%15), işletme gözlemi (%15).
- **Kontrollük davranışı**: doğru kanala bildirme, gerektiğinde durdurma,
  yetki sınırını aşmama, kayıt tutma.

Her ipucu kademesi iki eksenden 5 puan düşürür. Geçme/kalma eşiği yoktur.

## Yayın (Vercel)

1. Projeyi GitHub'a gönderin.
2. <https://vercel.com> üzerinde **Add New > Project** ile repoyu seçin.
3. **Environment Variables** kısmına `NEXT_PUBLIC_SUPABASE_URL` ve
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini ekleyin (Supabase kullanıyorsanız).
4. **Deploy** deyin.

## Komutlar

| Komut           | Açıklama                        |
| --------------- | ------------------------------- |
| `npm run dev`   | Geliştirme sunucusu             |
| `npm run build` | Üretim yapısı                   |
| `npm start`     | Üretim sunucusu (build sonrası) |
| `npm run lint`  | ESLint denetimi                 |
