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
