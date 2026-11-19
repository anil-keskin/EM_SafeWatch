-- SafeWatch — TEK DOSYA KURULUM (yeni Supabase projesi için)
-- Supabase > SQL Editor > New query > bu dosyanın tamamını yapıştır > Run
-- Sıra: migrations/0001..0011 ardından seed.sql. Üretildi: 2026-11-19

-- =================== migrations/0001_init.sql ===================
-- SafeWatch — başlangıç şeması
-- Erdemir Mühendislik | KKD ve İSG Saha Simülasyonu
--
-- Bu dosyayı Supabase panelinde SQL Editor'a yapıştırıp "Run" diyerek çalıştırın.
-- Tabloların tamamı yeniden çalıştırmaya dayanıklıdır (if not exists / drop policy if exists).

-- ---------------------------------------------------------------------------
-- 1) REFERANS TABLOLARI (herkes okuyabilir, kimse yazamaz)
-- ---------------------------------------------------------------------------

-- Sahadaki bölgeler (Yüksek Fırın, Çelikhane, Gaz Hatları ...)
create table if not exists zones (
  id          text primary key,          -- 'yuksek_firin', 'celikhane' ...
  name        text not null,             -- 'Yüksek Fırın'
  icon        text,                       -- ikon adı / emoji
  description text,                       -- kartta gösterilen kısa tanıtım
  order_index int  default 0
);

-- KKD ve tedbir kartlarının kategorileri (baş, göz, solunum ...)
create table if not exists equipment_categories (
  id          text primary key,          -- 'bas', 'goz', 'solunum' ...
  name        text not null,
  order_index int  default 0
);

-- Tek tek ekipman / tedbir kartları
create table if not exists equipment_items (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,      -- 'baret_en397'
  name        text not null,             -- 'Endüstriyel Baret'
  category_id text references equipment_categories(id) on delete set null,
  standard    text,                      -- 'EN 397'
  description text,                      -- ne işe yarar
  used_by     text,                      -- 'kontrolluk' | 'yuklenici' | 'isletme' | 'hepsi'
  not_for     text,                      -- hangi durumda yeterli değildir
  why_select  text,                      -- kart (i) rehberi: neden seçmeliyim
  icon        text,
  order_index int default 0
);

-- Senaryolar
create table if not exists scenarios (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,  -- URL'de kullanılır: 'yf-dokum-kanali'
  zone_id          text references zones(id) on delete cascade,
  order_index      int  default 0,
  title            text not null,
  is_draft         boolean default false, -- taslak senaryolar oynanamaz, "yakında" görünür
  briefing         jsonb default '{}'::jsonb,  -- {konum, isletme_faaliyeti, yuklenici_faaliyeti, gorev, hava, is_izni, gaz, sicaklik, yukseklik, ozel_not}
  hazards          jsonb default '[]'::jsonb,  -- [{code,label,is_real,explanation,x,y}]
  actors           jsonb default '[]'::jsonb,  -- [{type,employer,activity,expected_items[],current_items[],authority}]
  required_self    jsonb default '[]'::jsonb,  -- oyuncunun kendi doğru donanımı (equipment code listesi)
  forbidden_self   jsonb default '[]'::jsonb,  -- gereksiz / yanlış seçimler
  contractor_gaps  jsonb default '[]'::jsonb,  -- yüklenicide eksik olan KKD kodları
  operator_gaps    jsonb default '[]'::jsonb,  -- işletme personelindeki uygunsuzluk kodları
  correct_actions  jsonb default '[]'::jsonb,  -- doğru müdahale aksiyon kodları
  wrong_actions    jsonb default '[]'::jsonb,  -- yetki sınırını aşan / hatalı aksiyonlar
  hints            jsonb default '[]'::jsonb,  -- 3 kademeli ipucu
  explanation      text,                       -- sonuç ekranındaki kurumsal açıklama
  competency_tags  jsonb default '[]'::jsonb,  -- ['kkd_secimi','gaz_guvenligi', ...]
  created_at       timestamptz default now()
);

create index if not exists scenarios_zone_idx on scenarios (zone_id, order_index);

-- ---------------------------------------------------------------------------
-- 2) KULLANICIYA AİT TABLOLAR (sadece sahibi görür)
-- ---------------------------------------------------------------------------

-- Senaryo bazında ilerleme. Can sistemi yoktur; skor bir gelişim göstergesidir.
create table if not exists user_progress (
  user_id        uuid references auth.users(id) on delete cascade,
  scenario_id    uuid references scenarios(id) on delete cascade,
  status         text default 'acik',     -- 'acik' | 'tamamlandi'
  best_technical int  default 0,
  best_behavior  int  default 0,
  attempts       int  default 0,
  hints_used     int  default 0,
  updated_at     timestamptz default now(),
  primary key (user_id, scenario_id)
);

-- Bölge + yetkinlik kırılımında özet. "Gelişim Raporum" bu tablodan beslenir.
create table if not exists competency_summary (
  user_id    uuid references auth.users(id) on delete cascade,
  zone_id    text,
  competency text,
  score      int     default 0,
  attempts   int     default 0,
  weak_flag  boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, zone_id, competency)
);

-- ---------------------------------------------------------------------------
-- 3) ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table zones                enable row level security;
alter table equipment_categories enable row level security;
alter table equipment_items      enable row level security;
alter table scenarios            enable row level security;
alter table user_progress        enable row level security;
alter table competency_summary   enable row level security;

-- Referans veriler herkese açık okunur (giriş yapmadan da oynanabilsin diye anon dahil).
drop policy if exists "zones_read" on zones;
create policy "zones_read" on zones
  for select to anon, authenticated using (true);

drop policy if exists "equipment_categories_read" on equipment_categories;
create policy "equipment_categories_read" on equipment_categories
  for select to anon, authenticated using (true);

drop policy if exists "equipment_items_read" on equipment_items;
create policy "equipment_items_read" on equipment_items
  for select to anon, authenticated using (true);

drop policy if exists "scenarios_read" on scenarios;
create policy "scenarios_read" on scenarios
  for select to anon, authenticated using (true);

-- Kullanıcı yalnızca kendi ilerlemesini görür ve yazar.
drop policy if exists "user_progress_select_own" on user_progress;
create policy "user_progress_select_own" on user_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on user_progress;
create policy "user_progress_insert_own" on user_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "user_progress_update_own" on user_progress;
create policy "user_progress_update_own" on user_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_progress_delete_own" on user_progress;
create policy "user_progress_delete_own" on user_progress
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "competency_summary_select_own" on competency_summary;
create policy "competency_summary_select_own" on competency_summary
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "competency_summary_insert_own" on competency_summary;
create policy "competency_summary_insert_own" on competency_summary
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "competency_summary_update_own" on competency_summary;
create policy "competency_summary_update_own" on competency_summary
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "competency_summary_delete_own" on competency_summary;
create policy "competency_summary_delete_own" on competency_summary
  for delete to authenticated using (auth.uid() = user_id);

-- Data API okuma hakları (anon misafir dahil)
grant usage on schema public to anon, authenticated;
grant select on table public.zones to anon, authenticated;
grant select on table public.equipment_categories to anon, authenticated;
grant select on table public.equipment_items to anon, authenticated;
grant select on table public.scenarios to anon, authenticated;
grant select, insert, update, delete on table public.user_progress to authenticated;
grant select, insert, update, delete on table public.competency_summary to authenticated;

-- =================== migrations/0002_open_all_scenarios.sql ===================
-- Tüm senaryoları aç. SQL Editor'da bir kez çalıştırın.
update scenarios set is_draft = false;

-- =================== migrations/0003_api_grants.sql ===================
-- Data API hakları — kod tarafındaki kullanıma birebir karşılık gelir.
--
-- lib/data.ts (misafir / anon + giriş yapmış kullanıcı, yalnızca SELECT):
--   zones, scenarios, equipment_categories, equipment_items
-- lib/progress.ts (yalnızca authenticated, upsert = SELECT+INSERT+UPDATE):
--   user_progress, competency_summary
--
-- RLS politikaları 0001_init.sql içindedir. GRANT olmadan politika yetmez.
-- SQL Editor'da bir kez çalıştırın.

grant usage on schema public to anon, authenticated;

grant select on table public.zones to anon, authenticated;
grant select on table public.equipment_categories to anon, authenticated;
grant select on table public.equipment_items to anon, authenticated;
grant select on table public.scenarios to anon, authenticated;

grant select, insert, update, delete on table public.user_progress to authenticated;
grant select, insert, update, delete on table public.competency_summary to authenticated;

notify pgrst, 'reload schema';

-- =================== migrations/0004_equipment_why_select.sql ===================
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

-- =================== migrations/0005_standart_is_kiyafeti.sql ===================
-- Standart iş kıyafeti kartı (Gövde ailesi).
-- Dolu senaryoların doğru cevap kümelerine dokunulmaz.

insert into public.equipment_items (
  code, name, category_id, standard, description, used_by, not_for, why_select, icon, order_index
) values (
  'standart_is_kiyafeti',
  'Standart İş Kıyafeti',
  'govde',
  'EN ISO 13688',
  'Pamuk/karışım kumaşlı genel saha iş elbisesi. Alev, kıvılcım ve radyan ısı koruması yoktur.',
  'hepsi',
  'Sıcak iş, döküm ve kıvılcım ortamında tutuşur; FR kıyafet yerine geçmez.',
  'Isı ve kıvılcım yoksa, genel saha yürüyüşü ve soğuk iş için seçin. Döküm, sıcak hat veya kaynak çevresinde seçmeyin; tutuşur.',
  '👔',
  0
)
on conflict (code) do update
  set name        = excluded.name,
      category_id = excluded.category_id,
      standard    = excluded.standard,
      description = excluded.description,
      used_by     = excluded.used_by,
      not_for     = excluded.not_for,
      why_select  = excluded.why_select,
      icon        = excluded.icon,
      order_index = excluded.order_index;

-- =================== migrations/0006_kkd_aile_esdegeri.sql ===================
-- Baret ailesi: endüstriyel / çene kayışlı / geniş siperlik eşdeğer.
-- Isı-kıvılcım olmayan senaryolarda standart iş kıyafeti required_self'e eklenir.

update public.equipment_items
set
  description = 'Düşen cisim ve çarpma etkisine karşı temel baş koruması. Çene kayışlı baretle aynı saha ailesindendir.',
  not_for = 'Isı koruması sağlamaz. Çene kayışlı model bu kartın yerine geçer; olmaz demeyiz.',
  why_select = $h$Sahaya çıkıyorsanız baş koruması seçin. Çene kayışlı baret de aynı ihtiyacı karşılar; ikisi de saha standardıdır.$h$
where code = 'baret_en397';

update public.equipment_items
set
  description = 'Çene kayışlı saha bareti. Eğilme ve yüksekte baretin düşmesini önler; tesis standardı olarak da kullanılır.',
  not_for = 'Tek başına ısı koruması sağlamaz. Endüstriyel baretle aynı baş koruma ailesindendir.',
  why_select = $h$Sahada baş koruması olarak endüstriyel baretle aynı aile. İskele ve eğilmede kayış baretin düşmesini önler; saha turunda da doğrudur.$h$
where code = 'baret_jugular';

update public.equipment_items
set
  why_select = $h$Yandan darbe veya yüksek darbe enerjisi varsa seçin. Rutin turda şart değildir; seçerseniz baş koruması yerine geçer.$h$
where code = 'baret_en14052';

update public.scenarios
set
  actors = $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Kaynak dikişlerini iskele üzerinde gözle muayene edecek.","authority":"Kendi güvenliğinden tam sorumludur. Yüklenici üzerinde işi durdurma yetkisi vardır. İskelenin uygunluğunu onaylamak yetkili iskele kurulum sorumlusunun işidir."},
    {"type":"yuklenici","employer":"Mekanik montaj yüklenicisi","activity":"İskele üzerinde boru askı montajı.","expected_items":["baret_en397","tam_vucut_kemeri","soklu_lanyard","eldiven_mekanik","ayakkabi_s3","gozluk_en166"],"current_items":["baret_en397","eldiven_mekanik","ayakkabi_s3","gozluk_en166"]}
  ]$j$::jsonb,
  required_self = $j$["standart_is_kiyafeti","baret_jugular","tam_vucut_kemeri","cift_kancali_lanyard","ayakkabi_s3","gozluk_en166","eldiven_mekanik","iskele_kontrol_karti","toplu_koruma"]$j$::jsonb,
  contractor_gaps = $j$["tam_vucut_kemeri","soklu_lanyard"]$j$::jsonb,
  explanation = 'Bu senaryonun kilit noktası, iskeleye çıkmadan önce verilen karardır. Giriş kapısındaki kontrol kartı kırmızı etiketli ve üç hafta öncesine ait; bu, iskelenin kullanıma uygun olmadığını gösterir. Kemer takmak, lanyard bağlamak ya da dikkatli olmak bu durumu ortadan kaldırmaz. Üstelik ara korkuluğun bir bölümü sökülmüş durumda. Düşme riskinde koruma sıralaması nettir: önce toplu koruma gelir, kişisel koruyucu sonra devreye girer. Doğru davranış yüklenicinin çalışmasını durdurmak, firma saha sorumlusunu çağırmak, kendi ekibinizi iskeleden ve alt kottan uzak tutmak ve durumu kayıt altına almaktır. İskele yetkili kişi tarafından yeniden kontrol edilip yeşil etiketlenene kadar hiç kimse çıkmamalıdır. Yüklenici ekibinde tam vücut kemeri ve şok emicili lanyard eksiktir; bu haliyle +12 metrede çalışıyor olmaları başlı başına kritik bir ihlaldir. Baret tipi (endüstriyel veya çene kayışlı) saha standardıdır, eksik sayılmaz. Kendi donanımınıza gelince: ısı ve kıvılcım yoksa standart iş kıyafeti yeter; iskeleye çıkılacaksa baret, tam vücut kemeri ve yatay hareket için çift kancalı lanyard gerekir. Bu bölgede gaz dedektörü, alüminize giysi veya dozimetre gibi ekipmanlar gereksizdir; dikkati dağıtır ve hareketi kısıtlar.'
where slug = 'yi-iskele-kalite';

update public.scenarios
set
  required_self = $j$["standart_is_kiyafeti","guvenli_mesafe","alan_bariyeri","radyografi_calisma_formu","dozimetre","baret_en397","ayakkabi_s3"]$j$::jsonb
where slug = 'rg-sahaya-yaklasim';

-- =================== migrations/0007_kiyafet_yasaklari.sql ===================
-- Sıcak işte standart (pamuklu) kıyafet kritik yanlıştır.
-- Radyografide FR tesis üniforması olabilir; kurşun önlük gibi yasak değildir.

update public.scenarios
set forbidden_self = $j$["standart_is_kiyafeti","kaynak_maskesi","aluminize_giysi","tam_vucut_kemeri","eldiven_kimyasal","dozimetre","temiz_hava_solunum","kursun_onluk"]$j$::jsonb
where slug = 'yf-dokum-kanali';

update public.scenarios
set forbidden_self = $j$["standart_is_kiyafeti","aluminize_giysi","kaynak_maskesi","tam_vucut_kemeri","temiz_hava_solunum","eldiven_kimyasal","kursun_onluk","dozimetre"]$j$::jsonb
where slug = 'ch-dokum-platformu';

update public.scenarios
set forbidden_self = $j$["standart_is_kiyafeti","kaynak_maskesi","aluminize_giysi","tam_vucut_kemeri","temiz_hava_solunum","kursun_onluk","dozimetre","cizme_isi_hi3"]$j$::jsonb
where slug = 'ch-kaynakli-tadilat';

