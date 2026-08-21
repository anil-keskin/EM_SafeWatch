# SafeWatch — Cursor'da Ne Yapacaksın (Adım Adım)

Bu rehber, hiç bilmesen bile takip edebileceğin şekilde yazıldı.
Sırayla git, acele etme. Bir adım bitmeden diğerine geçme.

---

## ADIM 0 — Hazırlık (bir kere yapılır)

1. **Cursor** açık olsun (ücretli sürümün var, tamam).
2. Bilgisayarında bir proje klasörü oluştur. Örnek:
   `C:\Users\anilk\Desktop\Projeler\SafeWatch`
3. Cursor'da: **File > Open Folder** > bu klasörü seç.
4. **Supabase hesabı** aç (ücretsiz): https://supabase.com
   - "New Project" de. İsim: `safewatch`. Bölge: Frankfurt (EU).
   - Bir veritabanı şifresi belirle, bir yere not et.
   - Proje açılınca **Settings > API** kısmına git. Şu ikisini kopyala,
     birazdan lazım olacak:
     - `Project URL`
     - `anon public` key

---

## ADIM 1 — Master komutu Cursor'a yapıştır

1. Cursor'da sağdaki **Chat panelini** aç (yoksa `Ctrl + L`).
2. Chat'in üstünden **Agent** modunu seç (varsa). Yoksa normal chat de olur.
3. `1-CURSOR-KOMUTU.md` dosyasını aç, **içindeki tüm metni** kopyala.
   (Not: dosyanın en başındaki "> Aşağıdaki metnin tamamını..." açıklama
   satırlarını atla, asıl komut `---` çizgisinden sonrasıdır. Ama tamamını
   yapıştırsan da sorun olmaz.)
4. Chat'e yapıştır ve **Enter**'a bas.
5. Cursor kurmaya başlayacak. Sana terminal komutları verecek.

> **Kural:** Cursor sana "şu komutu çalıştır" dediğinde, o komutu Cursor'un
> alt kısmındaki **Terminal** sekmesine yapıştırıp Enter'a bas. Çıkan sonucu
> (varsa hatayı) kopyalayıp Chat'e geri yapıştır. Cursor devam edecek.

---

## ADIM 2 — Terminal komutlarını çalıştır

Cursor genelde şu sırayla ilerletir. Sen sadece verdiği komutları çalıştır:

1. `npx create-next-app` benzeri kurulum → Enter, gelen sorulara Cursor'un
   dediği gibi cevap ver (çoğunda varsayılan = Enter).
2. `npm install` (paketleri kurar) → bekle.
3. Supabase paketi kurulumu.

Her komuttan sonra bir şey ekrana yazar. **Kırmızı "error" görürsen**, o metni
kopyala, Chat'e "şu hatayı aldım:" diye yapıştır. Cursor düzeltir.

---

## ADIM 3 — Supabase anahtarlarını gir

1. Cursor bir `.env.local` dosyası oluşturacak (ya da senden isteyecek).
2. O dosyayı aç, şu iki satırı ADIM 0'da kopyaladığın değerlerle doldur:
   ```
   NEXT_PUBLIC_SUPABASE_URL=buraya_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=buraya_anon_key
   ```
3. Kaydet (`Ctrl + S`).

---

## ADIM 4 — Veritabanı tablolarını kur

1. Cursor `supabase/migrations/0001_init.sql` diye bir dosya oluşturacak.
2. Supabase sitesine git > sol menüden **SQL Editor**.
3. Cursor'un oluşturduğu `0001_init.sql` dosyasının içeriğini kopyala.
4. SQL Editor'a yapıştır, **Run** de. "Success" görmelisin.
5. Aynısını `supabase/seed.sql` (senaryo verileri) için de yap: kopyala, Run.

> Bu adım tabloları ve ilk senaryoları veritabanına yükler.

---

## ADIM 5 — Uygulamayı bilgisayarında aç

1. Cursor terminaline şunu yaz (Cursor da söyleyecek):
   ```
   npm run dev
   ```
2. Terminalde `http://localhost:3000` gibi bir adres çıkar.
3. Tarayıcıda o adresi aç. SafeWatch ana menüsünü görmelisin.
4. Bir sorun varsa ekran görüntüsünü/hatayı Chat'e yapıştır, Cursor düzeltir.

---

## ADIM 6 — Logoyu ekle

1. Erdemir Mühendislik logonu `logo.png` olarak kaydet.
2. Proje klasöründeki `public` klasörünün içine at.
3. Sayfayı yenile; logo üst barda görünür.

---

## ADIM 7 — İnternete yükle (Vercel) ve link al

Kardeşine/ekibe link göndermek için:

1. **GitHub** hesabına projeyi yükle. Cursor'a şunu yaz:
   "Projeyi GitHub'a yüklemek için adım adım git komutlarını ver."
   Verdiği komutları terminale sırayla yapıştır.
2. https://vercel.com adresine gir, GitHub ile giriş yap.
3. **Add New > Project** > SafeWatch reposunu seç.
4. **Environment Variables** kısmına ADIM 3'teki iki değeri ekle
   (`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. **Deploy** de. Birkaç dakikada `https://safewatch-xxx.vercel.app`
   gibi bir link verir. Bu linki paylaşabilirsin.

---

## ADIM 8 — Kalan senaryoları doldur (sonradan)

İlk 6 senaryo hazır gelecek. Kalan 24 senaryo taslak olarak duracak.
Bunları doldurmak için bana gel: "Şu bölge için şu senaryonun verisini hazırla"
de, ben sana Supabase'e yapıştıracağın hazır SQL/veriyi vereyim.

---

## TAKILIRSAN NE YAP

- **Kırmızı hata (error):** Kopyala, Cursor Chat'e yapıştır, "bu hatayı çöz" de.
- **Cursor takıldı/durdu:** "devam et" yaz.
- **Anlamadığın terim:** Cursor'a "bunu bana basitçe açıkla" de.
- **Bir şey bozuldu:** Panik yok. "Son değişikliği geri al" diyebilirsin.
- **Bana getir:** Ekran görüntüsü/hata metnini bana da yapıştırabilirsin,
  birlikte çözeriz.

---

## ÖZET AKIŞ (tek bakışta)

```
0. Klasör aç + Supabase projesi aç + anahtarları kopyala
1. Master komutu Cursor Chat'e yapıştır
2. Cursor'un verdiği terminal komutlarını çalıştır
3. .env.local'a Supabase anahtarlarını gir
4. SQL dosyalarını Supabase SQL Editor'da Run et
5. npm run dev → localhost:3000'de test et
6. logo.png'yi public klasörüne at
7. GitHub + Vercel ile yayınla, link al
8. Kalan senaryoları sonradan bana danışarak doldur
```

Kolay gelsin. Her adımda takılırsan bana dön.
