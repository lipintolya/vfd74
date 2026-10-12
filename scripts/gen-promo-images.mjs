/**
 * Локальные ресайзы карточных фото блока «Акции» (Promo.vue, #promo на
 * главной) и /promo-archive — те же данные PROMOS используются в обоих
 * местах. Тот же приём, что и gen-hero-bento.mjs: Yandex Cloud storage не
 * ресайзит по query-параметрам, а оригиналы (1000–1450px, один даже 1.16MB)
 * кратно крупнее реального размера показа — карточка максимум ~400px CSS
 * (grid-cols-3 в container), даём 640w/800w срез под retina.
 *
 * Запуск:        node scripts/gen-promo-images.mjs
 * Когда запускать снова: если добавили новую акцию в src/data/promos.ts
 * или сменили image у существующей.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { readMedia } from './lib/media.mjs'

const OUT_DIR = new URL('../public/renders/promo/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const sources = [
  { src: '/media/sale/zamer_render.webp', base: 'zamer-render' },
  { src: '/media/outdoors/basic_render.webp', base: 'basic-render' },
  { src: '/media/invisible/invisible.webp', base: 'invisible' },
  { src: '/media/sale/basic_z.webp', base: 'basic-z' },
  { src: '/media/promo_main/emalex_ec2_promo.webp', base: 'emalex-ec2-promo' },
  { src: '/media/promo_main/64443281-F5F2-4877-9AEA-304CD417BF8D.webp', base: 'urban-graphite' },
]

const widths = [
  { width: 640, quality: 76 },
  { width: 800, quality: 78 },
]

for (const { src, base } of sources) {
  const buf = await readMedia(src)
  for (const { width, quality } of widths) {
    const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
    const out = `${base}-${width}.webp`
    await writeFile(new URL(out, OUT_DIR), resized)
    console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
  }
}
