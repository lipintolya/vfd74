/**
 * Генерирует public/renders/hero/emalex-render-mobile.webp — уменьшенную
 * (800w) версию обложки первого слайда HeroSlider (src/data/hero-image.ts).
 *
 * Зачем: оригинал на Yandex Cloud storage — storage не поддерживает resize
 * по query-параметрам. На мобильном это единственный LCP-элемент главной,
 * throttled-4G грузила тот же файл, что и десктоп — на узком экране 800w
 * достаточно (379 CSS px × 2 DPR), см. HERO_COVER_IMAGE_SRCSET в
 * hero-image.ts.
 *
 * Запуск:        node scripts/gen-hero-mobile.mjs
 * Когда запускать снова: если HERO_COVER_IMAGE в hero-image.ts поменяли
 * на другой оригинал (тогда обновить и SRC/OUT здесь).
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { readMedia } from './lib/media.mjs'

const SRC = '/media/Main_page_perfomance-covers/hero_living_render.webp'
const OUT = new URL('../public/renders/hero/hero-cover-mobile.webp', import.meta.url)
const OUT_960 = new URL('../public/renders/hero/hero-cover-960.webp', import.meta.url)
const WIDTH = 800
const QUALITY = 72

await mkdir(new URL('../public/renders/hero/', import.meta.url), { recursive: true })

const buf = await readMedia(SRC)

/* Полный кадр, без кропа: какую часть показать, решает object-position
   слайда (HeroSlider, imagePosition). Кроп в srcset ломал десктоп — при
   sizes 55vw (~790px) браузер брал этот 800w и показывал обрезок крупно. */
const thumb = await sharp(buf)
  .resize({ width: WIDTH, withoutEnlargement: true })
  .webp({ quality: QUALITY })
  .toBuffer()
await writeFile(OUT, thumb)

/* Полный кадр 960w — для планшетов и десктопа с DPR 1 */
const full960 = await sharp(buf).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer()
await writeFile(OUT_960, full960)

console.log(`hero-cover-mobile.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(thumb.length / 1024).toFixed(0)}KB, 960w: ${(full960.length / 1024).toFixed(0)}KB`)
