-- Новая серия «Урбан Древесный» (coating «Экошпон»)
-- Выполнить в Supabase SQL Editor целиком, одним запуском — идемпотентно
-- (повторный запуск не создаст дублей).
--
-- ВАЖНО: это только 4 из 5 шагов. model_colors (цена + фото на пару
-- модель+цвет) добавляются ОТДЕЛЬНЫМ скриптом после того, как появятся
-- фото — см. 2026-09-urban-drevesnyy-photos.sql (шаблон в конце файла).

begin;

-- 1. Coating -----------------------------------------------------------
insert into public.coatings (name, slug, kit_price)
select 'Экошпон', 'ekoshpon', 5150
where not exists (select 1 from public.coatings where slug = 'ekoshpon');

-- 2. Series --------------------------------------------------------------
insert into public.series (coating_id, name, slug)
select c.id, 'Урбан Древесный', 'urban-drevesnyy'
from public.coatings c
where c.slug = 'ekoshpon'
  and not exists (select 1 from public.series where slug = 'urban-drevesnyy');

-- 3. Colors ----------------------------------------------------------------
-- hex_preview оставлен NULL — сайт безопасно откатывается на серый свотч
-- (#cccccc), заполним реальным hex, когда появятся фото.
insert into public.colors (coating_id, name, hex_preview)
select c.id, v.name, null
from public.coatings c
cross join (values
  ('Шервуд янтарь'),
  ('Шервуд бурбон'),
  ('Шервуд солярис'),
  ('Шервуд вишня'),
  ('Пекан дымчатый'),
  ('Пекан ванильный'),
  ('Пекан таёжный'),
  ('Пекан стальной')
) as v(name)
where c.slug = 'ekoshpon'
  and not exists (
    select 1 from public.colors existing
    where existing.coating_id = c.id and existing.name = v.name
  );

-- 4. Models ------------------------------------------------------------
-- has_glass = false везде (полотна без остекления, как в исходном прайсе).
insert into public.models (series_id, name, sku, has_glass, trim)
select s.id, v.name, v.sku, false, v.trim
from public.series s
cross join (values
  -- Группа «Шервуд», полотно 16610 / комплект 21760
  ('Урбан З',  'URBAN-EKO-Z-YANTAR-CHK',        '4х4 ЧК'),
  ('Урбан З',  'URBAN-EKO-Z-YANTAR-SK',         '4х4 СК'),
  ('Урбан ЗТ', 'URBAN-EKO-ZT-BURBON-CHK',       '4х4 ЧК'),
  ('Урбан ЗТ', 'URBAN-EKO-ZT-BURBON-ZK',        '4х4 ЗК'),
  ('Урбан ЗТ', 'URBAN-EKO-ZT-SOLARIS-CHK',      '4х4 ЧК'),
  ('Урбан ЗТ', 'URBAN-EKO-ZT-SOLARIS-ZK',       '4х4 ЗК'),
  ('Урбан ЗТ', 'URBAN-EKO-ZT-VISHNYA-CHK',      '4х4 ЧК'),
  ('Урбан ЗТ', 'URBAN-EKO-ZT-VISHNYA-SK',       '4х4 СК'),   -- было SM/СМ, переименовано в СК по просьбе
  -- Группа «Пекан», полотно 16700 / комплект 21850
  ('Урбан З',  'URBAN-EKO-Z-DYMCHATY-CHK',      '4х4 ЧК'),
  ('Урбан З',  'URBAN-EKO-Z-DYMCHATY-SK',       '4х4 СК'),
  ('Урбан З',  'URBAN-EKO-Z-VANILNY-CHK',       '4х4 ЧК'),
  ('Урбан З',  'URBAN-EKO-Z-VANILNY-ZK',        '4х4 ЗК'),
  ('Урбан З',  'URBAN-EKO-Z-TAEZHNY-CHK',       '4х4 ЧК'),
  ('Урбан З',  'URBAN-EKO-Z-TAEZHNY-ZK',        '4х4 ЗК'),
  ('Урбан З',  'URBAN-EKO-Z-STALNOY-CHK',       '4х4 ЧК'),
  ('Урбан З',  'URBAN-EKO-Z-STALNOY-SK',        '4х4 СК'),
  -- Группа «Шервуд» 2H/1V/2V, полотно 17750 / комплект 22900
  ('Урбан 2H', 'URBAN-EKO-2H-BURBON-CHK-CHM',   '4х4 ЧК ЧМ'),
  ('Урбан 2H', 'URBAN-EKO-2H-BURBON-ZK-ZM',     '4х4 ЗК ЗМ'),
  ('Урбан 1V', 'URBAN-EKO-1V-SOLARIS-CHK-CHM',  '4х4 ЧК ЧМ'),
  ('Урбан 1V', 'URBAN-EKO-1V-SOLARIS-ZK-ZM',    '4х4 ЗК ЗМ'),
  ('Урбан 2V', 'URBAN-EKO-2V-VISHNYA-CHK-CHM',  '4х4 ЧК ЧМ'),
  ('Урбан 2V', 'URBAN-EKO-2V-VISHNYA-SK-SM',    '4х4 СК СМ'),
  -- Группа «Пекан» 2H/1V/2V, полотно 17750 / комплект 22900
  ('Урбан 2H', 'URBAN-EKO-2H-VANILNY-CHK-CHM',  '4х4 ЧК ЧМ'),
  ('Урбан 2H', 'URBAN-EKO-2H-VANILNY-ZK-ZM',    '4х4 ЗК ЗМ'),
  ('Урбан 1V', 'URBAN-EKO-1V-TAEZHNY-CHK-CHM',  '4х4 ЧК ЧМ'),
  ('Урбан 1V', 'URBAN-EKO-1V-TAEZHNY-ZK-ZM',    '4х4 ЗК ЗМ'),
  ('Урбан 2V', 'URBAN-EKO-2V-STALNOY-CHK-CHM',  '4х4 ЧК ЧМ'),
  ('Урбан 2V', 'URBAN-EKO-2V-STALNOY-SK-SM',    '4х4 СК СМ')
) as v(name, sku, trim)
where s.slug = 'urban-drevesnyy'
  and not exists (select 1 from public.models existing where existing.sku = v.sku);

commit;

-- Проверка после запуска:
-- select count(*) from public.models m join public.series s on s.id = m.series_id where s.slug = 'urban-drevesnyy';
-- ожидается 28.
