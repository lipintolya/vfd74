-- Фаза 1: только «Урбан ЗТ» (Экошпон) — полная сетка 4 цвета × 3 кромки.
-- Выполнить в Supabase SQL Editor целиком, одним запуском — идемпотентно.
--
-- Остальные модели серии (Урбан З, 2H/1V/2V) — отдельным скриптом позже,
-- см. 2026-09-urban-drevesnyy.sql (полный набор, для справки).

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

-- 3. Colors — только 3, что нужны «Урбан ЗТ» (Пекан-цвета для других
-- моделей серии — отдельным шагом позже) ------------------------------
insert into public.colors (coating_id, name, hex_preview)
select c.id, v.name, null
from public.coatings c
cross join (values
  ('Шервуд янтарь'),
  ('Шервуд бурбон'),
  ('Шервуд солярис'),
  ('Шервуд вишня')
) as v(name)
where c.slug = 'ekoshpon'
  and not exists (
    select 1 from public.colors existing
    where existing.coating_id = c.id and existing.name = v.name
  );

-- 4. Models — «Урбан ЗТ», полная сетка 4×3, полотно 16610 / комплект 21760.
-- Из них 4 позиции (янтарь-ЗК, янтарь-СК, бурбон-СК, солярис-СК, вишня-ЗК —
-- итого 5) — расширение сверх исходного прайса фабрики (там был только
-- янтарь-ЧК/СК), добавлены по решению пользователя.
insert into public.models (series_id, name, sku, has_glass, trim)
select s.id, 'Урбан ЗТ', v.sku, false, v.trim
from public.series s
cross join (values
  ('URBAN-EKO-ZT-YANTAR-CHK',  '4х4 ЧК'),
  ('URBAN-EKO-ZT-YANTAR-ZK',   '4х4 ЗК'),
  ('URBAN-EKO-ZT-YANTAR-SK',   '4х4 СК'),
  ('URBAN-EKO-ZT-BURBON-CHK',  '4х4 ЧК'),
  ('URBAN-EKO-ZT-BURBON-ZK',   '4х4 ЗК'),
  ('URBAN-EKO-ZT-BURBON-SK',   '4х4 СК'),
  ('URBAN-EKO-ZT-SOLARIS-CHK', '4х4 ЧК'),
  ('URBAN-EKO-ZT-SOLARIS-ZK',  '4х4 ЗК'),
  ('URBAN-EKO-ZT-SOLARIS-SK',  '4х4 СК'),
  ('URBAN-EKO-ZT-VISHNYA-CHK', '4х4 ЧК'),
  ('URBAN-EKO-ZT-VISHNYA-ZK',  '4х4 ЗК'),
  ('URBAN-EKO-ZT-VISHNYA-SK',  '4х4 СК')
) as v(sku, trim)
where s.slug = 'urban-drevesnyy'
  and not exists (select 1 from public.models existing where existing.sku = v.sku);

commit;

-- Проверка: select count(*) from public.models m join public.series s
--   on s.id = m.series_id where s.slug = 'urban-drevesnyy';
-- ожидается 12.