update public.scenarios
set forbidden_self = $j$["standart_is_kiyafeti","kaynak_maskesi","aluminize_giysi","dozimetre","toz_maskesi_ffp3","kursun_onluk","tam_vucut_kemeri","cizme_isi_hi3","gaz_dedektoru_co"]$j$::jsonb
where slug = 'gh-saha-incelemesi';

update public.scenarios
set forbidden_self = $j$["kursun_onluk","temiz_hava_solunum","aluminize_giysi","kaynak_maskesi","tam_vucut_kemeri","gaz_dedektoru_4li","toz_maskesi_ffp3","yuz_siperi"]$j$::jsonb
where slug = 'rg-sahaya-yaklasim';

-- =================== migrations/0008_ppe_iki_katman.sql ===================
-- İki katmanlı KKD: risk_layer sütunu + çevresel donanımın üç aktörde eşitlenmesi.
-- İşe özel donanım (kaynak, alüminize, kemer, SCBA) kontrollük required_self'ten
-- yalnızca o işi gerçekten yapıyorsa kalır. Öğretici gap'ler korunur.

alter table public.equipment_items
  add column if not exists risk_layer text;

update public.equipment_items
set risk_layer = case code
  when 'kaynak_maskesi' then 'ise_ozgu'
  when 'eldiven_kaynak' then 'ise_ozgu'
  when 'kaynakci_onlugu' then 'ise_ozgu'
  when 'aluminize_giysi' then 'ise_ozgu'
  when 'yuz_siperi' then 'ise_ozgu'
  when 'cizme_isi_hi3' then 'ise_ozgu'
  when 'tam_vucut_kemeri' then 'ise_ozgu'
  when 'soklu_lanyard' then 'ise_ozgu'
  when 'cift_kancali_lanyard' then 'ise_ozgu'
  when 'yatay_yasam_hatti' then 'ise_ozgu'
  when 'temiz_hava_solunum' then 'ise_ozgu'
  when 'eldiven_kimyasal' then 'ise_ozgu'
  when 'can_yelegi' then 'ise_ozgu'
  else 'cevresel'
end;

insert into public.equipment_items (
  code, name, category_id, standard, description, used_by, not_for, icon, order_index, risk_layer
) values (
  'can_yelegi',
  'Can Yeleği / Suya Düşme Koruması',
  'govde',
  'EN ISO 12402',
  'Su kenarı, rıhtım ve iskele üstü liman işinde suya düşmeye karşı yüzerlik sağlar.',
  'hepsi',
  'Kara sahasında ve döküm alanında gerekli değildir.',
  '🛟',
  7,
  'ise_ozgu'
)
on conflict (code) do update
  set name = excluded.name,
      risk_layer = excluded.risk_layer;

create or replace function sw_add_codes(arr jsonb, codes text[])
returns jsonb
language sql
immutable
as $$
  select coalesce((
    select jsonb_agg(to_jsonb(x))
    from (
      select distinct unnest(
        coalesce(
          array(select jsonb_array_elements_text(coalesce(arr, '[]'::jsonb))),
          array[]::text[]
        ) || codes
      ) as x
    ) s
    where x is not null and x <> ''
  ), '[]'::jsonb);
$$;

create or replace function sw_actor_add(actor jsonb, codes text[])
returns jsonb
language sql
immutable
as $$
  select actor || jsonb_build_object(
    'expected_items', sw_add_codes(actor->'expected_items', codes),
    'current_items', sw_add_codes(actor->'current_items', codes)
  );
$$;

-- 1) Döküm kanalı: CO + gürültü + toz çevresel
update public.scenarios
set actors = (
  select jsonb_agg(
    case a->>'type'
      when 'yuklenici' then sw_actor_add(a, array['gaz_dedektoru_co','kacis_maskesi_co','kulak_tikaci'])
      when 'isletme' then sw_actor_add(a, array['gaz_dedektoru_co','kacis_maskesi_co','toz_maskesi_ffp3'])
      else a
    end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'yf-dokum-kanali';

-- 2) Döküm platformu: gürültü işletmede de ortak
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['kulak_tikaci']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'ch-dokum-platformu';

-- 3) Kaynaklı tadilat: gürültü ortak
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' in ('yuklenici','isletme') then sw_actor_add(a, array['kulak_tikaci']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'ch-kaynakli-tadilat';

-- 4) Gaz hattı: FR işletmede de (alan kıyafeti)
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['fr_kiyafet']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'gh-saha-incelemesi';

-- 5) İskele: temel kıyafet yüklenicide
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'yuklenici' then sw_actor_add(a, array['standart_is_kiyafeti']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'yi-iskele-kalite';

-- 6) Tapa: CO gerçek; kaçış maskesi yasaktan çıkar, herkese çevresel gaz
update public.scenarios
set
  required_self = sw_add_codes(required_self, array['kacis_maskesi_co']),
  forbidden_self = (
    select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
    from jsonb_array_elements_text(forbidden_self) x
    where x <> 'kacis_maskesi_co'
  ),
  actors = (
    select jsonb_agg(
      case when a->>'type' in ('yuklenici','isletme')
        then sw_actor_add(a, array['gaz_dedektoru_co','kacis_maskesi_co'])
        else a end
    )
    from jsonb_array_elements(actors) a
  )
where slug = 'yf-tapa-makinesi';

-- 7) Granülasyon: CO gerçek
update public.scenarios
set
  required_self = sw_add_codes(required_self, array['kacis_maskesi_co']),
  actors = (
    select jsonb_agg(
      case when a->>'type' = 'isletme'
        then sw_actor_add(a, array['gaz_dedektoru_co','kacis_maskesi_co','eldiven_isi'])
        else a end
    )
    from jsonb_array_elements(actors) a
  )
where slug = 'yf-cruf-granulasyon';

-- 8) Toz tutma: toz çevresel
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['toz_maskesi_ffp3']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'yf-toz-tutma';

-- 9) Pota ocağı: gürültü
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' in ('yuklenici','isletme') then sw_actor_add(a, array['kulak_tikaci']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'ch-pota-ocagi';

-- 10) Konvertör: gürültü yüklenicide
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'yuklenici' then sw_actor_add(a, array['kulak_tikaci']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'ch-konvertor-refrakter';

-- 11) Sürekli döküm: gürültü işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['kulak_tikaci']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'ch-surekli-dokum';

-- 12) Vana istasyonu: ayakkabı işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['ayakkabi_s3']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'gh-vana-istasyonu';

-- 13) Sıcak şerit: tufal tozu çevresel
update public.scenarios
set
  required_self = sw_add_codes(required_self, array['toz_maskesi_ffp3']),
  actors = (
    select jsonb_agg(
      case when a->>'type' in ('yuklenici','isletme')
        then sw_actor_add(a, array['toz_maskesi_ffp3'])
        else a end
    )
    from jsonb_array_elements(actors) a
  )
where slug = 'hd-sicak-serit';

-- 14) Merdane: gürültü işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['kulak_tikaci']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'hd-merdane-degisimi';

-- 15) Hidrolik: FR işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['fr_kiyafet']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'hd-hidrolik-unite';

-- 16) Tav fırını: kaçış maskesi işletmede (doğalgaz)
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['kacis_maskesi_co']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'hd-tav-firini';

-- 17) Tank girişi: kontrollük GİRMEZ — SCBA/kemer/kimyasal eldiven işe özel
update public.scenarios
set
  required_self = $j$["gaz_dedektoru_4li","kacis_maskesi_co","gozetmen","gaz_olcum_formu","baret_en397","ayakkabi_s3"]$j$::jsonb,
  forbidden_self = sw_add_codes(forbidden_self, array['temiz_hava_solunum','tam_vucut_kemeri','eldiven_kimyasal'])
where slug = 'ka-tank-girisi';

-- 18) Kok bataryası: işletmede CO dedektörü yetersiz, 4'lü gerekir
update public.scenarios
set actors = replace(actors::text, '"gaz_dedektoru_co"', '"gaz_dedektoru_4li"')::jsonb
where slug = 'kk-batarya-ustu';

-- 19) Söndürme kulesi: toz işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['toz_maskesi_ffp3']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'kk-sondurme-kulesi';

-- 20) Gaz arıtma: ayakkabı işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['ayakkabi_s3']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'kk-gaz-arindirma';

-- 21) Gemi: toz + gürültü çevresel
update public.scenarios
set actors = (
  select jsonb_agg(
    case
      when a->>'type' = 'yuklenici' then sw_actor_add(a, array['toz_maskesi_ffp3','kulak_tikaci'])
      when a->>'type' = 'isletme' then sw_actor_add(a, array['kulak_tikaci','gozluk_en166'])
      else a
    end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'lm-gemi-bosaltma';

-- 22) Stok sahası: gürültü çevresel
update public.scenarios
set
  required_self = sw_add_codes(required_self, array['kulak_tikaci']),
  actors = (
    select jsonb_agg(
      case when a->>'type' in ('yuklenici','isletme') then sw_actor_add(a, array['kulak_tikaci']) else a end
    )
    from jsonb_array_elements(actors) a
  )
where slug = 'lm-stok-sahasi-trafik';

-- 23) Eleme hattı: gözlük işletmede
update public.scenarios
set actors = (
  select jsonb_agg(
    case when a->>'type' = 'isletme' then sw_actor_add(a, array['gozluk_en166']) else a end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'sn-eleme-hatti';

-- 24) Konveyör: gürültü / gözlük
update public.scenarios
set actors = (
  select jsonb_agg(
    case
      when a->>'type' = 'isletme' then sw_actor_add(a, array['gozluk_en166','kulak_tikaci'])
      when a->>'type' = 'yuklenici' then sw_actor_add(a, array['kulak_tikaci'])
      else a
    end
  )
  from jsonb_array_elements(actors) a
)
where slug = 'sn-konveyor-bakim';

-- 25) Çatı: standart kıyafet
update public.scenarios
set
  required_self = sw_add_codes(required_self, array['standart_is_kiyafeti']),
  actors = (
    select jsonb_agg(
      case when a->>'type' = 'yuklenici'
        then sw_actor_add(a, array['standart_is_kiyafeti','gozluk_en166'])
        else a end
    )
    from jsonb_array_elements(actors) a
  )
where slug = 'yi-cati-calismasi';

drop function if exists sw_actor_add(jsonb, text[]);
drop function if exists sw_add_codes(jsonb, text[]);

notify pgrst, 'reload schema';

-- =================== migrations/0009_ppe_katman_ilke.sql ===================
-- Katalog katmanını tüm iş gruplarına yay; gözlemcideki işe özel KKD'yi düzelt.
-- Ortam giyilebilir donanımın aktörlere kopyası uygulama katmanında
-- (lib/ppe-consistency.ts) senaryo yüklenirken uygulanır.

create or replace function sw_add_codes(arr jsonb, codes text[])
returns jsonb
language sql
immutable
as $$
  select coalesce((
    select jsonb_agg(to_jsonb(x))
    from (
      select distinct unnest(
        coalesce(
          array(select jsonb_array_elements_text(coalesce(arr, '[]'::jsonb))),
          array[]::text[]
        ) || codes
      ) as x
    ) s
    where x is not null and x <> ''
  ), '[]'::jsonb);
$$;

create or replace function sw_drop_codes(arr jsonb, codes text[])
returns jsonb
language sql
immutable
as $$
  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
  from jsonb_array_elements_text(coalesce(arr, '[]'::jsonb)) x
  where not (x = any(codes));
$$;

update public.equipment_items
set risk_layer = case
  when code in (
    'kaynak_maskesi', 'eldiven_kaynak', 'kaynakci_onlugu', 'kaynak_perdesi',
    'aluminize_giysi', 'yuz_siperi',
    'tam_vucut_kemeri', 'soklu_lanyard', 'cift_kancali_lanyard', 'yatay_yasam_hatti',
    'temiz_hava_solunum',
    'eldiven_kimyasal', 'yarim_yuz_maske',
    'can_yelegi',
    'kursun_onluk',
    'cizme_isi_hi3'
  ) then 'ise_ozgu'
  else 'cevresel'
end;

-- Gözlemci yağ/kimyasala dokunmaz: işe özel eldiven required'dan çıksın.
update public.scenarios
set
  required_self = sw_drop_codes(required_self, array['eldiven_kimyasal']),
  forbidden_self = sw_add_codes(forbidden_self, array['eldiven_kimyasal'])
where slug in ('en-trafo-binasi', 'hd-hidrolik-unite', 'kk-gaz-arindirma');

-- Gaz istasyonu / kaçak: patlama-yangın ortamı, FR herkese.
update public.scenarios
set
  required_self = sw_add_codes(required_self, array['fr_kiyafet']),
  forbidden_self = sw_add_codes(forbidden_self, array['standart_is_kiyafeti'])
where slug in ('gh-vana-istasyonu', 'gh-kacak-mudahale');

-- Çatıya çıkan kontrollük: temel göz koruması ortam donanımıdır.
update public.scenarios
set required_self = sw_add_codes(required_self, array['gozluk_en166'])
where slug = 'yi-cati-calismasi';

