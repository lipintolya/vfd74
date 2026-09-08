-- Новая коллекция «Техно» (покрытие Эмалекс) — модель «Техно 1».
-- «Техно 1СВ» (с вертикальной вставкой стекла) НЕ создаётся этим скриптом —
-- фото/цены под неё пока не присланы, добавим отдельно, когда будут готовы.
--
-- Цвета — 4 переиспользуют существующие цвета покрытия Эмалекс (бежевый,
-- молочный, серый, графит), 3 новых эксклюзивных для Техно (тёмно-бежевый,
-- голубой, зелёный). «Белый» из присланного списка НЕ добавлен — фото под
-- него не прислали (7 фото на 8 цветов в списке), под заказ уточняйте у
-- пользователя, когда появится.
--
-- hex_preview новых цветов — реальный замер (средний цвет центрального
-- кропа полотна на фото), не на глаз:
--   Эмалекс тёмно-бежевый — #a9a296 (temno_bejeviy)
--   Эмалекс голубой       — #a7b8c0 (goluboy)
--   Эмалекс зелёный       — #86928e (zeleniy)
--
-- Цена 13 220 — за полотно (price_rrp). 18 760 за комплект в БД не хранится,
-- считается на лету (calcKitPrice), как и у всех прочих моделей.


-- Новая серия «Техно» на покрытии Эмалекс (bc8bd7ba-f86b-458b-89ee-7ab48b18a5df)
insert into series (id, coating_id, name, slug) values
  ('135ee808-bc5f-484c-8b51-4d22344776e5', 'bc8bd7ba-f86b-458b-89ee-7ab48b18a5df', 'Техно', 'tehno');

-- Новая модель «Техно 1» в этой серии
insert into models (id, series_id, name, sku, has_glass, trim) values
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', '135ee808-bc5f-484c-8b51-4d22344776e5', 'Техно 1', 'TEHNO-1', false, null);

-- 3 новых эксклюзивных цвета покрытия Эмалекс (только для Техно)
insert into colors (id, coating_id, name, hex_preview) values
  ('68d7aea3-8762-4c4a-ae06-f17f2b5ea513', 'bc8bd7ba-f86b-458b-89ee-7ab48b18a5df', 'Эмалекс тёмно-бежевый', '#a9a296'),
  ('23db75cd-87b6-4e07-b853-40da5127fc7b', 'bc8bd7ba-f86b-458b-89ee-7ab48b18a5df', 'Эмалекс голубой',       '#a7b8c0'),
  ('e090a1bf-221c-4070-bf99-f03dfaa41ef0', 'bc8bd7ba-f86b-458b-89ee-7ab48b18a5df', 'Эмалекс зелёный',       '#86928e');

-- 7 цветовых вариантов «Техно 1» — 4 существующих цвета Эмалекс + 3 новых выше
insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  -- существующие цвета Эмалекс
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_bejeviy.webp'),
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', '2f22c603-8a85-409c-a1f9-3b83403e7869', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_molochniy.webp'),
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_seriy.webp'),
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_satin_grafit.webp'),
  -- новые эксклюзивные цвета Техно
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', '68d7aea3-8762-4c4a-ae06-f17f2b5ea513', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_temno_bejeviy.webp'),
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', '23db75cd-87b6-4e07-b853-40da5127fc7b', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_goluboy.webp'),
  ('4fc7a08a-9216-4b29-a6d4-3473517e897c', 'e090a1bf-221c-4070-bf99-f03dfaa41ef0', 13220, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1_emaleks_zeleniy.webp');

commit;
