# SafeWatch — İnceleme ve Geliştirme Planı (19.11.2026)

Yedek: `Desktop\EMSafe_YEDEK_2026-11-19` klasörü + git etiketi `yedek-2026-11-19`.

## 1. Bulunan sorunlar

| # | Sorun | Durum |
|---|-------|-------|
| 1 | **Giriş çalışmıyor:** `.env.local` / `.env.production` içindeki Supabase adresi (`waxigsgov….supabase.co`) artık yok (DNS'te bulunamıyor). Proje silinmiş ya da ücretsiz planda uzun süre duraklatıldığı için kaldırılmış. Kodda hata yok. | Yeni proje gerekli (aşağıda) |
| 2 | Giriş hataları İngilizce/teknik çıkıyordu ("Failed to fetch"). | Düzeltildi: Türkçe, anlaşılır mesajlar |
| 3 | "30 senaryo" yazıyordu ama 24'ünün içi boş; tıklayınca "görev metni doldurulmamış" ekranı. | Düzeltildi: sayaç yalnızca oynanabilirleri sayar, boşlar "Hazırlanıyor" diye kilitli görünür |
| 4 | Tehlike tanıma ekranında tüm noktalar aynı üçgen, etiket tıklanınca görünüyordu → oyuncu tanımıyor, körlemesine tıklıyordu. | Düzeltildi: numaralı noktalar + "Saha gözlemleri" listesi; görev kartı aynı ekranda açılabilir |
| 5 | Repo kökünde eski Netlify/GitHub Pages ayarları ve `1 (9).md`, `pg.html` gibi dosyalar. | Dokunulmadı — Vercel kullanılıyorsa Netlify kısmı temizlenebilir |

## 2. Girişi açmak için (5 dk, sizin yapmanız gereken)

1. supabase.com → **New project** (bölge: Frankfurt).
2. **SQL Editor → New query** → `supabase/KURULUM_TEK_DOSYA.sql` dosyasının tamamını yapıştır → Run.
3. **Authentication → URL Configuration:** Site URL = `https://em-safe-watch.vercel.app`, Redirect URLs'e aynısını + `/giris/` ekle.
4. İsterseniz **Authentication → Providers → Email → Confirm email** kapatın (kurum içi kullanımda doğrulama maili beklemeden giriş).
5. **Project Settings → API Keys:** Project URL ve Publishable key'i kopyala.
6. Vercel → Project → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` güncelle → Redeploy. Aynı değerleri `.env.local`'a da yazın.

Not: Ücretsiz Supabase projeleri 7 gün hiç kullanılmazsa duraklatılır; 90 günden uzun duraklatılırsa geri alınamaz. Ara sıra açmak yeterli.

## 3. Oyunu geliştirme önerileri (benzer sistemlerden)

Kaynak alınan türler: "spot the hazard" iş güvenliği eğitim simülasyonları, belge/izin denetleme oyunları (masa başı kontrol mekaniği), dallanan senaryolu vaka eğitimleri.

1. **Sonuç zinciri (en etkili):** Her kararın sahadaki sonucunu kısa bir "ne oldu" anlatımıyla göster ("Gaz ölçümü yenilenmedi → 20 dk sonra CO alarmı"). Zaman Makinesi'ndeki bu yapı tüm senaryolara yayılabilir.
2. **Belge denetimi adımı:** Oyuncuya iş izni, gaz ölçüm formu, iskele etiketi, operatör belgesi gibi kartlar ver; tarih/saat/imza uyuşmazlığını bulsun. Kontrolörün gerçek işine en yakın mekanik.
3. **Yetki sınırı kararı ayrı ödül olsun:** "Müteahhide durdurma talimatı ver" / "İşletme yetkilisine bildir" / "Kendin müdahale et (yetkin yok)" — yanlış kişiye müdahale ayrı geri bildirim alsın. (Altyapı `lib/action-authority.ts` içinde var.)
4. **Gerçek sahne görseli:** Bölge başına tek bir illüstrasyon/fotoğraf (şirket içi, kişisiz) ve noktalar o görselde gerçek yerinde. Şu an arka plan genel siluet.
5. **Kısa tur, çok tur:** Bir senaryo 3–4 dakikayı geçmesin; günlük "1 senaryo" hedefi ve haftalık ekip ortalaması (kişiler arası sıralama olmadan).
6. **İçerik üretim şablonu:** 24 boş senaryo için tek sayfalık doldurma formu (görev, 6–8 gözlem, 2–3 sahte, doğru KKD, müteahhit/işletme eksikleri, doğru müdahale). İsterseniz bu formu doldurduğunuz notlardan senaryoları ben yazarım.