-- Yerel 6 senaryonun aktör listesi seed ile aynı kalsın.
update public.scenarios
set actors = $j$[
  {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Yürüyüş yolu montajını gözlemliyor, ilerleme kaydı alıyor.","authority":"İşletme personeline doğrudan talimat verme yetkisi YOKTUR. Gözlemini işletme sorumlusuna ve İSG birimine bildirir. Kendi ekibini risk alanından çekme yetkisi tamdır."},
  {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Tandiş çevresinde sıvı metal kaçağına müdahale ediyor.","expected_items":["aluminize_giysi","yuz_siperi","cizme_isi_hi3","eldiven_isi","baret_en397","kulak_tikaci"],"current_items":["fr_kiyafet","gozluk_en166","ayakkabi_s3","eldiven_mekanik","baret_en397","kulak_tikaci"]},
  {"type":"yuklenici","employer":"Mekanik montaj yüklenicisi","activity":"Platformun 15 m uzağında yürüyüş yolu montajı.","expected_items":["baret_en397","gozluk_en166","eldiven_mekanik","eldiven_isi","fr_kiyafet","ayakkabi_s3","kulak_tikaci"],"current_items":["baret_en397","gozluk_en166","eldiven_mekanik","eldiven_isi","fr_kiyafet","ayakkabi_s3","kulak_tikaci"]}
]$j$::jsonb
where slug = 'ch-dokum-platformu';

update public.scenarios
set actors = $j$[
  {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Kompansatör yenileme işi öncesi saha ön incelemesi.","authority":"Kendi ekibinin sahaya girip girmeyeceğine karar verme yetkisi tamdır. Yüklenicinin giriş onayını verme veya erteleme yetkisi vardır. Hattın izolasyonu işletmenin sorumluluğundadır."},
  {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Hat basıncını düşürme, blindaj hazırlığı.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex"],"current_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex"]},
  {"type":"yuklenici","employer":"Boru ve kaynak yüklenicisi","activity":"Sahaya giriş için onay bekliyor.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3","fr_kiyafet","ex_el_feneri","telsiz_atex"],"current_items":["baret_en397","ayakkabi_s3","fr_kiyafet","ex_el_feneri","telsiz_atex"]}
]$j$::jsonb
where slug = 'gh-saha-incelemesi';

update public.scenarios
set actors = $j$[
  {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Radyografik muayene sonuçlarını takip edecek.","authority":"Alana girmeme kararı tamamen kendisine aittir. Yüklenici NDT ekibinin çalışmasını durdurma yetkisi vardır. İşletme personelini uyarmak için işletme sorumlusuna bildirim yapar."},
  {"type":"yuklenici","employer":"Tahribatsız muayene yüklenicisi","activity":"Gama kaynağı ile film çekimi.","expected_items":["dozimetre","alan_bariyeri","radyografi_calisma_formu","guvenli_mesafe","baret_en397","ayakkabi_s3","standart_is_kiyafeti"],"current_items":["dozimetre","baret_en397","ayakkabi_s3","guvenli_mesafe","standart_is_kiyafeti"]},
  {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Komşu hatta rutin tur.","expected_items":["baret_en397","ayakkabi_s3","reflektorlu_yelek","standart_is_kiyafeti"],"current_items":["baret_en397","ayakkabi_s3","reflektorlu_yelek","standart_is_kiyafeti"]}
]$j$::jsonb
where slug = 'rg-sahaya-yaklasim';

drop function if exists sw_add_codes(jsonb, text[]);
drop function if exists sw_drop_codes(jsonb, text[]);

notify pgrst, 'reload schema';

-- =================== migrations/0010_gh_saha_authority.sql ===================
-- Canlı uygulanan MCP sürümündeki yazım hatasını düzeltir.
-- 0009 dosyası doğru metni içerir; bu adım yalnızca uzak kaydı hizalar.

update public.scenarios
set actors = replace(actors::text, 'sorumluluğundundadır', 'sorumluluğundadır')::jsonb
where slug = 'gh-saha-incelemesi';

-- =================== migrations/0011_zaman_makinesi.sql ===================
-- SafeWatch — Zaman Makinesi modülü
--
-- Bu dosyayı Supabase SQL Editor'a yapıştırıp BİR KEZ çalıştırın.
-- Tekrar çalıştırılabilir: şema eklemeleri "if not exists", veri "on conflict do update".
--
-- Ne yapar:
--   1) scenarios tablosuna scenario_type / incident_* / is_published alanlarını ekler
--   2) Mevcut 30 senaryo default sayesinde scenario_type = 'training' olur, verisine dokunulmaz
--   3) İki Zaman Makinesi senaryosunu ekler
--
-- RLS: 0001_init.sql içindeki "scenarios_read" politikası using (true) olduğu için
-- time_machine satırları da anon kullanıcı tarafından okunur; yeni politika gerekmez.
-- GRANT tarafı da 0003_api_grants.sql ile zaten verilmiştir.

-- ===========================================================================
-- 1. ŞEMA
-- ===========================================================================

alter table scenarios
  add column if not exists scenario_type    text    not null default 'training',
  add column if not exists incident_date    date,
  add column if not exists incident_unit    text,
  add column if not exists incident_outcome text,
  add column if not exists incident_lesson  text,
  add column if not exists is_published     boolean not null default true;

-- Yalnızca bilinen iki havuz değeri kabul edilir.
alter table scenarios drop constraint if exists scenarios_scenario_type_check;
alter table scenarios
  add constraint scenarios_scenario_type_check
  check (scenario_type in ('training', 'time_machine'));

-- Kronolojik liste (en yeni üstte) için.
create index if not exists scenarios_time_machine_idx
  on scenarios (scenario_type, incident_date desc);

-- ===========================================================================
-- 2. ZAMAN MAKİNESİ SENARYOLARI
-- ===========================================================================
-- İçerik content/scenarios.ts içindeki TIME_MACHINE_SCENARIOS ile birebir aynıdır.

insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags,
  scenario_type, incident_date, incident_unit, incident_outcome, incident_lesson,
  is_published
) values
  (
    'tm-kok-gazi-flans-butunlugu',
    'haddehane',
    1,
    'Kok Gazı Hattı — Flanş Bütünlüğü Riski',
    false,
    '{"konum":"Slab fırınları arası kok gazı ana hattı — basınç transmitteri bölgesi","gorev":"Basınç dalgalanması bildirilen kok gazı hattında yüklenici ekibinin yaklaşma hazırlığını denetlemek ve girişe onay verip vermeyeceğine karar vermek.","isletme_faaliyeti":"İşletme ekibi transmitter okumalarını panelden izliyor; hattın basıncı henüz düşürülmedi, blindaj takılmadı.","yuklenici_faaliyeti":"Müteahhit ekibi temiz hava solunum maskesi, poşet ve tel ile hatta yaklaşıp geçici sızdırmazlık uygulamaya hazırlanıyor.","hava":"Rüzgâr batıdan 3 m/s, değişken. Dış ortam sıcaklığı 29°C.","is_izni":"Gazlı sahada çalışma izni HENÜZ TAMAMLANMADI. Hat basınç altında, izolasyon yok.","gaz":"Kok gazı: CO, H₂S ve patlayıcı karışım (LEL) riski bir arada.","sicaklik":"Slab fırınları çalışıyor; hat güzergâhında yüzey sıcaklıkları yüksek.","ozel_not":"Basınç transmitterlerinde dalgalanma tespit edildi. Dalgalanma, hattın kendisiyle ilgili bir uyarıdır; ölçüm cihazı arızası varsayılarak yaklaşılmamalıdır."}'::jsonb,
    '[{"code":"basincli_hat","label":"Basınç altındaki hat","is_real":true,"x":52,"y":44,"explanation":"Hat izole edilmemiş ve blindaj takılmamıştır. Basınç altındaki bir bağlantı, üzerinde çalışılabilir bir ekipman değildir."},{"code":"flans_butunlugu","label":"Flanş / bağlantı bütünlüğü şüphesi","is_real":true,"x":62,"y":36,"explanation":"Basınç dalgalanması, korozyon veya mekanik yorulma nedeniyle zayıflamış bir bağlantının habercisi olabilir. Ani kırılma riski vardır."},{"code":"co_gazi","label":"Karbonmonoksit (CO)","is_real":true,"x":30,"y":52,"explanation":"Kok gazının ana bileşenlerinden biridir; renksiz, kokusuz ve öldürücüdür."},{"code":"h2s","label":"Hidrojen sülfür (H₂S)","is_real":true,"x":40,"y":28,"explanation":"Yüksek konsantrasyonda koku alma duyusunu felce uğratır; kokunun kesilmesi tehlikenin bittiği anlamına gelmez."},{"code":"patlayici_ortam","label":"Patlayıcı ortam (LEL)","is_real":true,"x":70,"y":58,"explanation":"Kok gazı hava ile patlayıcı karışım oluşturur. Ex sertifikasız ekipman ve statik yük taşıyan kıyafet sokulamaz."},{"code":"radyan_isi","label":"Radyan ısı (slab fırınları)","is_real":true,"x":18,"y":34,"explanation":"Fırınlar çalışır durumdadır; güzergâhtaki yüzey sıcaklıkları temas yanığı üretebilir."},{"code":"askida_yuk","label":"Askıda yük","is_real":false,"x":86,"y":20,"explanation":"Bu bölgede vinç operasyonu yoktur; malzeme elle taşınmaktadır."},{"code":"dusme_riski","label":"Yüksekten düşme","is_real":false,"x":12,"y":76,"explanation":"Çalışma zemin kotundadır; kot farkı veya açık boşluk bulunmamaktadır."}]'::jsonb,
    '[{"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Yüklenici ekibinin hatta yaklaşma hazırlığını denetlemek ve giriş onayı kararını vermek.","authority":"Kendi ekibiniz üzerinde tam yetkilisiniz. Yüklenici çalışmasını durdurma yetkiniz sözleşme kapsamındadır. Hattın basıncını düşürmek ve izole etmek işletmenin sorumluluğundadır; işletme personeline doğrudan talimat veremezsiniz."},{"type":"yuklenici","employer":"Müteahhit firma","activity":"Temiz hava solunum maskesi, poşet ve tel ile hatta yaklaşıp geçici sızdırmazlık uygulamak.","expected_items":["gaz_dedektoru_4li","antistatik_ex_kiyafet","temiz_hava_solunum","baret_en397","ayakkabi_s3","alan_bariyeri"],"current_items":["temiz_hava_solunum","baret_en397","ayakkabi_s3"]},{"type":"isletme","employer":"Demir çelik işletmesi","activity":"Transmitter okumalarını panelden izlemek, basınç düşürme ve blindaj hazırlığını yürütmek.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3"],"current_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3"]}]'::jsonb,
    '["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex","ruzgar_yonu","kacis_guzergahi","guvenli_mesafe","gozetmen"]'::jsonb,
    '["standart_is_kiyafeti","gaz_dedektoru_co","toz_maskesi_ffp3","kaynak_maskesi","aluminize_giysi","kursun_onluk","dozimetre","tam_vucut_kemeri","can_yelegi","cizme_isi_hi3"]'::jsonb,
    '["gaz_dedektoru_4li","antistatik_ex_kiyafet","alan_bariyeri"]'::jsonb,
    '[]'::jsonb,
    '["durdur_muteahhit","ekibi_cikar","bildir_isletme","izin_kontrol","kayit_al"]'::jsonb,
    '["gozleme_devam"]'::jsonb,
    '["Basınç dalgalanması neyin habercisidir? Ölçüm cihazının arızası mı, yoksa ölçtüğü hattın kendisinin bir sorunu mu? Bu ayrım, yaklaşıp yaklaşmama kararının tamamını belirler.","Yüklenicinin hazırlığına bakın: temiz hava solunum maskesi neye karşı korur? Solunan gaza mı, yoksa basınç altındaki bir bağlantının ani kırılmasına mı? Doğru KKD yanlış bir kararı güvenli hale getirmez.","Gazlı sahada çalışma izni henüz tamamlanmadı ve hat basınç altında. Bu şartlarda en güçlü kontrollük davranışı, donanımı tamamlatıp yaklaşmak değil; yaklaşımı durdurup ekibi geri çekmek ve hattın basıncının düşürülmesini istemektir."]'::jsonb,
    'Bu senaryonun doğru cevabı bir KKD listesi değil, bir yaklaşma kararıdır. Basınç transmitterindeki dalgalanma, ölçüm cihazının değil ölçtüğü hattın bir uyarısıdır: korozyon veya mekanik yorulma nedeniyle zayıflamış bir bağlantı, basınç altında herhangi bir anda kırılabilir. Temiz hava solunum maskesi gaz solunmasına karşı gerçekten koruyucudur; ancak ani mekanik kırılmaya, basınçla savrulan parçaya ve anlık yüksek konsantrasyon bulutuna karşı hiçbir koruma sağlamaz. Bu yüzden maskeyi takıp yaklaşma akıl yürütmesi burada hatalıdır. Doğru davranış zinciri şudur: yüklenicinin yaklaşımını durdurmak, kendi ekibinizi güvenli mesafeye çekmek, hattın basıncının düşürülmesi ve izolasyonun sağlanması için işletme sorumlusuna bildirim yapmak, gazlı sahada çalışma izninin şartlarını yeniden kontrol ettirmek ve tespiti kayıt altına almak. Gözleme devam etmek, riskin kendiliğinden geçmesini beklemek anlamına gelir ve bu senaryoda açıkça yanlıştır. Donanım tarafında kritik ayrım, kok gazının yalnızca CO olmadığıdır: içinde H₂S ve patlayıcı karışım da bulunur, bu nedenle tek gazlı dedektör yanıltıcıdır ve dört gazlı cihaz gerekir. Patlayıcı ortam nedeniyle kıyafetin antistatik, elektrikli ekipmanın Ex sertifikalı olması zorunludur. Yüklenici ekibinde gaz ölçüm cihazı, antistatik kıyafet ve alan bariyeri hiç yoktur; bu haliyle hatta yaklaşmaları söz konusu olamaz.',
    '["gaz_guvenligi","tehlike_tanima","isi_durdurma_karari","is_izni_yonetimi","muteahhit_denetimi","kontrolluk_davranisi"]'::jsonb,
    'time_machine',
    '2026-08-21'::date,
    'Sıcak Haddehane Müdürlüğü',
    'Basınç dalgalanması tespit edildikten sonra kontrol amacıyla bölgeye gidildi. Temiz hava solunum maskesi, poşet ve tel talep edildi. Malzemeler getirilirken basınç transmitterinin bağlı olduğu boru/flanş bağlantısı kırıldı. Ortama yayılan gazdan üç çalışan etkilendi.',
    'Basınç dalgalanması, korozyon veya mekanik yorulma nedeniyle zayıflamış bir bağlantının habercisi olabilir. Solunum koruması gaz maruziyetine karşı işe yarar, ancak ani mekanik kırılmaya karşı koruma sağlamaz. Doğru davranış yaklaşmayı durdurmak, hattı basınçsız hale getirtmek ve ekipman bütünlüğünü doğrulatmaktır.',
    true
  ),
  (
    'tm-zemin-saci-cokmesi',
    'kok_fabrikasi',
    2,
    'Zemin Sacı Çökmesi — Gizli Yapısal Hasar',
    false,
    '{"konum":"1 ve 2 numaralı tanklar arası üst kat platformu, +6,30 kotu","gorev":"Hasarlı zemin sacının değişimi öncesi yapılan izolasyon söküm çalışmasını denetlemek ve çalışma alanının güvenli olup olmadığına karar vermek.","isletme_faaliyeti":"İşletme ekibi alt kotta tank çevresi rutin kontrolünü sürdürüyor; üst kat çalışmasına müdahil değil.","yuklenici_faaliyeti":"Müteahhit ekibi zemin sacı değişimi için üst katta izolasyon sökümü yapıyor; malzemeyi taşırken zemin üzerinde serbestçe hareket ediyor.","hava":"Kapalı, nemli. Platform yüzeyinde yer yer nem birikmesi var.","is_izni":"Yüksekte çalışma izni açık; ancak zeminin yapısal doğrulaması izin kapsamında YER ALMIYOR.","yukseklik":"Çalışma kotu +6,30 m. Alt kot beton zemin; araya yakalayıcı platform veya ağ konulmamış.","ozel_not":"Zemin sacında hasar olduğu biliniyor — zaten bu yüzden değiştirilecek. Şüpheli bölge bariyerle çevrilmemiş ve yetkili kişi tarafından yapısal doğrulamadan geçmemiş."}'::jsonb,
    '[{"code":"yapisal_butunluk","label":"Zemin sacında gizli yapısal hasar","is_real":true,"x":46,"y":58,"explanation":"Gözle sağlam görünen sac, alt yüzeydeki korozyon veya ısıl yorulma nedeniyle taşıma kapasitesini kaybetmiş olabilir. Üstüne basılarak test edilmez."},{"code":"dusme_riski","label":"Yüksekten düşme (+6,30 m)","is_real":true,"x":58,"y":44,"explanation":"Zemin çökmesi durumunda alt kota serbest düşme gerçekleşir; bu yükseklik ağır yaralanma için fazlasıyla yeterlidir."},{"code":"toplu_koruma_yoklugu","label":"Toplu koruma yok (bariyer / ağ / yakalayıcı platform)","is_real":true,"x":30,"y":66,"explanation":"Şüpheli bölge çevrelenmemiş ve altına yakalayıcı sistem konmamıştır. Toplu koruma, kişisel korumadan önce gelir."},{"code":"ankraj_yoklugu","label":"Bağlanacak ankraj / yaşam hattı yok","is_real":true,"x":70,"y":30,"explanation":"Kemer takmak tek başına yeterli değildir; bağlanacak uygun bir ankraj noktası veya yatay yaşam hattı bulunmalıdır."},{"code":"kaygan_zemin","label":"Nemli / kaygan platform yüzeyi","is_real":true,"x":22,"y":80,"explanation":"Nem birikmesi metal yüzeyde tutunmayı azaltır; dengesini kaybeden bir kişi hasarlı bölgeye basabilir."},{"code":"malzeme_dusmesi","label":"Alt kota malzeme düşmesi","is_real":true,"x":82,"y":70,"explanation":"Sökülen izolasyon parçaları alt kota düşebilir; alt kotta işletme ekibi çalışmaktadır."},{"code":"patlayici_ortam","label":"Patlayıcı ortam (LEL)","is_real":false,"x":12,"y":24,"explanation":"Tanklar boşaltılmış ve havalandırılmıştır; bu çalışma için gazlı ortam şartı oluşmamıştır."},{"code":"radyan_isi","label":"Radyan ısı","is_real":false,"x":90,"y":16,"explanation":"Bu platformda kızgın yüzey veya sıvı metal bulunmamaktadır."}]'::jsonb,
    '[{"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Zemin sacı değişimi öncesi izolasyon söküm çalışmasını denetlemek.","authority":"Yüklenici çalışmasını durdurma yetkiniz sözleşme kapsamındadır. Zeminin yapısal doğrulamasını yaptırma talebini yüklenici firma saha sorumlusuna iletirsiniz. İşletme personelinin alt kottaki çalışmasına doğrudan talimat veremezsiniz."},{"type":"yuklenici","employer":"Müteahhit firma","activity":"Üst katta izolasyon sökümü ve hasarlı zemin sacının değişime hazırlanması.","expected_items":["tam_vucut_kemeri","cift_kancali_lanyard","yatay_yasam_hatti","toplu_koruma","alan_bariyeri","baret_jugular","ayakkabi_s3","eldiven_mekanik"],"current_items":["baret_jugular","ayakkabi_s3","eldiven_mekanik","alan_bariyeri"]},{"type":"isletme","employer":"Demir çelik işletmesi","activity":"Alt kotta tank çevresi rutin kontrolü.","expected_items":["baret_en397","ayakkabi_s3","standart_is_kiyafeti"],"current_items":["baret_en397","ayakkabi_s3","standart_is_kiyafeti"]}]'::jsonb,
    '["baret_jugular","gozluk_en166","eldiven_mekanik","ayakkabi_s3","standart_is_kiyafeti","tam_vucut_kemeri","cift_kancali_lanyard","yatay_yasam_hatti","toplu_koruma","alan_bariyeri","gozetmen"]'::jsonb,
    '["kaynak_maskesi","aluminize_giysi","kaynakci_onlugu","kursun_onluk","dozimetre","cizme_isi_hi3","can_yelegi","temiz_hava_solunum","eldiven_kaynak"]'::jsonb,
    '["tam_vucut_kemeri","cift_kancali_lanyard","yatay_yasam_hatti","toplu_koruma"]'::jsonb,
    '[]'::jsonb,
    '["durdur_muteahhit","izin_kontrol","bildir_firma","kayit_al"]'::jsonb,
    '["gozleme_devam"]'::jsonb,
    '["Çalışmanın konusunu tekrar okuyun: değiştirilecek olan şey, üzerinde durulan zeminin kendisi. Hasarlı olduğu zaten biliniyorsa, o zemine basılarak çalışılabilir mi?","İş izni yüksekte çalışma için açık; ancak izin kapsamında ne YOK? Zeminin taşıma kapasitesini kimin doğruladığı yazıyor mu? İzni olan her iş, her koşulda güvenli değildir.","Sıralamayı düşünün: önce toplu koruma mı, önce kişisel koruma mı? Şüpheli bölge bariyerle çevrilmeden ve yapısal doğrulama yapılmadan kemer takmak, riski ortadan kaldırmaz; yalnızca sonucunu hafifletmeyi umar."]'::jsonb,
    'Bu senaryoda tehlike, görülmesi en zor olan türdendir: zemin gözle sağlam görünür, ama alt yüzeyindeki korozyon ve ısıl yorulma taşıma kapasitesini çoktan bitirmiş olabilir. Kritik mantık hatası, hasarlı olduğu bilinen bir zeminin üzerinde durarak o zemini değiştirmeye çalışmaktır. Doğru sıralama toplu korumanın kişisel korumadan önce gelmesidir: şüpheli bölge işe başlamadan önce bariyerle çevrilmeli, yetkili kişi tarafından yapısal doğrulama yapılmalı, gerekiyorsa alta yakalayıcı platform veya ağ kurulmalıdır. Kişisel koruma bunların yerine geçmez, üzerine eklenir; üstelik tam vücut kemeri ancak bağlanacak uygun bir ankraj veya yatay yaşam hattı varsa anlamlıdır, ki burada o da yoktur. Yüksekte çalışma izninin açık olması yanıltıcıdır: izin kapsamında zeminin taşıma kapasitesinin doğrulanması yer almamaktadır, dolayısıyla izin bu riski karşılamamaktadır. Doğru kontrollük davranışı yüklenici çalışmasını durdurmak, iş izin şartlarını yapısal doğrulamayı da kapsayacak şekilde yeniden kontrol ettirmek, eksikliğin giderilmesi sorumluluğunu yüklenici firma saha sorumlusuna vermek ve tespiti kayıt altına almaktır. Alt kotta işletme ekibi bulunduğundan malzeme düşmesine karşı alan izolasyonu da ihmal edilmemelidir.',
    '["yuksekte_calisma","toplu_koruma_onceligi","tehlike_tanima","alan_izolasyonu","isi_durdurma_karari","muteahhit_denetimi"]'::jsonb,
    'time_machine',
    '2026-07-18'::date,
    'Kok Fabrikası Müdürlüğü',
    'Hasarlı zemin sacının değişimi için izolasyon sökümü yapılırken, çalışan hasarlı zemin sacına bastı. Sac çöktü ve yaklaşık 6,3 metre yükseklikten düşme gerçekleşti.',
    'Görünüşte sağlam duran zemin sacları, alt yüzeydeki korozyon veya ısıl yorulma nedeniyle taşıma kapasitesini kaybetmiş olabilir. Çalışma alanının yapısal bütünlüğü işe başlamadan önce yetkili kişi tarafından doğrulanmalı, şüpheli bölgeler bariyerle çevrilmeli ve düşmeye karşı toplu koruma sağlanmalıdır.',
    true
  )
on conflict (slug) do update
  set zone_id          = excluded.zone_id,
      order_index      = excluded.order_index,
      title            = excluded.title,
      is_draft         = excluded.is_draft,
      briefing         = excluded.briefing,
      hazards          = excluded.hazards,
      actors           = excluded.actors,
      required_self    = excluded.required_self,
      forbidden_self   = excluded.forbidden_self,
      contractor_gaps  = excluded.contractor_gaps,
      operator_gaps    = excluded.operator_gaps,
      correct_actions  = excluded.correct_actions,
      wrong_actions    = excluded.wrong_actions,
      hints            = excluded.hints,
      explanation      = excluded.explanation,
      competency_tags  = excluded.competency_tags,
      scenario_type    = excluded.scenario_type,
      incident_date    = excluded.incident_date,
      incident_unit    = excluded.incident_unit,
      incident_outcome = excluded.incident_outcome,
      incident_lesson  = excluded.incident_lesson,
      is_published     = excluded.is_published;

-- PostgREST şema önbelleğini tazele (yeni kolonlar API'de görünsün).
notify pgrst, 'reload schema';

-- ===========================================================================
-- 3. DOĞRULAMA — beklenen: training = 30, time_machine = 2
-- ===========================================================================
select scenario_type, count(*) as adet
from scenarios
where is_published
group by scenario_type
order by 1;

-- =================== seed.sql ===================
-- SafeWatch — başlangıç verisi
-- Önce 0001_init.sql çalıştırılmış olmalıdır.
-- Bu dosya tekrar tekrar çalıştırılabilir (on conflict ... do update).

-- ===========================================================================
-- BÖLGELER
-- ===========================================================================
insert into zones (id, name, icon, description, order_index) values
  ('yuksek_firin',    'Yüksek Fırın',    '🔥', 'Döküm sahası, tapa makinesi, cüruf kanalları. CO gazı ve radyan ısı baskın risk.',        1),
  ('celikhane',       'Çelikhane',       '🫗', 'Konvertör, pota ocağı ve sürekli döküm. Sıvı metal sıçraması ve yüksek ısı.',             2),
  ('kok_fabrikasi',   'Kok Fabrikası',   '🏭', 'Kok bataryaları ve söndürme kulesi. Sıcaklık, kok gazı ve PAH maruziyeti.',               3),
  ('sinter',          'Sinter',          '🪨', 'Karışım, sinterleme ve eleme hatları. Yoğun toz ve konveyör riskleri.',                   4),
  ('haddehane',       'Haddehane',       '⚙️', 'Sıcak ve soğuk hadde hatları. Hareketli ekipman, sıcak şerit, hidrolik enerji.',          5),
  ('enerji_elektrik', 'Enerji Merkezi',  '⚡', 'Şalt sahaları ve trafo binaları. Ark parlaması ve enerji izolasyonu.',                    6),
  ('gaz_hatlari',     'Gaz Hatları',     '🧯', 'Kok gazı, yüksek fırın gazı ve doğalgaz hatları. Boğucu/patlayıcı ortam riski.',          7),
  ('liman_stok',      'Liman',           '🚢', 'Boşaltma, stoklama ve saha trafiği. Askıda yük ve iş makinesi trafiği.',                  8),
  ('yuksekte_iskele', 'Yüksekte/İskele', '🪜', 'İskele, platform ve çatı çalışmaları. Düşme ve malzeme düşmesi riski.',                   9),
  ('kapali_alan',     'Kapalı Alan',     '🕳️', 'Tank, silo ve kapalı hacim girişleri. Boğulma, gaz birikmesi ve kurtarma zorluğu.',      10),
  ('radyografi',      'Radyografi',      '☢️', 'Tahribatsız muayene, gama kaynağı ile film çekimi. İyonlaştırıcı radyasyon.',            11)
on conflict (id) do update
  set name = excluded.name,
      icon = excluded.icon,
      description = excluded.description,
      order_index = excluded.order_index;

-- ===========================================================================
-- EKİPMAN KATEGORİLERİ
-- ===========================================================================
insert into equipment_categories (id, name, order_index) values
  ('bas',       'Baş Koruma',                 1),
  ('goz',       'Göz ve Yüz Koruma',          2),
  ('solunum',   'Solunum Koruma',             3),
  ('isitme',    'İşitme Koruma',              4),
  ('el',        'El Koruma',                  5),
  ('ayak',      'Ayak Koruma',                6),
  ('govde',     'Gövde ve Kıyafet',           7),
  ('yuksekte',  'Yüksekte Çalışma',           8),
  ('olcum',     'Ölçüm ve Tespit',            9),
  ('alan',      'Alan Tedbiri (KKD Dışı)',   10),
  ('dokuman',   'Doküman ve İzin',           11)
on conflict (id) do update
  set name = excluded.name,
      order_index = excluded.order_index;

-- ===========================================================================
-- EKİPMAN / TEDBİR KARTLARI
-- ===========================================================================
insert into equipment_items (code, name, category_id, standard, description, used_by, not_for, icon, order_index) values
  -- Baş
  ('baret_en397',        'Endüstriyel Baret',                  'bas',      'EN 397',              'Düşen cisim ve çarpma etkisine karşı temel baş koruması. Çene kayışlı baretle aynı saha ailesindendir.',          'hepsi',      'Isı koruması sağlamaz. Çene kayışlı model bu kartın yerine geçer; olmaz demeyiz.',          '⛑️', 1),
  ('baret_jugular',      'Çene Kayışlı Baret',                 'bas',      'EN 397 / EN 12492',   'Çene kayışlı saha bareti. Eğilme ve yüksekte baretin düşmesini önler; tesis standardı olarak da kullanılır.',     'hepsi',      'Tek başına ısı koruması sağlamaz. Endüstriyel baretle aynı baş koruma ailesindendir.',       '⛑️', 2),
  ('baret_en14052',      'Geniş Siperlikli Baret',             'bas',      'EN 14052',            'Yandan ve açılı darbelere karşı artırılmış koruma sağlar.',                                                      'hepsi',      'Dar hacimlerde hareket kısıtlar; her işte gerekli değildir.',                               '⛑️', 3),
  -- Göz ve yüz
  ('gozluk_en166',       'Koruyucu Gözlük',                    'goz',      'EN 166',              'Toz, parçacık ve düşük enerjili darbeye karşı temel göz koruması.',                                              'hepsi',      'Radyan ısı ve kaynak arkına karşı koruma sağlamaz.',                                        '🥽', 1),
  ('gozluk_ir',          'IR Filtreli Gözlük',                 'goz',      'EN 171',              'Sıvı metal ve kızgın yüzeylerin yaydığı kızılötesi ışınıma karşı filtreli gözlük.',                             'hepsi',      'Kaynak arkı için uygun kararma derecesini sağlamaz.',                                       '🕶️', 2),
  ('yuz_siperi',         'Yüz Siperi',                         'goz',      'EN 166',              'Sıçrama ve radyan ısıya karşı tüm yüzü koruyan siper. Gözlükle birlikte kullanılır.',                            'hepsi',      'Tek başına göz koruması yerine geçmez.',                                                    '😷', 3),
  ('kaynak_maskesi',     'Kaynakçı Maskesi',                   'goz',      'EN 175 + EN 379',     'Kaynak arkının UV/IR ışımasına karşı otomatik kararan camlı maske. Sadece kaynak yapan kişi kullanır.',           'yuklenici',  'Kaynak yapmayan gözlemci için gereksizdir, görüş alanını daraltır.',                          '🪖', 4),
  -- Solunum
  ('kacis_maskesi_co',   'Acil Kaçış Maskesi (CO)',            'solunum',  'EN 404',              'CO ortamında bölgeyi terk etmek için kısa süreli kaçış imkânı verir. Gaz riskli bölgede zorunludur.',            'hepsi',      'Çalışmaya devam etmek için değildir; oksijen sağlamaz, sadece kaçış içindir.',               '🎭', 1),
  ('toz_maskesi_ffp3',   'Toz Maskesi FFP3',                   'solunum',  'EN 149',              'İnce toz ve refrakter partiküllerine karşı tek kullanımlık filtreli maske.',                                     'hepsi',      'Gaz ve buharlara karşı koruma sağlamaz.',                                                   '😷', 2),
  ('yarim_yuz_maske',    'Yarım Yüz Maske + Filtre',           'solunum',  'EN 140',              'Değiştirilebilir filtreyle gaz/buhar ve partikül koruması sağlar.',                                              'hepsi',      'Oksijen yetersizliği olan ortamda kullanılamaz.',                                           '🎭', 3),
  ('temiz_hava_solunum', 'Temiz Hava Beslemeli Cihaz (SCBA)',  'solunum',  'EN 137',              'Oksijen yetersiz veya IDLH ortamda bağımsız hava kaynağı sağlar. Özel eğitim gerektirir.',                       'hepsi',      'Rutin gözlem turu için gereksizdir; hareketi ciddi biçimde kısıtlar.',                       '🧴', 4),
  -- İşitme
  ('kulak_tikaci',       'Kulak Tıkacı',                       'isitme',   'EN 352-2',            'Yüksek gürültülü bölgelerde işitme koruması. Kısa süreli geçişler için pratiktir.',                              'hepsi',      'Çok yüksek gürültüde tek başına yetersiz kalabilir.',                                       '🎧', 1),
  ('kulaklik_en352',     'Kulaklık (Manşon Tipi)',             'isitme',   'EN 352-1',            'Sürekli yüksek gürültü altında daha yüksek zayıflatma sağlar.',                                                  'hepsi',      'Baret ve maske ile birlikte uyum kontrolü gerektirir.',                                     '🎧', 2),
  -- El
  ('eldiven_mekanik',    'Mekanik Riske Karşı Eldiven',        'el',       'EN 388',              'Kesilme, delinme ve aşınmaya karşı genel amaçlı iş eldiveni.',                                                   'hepsi',      'Isıya ve sıvı metale karşı koruma sağlamaz.',                                               '🧤', 1),
  ('eldiven_isi',        'Isıya Dayanıklı Eldiven',            'el',       'EN 407',              'Temas ve radyan ısıya karşı korur. Sıcak yüzey ve döküm sahası çevresinde gereklidir.',                          'hepsi',      'Kaynak işlemi için özel kaynakçı eldiveni gerekir.',                                        '🧤', 2),
  ('eldiven_kaynak',     'Kaynakçı Eldiveni',                  'el',       'EN 12477',            'Kaynak sıçrantısı, ark ısısı ve kıvılcıma karşı uzun konçlu deri eldiven.',                                      'yuklenici',  'Hassas el işleri için uygun değildir.',                                                     '🧤', 3),
  ('eldiven_kimyasal',   'Kimyasala Dayanıklı Eldiven',        'el',       'EN 374',              'Asit, baz ve solventlere karşı geçirimsiz eldiven.',                                                             'hepsi',      'Isı ve mekanik riske karşı koruma sağlamaz.',                                               '🧤', 4),
  -- Ayak
  ('ayakkabi_s3',        'Çelik Burunlu İş Ayakkabısı',        'ayak',     'EN ISO 20345 S3',     'Ezilme, delinme ve ıslak zemine karşı temel ayak koruması. Sahada zorunludur.',                                  'hepsi',      'Sıvı metal sıçramasına karşı yeterli değildir.',                                            '🥾', 1),
  ('cizme_isi_hi3',      'Isıya Dayanıklı Bot (HI3)',          'ayak',     'EN ISO 20349',        'Sıvı metal sıçramasına ve sıcak zemine karşı, hızlı çıkarılabilir bağcıksız bot.',                               'hepsi',      'Genel saha yürüyüşü için gerekli değildir.',                                                '🥾', 2),
  -- Gövde
  ('standart_is_kiyafeti','Standart İş Kıyafeti',              'govde',    'EN ISO 13688',        'Pamuk/karışım kumaşlı genel saha iş elbisesi. Alev, kıvılcım ve radyan ısı koruması yoktur.',                    'hepsi',      'Sıcak iş, döküm ve kıvılcım ortamında tutuşur; FR kıyafet yerine geçmez.',                   '👔', 0),
  ('fr_kiyafet',         'Alev Almaz (FR) İş Elbisesi',        'govde',    'EN ISO 11612',        'Kıvılcım, kısa süreli alev ve radyan ısıya karşı tutuşmayan iş elbisesi.',                                       'hepsi',      'Doğrudan sıvı metal sıçramasında tek başına yeterli değildir.',                             '🦺', 1),
  ('aluminize_giysi',    'Alüminize Isı Giysisi',              'govde',    'EN ISO 11612 / 1486', 'Sıvı metale doğrudan müdahale eden kişinin giydiği yansıtıcı tam koruma takımı.',                                'isletme',    'Gözlemci için gereksizdir; hareketi kısıtlar ve yanlış güven duygusu yaratır.',              '🥼', 2),
  ('kaynakci_onlugu',    'Kaynakçı Önlüğü ve Kolluk',          'govde',    'EN ISO 11611',        'Kaynak sıçrantısına karşı deri önlük, kolluk ve tozluk seti.',                                                   'yuklenici',  'Kaynak yapmayan personel için gerekli değildir.',                                           '🥼', 3),
  ('antistatik_ex_kiyafet','Antistatik Kıyafet',               'govde',    'EN 1149',             'Patlayıcı ortamda statik elektrik birikimini engelleyen kıyafet.',                                               'hepsi',      'Isı ve alev koruması sağlamaz; FR kıyafet yerine geçmez.',                                  '🦺', 4),
  ('reflektorlu_yelek',  'Reflektörlü Yelek',                  'govde',    'EN ISO 20471',        'Araç ve iş makinesi trafiğinde görünürlüğü artırır.',                                                            'hepsi',      'Fiziksel koruma sağlamaz.',                                                                 '🦺', 5),
  ('kursun_onluk',       'Kurşun Önlük',                       'govde',    'IEC 61331',           'Tıbbi röntgen (düşük enerjili X-ışını) uygulamalarında kullanılan koruyucu önlük.',                              'hepsi',      'Endüstriyel gama radyografisinde koruma sağlamaz. Tek geçerli tedbir mesafe ve alan kontrolüdür.', '🥼', 6),
  -- Yüksekte
  ('tam_vucut_kemeri',   'Tam Vücut Emniyet Kemeri',           'yuksekte', 'EN 361',              'Düşme durdurma sisteminin gövde bileşeni. Uygun bağlantı noktasıyla birlikte anlam kazanır.',                    'hepsi',      'Bağlanacak sağlam nokta yoksa tek başına koruma sağlamaz.',                                 '🪢', 1),
  ('soklu_lanyard',      'Şok Emicili Lanyard',                'yuksekte', 'EN 355',              'Düşme anındaki darbe kuvvetini vücut için güvenli seviyeye indirir.',                                            'hepsi',      'Serbest düşme mesafesi yetersizse uygun değildir.',                                         '🪢', 2),
  ('cift_kancali_lanyard','Çift Kancalı Lanyard',              'yuksekte', 'EN 355 + EN 362',     'Yatay hareket sırasında kesintisiz bağlı kalmayı sağlar (%100 tie-off).',                                        'hepsi',      'Uygun mukavemette bağlantı noktası gerektirir.',                                            '🪢', 3),
  ('yatay_yasam_hatti',  'Yatay Yaşam Hattı',                  'yuksekte', 'EN 795',              'Uzun mesafede güvenli bağlantı imkânı veren kalıcı/geçici hat.',                                                 'hepsi',      'Mühendislik hesabı ve kurulum onayı olmadan kullanılamaz.',                                 '🪢', 4),
  -- Ölçüm
  ('gaz_dedektoru_co',   'Kişisel Gaz Dedektörü (CO/O₂)',      'olcum',    'EN 45544',            'CO ve oksijen seviyesini sürekli izleyip alarm veren kişisel cihaz.',                                            'hepsi',      'Patlayıcı gaz (LEL) ve H₂S ölçmez.',                                                        '📟', 1),
  ('gaz_dedektoru_4li',  '4''lü Gaz Dedektörü',                'olcum',    'EN 60079-29-1',       'O₂, CO, H₂S ve LEL ölçen çok sensörlü kişisel cihaz. Gaz hatlarında zorunludur.',                               'hepsi',      'Kalibrasyonu ve bump testi güncel değilse güvenilmez.',                                     '📟', 2),
  ('dozimetre',          'Kişisel Dozimetre',                  'olcum',    'IEC 62387',           'Alınan radyasyon dozunu ölçer. Radyografi bölgesine yaklaşan yetkili personel taşır.',                            'hepsi',      'Koruyucu değildir; sadece maruziyeti kaydeder.',                                            '📟', 3),
  ('ex_el_feneri',       'Ex-Proof El Feneri',                 'olcum',    'ATEX',                'Patlayıcı ortamda kıvılcım oluşturmayan aydınlatma.',                                                            'hepsi',      'Standart el feneri patlayıcı ortamda tutuşturucu kaynaktır.',                               '🔦', 4),
  ('telsiz_atex',        'ATEX Sertifikalı Telsiz',            'olcum',    'ATEX',                'Patlayıcı ortamda güvenli haberleşme; yalnız çalışma riskini azaltır.',                                          'hepsi',      'Sertifikasız cihazlar Ex bölgeye sokulamaz.',                                               '📻', 5),
  -- Alan tedbiri (KKD dışı)
  ('kaynak_perdesi',     'Kaynak Perdesi / Paravan',           'alan',     'EN ISO 25980',        'Ark ışımasını ve sıçrantıyı çevredeki kişilerden izole eder.',                                                   'hepsi',      'KKD değildir; kişisel korumanın yerine geçmez.',                                            '🧱', 1),
  ('alan_bariyeri',      'Alan Bariyeri ve Uyarı Levhası',     'alan',     '—',                   'Riskli alanı fiziksel olarak sınırlar ve girişi kontrol altına alır.',                                           'hepsi',      'Sadece şerit çekmek yeterli değildir; giriş kontrolü gerekir.',                             '🚧', 2),
  ('yangin_sondurucu',   'Yangın Söndürücü ve Yangın Gözcüsü', 'alan',     '—',                   'Sıcak işlerde tutuşmayı erken müdahaleyle önler. Sıcak iş izninin şartıdır.',                                    'hepsi',      'Gözcü olmadan tek başına söndürücü bulundurmak yeterli değildir.',                          '🧯', 3),
  ('kacis_guzergahi',    'Kaçış Güzergâhı ve Toplanma Noktası','alan',     '—',                   'Bölgeye girmeden önce çıkış yolunun ve toplanma noktasının belirlenmesi.',                                       'hepsi',      'Sonradan planlanamaz; giriş öncesi belirlenmelidir.',                                       '🏃', 4),
  ('ruzgar_yonu',        'Rüzgâr Yönüne Göre Konumlanma',      'alan',     '—',                   'Gaz kaçağı ihtimalinde rüzgârı arkaya alarak yukarı yönde konumlanmak.',                                         'hepsi',      'Rüzgâr yönü değişkendir; sürekli takip gerekir.',                                           '🧭', 5),
  ('toplu_koruma',       'Toplu Koruma (Korkuluk/Platform)',   'alan',     'EN 13374',            'Düşme riskinde önceliklidir; kişisel koruyucudan önce gelir.',                                                   'hepsi',      'Eksik veya sökülmüş korkuluk yanıltıcı güven verir.',                                       '🛡️', 6),
  ('gozetmen',           'Gözetmen (Stand-by Watch)',          'alan',     '—',                   'Kapalı/riskli hacimde dışarıda bekleyerek acil durumda müdahaleyi başlatan kişi.',                               'hepsi',      'Gözetmen aynı anda başka iş yapamaz.',                                                     '👁️', 7),
  ('guvenli_mesafe',     'Güvenli Mesafede Konumlanma',        'alan',     '—',                   'Gözlemi risk alanının dışından yapmak. En etkili ve en çok unutulan tedbirdir.',                                 'hepsi',      'Görüş açısı yetersizse alternatif gözlem noktası planlanmalıdır.',                          '📏', 8),
  -- Doküman
  ('is_izni',                 'İş İzin Formu Kontrolü',        'dokuman',  '—',                   'İşin izin kapsamında, tarif edilen yer ve şartlarda yapıldığının doğrulanması.',                                 'hepsi',      'İmzalı form tek başına sahanın güvenli olduğunu göstermez.',                                '📄', 1),
  ('gaz_olcum_formu',         'Giriş Öncesi Gaz Ölçüm Kaydı',  'dokuman',  '—',                   'Bölgeye girmeden önce yapılan ölçümün kaydı. Geçerlilik süresi sınırlıdır.',                                    'hepsi',      'Süresi geçmiş ölçüm geçersizdir, yenilenmelidir.',                                          '📄', 2),
  ('iskele_kontrol_karti',    'İskele Kontrol Kartı',          'dokuman',  'TS EN 12811',         'İskelenin yetkili kişi tarafından kontrol edildiğini gösteren yeşil etiket.',                                    'hepsi',      'Kırmızı etiketli veya etiketsiz iskeleye çıkılmaz.',                                        '🏷️', 3),
  ('radyografi_calisma_formu','Radyografi Çalışma Bildirim Formu','dokuman','—',                  'Çekim saati, kaynak aktivitesi ve izolasyon sınırlarını gösteren bildirim.',                                     'hepsi',      'Bildirimsiz çekim yapılamaz; saha personeline duyurulmalıdır.',                             '📄', 4),
  ('toolbox',                 'Başlangıç Toplantısı (Toolbox)','dokuman',  '—',                   'İşe başlamadan önce riskleri ve tedbirleri ekiple paylaşan kısa saha toplantısı.',                               'hepsi',      'İmza toplamak yeterli değildir; içerik anlaşılmalıdır.',                                    '🗣️', 5),
  ('can_yelegi',              'Can Yeleği / Suya Düşme Koruması','govde', 'EN ISO 12402',       'Su kenarı, rıhtım ve iskele üstü liman işinde suya düşmeye karşı yüzerlik sağlar.',                            'hepsi',      'Kara sahasında ve döküm alanında gerekli değildir.',                                       '🛟', 7)
on conflict (code) do update
  set name        = excluded.name,
      category_id = excluded.category_id,
      standard    = excluded.standard,
      description = excluded.description,
      used_by     = excluded.used_by,
      not_for     = excluded.not_for,
      icon        = excluded.icon,
      order_index = excluded.order_index;

-- ===========================================================================
-- SENARYO 1 — Yüksek Fırın: Döküm Kanalı Gözlemi
-- ===========================================================================
insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags
) values (
  'yf-dokum-kanali', 'yuksek_firin', 1, 'Döküm Kanalı Gözlemi', false,
  $j${
    "konum": "Yüksek Fırın 2 — Döküm Sahası, +8.50 kotu",
    "gorev": "Refrakter tamiratının şartnameye uygunluğunu yerinde gözlemlemek ve ilerleme kaydı almak.",
    "isletme_faaliyeti": "İşletme ekibi döküm sonrası cüruf kanalını temizliyor, tapa makinesi hazırlığı sürüyor.",
    "yuklenici_faaliyeti": "Müteahhit refrakter ekibi kanal yan duvarına döküm harcı uyguluyor.",
    "hava": "Rüzgâr güneybatıdan hafif esiyor. Dış ortam sıcaklığı 31°C.",
    "is_izni": "Sıcak iş izni açık. Gaz ölçümü 2 saat 40 dakika önce yapılmış.",
    "gaz": "CO birikme ihtimali olan kapalı geçit güzergâh üzerinde.",
    "sicaklik": "Döküm arası dönem; kanal ve refrakter yüzeyleri hâlâ kızgın.",
    "yukseklik": "Kot farkı var, kanal kenarı korkuluksuz.",
    "ozel_not": "Gözlem güzergâhınız CO birikmesine açık kapalı geçitten geçiyor."
  }$j$::jsonb,
  $j$[
    {"code":"co_gazi","label":"Karbonmonoksit (CO) birikmesi","is_real":true,"x":20,"y":34,"explanation":"CO renksiz ve kokusuzdur. Kapalı geçitte birikir; ancak kişisel dedektörle fark edilir."},
    {"code":"radyan_isi","label":"Radyan ısı (kızgın kanal)","is_real":true,"x":54,"y":56,"explanation":"Sıvı metal ve kızgın refrakter yüzeyler doğrudan temas olmadan da ısı yükü oluşturur."},
    {"code":"sicak_yuzey","label":"Sıcak yüzey teması","is_real":true,"x":72,"y":66,"explanation":"Kızgın refrakter ve tapa donanımı temas yanığı riski taşır."},
    {"code":"kot_farki","label":"Kot farkı / korkuluksuz kanal kenarı","is_real":true,"x":36,"y":78,"explanation":"Açık kanal kenarında düşme riski var; güzergâh kenardan uzak planlanmalı."},
    {"code":"gurultu","label":"Yüksek gürültü","is_real":true,"x":86,"y":24,"explanation":"Tapa makinesi ve havalandırma sürekli gürültü üretir."},
    {"code":"toz","label":"Refrakter tozu","is_real":true,"x":62,"y":42,"explanation":"Harç uygulaması ve kanal temizliği ince toz açığa çıkarır."},
    {"code":"askida_yuk","label":"Askıda yük","is_real":false,"x":14,"y":16,"explanation":"Bu vardiyada döküm sahasında vinç operasyonu yok. Gerçek bir risk noktası değil."},
    {"code":"kimyasal_sicrama","label":"Kimyasal sıçrama","is_real":false,"x":90,"y":76,"explanation":"Bu senaryoda kimyasal kullanımı yok. Gerçek bir risk noktası değil."}
  ]$j$::jsonb,
  $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Refrakter tamiratını gözlemliyor, ilerleme kaydı alıyor.","authority":"Kendi ekibi üzerinde tam yetkili. Yüklenicide sözleşme kapsamında durdurma yetkisi var. İşletme personeline doğrudan talimat veremez.","expected_items":["gaz_dedektoru_co","kacis_maskesi_co","fr_kiyafet","baret_en397","gozluk_ir","eldiven_isi","ayakkabi_s3","kulak_tikaci","gaz_olcum_formu"]},
    {"type":"yuklenici","employer":"Refrakter yüklenicisi","activity":"Kanal yan duvarına döküm harcı uyguluyor.","expected_items":["gaz_dedektoru_co","kacis_maskesi_co","baret_en397","gozluk_en166","toz_maskesi_ffp3","eldiven_isi","fr_kiyafet","ayakkabi_s3","kulak_tikaci"],"current_items":["gaz_dedektoru_co","kacis_maskesi_co","baret_en397","eldiven_mekanik","fr_kiyafet","ayakkabi_s3","kulak_tikaci"]},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Cüruf kanalı temizliği ve tapa makinesi hazırlığı.","expected_items":["gaz_dedektoru_co","kacis_maskesi_co","baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci","toz_maskesi_ffp3"],"current_items":["gaz_dedektoru_co","kacis_maskesi_co","baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci","toz_maskesi_ffp3"]}
  ]$j$::jsonb,
  $j$["gaz_dedektoru_co","kacis_maskesi_co","fr_kiyafet","baret_en397","gozluk_ir","eldiven_isi","ayakkabi_s3","kulak_tikaci","gaz_olcum_formu"]$j$::jsonb,
  $j$["standart_is_kiyafeti","kaynak_maskesi","aluminize_giysi","tam_vucut_kemeri","eldiven_kimyasal","dozimetre","temiz_hava_solunum","kursun_onluk"]$j$::jsonb,
  $j$["gozluk_en166","toz_maskesi_ffp3","eldiven_isi"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["izin_kontrol","bildir_firma","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam"]$j$::jsonb,
  $j$[
    "Bu bölgedeki en kritik risk gözle görülmez, kokusu ve rengi yoktur. Onu fark etmenin tek yolu yanınızda taşıdığınız bir cihazdır.",
    "Kaçış maskesi ile temiz hava beslemeli cihaz aynı şey değildir. Biri yalnızca bölgeyi terk etmenize yeter, diğeri ortamda çalışmak içindir. Rutin gözlem turunda hangisi doğru?",
    "İş izni notuna tekrar bakın: gaz ölçümünün üzerinden 2 saat 40 dakika geçmiş. Ölçümlerin geçerlilik süresi sınırlıdır — girmeden önce yenilenmesini istemelisiniz."
  ]$j$::jsonb,
  'Bu senaryonun özü, görünmeyen riski yönetmektir. Döküm sahasında ısı ve toz kolayca fark edilir; asıl belirleyici olan CO maruziyetidir. Kişisel gaz dedektörü ve acil kaçış maskesi bu bölgede pazarlık konusu değildir. Alev almaz iş elbisesi, IR filtreli gözlük ve ısıya dayanıklı eldiven radyan ısı yükünü karşılar. Buna karşılık kaynakçı maskesi, alüminize giysi veya temiz hava beslemeli cihaz bu görev için gereksizdir; hareketinizi kısıtlar ve yanlış bir güven duygusu yaratır. Gerekenden fazla KKD seçmek de bir uygunsuzluktur. Yüklenici refrakter ekibinde göz koruması ve toz maskesi eksik, eldiven seçimi işin ısısına uygun değil. Bu, işi anında durdurmayı gerektiren kritik bir ihlal olmamakla birlikte firma saha sorumlusuna bildirilmesi ve kayıt altına alınması gereken bir eksikliktir. İşletme personelinde bu vardiyada bir uygunsuzluk gözlenmemiştir; "eksik yok" demek de doğru bir denetim sonucudur. Son olarak gaz ölçümünün üzerinden geçen süre nedeniyle iş izin şartlarının yeniden kontrol ettirilmesi, bu senaryodaki en değerli kontrollük davranışıdır.',
  $j$["gaz_guvenligi","kkd_secimi","is_izni_yonetimi","kontrolluk_davranisi","tehlike_tanima"]$j$::jsonb
)
on conflict (slug) do update set
  zone_id = excluded.zone_id, order_index = excluded.order_index, title = excluded.title,
  is_draft = excluded.is_draft, briefing = excluded.briefing, hazards = excluded.hazards,
  actors = excluded.actors, required_self = excluded.required_self,
  forbidden_self = excluded.forbidden_self, contractor_gaps = excluded.contractor_gaps,
  operator_gaps = excluded.operator_gaps, correct_actions = excluded.correct_actions,
  wrong_actions = excluded.wrong_actions, hints = excluded.hints,
  explanation = excluded.explanation, competency_tags = excluded.competency_tags;

-- ===========================================================================
-- SENARYO 2 — Çelikhane: Döküm Platformu (işletme personelinde uygunsuzluk)
-- ===========================================================================
insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags
) values (
  'ch-dokum-platformu', 'celikhane', 1, 'Döküm Platformu — İşletmede Uygunsuzluk', false,
  $j${
    "konum": "Çelikhane — Sürekli Döküm Platformu, pota kulesi altı",
    "gorev": "Platform çevresindeki yürüyüş yolu yenileme işinin ilerlemesini gözlemlemek.",
    "isletme_faaliyeti": "İşletme personeli sıvı metal kaçağına müdahale ediyor; tandiş çevresinde çalışıyor.",
    "yuklenici_faaliyeti": "Müteahhit ekibi platformun 15 metre uzağında yürüyüş yolu montajı yapıyor.",
    "hava": "Kapalı hacim, ortam sıcaklığı 42°C.",
    "is_izni": "Genel çalışma izni açık, sıcak iş kapsamı dışında.",
    "sicaklik": "Sıvı çelik sıcaklığı yaklaşık 1550°C. Sıçrama alanı belirgin.",
    "ozel_not": "Sıvı metale müdahale eden işletme personelinde koruma eksikliği gözlemliyorsunuz."
  }$j$::jsonb,
  $j$[
    {"code":"sivi_metal_sicrama","label":"Sıvı metal sıçraması","is_real":true,"x":48,"y":50,"explanation":"Tandiş müdahalesi sırasında sıçrama alanı genişler; giysinin altına giren damla ağır yanık yapar."},
    {"code":"radyan_isi","label":"Yoğun radyan ısı","is_real":true,"x":58,"y":40,"explanation":"1550°C sıvı çelik, temas olmadan da ciddi ısı yükü oluşturur."},
    {"code":"sicak_yuzey","label":"Sıcak platform yüzeyi","is_real":true,"x":66,"y":72,"explanation":"Platform sacları ve döküntü metal parçaları kızgın olabilir."},
    {"code":"askida_yuk","label":"Pota vinci — askıda yük","is_real":true,"x":30,"y":18,"explanation":"Pota kulesi altında yük geçiş güzergâhı var; altında durulmaz."},
    {"code":"gurultu","label":"Yüksek gürültü","is_real":true,"x":84,"y":30,"explanation":"Vakum ve fan sistemleri sürekli gürültü üretir."},
    {"code":"kot_farki","label":"Platform kenarı kot farkı","is_real":true,"x":22,"y":74,"explanation":"Platform kenarında düşme riski bulunuyor."},
    {"code":"co_gazi","label":"Karbonmonoksit birikmesi","is_real":false,"x":12,"y":44,"explanation":"Bu platform açık havalandırmalıdır; CO birikmesi bu senaryonun riski değildir."},
    {"code":"radyasyon","label":"İyonlaştırıcı radyasyon","is_real":false,"x":90,"y":60,"explanation":"Bu bölgede radyografi çalışması yoktur."}
  ]$j$::jsonb,
  $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Yürüyüş yolu montajını gözlemliyor, ilerleme kaydı alıyor.","authority":"İşletme personeline doğrudan talimat verme yetkisi YOKTUR. Gözlemini işletme sorumlusuna ve İSG birimine bildirir. Kendi ekibini risk alanından çekme yetkisi tamdır."},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Tandiş çevresinde sıvı metal kaçağına müdahale ediyor.","expected_items":["aluminize_giysi","yuz_siperi","cizme_isi_hi3","eldiven_isi","baret_en397","kulak_tikaci"],"current_items":["fr_kiyafet","gozluk_en166","ayakkabi_s3","eldiven_mekanik","baret_en397","kulak_tikaci"]},
    {"type":"yuklenici","employer":"Mekanik montaj yüklenicisi","activity":"Platformun 15 m uzağında yürüyüş yolu montajı.","expected_items":["baret_en397","gozluk_en166","eldiven_mekanik","eldiven_isi","fr_kiyafet","ayakkabi_s3","kulak_tikaci"],"current_items":["baret_en397","gozluk_en166","eldiven_mekanik","eldiven_isi","fr_kiyafet","ayakkabi_s3","kulak_tikaci"]}
  ]$j$::jsonb,
  $j$["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci","guvenli_mesafe"]$j$::jsonb,
  $j$["standart_is_kiyafeti","aluminize_giysi","kaynak_maskesi","tam_vucut_kemeri","temiz_hava_solunum","eldiven_kimyasal","kursun_onluk","dozimetre"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["aluminize_giysi","yuz_siperi","cizme_isi_hi3","eldiven_isi"]$j$::jsonb,
  $j$["bildir_isletme","bildir_isg","ekibi_cikar","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam","durdur_muteahhit","bildir_firma"]$j$::jsonb,
  $j$[
    "Gördüğünüz uygunsuzluk sizde değil, karşınızdaki kişide. Önce şunu sorun: bu kişi kimin çalışanı?",
    "Alüminize giysi sıvı metale doğrudan müdahale edenin kıyafetidir. Siz müdahale etmiyorsunuz — onu kendinize giymek çözüm değildir.",
    "İşletme personeline doğrudan 'dur' diyemezsiniz. Ama bu, hiçbir şey yapmayacağınız anlamına gelmez: doğru kanal işletme sorumlusu ve İSG birimidir. Bu arada kendi ekibinizi sıçrama alanından çekmelisiniz."
  ]$j$::jsonb,
  'Bu senaryo yetki sınırını öğretir. Gözlemlediğiniz uygunsuzluk gerçektir ve ciddidir: sıvı metale müdahale eden işletme personeli alüminize koruyucu giysi, yüz siperi ve ısıya dayanıklı bot yerine standart alev almaz elbise, koruyucu gözlük ve normal iş ayakkabısı kullanıyor. Ancak bu kişi sizin denetiminizdeki bir müteahhit çalışanı değil, işletmenin kendi personelidir. Ona doğrudan talimat vermek ya da işini durdurmak yetki sınırınızın dışındadır. Doğru davranış üç adımdır: durumu işletme sorumlusuna ve demir çelik İSG birimine bildirmek, kendi kontrollük ekibinizi sıçrama alanının dışına çekmek ve gözlemi kayıt altına almak. Kendi donanımınız açısından gözlem mesafesine uygun temel set yeterlidir: baret, IR filtreli gözlük, alev almaz elbise, ısıya dayanıklı eldiven, iş ayakkabısı ve kulak koruyucu. Alüminize giysiyi kendinize giymek yaygın bir hatadır; bu giysi müdahale edenin ekipmanıdır, gözlemcinin değil. En güçlü tedbiriniz bir KKD değil, güvenli mesafedir. Müteahhit ekibinde bu senaryoda bir eksiklik yoktur; onların işini durdurmak hem gereksiz hem de orantısız bir müdahale olurdu.',
  $j$["yetki_sinirlari","bildirim_kanallari","kkd_secimi","isi_sicrama_korunmasi","kontrolluk_davranisi"]$j$::jsonb
)
on conflict (slug) do update set
  zone_id = excluded.zone_id, order_index = excluded.order_index, title = excluded.title,
  is_draft = excluded.is_draft, briefing = excluded.briefing, hazards = excluded.hazards,
  actors = excluded.actors, required_self = excluded.required_self,
  forbidden_self = excluded.forbidden_self, contractor_gaps = excluded.contractor_gaps,
  operator_gaps = excluded.operator_gaps, correct_actions = excluded.correct_actions,
  wrong_actions = excluded.wrong_actions, hints = excluded.hints,
  explanation = excluded.explanation, competency_tags = excluded.competency_tags;

