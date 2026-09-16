/**
 * Генерирует public/renders/hero/main-render-innova-mobile.webp — уменьшенную
 * (800w) версию обложки первого слайда HeroSlider (src/data/hero-image.ts).
 *
 * Зачем: оригинал на Yandex Cloud storage — 1672×941px, ~75KB, ниже отдавать
 * нечем (storage не поддерживает resize по query-параметрам). На мобильном
 * это единственный LCP-элемент главной, и throttled-4G грузила тот же файл,
 * что и десктоп — на узком экране 800w достаточно (379 CSS px × 2 DPR),
 * см. HERO_COVER_IMAGE_SRCSET в hero-image.ts.
 *
 * Запуск:        node scripts/gen-hero-mobile.mjs
 * Когда запускать снова: если HERO_COVER_IMAGE в hero-image.ts поменяли
 * на другой оригинал.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const SRC = 'https://storage.yandexcloud.net/vfd74ru/promo_main/main_render_innova.webp'
const OUT = new URL('../public/renders/hero/main-render-innova-mobile.webp', import.meta.url)
const WIDTH = 800
const QUALITY = 78

await mkdir(new URL('../public/renders/hero/', import.meta.url), { recursive: true })

const res = await fetch(SRC)
if (!res.ok) throw new Error(`HTTP ${res.status} на ${SRC}`)
const buf = Buffer.from(await res.arrayBuffer())

const thumb = await sharp(buf).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
await writeFile(OUT, thumb)

console.log(`main-render-innova-mobile.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(thumb.length / 1024).toFixed(0)}KB`)
