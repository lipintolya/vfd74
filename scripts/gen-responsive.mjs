/**
 * Ресайзы (srcset-кандидаты) для картинок, которые на экране заметно меньше
 * оригинала: слайды hero и промо-слайдеры главной, карточки «Каталог» на
 * главной, схема плинтуса. Телефон берёт 640w/960w вместо 1100–1900 px
 * оригинала (80–150 КБ → 10–40 КБ), десктоп — подходящий из набора.
 *
 * Каждая запись: исходник (путь сайта: /media/… или /renders/…), префикс
 * результата (путь сайта без суффикса и расширения) и ширины. Результат —
 * public<prefix>-<ширина>.webp. Увеличивать картинку скрипт не умеет
 * (withoutEnlargement): если исходник уже запрошенной ширины, получится копия
 * в исходном размере — такие ширины не перечисляйте.
 *
 * Где используется:
 *  - HeroSlider.vue            — слайды 2–6 (hero/…)
 *  - PhotoAutoplaySlider.vue   — флаг `responsive`, /renders/home/<имя>-640|960
 *  - CatalogCategories.astro   — home/cat-* (плитки «Каталог» на главной)
 *  - PlinthSection.astro       — decor/plintus-type
 *
 * Запуск:        node scripts/gen-responsive.mjs [часть пути, напр. cat-partitions]
 * Когда запускать снова: заменили исходник или добавили слайд/картинку —
 * допиши строку в JOBS и подключи srcset в компоненте.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMedia } from './lib/media.mjs'

const PUBLIC = new URL('../public/', import.meta.url)
const S = [640, 960]

const JOBS = [
  // HeroSlider.vue, слайды 2–6
  { src: '/renders/hero/comforttermo-promo.webp',                 out: '/renders/hero/comforttermo-promo', widths: S },
  { src: '/media/Main_page/left_bento/strix_render.webp',         out: '/renders/hero/strix-render',       widths: S },
  { src: '/media/Main_page_perfomance-covers/innova_render.webp', out: '/renders/hero/innova-render',      widths: S },
  { src: '/media/covers/linea-1.webp',                            out: '/renders/hero/linea-1',            widths: S },
  { src: '/media/Main_page/left_bento/render_urban2.webp',        out: '/renders/hero/urban2-render',      widths: S },

  // Промо-слайдеры главной: исходник — готовые 1300w из /renders/home/
  // (оригиналов в public/media под них уже нет, см. gen-home-images.mjs)
  ...['tehno-1', 'tehno-2', 'tehno-3',
      'shtrih-2a-1', 'shtrih-2a-2', 'shtrih-2a-3',
      'reflex-1', 'reflex-2', 'reflex-3',
      'secret-cover', 'secret-2', 'secret-3']
    .map(n => ({ src: `/renders/home/${n}.webp`, out: `/renders/home/${n}`, widths: S })),

  // CatalogCategories.astro — вертикальные плитки 4:5; перегородки — портретный
  // кадр реечной перегородки (tg1 уже в hero главной, не повторяем)
  { src: '/media/Main_page/left_bento/cover_doors.webp',  out: '/renders/home/cat-interior',   widths: S },
  { src: '/media/metal_doors/Optima/render_optima.webp',  out: '/renders/home/cat-entrance',   widths: S },
  { src: '/media/alum/saint_p_alum/tg4.webp',             out: '/renders/home/cat-partitions', widths: S },

  // Reviews.astro — фото клиентов в карточке ~300–380 px → превью 640; оригиналы
  // открываются в диалоге из public/media/info/reviews
  ...['XXXL', 'rev_1', 'rev_2_1', 'rev_4_1', 'rev_5_1']
    .map(n => ({ src: `/media/info/reviews/${n}.webp`, out: `/renders/reviews/${n}`, widths: [640] })),

  // PlinthSection.astro — схема на всю ширину контейнера (оригинал 1920 px)
  { src: '/media/decor/plintus/plintus_type.webp', out: '/renders/decor/plintus-type', widths: [960, 1440] },
]

/* node scripts/gen-responsive.mjs cat-partitions — только записи, в пути
   результата которых есть эта строка */
const only = process.argv[2]

let before = 0, after = 0
for (const { src, out, widths } of JOBS.filter(j => !only || j.out.includes(only))) {
  const buf = await readMedia(src)
  for (const width of widths) {
    const file = new URL(`${out.slice(1)}-${width}.webp`, PUBLIC)
    await mkdir(dirname(fileURLToPath(file)), { recursive: true })
    const img = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: width <= 640 ? 76 : 78 }).toBuffer()
    await writeFile(file, img)
    before += buf.length; after += img.length
    console.log(`${(out + '-' + width).padEnd(44)} ${(buf.length / 1024).toFixed(0).padStart(4)}KB -> ${(img.length / 1024).toFixed(0).padStart(4)}KB`)
  }
}
console.log(`ИТОГО по файлам: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