-- ===========================================================================
-- SENARYO 3 — Çelikhane: Kaynaklı Tadilat (müteahhit denetimi)
-- ===========================================================================
insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags
) values (
  'ch-kaynakli-tadilat', 'celikhane', 2, 'Kaynaklı Tadilat — Müteahhit Denetimi', false,
  $j${
    "konum": "Çelikhane — Cüruf potası taşıma yolu yanı, bakım nişi",
    "gorev": "Müteahhit kaynak ekibinin çalışma şartlarını ve KKD uygunluğunu denetlemek.",
    "isletme_faaliyeti": "İşletme ekibi 20 m ötede cüruf potası taşıma hazırlığı yapıyor.",
    "yuklenici_faaliyeti": "Müteahhit kaynakçı, taşıyıcı konsol üzerinde elektrik ark kaynağı yapıyor.",
    "hava": "Kapalı hacim, sınırlı doğal havalandırma.",
    "is_izni": "Sıcak iş izni açık. İzin formunda yangın gözcüsü şartı yazılı.",
    "ozel_not": "Kaynak alanının 3 m yakınında hidrolik hortum güzergâhı ve ahşap palet yığını var."
  }$j$::jsonb,
  $j$[
    {"code":"ark_isimasi","label":"Kaynak arkı UV/IR ışıması","is_real":true,"x":46,"y":48,"explanation":"Ark ışıması çevredeki kişilerde de göz yanığı (ark gözü) yapar. Perde ile izole edilmelidir."},
    {"code":"kivilcim_yangin","label":"Kıvılcım ve yangın riski","is_real":true,"x":58,"y":62,"explanation":"3 m yakındaki ahşap palet ve hidrolik hortum tutuşabilir. Yangın gözcüsü izin şartıdır."},
    {"code":"kaynak_dumani","label":"Kaynak dumanı","is_real":true,"x":40,"y":34,"explanation":"Sınırlı havalandırmada kaynak dumanı birikir; lokal emiş veya solunum koruması gerekir."},
    {"code":"elektrik","label":"Elektrik çarpması","is_real":true,"x":72,"y":56,"explanation":"Kaynak kablosu izolasyonu ve topraklama kontrol edilmelidir."},
    {"code":"askida_yuk","label":"Cüruf potası taşıma güzergâhı","is_real":true,"x":20,"y":22,"explanation":"20 m ötedeki taşıma güzergâhı çalışma alanını etkileyebilir."},
    {"code":"kot_farki","label":"Konsol üzerinde kot farkı","is_real":true,"x":52,"y":76,"explanation":"Kaynakçı yerden yükseltilmiş konsolda çalışıyor."},
    {"code":"gaz_bogucu","label":"Boğucu gaz sızıntısı","is_real":false,"x":88,"y":40,"explanation":"Bu nişte gaz hattı bulunmuyor. Gerçek bir risk noktası değil."},
    {"code":"radyasyon","label":"İyonlaştırıcı radyasyon","is_real":false,"x":14,"y":68,"explanation":"Bu vardiyada radyografi planlanmamıştır."}
  ]$j$::jsonb,
  $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Kaynak işinin şartname ve İSG uygunluğunu denetliyor.","authority":"Yüklenici üzerinde sözleşme kapsamında işi durdurma yetkisi vardır. Kritik ihlalde durdurup firma saha sorumlusuna bildirir."},
    {"type":"yuklenici","employer":"Mekanik tadilat yüklenicisi","activity":"Taşıyıcı konsol üzerinde elektrik ark kaynağı.","expected_items":["kaynak_maskesi","eldiven_kaynak","kaynakci_onlugu","fr_kiyafet","ayakkabi_s3","baret_en397","kulak_tikaci","kaynak_perdesi","yangin_sondurucu"],"current_items":["baret_en397","fr_kiyafet","ayakkabi_s3","eldiven_mekanik","kulak_tikaci"]},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"20 m ötede cüruf potası taşıma hazırlığı.","expected_items":["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci"],"current_items":["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci"]}
  ]$j$::jsonb,
  $j$["baret_en397","gozluk_en166","fr_kiyafet","eldiven_mekanik","ayakkabi_s3","kulak_tikaci","is_izni"]$j$::jsonb,
  $j$["standart_is_kiyafeti","kaynak_maskesi","aluminize_giysi","tam_vucut_kemeri","temiz_hava_solunum","kursun_onluk","dozimetre","cizme_isi_hi3"]$j$::jsonb,
  $j$["kaynak_maskesi","eldiven_kaynak","kaynakci_onlugu","kaynak_perdesi","yangin_sondurucu"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["durdur_muteahhit","bildir_firma","izin_kontrol","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam"]$j$::jsonb,
  $j$[
    "Kaynakçının kendisine bakın: hangi koruyucular işin cinsine göre olması gerektiği gibi değil?",
    "Eksik olan yalnızca kişisel koruyucular değil. İş izin formunda yazan bir alan tedbiri de sahada yok.",
    "Göz koruması olmadan ark kaynağı yapmak kritik ve anlık bir ihlaldir. Bildirim yetmez; bu durumda işi durdurmak sözleşme kapsamındaki yetkinizdir."
  ]$j$::jsonb,
  'Bu senaryoda denetlediğiniz kişi sizin yükleniciniz, dolayısıyla müdahale yetkiniz açıktır. Kaynakçıda üç kişisel koruyucu eksik: kaynakçı maskesi, kaynakçı eldiveni ve deri önlük. Bunlardan göz/yüz korumasının hiç bulunmaması anlık ve geri dönüşsüz zarar doğurabilecek kritik bir ihlaldir; işi durdurmayı gerektirir. Eksikler kişisel koruyucularla da sınırlı değildir: ark ışımasını çevredeki personelden izole edecek kaynak perdesi ve sıcak iş izninin açık şartı olan yangın söndürücü/yangın gözcüsü sahada yoktur. Kaynak alanının üç metre yakınındaki ahşap palet ve hidrolik hortum güzergâhı bu eksikliği daha da kritik hale getirir. Doğru sıralama şudur: işi durdurun, firma saha sorumlusunu çağırın, iş izin şartlarının yeniden gözden geçirilmesini isteyin ve uygunsuzluğu kayıt altına alın. Kendi donanımınız açısından ise dikkat edilecek nokta şudur: kaynak yapan siz değilsiniz. Kaynakçı maskesini kendinize takmak gereksizdir; koruyucu gözlük yeterlidir. Gözlem mesafenizi ark ışımasından koruyacak şekilde ayarlamanız daha doğrudur.',
  $j$["muteahhit_denetimi","kkd_secimi","sicak_is_yonetimi","isi_durdurma_karari","kontrolluk_davranisi"]$j$::jsonb
)
on conflict (slug) do update set
  zone_id = excluded.zone_id, order_index = excluded.order_index, title = excluded.title,
  is_draft = excluded.is_draft, briefing = excluded.briefing, hazards = excluded.hazards,
  actors = excluded.actors, required_self = excluded.required_self,
  forbidden_self = excluded.forbidden_self, contractor_gaps = excluded.contractor_gaps,
  operator_gaps = excluded.operator_gaps, correct_actions = excluded.correct_actions,
  wrong_actions = excluded.wrong_actions, hints = excluded.hints,
  explanation = excluded.explanation, competency_tags = excluded.competency_tags;

