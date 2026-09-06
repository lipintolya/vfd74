-- Урбан ЗТ (Экошпон) — добавление коллекции «Пекан», 4 новых цвета.
-- Чёрная кромка (ЧК): все 4 цвета. Серебряная кромка (СК): пока только
-- Пекан дымчатый и Пекан стальной — под остальные 2 фото ещё не готовы.
--
-- hex_preview снят реальным замером (средний цвет центрального кропа
-- полотна на фото), не на глаз:
--   Пекан ванильный — #e7e8e2 (charm_forest)
--   Пекан дымчатый  — #837b72 (dust_forest)
--   Пекан таёжный   — #5c5347 (wild_forest)
--   Пекан стальной  — #6c6e70 (wolf_forest)
--
-- Цена — та же, что у остальных цветов «Урбан ЗТ» (16610), см.
-- существующие строки model_colors для этих моделей.

insert into colors (id, coating_id, name, hex_preview) values
  ('a27771e0-1e0d-44a2-911a-40d98cd4f7f3', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Пекан ванильный', '#e7e8e2'),
  ('7eaa8087-726b-43a5-91e9-85e16bb2279a', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Пекан дымчатый',  '#837b72'),
  ('66ec0965-8ee1-413f-855b-ca664aef5b39', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Пекан таёжный',   '#5c5347'),
  ('35f27da7-cf93-4229-8eae-a89a95293dd4', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Пекан стальной',  '#6c6e70');

-- Урбан ЗТ, чёрная кромка (модель fcd99314-e44f-4c4c-ac11-50ff4e6bcf10) — все 4 цвета
insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('fcd99314-e44f-4c4c-ac11-50ff4e6bcf10', 'a27771e0-1e0d-44a2-911a-40d98cd4f7f3', 16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_z_charm_forest_be_4x4.webp'),
  ('fcd99314-e44f-4c4c-ac11-50ff4e6bcf10', '7eaa8087-726b-43a5-91e9-85e16bb2279a', 16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_z_dust_forest_be_4x4.webp'),
  ('fcd99314-e44f-4c4c-ac11-50ff4e6bcf10', '66ec0965-8ee1-413f-855b-ca664aef5b39', 16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_z_wild_forest_be_4x4.webp'),
  ('fcd99314-e44f-4c4c-ac11-50ff4e6bcf10', '35f27da7-cf93-4229-8eae-a89a95293dd4', 16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_z_wolf_forest_be_4x4.webp');

-- Урбан ЗТ, серебряная кромка (модель 05cbe9ba-d9df-4142-951c-1878fcc72101) — пока 2 цвета
insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('05cbe9ba-d9df-4142-951c-1878fcc72101', '7eaa8087-726b-43a5-91e9-85e16bb2279a', 16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_z_dust_forest_se_4x4.webp'),
  ('05cbe9ba-d9df-4142-951c-1878fcc72101', '35f27da7-cf93-4229-8eae-a89a95293dd4', 16610, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_z_wolf_forest_se_4x4.webp');
