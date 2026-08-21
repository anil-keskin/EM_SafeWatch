# SafeWatch — Cursor Master Komutu

> Aşağıdaki metnin TAMAMINI kopyala, Cursor'da yeni bir proje klasörü açtıktan sonra
> Cursor Chat (Agent modu) içine yapıştır ve gönder. Cursor projeyi baştan sona kuracak.

---

Sen kıdemli bir full-stack geliştiricisin. Aşağıda tarif ettiğim web uygulamasını
**eksiksiz, çalışır ve profesyonel** biçimde sıfırdan kur. Ben junior seviyedeyim,
bu yüzden her adımda ne yaptığını kısa Türkçe açıklamalarla belirt ve terminalde
çalıştırmam gereken komutları tek tek ver.

## PROJE ADI
Erdemir Mühendislik **SafeWatch** — KKD ve İSG Saha Simülasyonu

## AMAÇ
Demir çelik sahasında kontrollük/gözlem görevi yapan beyaz yakalı personelin;
kendi saha hazırlığını yapmasını, müteahhit çalışanlarının işe uygun KKD ve güvenlik
tedbirlerini denetlemesini, işletme personelinde gördüğü uygunsuzlukları yetki
sınırlarına uygun kanallardan bildirmesini öğreten görsel bir eğitim/simülasyon
oyunudur. Bir sınav DEĞİL, bir antrenman aracıdır.

## TEKNOLOJİ YIĞINI
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (stil)
- **Supabase** (PostgreSQL veritabanı + Auth + Storage)
- **Vercel** (yayın)
- State için basit React hooks + Supabase client. Ağır kütüphane kullanma.
- Mobil ve masaüstü uyumlu (responsive). PWA yapısı ekle (manifest + basit service worker).