-- ===========================================================================
-- SENARYO 4 — Gaz Hatları: Saha İncelemesi
-- ===========================================================================
insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags
) values (
  'gh-saha-incelemesi', 'gaz_hatlari', 1, 'Gaz Hattı Saha İncelemesi', false,
  $j${
    "konum": "Kok gazı ana hattı — kompansatör bölgesi, boru köprüsü altı",
    "gorev": "Kompansatör yenileme işi öncesi saha ön incelemesi yapmak ve ölçüm noktalarını belirlemek.",
    "isletme_faaliyeti": "İşletme ekibi hat basıncını düşürme çalışması yapıyor; blindaj henüz takılmamış.",
    "yuklenici_faaliyeti": "Müteahhit ekibi henüz sahaya girmedi, giriş için sizin onayınızı bekliyor.",
    "hava": "Rüzgâr kuzeydoğudan 4 m/s. Hafif yağmur.",
    "is_izni": "İş izni HAZIRLIK aşamasında. Hat henüz gaz sızdırmaz hale getirilmemiş.",
    "gaz": "Kok gazı: CO, H₂S ve patlayıcı karışım (LEL) riski bir arada.",
    "ozel_not": "Sahada iki gün önce hafif kaçak bildirimi yapılmış, kalıcı onarım tamamlanmamış."
  }$j$::jsonb,
  $j$[
    {"code":"co_gazi","label":"Karbonmonoksit (CO)","is_real":true,"x":30,"y":40,"explanation":"Kok gazının ana bileşenlerinden biri; renksiz, kokusuz ve öldürücüdür."},
    {"code":"h2s","label":"Hidrojen sülfür (H₂S)","is_real":true,"x":44,"y":30,"explanation":"Düşük konsantrasyonda çürük yumurta kokar; yüksek konsantrasyonda koku alma duyusunu felce uğratır."},
    {"code":"patlayici_ortam","label":"Patlayıcı ortam (LEL)","is_real":true,"x":56,"y":52,"explanation":"Kok gazı hava ile patlayıcı karışım oluşturur. Kıvılcım kaynağı sokulamaz."},
    {"code":"oksijen_yetersizligi","label":"Oksijen yetersizliği","is_real":true,"x":22,"y":62,"explanation":"Boru köprüsü altındaki çukur bölgede gaz birikip oksijeni yerinden edebilir."},
    {"code":"basincli_hat","label":"Basınç altındaki hat","is_real":true,"x":68,"y":44,"explanation":"Hat henüz izole edilmemiş; blindaj takılmadan iş güvenli sayılmaz."},
    {"code":"kaygan_zemin","label":"Kaygan zemin (yağmur)","is_real":true,"x":38,"y":80,"explanation":"Yağmur nedeniyle metal platform ve merdivenler kaygan."},
    {"code":"radyan_isi","label":"Radyan ısı","is_real":false,"x":86,"y":24,"explanation":"Bu bölgede sıvı metal veya kızgın yüzey yoktur."},
    {"code":"askida_yuk","label":"Askıda yük","is_real":false,"x":12,"y":18,"explanation":"Vinç operasyonu henüz başlamamıştır."}
  ]$j$::jsonb,
  $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Kompansatör yenileme işi öncesi saha ön incelemesi.","authority":"Kendi ekibinin sahaya girip girmeyeceğine karar verme yetkisi tamdır. Yüklenicinin giriş onayını verme/erteleme yetkisi vardır. Hattın izolasyonu işletmenin sorumluluğundadır."},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Hat basıncını düşürme, blindaj hazırlığı.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex"],"current_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex"]},
    {"type":"yuklenici","employer":"Boru ve kaynak yüklenicisi","activity":"Sahaya giriş için onay bekliyor.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3","fr_kiyafet","ex_el_feneri","telsiz_atex"],"current_items":["baret_en397","ayakkabi_s3","fr_kiyafet","ex_el_feneri","telsiz_atex"]}
  ]$j$::jsonb,
  $j$["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex","ruzgar_yonu","kacis_guzergahi","gozetmen"]$j$::jsonb,
  $j$["standart_is_kiyafeti","kaynak_maskesi","aluminize_giysi","dozimetre","toz_maskesi_ffp3","kursun_onluk","tam_vucut_kemeri","cizme_isi_hi3","gaz_dedektoru_co"]$j$::jsonb,
  $j$["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["ekibi_cikar","izin_kontrol","bildir_isletme","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam","durdur_muteahhit"]$j$::jsonb,
  $j$[
    "Kok gazında tek bir tehlikeli bileşen yoktur. Yanınızdaki dedektör hangi gazları ölçüyor? Sadece CO ölçen bir cihaz burada size yalancı bir güven verir.",
    "İş izni notunu tekrar okuyun: hat henüz izole edilmemiş, blindaj takılmamış ve iki gün önce kaçak bildirimi yapılmış. Bu şartlarda doğru KKD listesini yapmak yeterli midir?",
    "Bazı senaryolarda en doğru karar KKD giyip girmek değil, girmemektir. Şartlar sağlanana kadar ekibinizi geri çekip izin sürecinin tamamlanmasını istemek burada en güçlü davranıştır."
  ]$j$::jsonb,
  'Bu senaryonun doğru cevabı bir KKD listesi değil, bir karardır. Hat izole edilmemiş, blindaj takılmamış, iş izni hâlâ hazırlık aşamasında ve iki gün önceki kaçağın kalıcı onarımı tamamlanmamış. Bu şartlar altında sahaya girmek, ne kadar iyi donanmış olursanız olun kabul edilemez. Doğru davranış kendi ekibinizi bölgeden çekmek, iş izin şartlarının tamamlanmasını istemek, durumu işletme sorumlusuna bildirmek ve tespiti kayıt altına almaktır. Yüklenicinin giriş onayını bu şartlar sağlanana kadar vermemelisiniz — bu "işi durdurmak" değil, henüz başlamamış bir işe onay vermemektir. Donanım tarafında kritik ayrım şudur: kok gazı yalnızca CO değildir. İçinde H₂S ve patlayıcı karışım da bulunur; bu nedenle sadece CO/O₂ ölçen kişisel dedektör burada yanıltıcıdır, dört gazlı cihaz gerekir. Patlayıcı ortam nedeniyle tüm elektrikli ekipmanın Ex sertifikalı olması, kıyafetin antistatik olması ve rüzgâr yönüne göre yukarı yönde konumlanılması zorunludur. Kaçış güzergâhı bölgeye girmeden önce belirlenmelidir; sonradan planlanmaz. Yüklenici ekibinde ise gaz ölçüm cihazı, kaçış maskesi ve antistatik kıyafet hiç yok — bu haliyle sahaya alınmaları söz konusu bile olamaz.',
  $j$["gaz_guvenligi","girmeme_karari","is_izni_yonetimi","kkd_secimi","kontrolluk_davranisi","tehlike_tanima"]$j$::jsonb
)
on conflict (slug) do update set
  zone_id = excluded.zone_id, order_index = excluded.order_index, title = excluded.title,
  is_draft = excluded.is_draft, briefing = excluded.briefing, hazards = excluded.hazards,
  actors = excluded.actors, required_self = excluded.required_self,
  forbidden_self = excluded.forbidden_self, contractor_gaps = excluded.contractor_gaps,
  operator_gaps = excluded.operator_gaps, correct_actions = excluded.correct_actions,
  wrong_actions = excluded.wrong_actions, hints = excluded.hints,
  explanation = excluded.explanation, competency_tags = excluded.competency_tags;

