-- Фаза 2 «Урбан Древесный»: модели 2H/1V/2V — по одному цвету на модель,
-- без цветовой сетки (в отличие от «Урбан ЗТ» из фазы 1). Каждой паре
-- дизайн+кромка соответствует ровно один сфотографированный цвет —
-- лишних свотчей не создаём, пока нет остальных фото.
--
-- Цвета (Шервуд бурбон/солярис/вишня) уже есть в БД с фазы 1 — новых
-- colors не вставляем. Выполнить в Supabase SQL Editor целиком.

begin;

-- Models — полотно 17750 / комплект 22900 (kit_price coating без изменений).
insert into public.models (series_id, name, sku, has_glass, trim)
select s.id, v.name, v.sku, false, v.trim
from public.series s
cross join (values
  ('Урбан 2H', 'URBAN-EKO-2H-BURBON-CHK-CHM',  '4х4 ЧК ЧМ'),
  ('Урбан 2H', 'URBAN-EKO-2H-BURBON-ZK-ZM',    '4х4 ЗК ЗМ'),
  ('Урбан 1V', 'URBAN-EKO-1V-SOLARIS-CHK-CHM', '4х4 ЧК ЧМ'),
  ('Урбан 1V', 'URBAN-EKO-1V-SOLARIS-ZK-ZM',   '4х4 ЗК ЗМ'),
  ('Урбан 2V', 'URBAN-EKO-2V-VISHNYA-CHK-CHM', '4х4 ЧК ЧМ'),
  ('Урбан 2V', 'URBAN-EKO-2V-VISHNYA-SK-SM',   '4х4 СК СМ')
) as v(name, sku, trim)
where s.slug = 'urban-drevesnyy'
  and not exists (select 1 from public.models existing where existing.sku = v.sku);

-- model_colors — по одному цвету на модель (photo_url уже реальный, не
-- placeholder — проверен curl'ом, все 200).
insert into public.model_colors (model_id, color_id, price_rrp, photo_url)
select m.id, c.id, v.price, v.photo_url
from public.models m
join public.series s on s.id = m.series_id and s.slug = 'urban-drevesnyy'
join public.colors c on c.coating_id = s.coating_id
cross join lateral (values
  ('URBAN-EKO-2H-BURBON-CHK-CHM',  'Шервуд бурбон',   17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_models_other/urban_2h_bourbon_wood_bm_be_4x4.webp'),
  ('URBAN-EKO-2H-BURBON-ZK-ZM',    'Шервуд бурбон',   17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_models_other/urban_2h_bourbon_wood_gm_ge_4x4.webp'),
  ('URBAN-EKO-1V-SOLARIS-CHK-CHM', 'Шервуд солярис',  17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_models_other/urban_1v_sunshine_wood_bm_be_4x4.webp'),
  ('URBAN-EKO-1V-SOLARIS-ZK-ZM',   'Шервуд солярис',  17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_models_other/urban_1v_sunshine_wood_gm_ge_4x4.webp'),
  ('URBAN-EKO-2V-VISHNYA-CHK-CHM', 'Шервуд вишня',    17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_models_other/urban_2v_cherry_wood_bm_be_4x4.webp'),
  ('URBAN-EKO-2V-VISHNYA-SK-SM',   'Шервуд вишня',    17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_models_other/urban_2v_cherry_wood_sm_se_4x4.webp')
) as v(sku, color_name, price, photo_url)
where m.sku = v.sku and c.name = v.color_name
  and not exists (
    select 1 from public.model_colors existing
    where existing.model_id = m.id and existing.color_id = c.id
  );

commit;

-- Проверка: select count(*) from models m join series s on s.id=m.series_id where s.slug='urban-drevesnyy';
-- ожидается 9 (было 3 «Урбан ЗТ» + 6 новых).
-- select count(*) from model_colors mc join models m on m.id=mc.model_id
--   join series s on s.id=m.series_id where s.slug='urban-drevesnyy';
-- ожидается 18 (было 12 + 6 новых).
