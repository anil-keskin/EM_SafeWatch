-- Standart iş kıyafeti kartı (Gövde ailesi).
-- Dolu senaryoların doğru cevap kümelerine dokunulmaz.

insert into public.equipment_items (
  code, name, category_id, standard, description, used_by, not_for, why_select, icon, order_index
) values (
  'standart_is_kiyafeti',
  'Standart İş Kıyafeti',
  'govde',
  'EN ISO 13688',
  'Pamuk/karışım kumaşlı genel saha iş elbisesi. Alev, kıvılcım ve radyan ısı koruması yoktur.',
  'hepsi',
  'Sıcak iş, döküm ve kıvılcım ortamında tutuşur; FR kıyafet yerine geçmez.',
  'Isı ve kıvılcım yoksa, genel saha yürüyüşü ve soğuk iş için seçin. Döküm, sıcak hat veya kaynak çevresinde seçmeyin; tutuşur.',
  '👔',
  0
)
on conflict (code) do update
  set name        = excluded.name,
      category_id = excluded.category_id,
      standard    = excluded.standard,
      description = excluded.description,
      used_by     = excluded.used_by,
      not_for     = excluded.not_for,
      why_select  = excluded.why_select,
      icon        = excluded.icon,
      order_index = excluded.order_index;
