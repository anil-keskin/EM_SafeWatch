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
