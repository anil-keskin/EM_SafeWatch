-- Canlı uygulanan MCP sürümündeki yazım hatasını düzeltir.
-- 0009 dosyası doğru metni içerir; bu adım yalnızca uzak kaydı hizalar.

update public.scenarios
set actors = replace(actors::text, 'sorumluluğundundadır', 'sorumluluğundadır')::jsonb
where slug = 'gh-saha-incelemesi';
