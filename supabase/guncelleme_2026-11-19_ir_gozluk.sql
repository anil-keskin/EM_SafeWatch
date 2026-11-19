-- Döküm Kanalı Gözlemi: yüklenicinin göz koruması eksiği IR filtreli gözlük.
-- Radyan ısı ortamında EN 166 tek başına yetmez; kontrolluk ve işletme zaten IR kullanıyor.
update public.scenarios set
  contractor_gaps = replace(contractor_gaps::text, '"gozluk_en166"', '"gozluk_ir"')::jsonb,
  actors          = replace(actors::text, '"gozluk_en166"', '"gozluk_ir"')::jsonb,
  explanation     = replace(explanation,
                      'göz koruması ve toz maskesi eksik',
                      'IR filtreli göz koruması ve toz maskesi eksik')
where slug = 'yf-dokum-kanali'
returning slug, contractor_gaps;
