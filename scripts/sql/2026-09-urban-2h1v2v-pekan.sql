-- Урбан Древесный — добавление коллекции «Пекан» в модели Урбан 2H, 1V, 2V.
-- Модели/кромки уже существуют в БД, добавляются только 6 новых строк
-- model_colors (цвета Пекан из scripts/sql/2026-09-urban-zt-pekan.sql уже
-- в базе — проверено). Цена (17 750 за полотно) — как у остальных цветов
-- этих же моделей; 22 900 (комплект) не хранится в БД, считается на лету
-- (calcKitPrice), как и для всех прочих цветов.

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  -- Урбан 2H, Пекан ванильный, ЧК ЧМ
  ('b070e3a8-d4ff-4bfc-95d2-49ba5f7d0bac', 'a27771e0-1e0d-44a2-911a-40d98cd4f7f3', 17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_2h_charm_forest_bm_be_4x4.webp'),
  -- Урбан 2H, Пекан ванильный, ЗК ЗМ
  ('ed416ecb-4a51-4a3b-996a-dc2f55a34fce', 'a27771e0-1e0d-44a2-911a-40d98cd4f7f3', 17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_2h_charm_forest_gm_ge_4x4.webp'),
  -- Урбан 1V, Пекан таёжный, ЧК ЧМ
  ('bda7182c-db74-47fb-aed1-377783d352e6', '66ec0965-8ee1-413f-855b-ca664aef5b39', 17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_1v_wild_forest_bm_be_4x4.webp'),
  -- Урбан 1V, Пекан таёжный, ЗК ЗМ
  ('1e206c2b-a61e-4e71-aebb-b289b9122d2e', '66ec0965-8ee1-413f-855b-ca664aef5b39', 17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_1v_wild_forest_gm_ge_4x4.webp'),
  -- Урбан 2V, Пекан стальной, ЧК ЧМ
  ('52617548-0a2e-4e50-adec-bccfa42c627c', '35f27da7-cf93-4229-8eae-a89a95293dd4', 17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_2v_wolf_forest_bm_be_4x4.webp'),
  -- Урбан 2V, Пекан стальной, СК СМ
  ('c7acd318-5e69-4623-9aee-6b905b352d60', '35f27da7-cf93-4229-8eae-a89a95293dd4', 17750, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z_pekan/urban_2v_wolf_forest_sm_se_4x4.webp');
