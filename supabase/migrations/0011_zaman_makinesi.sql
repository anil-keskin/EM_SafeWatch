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
