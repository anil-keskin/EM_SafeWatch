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