## MARKA VE TASARIM KURALLARI
- Renk paleti (Tailwind config'e ekle):
  - `erd-red`: #E1251B (Erdemir kırmızısı, vurgu/kritik butonlar)
  - `erd-charcoal`: #2E2E2E (üst bar, başlıklar, ana metin)
  - `erd-gray`: #6B6B6B (ikincil metin)
  - `erd-light`: #F4F4F4 (zemin)
  - `safety-orange`: #F5821F (sadece İSG/KKD ikon vurgusu)
  - `white`: #FFFFFF
- Genel his: kırmızı + antrasit gri + beyaz. Turuncu sadece küçük İSG ikonlarında.
- Yuvarlatılmış kartlar, bol beyaz boşluk, temiz kurumsal görünüm.
- Üst barda yer için `/public/logo.png` (ben sonra ekleyeceğim) kullan; yoksa
  "Erdemir Mühendislik | SafeWatch" yazısı göster.
- Tüm arayüz metinleri **Türkçe** olacak.

## OYUN KURALLARI (ÇOK ÖNEMLİ)
1. **Can/kalp sistemi YOK.** Oyun asla "başarısız" diye bitmez.
2. Yanlış seçim yapınca oyun durmaz; sonunda **nazik, öğretici geri bildirim** verir.
3. Puan bir **"gelişim göstergesi"dir**, geçti/kaldı eşiği yoktur.
4. Oyuncu senaryoları **istediği sırayla** seçebilir (serbest geçiş).
5. İlerleme kaydedilir; oyuncu kaldığı yerden devam eder, en iyi skoru saklanır,
   senaryoyu tekrar oynayıp skorunu geliştirebilir.
6. **Kademeli ipucu** vardır (3 seviye), her ipucu skoru biraz düşürür ama asla engel değildir.

## OYUNCU ROLÜ VE KARAKTER GRUPLARI
Her senaryoda 1-3 karakter grubu olabilir:
- **KONTROLLÜK** (mavi rozet): Oyuncunun kendisi (Erdemir Mühendislik personeli).
- **YÜKLENİCİ** (turuncu rozet): Oyuncunun denetlediği müteahhit çalışanı.
- **İŞLETME** (kırmızı rozet): Demir çelik fabrika personeli — oyuncunun doğrudan
  emir verme yetkisi YOKTUR, sadece ilgili işletme birimine/İSG'ye bildirir.

## SENARYO AKIŞI (her senaryo için ekran sırası)
1. **Görev Kartı**: Nereye, neden gidiliyor; işletme ne yapıyor; müteahhit ne yapıyor;
   oyuncu ne yapacak; hava/özel durum.
2. **Tehlike Tanıma**: Sahnede tıklanabilir risk noktaları (gaz, ısı, askıda yük,
   kot farkı, gürültü, toz, sıçrama, enerji, trafik vb.) oyuncu işaretler.
3. **Hazırlık / Denetim** — Sağ panelde 4 karar sekmesi:
   - "Ben ne kullanmalıyım?" (kendi KKD + güvenlik ekipmanı + giriş koşulu)
   - "Yüklenici ne kullanmalı?" (müteahhit çalışanının eksik KKD'si)
   - "İşletmede ne eksik?" (işletme personelindeki uygunsuzluk)
   - "Nasıl müdahale etmeliyim?" (doğru aksiyon: bildir/durdur/kaydet vb.)
4. **Sonuç Kartı**: Doğru seçtikleri, eksikler, gereksiz seçilenler, kritik hata,
   nedeni, dayandığı kural — nazik/kurumsal dille.

## PUANLAMA (iki eksen)
- **Teknik doğruluk**: tehlike tanıma, doğru KKD ailesi, standart eşleşmesi,
  KKD dışı tedbir, gereksiz KKD'den kaçınma.
- **Kontrollük davranışı**: çalışanın bağlı olduğu kuruluşu fark etme, doğru
  kişiye bildirme, gerektiğinde işi durdurma, yetki sınırını aşmama, kayıt tutma.
Her ikisini ayrı sakla ve sonuç ekranında ayrı göster.

## AKSİYON SEÇENEKLERİ (müdahale sekmesi için)
- Gözleme devam et
- Müteahhit işini durdur
- Firma saha sorumlusuna bildir
- İşletme sorumlusuna bildir
- Demir çelik İSG birimine bildir
- Kontrollük ekibini risk alanından çıkar
- İş izin şartlarını yeniden kontrol ettir
- Uygunsuzluğu kayıt altına al

## VERİTABANI (Supabase — SQL migration olarak oluştur)
Aşağıdaki tabloları kur. Row Level Security aç; kullanıcı sadece kendi ilerlemesini görsün.

```sql
-- Bölgeler
create table zones (
  id text primary key,           -- 'yuksek_firin', 'celikhane' ...
  name text not null,            -- 'Yüksek Fırın'
  icon text,                     -- ikon adı/emoji
  order_index int default 0
);

-- Ekipman kategorileri
create table equipment_categories (
  id text primary key,           -- 'bas', 'goz', 'solunum', 'yuksekte', 'ozel' ...
  name text not null
);

-- Ekipman kartları
create table equipment_items (
  id uuid primary key default gen_random_uuid(),
  code text unique,              -- 'baret_en397'
  name text not null,            -- 'Endüstriyel Baret'
  category_id text references equipment_categories(id),
  standard text,                 -- 'EN 397'
  description text,              -- ne işe yarar
  used_by text,                  -- 'kontrolluk|yuklenici|isletme|hepsi'
  not_for text,                  -- hangi durumda yeterli değil
  icon text
);

-- Senaryolar
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  zone_id text references zones(id),
  order_index int default 0,
  title text not null,
  briefing jsonb,                -- is_izni, gaz, sicaklik, yukseklik, ozel_not
  hazards jsonb,                 -- tehlike listesi [{code,label}]
  actors jsonb,                  -- [{type, employer, activity, expected_items[], current_items[], authority}]
  required_self jsonb,           -- oyuncunun kendi doğru donanımı
  forbidden_self jsonb,          -- gereksiz/yanlış seçimler
  correct_actions jsonb,         -- doğru müdahale aksiyonları
  hints jsonb,                   -- 3 kademeli ipucu ["...","...","..."]
  explanation text,              -- sonuç açıklaması
  competency_tags jsonb          -- ['kkd_secimi','gaz_guvenligi','kontrolluk_davranisi']
);

-- Kullanıcı ilerlemesi
create table user_progress (
  user_id uuid references auth.users(id),
  scenario_id uuid references scenarios(id),
  status text default 'acik',    -- 'acik' | 'tamamlandi'
  best_technical int default 0,
  best_behavior int default 0,
  attempts int default 0,
  hints_used int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, scenario_id)
);

-- Yetkinlik özeti (gelişim raporu için)
create table competency_summary (
  user_id uuid references auth.users(id),
  zone_id text,
  competency text,
  score int default 0,
  weak_flag boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, zone_id, competency)
);
```

## SAYFALAR (Next.js App Router)
- `/` — Ana menü: SafeWatch başlığı, "X/30 senaryo" ilerleme çubuğu, butonlar:
  Oyuna Başla, Saha Seçimi, Gelişim Raporum, Nasıl Oynanır.
- `/saha` — Saha Seçimi: 11 bölge kartı grid halinde; her kartta senaryo sayısı ve
  tamamlanma noktaları (dolu/boş). Serbest seçim. Altta toplam ilerleme.
- `/senaryo/[id]` — Senaryo oyun ekranı: sol büyük sahne + sağ karar paneli
  (4 sekme) + alt ekipman kartları + İpucu Al + Değerlendir. Yukarıda tarif edilen akış.
- `/sonuc/[id]` — Sonuç/değerlendirme ekranı: teknik + kontrollük puanı ayrı,
  doğru/eksik/gereksiz listeleri, kurumsal açıklama, "Tekrar Dene" ve "Saha Seçimi" butonları.
- `/gelisim` — Gelişim Raporum: bölge ve yetkinlik bazında zayıf alanları
  KURUMSAL KOÇLUK DİLİYLE gösterir. Örnek metin:
  "Genel yaklaşımınız güçlü. Gelişime açık alan: Çelikhane bölgesinde sıvı metal
  maruziyetine yönelik özel koruyucu giysi değerlendirmesinde bazı noktaları
  gözden kaçırdınız. Bu bölümdeki senaryoları tekrar çözmeniz faydalı olacaktır."
  Altında ilgili bölgeye tek tıkla gidiş butonu.
- `/nasil-oynanir` — Kısa kurallar sayfası.
- `/giris` — Basit Supabase e-posta/parola girişi (magic link de olabilir).

## ÖNEMLİ İSTEKLER
- `.env.local` için `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  değişkenlerini kullan. Bir `.env.example` dosyası oluştur ama gerçek anahtar yazma.
- Supabase şemasını `supabase/migrations/0001_init.sql` içine yaz.
- 30 senaryonun tamamı için veri iskeleti hazırla; ama önce **6 çekirdek senaryoyu**
  (aşağıdaki liste) tam ve doğru içerikle doldur, kalan 24'ü aynı formatta boş/taslak
  kayıt olarak ekle ki sonradan doldurabileyim. Seed dosyasını
  `supabase/seed.sql` içine yaz.
- Kod temiz, yorumlu ve modüler olsun. Bileşenleri `/components` altında topla.
- Her büyük adımdan sonra bana ne yaptığını özetle ve çalıştırmam gereken terminal
  komutunu ver.

## İLK 6 ÇEKİRDEK SENARYO (tam doldur)
1. **Yüksek Fırın – Döküm Kanalı Gözlemi**: CO/gaz riskli bölgeden geçen gözlem
   güzergâhı; kişisel gaz dedektörü + acil kaçış maskesi + FR kıyafet zorunlu;
   kaynakçı maskesi gereksiz; giriş öncesi gaz ölçümü ve izin kontrolü.
2. **Çelikhane – Döküm Platformu (işletme personelinde uygunsuzluk)**: İşletme
   personeli sıvı metal müdahalesinde yetersiz ısı/sıçrama koruması kullanıyor;
   oyuncu alüminize giysiyi KENDİNE giymez; uygunsuzluğu fark eder ve işletme
   İSG'ye bildirir; kendi ekibini sıçrama alanından uzak tutar.
3. **Çelikhane – Kaynaklı Tadilat (müteahhit denetimi)**: Müteahhit kaynakçının
   gözlüğü yok, eldiveni yanlış, kaynak perdesi yok; oyuncu eksik KKD'yi belirler,
   firma sorumlusuna bildirir, perde/alan tedbiri ister, gerekirse işi durdurur.
4. **Gaz Hatları – Saha İncelemesi**: Kişisel dedektör (doğru sensör),
   acil kaçış maskesi, Ex uygun ekipman, rüzgâr yönü ve kaçış güzergâhı; bazı
   durumda doğru karar "girmemek/koordinasyon".
5. **Yüksekte/İskele – Kalite Kontrolü**: İskele kontrol kartı (yeşil/kırmızı),
   güvenli erişim, toplu koruma önceliği, gerekiyorsa tam vücut kemeri + uygun
   bağlantı; kartsız iskeleye çıkmama.
6. **Radyografi – Sahaya Yaklaşım**: Doğru cevap çoğu zaman KKD giyip girmek değil,
   izole alana GİRMEMEK; alan işaretlemesi, koordinasyon, çalışma formu kontrolü.

Şimdi başla. Önce projeyi kur ve bana ilk terminal komutlarını ver.
