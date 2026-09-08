-- «Техно 1SV» (Эмалекс, серия Техно, id 135ee808-bc5f-484c-8b51-4d22344776e5) —
-- вариант «Техно 1» с вертикальной вставкой стекла (has_glass=true).
--
-- Все 8 цветов уже существуют в colors (созданы скриптом
-- 2026-09-tehno-series.sql для «Техно 1») — новых цветов здесь НЕТ, только
-- новая модель + 8 model_colors.
--
-- Стекло у моделей разное (лакобель белый/чёрный, сатин серебро — видно из
-- имён файлов), но это не влияет на структуру данных — цвет полотна и так
-- однозначно определяется по имени файла, отдельного поля под тип стекла
-- в схеме нет, как и для остальных моделей каталога.
--
-- Цена 14 370 — за полотно (price_rrp). 19 910 за комплект в БД не хранится
-- (calcKitPrice), как и везде.

begin;

insert into models (id, series_id, name, sku, has_glass, trim) values
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', '135ee808-bc5f-484c-8b51-4d22344776e5', 'Техно 1SV', 'TEHNO-1SV', true, null);

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', '5d553c8d-8244-451e-81e5-25341362347b', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_beliy_lakobel_beliy.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_molochniy_lakobel_beliy.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_seriy_satin_serebro.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_bejeviy_satin_serebro.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', '68d7aea3-8762-4c4a-ae06-f17f2b5ea513', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_temno_bejeviy_lakobel_cherniy.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', '23db75cd-87b6-4e07-b853-40da5127fc7b', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_goluboylakobel_cherniy.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', 'e090a1bf-221c-4070-bf99-f03dfaa41ef0', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_zeleniy_lakobel_cherniy.webp'),
  ('e6038485-1482-42ef-a4d0-5e8945e51c76', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 14370, 'https://storage.yandexcloud.net/vfd74ru/catalog/tehno/tehno_1sv/tehno_1sv_emaleks_satin_grafit_lakobel_cherniy.webp');

commit;
