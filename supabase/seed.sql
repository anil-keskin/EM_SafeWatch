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
  ('baret_en397',        'Endüstriyel Baret',                  'bas',      'EN 397',              'Düşen cisim ve çarpma etkisine karşı temel baş koruması. Sahada istisnasız zorunludur.',                         'hepsi',      'Yüksekte çalışmada çene kayışı olmadan yeterli değildir.',                                  '⛑️', 1),
  ('baret_jugular',      'Çene Kayışlı Baret',                 'bas',      'EN 397 / EN 12492',   'Baş aşağı düşme ve eğilme hareketlerinde baretin düşmesini engelleyen çene kayışlı model.',                      'hepsi',      'Yüksek ısı bölgesinde tek başına ısı koruması sağlamaz.',                                   '⛑️', 2),
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
  ('toolbox',                 'Başlangıç Toplantısı (Toolbox)','dokuman',  '—',                   'İşe başlamadan önce riskleri ve tedbirleri ekiple paylaşan kısa saha toplantısı.',                               'hepsi',      'İmza toplamak yeterli değildir; içerik anlaşılmalıdır.',                                    '🗣️', 5)
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
    {"type":"kontrolluk","employer":"Erdemir Mühendislik","activity":"Refrakter tamiratını gözlemliyor, ilerleme kaydı alıyor.","authority":"Kendi ekibi üzerinde tam yetkili. Yüklenicide sözleşme kapsamında durdurma yetkisi var. İşletme personeline doğrudan talimat veremez."},
    {"type":"yuklenici","employer":"Refrakter yüklenicisi","activity":"Kanal yan duvarına döküm harcı uyguluyor.","expected_items":["baret_en397","gozluk_en166","toz_maskesi_ffp3","eldiven_isi","fr_kiyafet","ayakkabi_s3"],"current_items":["baret_en397","eldiven_mekanik","fr_kiyafet","ayakkabi_s3"]},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Cüruf kanalı temizliği ve tapa makinesi hazırlığı.","expected_items":["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci"],"current_items":["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci"]}
  ]$j$::jsonb,
  $j$["gaz_dedektoru_co","kacis_maskesi_co","fr_kiyafet","baret_en397","gozluk_ir","eldiven_isi","ayakkabi_s3","kulak_tikaci","gaz_olcum_formu"]$j$::jsonb,
  $j$["kaynak_maskesi","aluminize_giysi","tam_vucut_kemeri","eldiven_kimyasal","dozimetre","temiz_hava_solunum","kursun_onluk"]$j$::jsonb,
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
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Tandiş çevresinde sıvı metal kaçağına müdahale ediyor.","expected_items":["aluminize_giysi","yuz_siperi","cizme_isi_hi3","eldiven_isi","baret_en397"],"current_items":["fr_kiyafet","gozluk_en166","ayakkabi_s3","eldiven_mekanik","baret_en397"]},
    {"type":"yuklenici","employer":"Mekanik montaj yüklenicisi","activity":"Platformun 15 m uzağında yürüyüş yolu montajı.","expected_items":["baret_en397","gozluk_en166","eldiven_mekanik","fr_kiyafet","ayakkabi_s3","kulak_tikaci"],"current_items":["baret_en397","gozluk_en166","eldiven_mekanik","fr_kiyafet","ayakkabi_s3","kulak_tikaci"]}
  ]$j$::jsonb,
  $j$["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3","kulak_tikaci","guvenli_mesafe"]$j$::jsonb,
  $j$["aluminize_giysi","kaynak_maskesi","tam_vucut_kemeri","temiz_hava_solunum","eldiven_kimyasal","kursun_onluk","dozimetre"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["aluminize_giysi","yuz_siperi","cizme_isi_hi3","eldiven_isi"]$j$::jsonb,
  $j$["bildir_isletme","bildir_isg","ekibi_cikar","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam","durdur_muteahhit"]$j$::jsonb,
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
    {"type":"yuklenici","employer":"Mekanik tadilat yüklenicisi","activity":"Taşıyıcı konsol üzerinde elektrik ark kaynağı.","expected_items":["kaynak_maskesi","eldiven_kaynak","kaynakci_onlugu","fr_kiyafet","ayakkabi_s3","baret_en397","kaynak_perdesi","yangin_sondurucu"],"current_items":["baret_en397","fr_kiyafet","ayakkabi_s3","eldiven_mekanik"]},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"20 m ötede cüruf potası taşıma hazırlığı.","expected_items":["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3"],"current_items":["baret_en397","gozluk_ir","fr_kiyafet","eldiven_isi","ayakkabi_s3"]}
  ]$j$::jsonb,
  $j$["baret_en397","gozluk_en166","fr_kiyafet","eldiven_mekanik","ayakkabi_s3","kulak_tikaci","is_izni"]$j$::jsonb,
  $j$["kaynak_maskesi","aluminize_giysi","tam_vucut_kemeri","temiz_hava_solunum","kursun_onluk","dozimetre","cizme_isi_hi3"]$j$::jsonb,
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
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Hat basıncını düşürme, blindaj hazırlığı.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3"],"current_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3"]},
    {"type":"yuklenici","employer":"Boru ve kaynak yüklenicisi","activity":"Sahaya giriş için onay bekliyor.","expected_items":["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","baret_en397","ayakkabi_s3","fr_kiyafet"],"current_items":["baret_en397","ayakkabi_s3","fr_kiyafet"]}
  ]$j$::jsonb,
  $j$["gaz_dedektoru_4li","kacis_maskesi_co","antistatik_ex_kiyafet","fr_kiyafet","baret_en397","ayakkabi_s3","ex_el_feneri","telsiz_atex","ruzgar_yonu","kacis_guzergahi","gozetmen"]$j$::jsonb,
  $j$["kaynak_maskesi","aluminize_giysi","dozimetre","toz_maskesi_ffp3","kursun_onluk","tam_vucut_kemeri","cizme_isi_hi3","gaz_dedektoru_co"]$j$::jsonb,
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
    {"type":"yuklenici","employer":"Mekanik montaj yüklenicisi","activity":"İskele üzerinde boru askı montajı.","expected_items":["baret_jugular","tam_vucut_kemeri","soklu_lanyard","eldiven_mekanik","ayakkabi_s3","gozluk_en166"],"current_items":["baret_en397","eldiven_mekanik","ayakkabi_s3","gozluk_en166"]}
  ]$j$::jsonb,
  $j$["baret_jugular","tam_vucut_kemeri","cift_kancali_lanyard","ayakkabi_s3","gozluk_en166","eldiven_mekanik","iskele_kontrol_karti","toplu_koruma"]$j$::jsonb,
  $j$["aluminize_giysi","kaynak_maskesi","temiz_hava_solunum","gaz_dedektoru_4li","dozimetre","kursun_onluk","cizme_isi_hi3","eldiven_kimyasal"]$j$::jsonb,
  $j$["baret_jugular","tam_vucut_kemeri","soklu_lanyard"]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$["durdur_muteahhit","bildir_firma","ekibi_cikar","kayit_al"]$j$::jsonb,
  $j$["gozleme_devam"]$j$::jsonb,
  $j$[
    "İskeleye çıkmadan önce bakmanız gereken bir şey var ve o bir KKD değil. Giriş kapısında duruyor.",
    "Kırmızı etiket 'dikkatli ol' demek değildir; 'bu iskele kullanılamaz' demektir. Kemer takmak bu durumu düzeltmez.",
    "Düşme riskinde sıralama nettir: önce toplu koruma (korkuluk), sonra kişisel koruyucu. Sökülmüş korkuluk tamamlanmadan ve iskele yeşil etiketlenmeden ne siz çıkmalısınız ne de yüklenici çalışmaya devam etmelidir."
  ]$j$::jsonb,
  'Bu senaryonun kilit noktası, iskeleye çıkmadan önce verilen karardır. Giriş kapısındaki kontrol kartı kırmızı etiketli ve üç hafta öncesine ait; bu, iskelenin kullanıma uygun olmadığını gösterir. Kemer takmak, lanyard bağlamak ya da dikkatli olmak bu durumu ortadan kaldırmaz. Üstelik ara korkuluğun bir bölümü sökülmüş durumda. Düşme riskinde koruma sıralaması nettir: önce toplu koruma gelir, kişisel koruyucu sonra devreye girer. Doğru davranış yüklenicinin çalışmasını durdurmak, firma saha sorumlusunu çağırmak, kendi ekibinizi iskeleden ve alt kottan uzak tutmak ve durumu kayıt altına almaktır. İskele yetkili kişi tarafından yeniden kontrol edilip yeşil etiketlenene kadar hiç kimse çıkmamalıdır. Yüklenici ekibinde ayrıca çene kayışlı baret, tam vücut kemeri ve şok emicili lanyard eksiktir; bu haliyle +12 metrede çalışıyor olmaları başlı başına kritik bir ihlaldir. Kendi donanımınıza gelince: iskeleye çıkacaksanız çene kayışlı baret, tam vücut kemeri ve yatay hareket için çift kancalı lanyard gerekir. Bu bölgede gaz dedektörü, alüminize giysi veya dozimetre gibi ekipmanlar gereksizdir; dikkati dağıtır ve hareketi kısıtlar.',
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
    {"type":"yuklenici","employer":"Tahribatsız muayene yüklenicisi","activity":"Gama kaynağı ile film çekimi.","expected_items":["dozimetre","alan_bariyeri","radyografi_calisma_formu","guvenli_mesafe","baret_en397","ayakkabi_s3"],"current_items":["dozimetre","baret_en397","ayakkabi_s3"]},
    {"type":"isletme","employer":"Demir çelik işletmesi","activity":"Komşu hatta rutin tur.","expected_items":["baret_en397","ayakkabi_s3","reflektorlu_yelek"],"current_items":["baret_en397","ayakkabi_s3","reflektorlu_yelek"]}
  ]$j$::jsonb,
  $j$["guvenli_mesafe","alan_bariyeri","radyografi_calisma_formu","dozimetre","baret_en397","ayakkabi_s3"]$j$::jsonb,
  $j$["kursun_onluk","temiz_hava_solunum","aluminize_giysi","kaynak_maskesi","fr_kiyafet","tam_vucut_kemeri","gaz_dedektoru_4li","toz_maskesi_ffp3","yuz_siperi"]$j$::jsonb,
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
