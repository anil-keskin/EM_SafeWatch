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
