-- Фикс структуры «Урбан ЗТ»: было 12 models (цвет+кромка в одном SKU,
-- каждая — своя карточка без переключения цвета). Нужно: 3 models (по
-- кромке — ЧК/ЗК/СК), у каждой 4 model_colors (янтарь/бурбон/солярис/
-- вишня) — тогда в каталоге 3 карточки с переключателем цвета на 4
-- варианта, как и задумано.
--
-- Выполнить ОДИН РАЗ вместо/после уже накатанных 2026-09-urban-zt-phase1*.sql.
-- Безопасно перезапускать (идемпотентно).

begin;

-- 1. Снести старые model_colors и models (старая схема: 1 sku = 1 цвет).
delete from public.model_colors
where model_id in (
  select id from public.models where sku like 'URBAN-EKO-ZT-%'
);
delete from public.models where sku like 'URBAN-EKO-ZT-%';

-- 2. Новые models — 3 шт, по кромке.
insert into public.models (series_id, name, sku, has_glass, trim)
select s.id, 'Урбан ЗТ', v.sku, false, v.trim
from public.series s
cross join (values
  ('URBAN-EKO-ZT-CHK', '4х4 ЧК'),
  ('URBAN-EKO-ZT-ZK',  '4х4 ЗК'),
  ('URBAN-EKO-ZT-SK',  '4х4 СК')
) as v(sku, trim)
where s.slug = 'urban-drevesnyy'
  and not exists (select 1 from public.models existing where existing.sku = v.sku);

-- 3. model_colors — каждая из 3 моделей получает все 4 цвета с ценой и
-- фото (те же фото, что уже загружены под соответствующую пару
-- цвет+кромка).
insert into public.model_colors (model_id, color_id, price_rrp, photo_url)
select m.id, c.id, v.price, v.photo_url
from public.models m
join public.series s on s.id = m.series_id and s.slug = 'urban-drevesnyy'
join public.colors c on c.coating_id = s.coating_id
cross join lateral (values
  ('URBAN-EKO-ZT-CHK', 'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_amber_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-ZK',  'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_yantar_ge.webp'),
  ('URBAN-EKO-ZT-SK',  'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_amber_wood_sm_se_4x4.webp'),
  ('URBAN-EKO-ZT-CHK', 'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_bourbon_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-ZK',  'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_bourbon_wood_ge_4x4.webp'),
  ('URBAN-EKO-ZT-SK',  'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_se_burbon.webp'),
  ('URBAN-EKO-ZT-CHK', 'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_sunshine_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-ZK',  'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_ge_soliaris.webp'),
  ('URBAN-EKO-ZT-SK',  'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_se_soliaris.webp'),
  ('URBAN-EKO-ZT-CHK', 'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_cherry_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-ZK',  'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_cherry_ge.webp'),
  ('URBAN-EKO-ZT-SK',  'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_cherry_wood_se_4x4.webp')
) as v(sku, color_name, price, photo_url)
where m.sku = v.sku and c.name = v.color_name
  and not exists (
    select 1 from public.model_colors existing
    where existing.model_id = m.id and existing.color_id = c.id
  );

commit;

-- Проверка:
-- select count(*) from models m join series s on s.id=m.series_id where s.slug='urban-drevesnyy';
-- ожидается 3.
-- select count(*) from model_colors mc join models m on m.id=mc.model_id
--   join series s on s.id=m.series_id where s.slug='urban-drevesnyy';
-- ожидается 12.
