-- Шаг 2: цена + фото на пару модель+цвет для «Урбан Древесный».
-- Выполнять ПОСЛЕ 2026-09-urban-drevesnyy.sql и после того, как фото
-- залиты в Yandex Cloud (storage.yandexcloud.net/catalog-vfd/ekoshpon/...).
--
-- Цены — полотно (price_rrp), сайт сам прибавляет kit_price (5150) для
-- отображения «под ключ». Заполни photo_url для каждой строки перед
-- запуском — если оставить placeholder-путь, замени на реальный.

begin;

insert into public.model_colors (model_id, color_id, price_rrp, photo_url)
select m.id, c.id, v.price, v.photo_url
from public.models m
join public.series s on s.id = m.series_id and s.slug = 'urban-drevesnyy'
join public.colors c on c.coating_id = s.coating_id
cross join lateral (values
  ('URBAN-EKO-Z-YANTAR-CHK',       'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_sherwood_yantar_chk_4x4.webp'),
  ('URBAN-EKO-Z-YANTAR-SK',        'Шервуд янтарь',   16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_sherwood_yantar_sk_4x4.webp'),
  ('URBAN-EKO-ZT-BURBON-CHK',      'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_zt_sherwood_burbon_chk_4x4.webp'),
  ('URBAN-EKO-ZT-BURBON-ZK',       'Шервуд бурбон',   16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_zt_sherwood_burbon_zk_4x4.webp'),
  ('URBAN-EKO-ZT-SOLARIS-CHK',     'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_zt_sherwood_solaris_chk_4x4.webp'),
  ('URBAN-EKO-ZT-SOLARIS-ZK',      'Шервуд солярис',  16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_zt_sherwood_solaris_zk_4x4.webp'),
  ('URBAN-EKO-ZT-VISHNYA-CHK',     'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_zt_sherwood_vishnya_chk_4x4.webp'),
  ('URBAN-EKO-ZT-VISHNYA-SK',      'Шервуд вишня',    16610, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_zt_sherwood_vishnya_sk_4x4.webp'),
  ('URBAN-EKO-Z-DYMCHATY-CHK',     'Пекан дымчатый',  16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_dymchaty_chk_4x4.webp'),
  ('URBAN-EKO-Z-DYMCHATY-SK',      'Пекан дымчатый',  16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_dymchaty_sk_4x4.webp'),
  ('URBAN-EKO-Z-VANILNY-CHK',      'Пекан ванильный', 16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_vanilny_chk_4x4.webp'),
  ('URBAN-EKO-Z-VANILNY-ZK',       'Пекан ванильный', 16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_vanilny_zk_4x4.webp'),
  ('URBAN-EKO-Z-TAEZHNY-CHK',      'Пекан таёжный',   16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_taezhny_chk_4x4.webp'),
  ('URBAN-EKO-Z-TAEZHNY-ZK',       'Пекан таёжный',   16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_taezhny_zk_4x4.webp'),
  ('URBAN-EKO-Z-STALNOY-CHK',      'Пекан стальной',  16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_stalnoy_chk_4x4.webp'),
  ('URBAN-EKO-Z-STALNOY-SK',       'Пекан стальной',  16700, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_z_pecan_stalnoy_sk_4x4.webp'),
  ('URBAN-EKO-2H-BURBON-CHK-CHM',  'Шервуд бурбон',   17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2h_sherwood_burbon_chk_chm_4x4.webp'),
  ('URBAN-EKO-2H-BURBON-ZK-ZM',    'Шервуд бурбон',   17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2h_sherwood_burbon_zk_zm_4x4.webp'),
  ('URBAN-EKO-1V-SOLARIS-CHK-CHM', 'Шервуд солярис',  17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_1v_sherwood_solaris_chk_chm_4x4.webp'),
  ('URBAN-EKO-1V-SOLARIS-ZK-ZM',   'Шервуд солярис',  17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_1v_sherwood_solaris_zk_zm_4x4.webp'),
  ('URBAN-EKO-2V-VISHNYA-CHK-CHM', 'Шервуд вишня',    17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2v_sherwood_vishnya_chk_chm_4x4.webp'),
  ('URBAN-EKO-2V-VISHNYA-SK-SM',   'Шервуд вишня',    17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2v_sherwood_vishnya_sk_sm_4x4.webp'),
  ('URBAN-EKO-2H-VANILNY-CHK-CHM', 'Пекан ванильный', 17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2h_pecan_vanilny_chk_chm_4x4.webp'),
  ('URBAN-EKO-2H-VANILNY-ZK-ZM',   'Пекан ванильный', 17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2h_pecan_vanilny_zk_zm_4x4.webp'),
  ('URBAN-EKO-1V-TAEZHNY-CHK-CHM', 'Пекан таёжный',   17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_1v_pecan_taezhny_chk_chm_4x4.webp'),
  ('URBAN-EKO-1V-TAEZHNY-ZK-ZM',   'Пекан таёжный',   17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_1v_pecan_taezhny_zk_zm_4x4.webp'),
  ('URBAN-EKO-2V-STALNOY-CHK-CHM', 'Пекан стальной',  17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2v_pecan_stalnoy_chk_chm_4x4.webp'),
  ('URBAN-EKO-2V-STALNOY-SK-SM',   'Пекан стальной',  17750, 'https://storage.yandexcloud.net/catalog-vfd/ekoshpon/urban_2v_pecan_stalnoy_sk_sm_4x4.webp')
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
-- ожидается 28.
