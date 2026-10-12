/**
 * Локальные ресайзы декоративных фото шагов «Как мы работаем» на главной
 * (ProcessSteps, .ps-corner-img) — тот же приём, что и gen-hero-bento.mjs:
 * оригинал с Yandex Cloud кратно крупнее реального размера показа
 * (clamp(7.5rem, 17vw, 11.5rem) ≈ макс 184px CSS, ×2 DPR = 368px).
 *
 * - catalog_main.png (шаг 1 «Выбор модели»): 447×447 PNG/78KB источник —
 *   формат и вес не подходят для decorative img в углу карточки.
 * - garantee_main.webp (шаг 4 «Гарантия и поддержка»): 1289×1220/89KB
 *   источник — тот же случай, кратно крупнее реального показа.
 *
 * Запуск:        node scripts/gen-how-it-works-images.mjs
 * Когда запускать снова: если добавили/сменили декоративное фото шага
 * в src/data/how-it-works.ts.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { readMedia } from './lib/media.mjs'

const OUT_DIR = new URL('../public/renders/how-it-works/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const jobs = [
  {
    src: '/media/Main_page/catalog_main.png',
    out: 'catalog-main-368.webp',
    width: 368,
    quality: 88,
  },
  {
    src: '/media/Main_page/garantee_main.webp',
    out: 'garantee-main-368.webp',
    width: 368,
    quality: 82,
  },
]

for (const { src, out, width, quality } of jobs) {
  const buf = await readMedia(src)
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
