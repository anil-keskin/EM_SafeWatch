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