-- ===========================================================================
-- SENARYO 5 — Yüksekte / İskele: Kalite Kontrolü
-- ===========================================================================
insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags
) values (
  'yi-iskele-kalite', 'yuksekte_iskele', 1, 'İskelede Kaynak Dikişi Kalite Kontrolü', false,
  $j${
    "konum": "Kazan dairesi dış cephe — cephe iskelesi, +12.00 kotu",
    "gorev": "Boru askı konsollarındaki kaynak dikişlerini iskele üzerinde gözle muayene etmek.",
    "isletme_faaliyeti": "İşletme ekibinin bu bölgede aktif çalışması yok.",
    "yuklenici_faaliyeti": "Müteahhit ekibi iskele üzerinde boru askı montajına devam ediyor.",
    "hava": "Rüzgâr 9 m/s, aralıklı sağanak. Zemin ıslak.",
    "is_izni": "Yüksekte çalışma izni açık.",
    "yukseklik": "Çalışma kotu +12.00 m. İskelenin bir bölümünde ara korkuluk sökülmüş.",
    "ozel_not": "İskele giriş kapısındaki kontrol kartı KIRMIZI etiketli ve tarih üç hafta önce."
  }$j$::jsonb,
  $j$[
    {"code":"dusme","label":"Yüksekten düşme","is_real":true,"x":40,"y":40,"explanation":"+12.00 kotta ara korkuluğu sökülmüş açıklık var. Düşme riski doğrudan ölümcüldür."},
    {"code":"eksik_korkuluk","label":"Sökülmüş ara korkuluk","is_real":true,"x":54,"y":34,"explanation":"Toplu koruma eksik. Kişisel koruyucudan önce toplu koruma tamamlanmalıdır."},
    {"code":"kirmizi_etiket","label":"Kırmızı etiketli iskele kartı","is_real":true,"x":18,"y":70,"explanation":"Kırmızı etiket iskelenin kullanıma UYGUN OLMADIĞINI gösterir. Üzerine çıkılmaz."},
    {"code":"malzeme_dusmesi","label":"Yüksekten malzeme düşmesi","is_real":true,"x":66,"y":60,"explanation":"Platform üzerinde bağlanmamış el aleti ve boru parçaları var; alt kot korunmalı."},
    {"code":"ruzgar","label":"Yüksek rüzgâr (9 m/s)","is_real":true,"x":80,"y":22,"explanation":"Rüzgâr hızı yüksekte çalışma için sınır değere yaklaşıyor; malzeme taşımayı riskli kılar."},
    {"code":"kaygan_zemin","label":"Islak ve kaygan platform","is_real":true,"x":32,"y":82,"explanation":"Sağanak sonrası iskele platformu kaygan."},
    {"code":"co_gazi","label":"Karbonmonoksit","is_real":false,"x":88,"y":50,"explanation":"Dış cephede açık havada gaz birikmesi bu senaryonun riski değildir."},
    {"code":"sivi_metal_sicrama","label":"Sıvı metal sıçraması","is_real":false,"x":10,"y":30,"explanation":"Bu bölgede sıvı metal işlemi yoktur."}
  ]$j$::jsonb,
  $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Kaynak dikişlerini iskele üzerinde gözle muayene edecek.","authority":"Kendi güvenliğinden tam sorumludur. Yüklenici üzerinde işi durdurma yetkisi vardır. İskelenin uygunluğunu onaylamak yetkili iskele kurulum sorumlusunun işidir."},
    {"type":"yuklenici","employer":"Mekanik montaj yüklenicisi","activity":"İskele üzerinde boru askı montajı.","expected_items":["standart_is_kiyafeti","baret_en397","tam_vucut_kemeri","soklu_lanyard","eldiven_mekanik","ayakkabi_s3","gozluk_en166"],"current_items":["standart_is_kiyafeti","baret_en397","eldiven_mekanik","ayakkabi_s3","gozluk_en166"]}
  ]$j$::jsonb,
  $j$["standart_is_kiyafeti","baret_jugular","tam_vucut_kemeri","cift_kancali_lanyard","ayakkabi_s3","gozluk_en166","eldiven_mekanik","iskele_kontrol_karti","toplu_koruma"]$j$::jsonb,
  $j$["aluminize_giysi","kaynak_maskesi","temiz_hava_solunum","gaz_dedektoru_4li","dozimetre","kursun_onluk","cizme_isi_hi3","eldiven_kimyasal"]$j$::jsonb,
  $j$["tam_vucut_kemeri","soklu_lanyard"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["durdur_muteahhit","bildir_firma","ekibi_cikar","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam"]$j$::jsonb,
  $j$[
    "İskeleye çıkmadan önce bakmanız gereken bir şey var ve o bir KKD değil. Giriş kapısında duruyor.",
    "Kırmızı etiket 'dikkatli ol' demek değildir; 'bu iskele kullanılamaz' demektir. Kemer takmak bu durumu düzeltmez.",
    "Düşme riskinde sıralama nettir: önce toplu koruma (korkuluk), sonra kişisel koruyucu. Sökülmüş korkuluk tamamlanmadan ve iskele yeşil etiketlenmeden ne siz çıkmalısınız ne de yüklenici çalışmaya devam etmelidir."
  ]$j$::jsonb,
  'Bu senaryonun kilit noktası, iskeleye çıkmadan önce verilen karardır. Giriş kapısındaki kontrol kartı kırmızı etiketli ve üç hafta öncesine ait; bu, iskelenin kullanıma uygun olmadığını gösterir. Kemer takmak, lanyard bağlamak ya da dikkatli olmak bu durumu ortadan kaldırmaz. Üstelik ara korkuluğun bir bölümü sökülmüş durumda. Düşme riskinde koruma sıralaması nettir: önce toplu koruma gelir, kişisel koruyucu sonra devreye girer. Doğru davranış yüklenicinin çalışmasını durdurmak, firma saha sorumlusunu çağırmak, kendi ekibinizi iskeleden ve alt kottan uzak tutmak ve durumu kayıt altına almaktır. İskele yetkili kişi tarafından yeniden kontrol edilip yeşil etiketlenene kadar hiç kimse çıkmamalıdır. Yüklenici ekibinde tam vücut kemeri ve şok emicili lanyard eksiktir; bu haliyle +12 metrede çalışıyor olmaları başlı başına kritik bir ihlaldir. Baret tipi (endüstriyel veya çene kayışlı) saha standardıdır, eksik sayılmaz. Kendi donanımınıza gelince: ısı ve kıvılcım yoksa standart iş kıyafeti yeter; iskeleye çıkılacaksa baret, tam vücut kemeri ve yatay hareket için çift kancalı lanyard gerekir. Bu bölgede gaz dedektörü, alüminize giysi veya dozimetre gibi ekipmanlar gereksizdir; dikkati dağıtır ve hareketi kısıtlar.',
  $j$["yuksekte_calisma","toplu_koruma_onceligi","iskele_kontrolu","isi_durdurma_karari","kontrolluk_davranisi"]$j$::jsonb
)
on conflict (slug) do update set
  zone_id = excluded.zone_id, order_index = excluded.order_index, title = excluded.title,
  is_draft = excluded.is_draft, briefing = excluded.briefing, hazards = excluded.hazards,
  actors = excluded.actors, required_self = excluded.required_self,
  forbidden_self = excluded.forbidden_self, contractor_gaps = excluded.contractor_gaps,
  operator_gaps = excluded.operator_gaps, correct_actions = excluded.correct_actions,
  wrong_actions = excluded.wrong_actions, hints = excluded.hints,
  explanation = excluded.explanation, competency_tags = excluded.competency_tags;

