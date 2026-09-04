-- Фаза 1 (шаг 2): цена + фото для 12 позиций «Урбан ЗТ».
-- Выполнять ПОСЛЕ 2026-09-urban-zt-phase1.sql. Все 12 URL проверены
-- curl'ом — отвечают 200.

begin;

insert into public.model_colors (model_id, color_id, price_rrp, photo_url)
select m.id, c.id, v.price, v.photo_url
from public.models m
join public.series s on s.id = m.series_id and s.slug = 'urban-drevesnyy'
join public.colors c on c.coating_id = s.coating_id
cross join lateral (values
  ('URBAN-EKO-ZT-YANTAR-CHK',  'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_amber_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-YANTAR-ZK',   'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_yantar_ge.webp'),
  ('URBAN-EKO-ZT-YANTAR-SK',   'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_amber_wood_sm_se_4x4.webp'),
  ('URBAN-EKO-ZT-BURBON-CHK',  'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_bourbon_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-BURBON-ZK',   'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_bourbon_wood_ge_4x4.webp'),
  ('URBAN-EKO-ZT-BURBON-SK',   'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_se_burbon.webp'),
  ('URBAN-EKO-ZT-SOLARIS-CHK', 'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_sunshine_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-SOLARIS-ZK',  'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_ge_soliaris.webp'),
  ('URBAN-EKO-ZT-SOLARIS-SK',  'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_se_soliaris.webp'),
  ('URBAN-EKO-ZT-VISHNYA-CHK', 'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_cherry_wood_be_4x4.webp'),
  ('URBAN-EKO-ZT-VISHNYA-ZK',  'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_cherry_ge.webp'),
  ('URBAN-EKO-ZT-VISHNYA-SK',  'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/silver/urban_z_cherry_wood_se_4x4.webp')
) as v(sku, color_name, price, photo_url)
where m.sku = v.sku and c.name = v.color_name
  and not exists (
    select 1 from public.model_colors existing
    where existing.model_id = m.id and existing.color_id = c.id
  );

commit;

-- Проверка: select count(*) from public.model_colors mc
--   join public.models m on m.id = mc.model_id
--   join public.series s on s.id = m.series_id
--   where s.slug = 'urban-drevesnyy';
-- ожидается 12.
