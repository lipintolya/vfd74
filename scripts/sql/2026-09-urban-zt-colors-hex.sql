-- Hex-превью для 4 цветов «Урбан Древесный» — усреднённый цвет с тех же
-- фото-свотчей, что в блоке «Шервуд» на главной (SherwoodPromo.vue,
-- CDN storage.yandexcloud.net/vfd74ru/promo_main/sherwood/*.webp), чтобы
-- кружок цвета в каталоге визуально совпадал с превью на главной.

update public.colors set hex_preview = '#6d6152' where name = 'Шервуд янтарь';
update public.colors set hex_preview = '#362b23' where name = 'Шервуд бурбон';
update public.colors set hex_preview = '#a6947a' where name = 'Шервуд солярис';
update public.colors set hex_preview = '#7d6b5c' where name = 'Шервуд вишня';

-- Проверка: select name, hex_preview from public.colors where name like 'Шервуд%';