-- ===========================================================================
-- SENARYO 6 — Radyografi: Sahaya Yaklaşım
-- ===========================================================================
insert into scenarios (
  slug, zone_id, order_index, title, is_draft,
  briefing, hazards, actors,
  required_self, forbidden_self, contractor_gaps, operator_gaps,
  correct_actions, wrong_actions, hints, explanation, competency_tags
) values (
  'rg-sahaya-yaklasim', 'radyografi', 1, 'Radyografi Sahasına Yaklaşım', false,
  $j${
    "konum": "Boru köprüsü B hattı — tahribatsız muayene çalışma alanı",
    "gorev": "Kaynak dikişlerinin radyografik muayene sonuçlarını yerinde takip etmek.",
    "isletme_faaliyeti": "İşletme ekibi komşu hatta rutin tur atıyor; radyografiden haberdar değil görünüyor.",
    "yuklenici_faaliyeti": "Müteahhit NDT ekibi gama kaynağı ile film çekimi yapıyor; kaynak dışarıda.",
    "hava": "Açık hava, gündüz vardiyası.",
    "is_izni": "Radyografi çalışma bildirim formu düzenlenmiş ancak saha personeline duyurulmamış.",
    "ozel_not": "İzole alan şeridi çekilmiş fakat bir kenarı açık; uyarı levhası yerde duruyor. İkaz lambası yanıyor."
  }$j$::jsonb,
  $j$[
    {"code":"radyasyon","label":"İyonlaştırıcı radyasyon (gama)","is_real":true,"x":50,"y":46,"explanation":"Gama kaynağı dışarıda ve aktif. Görülmez, hissedilmez; tek etkili tedbir mesafe, süre ve zırhlamadır."},
    {"code":"acik_izolasyon","label":"İzole alanın açık kenarı","is_real":true,"x":30,"y":62,"explanation":"Bariyerin bir kenarı açık; habersiz kişiler alana girebilir."},
    {"code":"eksik_isaretleme","label":"Yerde duran uyarı levhası","is_real":true,"x":68,"y":74,"explanation":"Uyarı levhası görev yapmıyor. İşaretleme, alan kontrolünün ayrılmaz parçasıdır."},
    {"code":"habersiz_personel","label":"Habersiz işletme personeli","is_real":true,"x":80,"y":36,"explanation":"Komşu hatta tur atan ekip çekimden haberdar değil; bildirim yapılmamış."},
    {"code":"yuksek_kot","label":"Boru köprüsü kot farkı","is_real":true,"x":42,"y":22,"explanation":"Boru köprüsü üzerinde çalışma yüksekte yapılıyor."},
    {"code":"co_gazi","label":"Karbonmonoksit","is_real":false,"x":14,"y":40,"explanation":"Açık havada boru köprüsünde gaz birikmesi bu senaryonun riski değildir."},
    {"code":"radyan_isi","label":"Radyan ısı","is_real":false,"x":90,"y":66,"explanation":"Bu bölgede sıcak proses yoktur."},
    {"code":"kaynak_dumani","label":"Kaynak dumanı","is_real":false,"x":20,"y":16,"explanation":"Çekim sırasında kaynak yapılmamaktadır."}
  ]$j$::jsonb,
  $j$[
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Radyografik muayene sonuçlarını takip edecek.","authority":"Alana girmeme kararı tamamen kendisine aittir. Yüklenici NDT ekibinin çalışmasını durdurma yetkisi vardır. İşletme personelini uyarmak için işletme sorumlusuna bildirim yapar."},
    {"type":"yuklenici","employer":"Tahribatsız muayene yüklenicisi","activity":"Gama kaynağı ile film çekimi.","expected_items":["dozimetre","alan_bariyeri","radyografi_calisma_formu","guvenli_mesafe","baret_en397","ayakkabi_s3","standart_is_kiyafeti"],"current_items":["dozimetre","baret_en397","ayakkabi_s3","guvenli_mesafe","standart_is_kiyafeti"]},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Komşu hatta rutin tur.","expected_items":["baret_en397","ayakkabi_s3","reflektorlu_yelek","standart_is_kiyafeti"],"current_items":["baret_en397","ayakkabi_s3","reflektorlu_yelek","standart_is_kiyafeti"]}
  ]$j$::jsonb,
  $j$["standart_is_kiyafeti","guvenli_mesafe","alan_bariyeri","radyografi_calisma_formu","dozimetre","baret_en397","ayakkabi_s3"]$j$::jsonb,
  $j$["kursun_onluk","temiz_hava_solunum","aluminize_giysi","kaynak_maskesi","tam_vucut_kemeri","gaz_dedektoru_4li","toz_maskesi_ffp3","yuz_siperi"]$j$::jsonb,
  $j$["alan_bariyeri","radyografi_calisma_formu"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["ekibi_cikar","durdur_muteahhit","bildir_isletme","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam"]$j$::jsonb,
  $j$[
    "Ekipman listesine bakmadan önce şunu düşünün: bu tehlikeye karşı giyilebilecek bir KKD var mı?",
    "Kurşun önlük tıbbi röntgen içindir. Endüstriyel gama kaynağının enerjisi bambaşkadır; o önlük burada sizi korumaz, sadece korunduğunuzu sanmanıza yol açar.",
    "Radyasyonda üç tedbir vardır: mesafe, süre ve zırhlama. Sizin elinizdeki tek gerçek tedbir mesafedir — yani alana GİRMEMEK. Ayrıca izolasyonun açık kenarı ve habersiz işletme ekibi acil müdahale gerektirir."
  ]$j$::jsonb,
  'Bu senaryodaki en yaygın hata, "hangi koruyucuyu giyip girmeliyim?" sorusuyla başlamaktır. Doğru soru şudur: girmeli miyim? İyonlaştırıcı radyasyona karşı sahada giyilebilecek etkili bir kişisel koruyucu yoktur. Kurşun önlük tıbbi röntgen enerjileri için tasarlanmıştır; endüstriyel gama kaynağı karşısında koruma sağlamaz ve yalnızca yanlış bir güven duygusu üretir. Elinizdeki gerçek tedbirler mesafe, maruziyet süresi ve zırhlamadır. Dolayısıyla doğru karar izole alana girmemek ve kendi ekibinizi güvenli mesafeye çekmektir. Sahada ayrıca iki ciddi eksik var: izolasyon bariyerinin bir kenarı açık ve uyarı levhası yerde duruyor; ayrıca radyografi bildirim formu düzenlenmiş olmasına rağmen saha personeline duyurulmamış, komşu hatta tur atan işletme ekibi durumdan habersiz. Bu koşullarda NDT ekibinin çalışmasını durdurmak, alan izolasyonu ve bildirim tamamlanana kadar çekime izin vermemek gerekir. Habersiz işletme personeli için doğru kanal, doğrudan müdahale değil işletme sorumlusuna acil bildirimdir. Dozimetre taşımak bir koruma değil kayıt aracıdır; alana yaklaşan yetkili personelin maruziyetini izlemesini sağlar. Tüm bu tespitlerin kayıt altına alınması, benzer bir eksikliğin tekrarını önlemenin en etkili yoludur.',
  $j$["radyasyon_guvenligi","girmeme_karari","alan_izolasyonu","bildirim_kanallari","kontrolluk_davranisi"]$j$::jsonb
)
on conflict (slug) do update set
  zone_id = excluded.zone_id, order_index = excluded.order_index, title = excluded.title,
  is_draft = excluded.is_draft, briefing = excluded.briefing, hazards = excluded.hazards,
  actors = excluded.actors, required_self = excluded.required_self,
  forbidden_self = excluded.forbidden_self, contractor_gaps = excluded.contractor_gaps,
  operator_gaps = excluded.operator_gaps, correct_actions = excluded.correct_actions,
  wrong_actions = excluded.wrong_actions, hints = excluded.hints,
  explanation = excluded.explanation, competency_tags = excluded.competency_tags;

-- ===========================================================================
-- KALAN SENARYOLAR (24 adet) — tamamı açık, içerik sonradan doldurulabilir.
-- ===========================================================================
insert into scenarios (slug, zone_id, order_index, title, is_draft) values
  -- Yüksek Fırın (bölge toplamı 5)
  ('yf-tapa-makinesi',       'yuksek_firin',    2, 'Tapa Makinesi Bakım Denetimi',        false),
  ('yf-cruf-granulasyon',    'yuksek_firin',    3, 'Cüruf Granülasyon Hattı Turu',        false),
  ('yf-sarj-kati',           'yuksek_firin',    4, 'Şarj Katı Malzeme Besleme',           false),
  ('yf-toz-tutma',           'yuksek_firin',    5, 'Toz Tutma Ünitesi Bakımı',            false),
  -- Çelikhane (bölge toplamı 5)
  ('ch-pota-ocagi',          'celikhane',       3, 'Pota Ocağı Elektrot Değişimi',        false),
  ('ch-konvertor-refrakter', 'celikhane',       4, 'Konvertör Refrakter Örümü',           false),
  ('ch-surekli-dokum',       'celikhane',       5, 'Sürekli Döküm Segment Değişimi',      false),
  -- Kok Fabrikası (3)
  ('kk-batarya-ustu',        'kok_fabrikasi',   1, 'Kok Bataryası Üstü Turu',             false),
  ('kk-sondurme-kulesi',     'kok_fabrikasi',   2, 'Söndürme Kulesi İncelemesi',          false),
  ('kk-gaz-arindirma',       'kok_fabrikasi',   3, 'Gaz Arıtma Ünitesi Bakımı',           false),
  -- Sinter (2)
  ('sn-eleme-hatti',         'sinter',          1, 'Eleme Hattı Toz Kontrolü',            false),
  ('sn-konveyor-bakim',      'sinter',          2, 'Konveyör Bant Bakımı',                false),
  -- Haddehane (4)
  ('hd-sicak-serit',         'haddehane',       1, 'Sıcak Şerit Hattı Gözlemi',           false),
  ('hd-merdane-degisimi',    'haddehane',       2, 'Merdane Değişimi Denetimi',           false),
  ('hd-hidrolik-unite',      'haddehane',       3, 'Hidrolik Ünite Bakımı',               false),
  ('hd-tav-firini',          'haddehane',       4, 'Tav Fırını Bakım Denetimi',           false),
  -- Enerji Merkezi (2)
  ('en-salt-sahasi',         'enerji_elektrik', 1, 'Şalt Sahası Yaklaşma Mesafesi',       false),
  ('en-trafo-binasi',        'enerji_elektrik', 2, 'Trafo Binası Bakım Denetimi',         false),
  -- Gaz Hatları (bölge toplamı 3)
  ('gh-vana-istasyonu',      'gaz_hatlari',     2, 'Vana İstasyonu Devreye Alma',         false),
  ('gh-kacak-mudahale',      'gaz_hatlari',     3, 'Gaz Kaçağı İhbarına Müdahale',        false),
  -- Liman (2)
  ('lm-gemi-bosaltma',       'liman_stok',      1, 'Gemi Boşaltma Operasyonu',            false),
  ('lm-stok-sahasi-trafik',  'liman_stok',      2, 'Stok Sahası Araç Trafiği',            false),
  -- Yüksekte/İskele (bölge toplamı 2)
  ('yi-cati-calismasi',      'yuksekte_iskele', 2, 'Çatı Üzeri Sac Yenileme',             false),
  -- Kapalı Alan (1)
  ('ka-tank-girisi',         'kapali_alan',     1, 'Gaz Tankı İçi Kapalı Hacim Girişi',   false)
on conflict (slug) do update set
  zone_id     = excluded.zone_id,
  order_index = excluded.order_index,
  title       = excluded.title,
  is_draft    = false;

-- Daha önce taslak işaretlenen tüm kayıtları aç.
update scenarios set is_draft = false;

-- ===========================================================================
-- TEMİZLİK
-- Bölge yapısı güncellendiğinde artık kullanılmayan kayıtları kaldırır.
-- Daha önceki bir sürümü çalıştırdıysanız bu blok fazlalıkları siler.
-- ===========================================================================
delete from scenarios where slug in (
  'yi-sepetli-platform',
  'rg-gece-cekimi',
  'en-kablo-galerisi',
  'gh-kapali-hacim',
  'at-tezgah-calismasi',
  'at-kaldirma-ekipmani'
);

delete from zones where id = 'atolye_bakim';
