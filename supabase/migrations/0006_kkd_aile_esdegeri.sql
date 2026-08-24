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
