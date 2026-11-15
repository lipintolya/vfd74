/**
 * Генерирует public/renders/about/*.webp — уменьшенные копии фото салона.
 * Оригиналы зала в public/media/about_page — 1920×2560 (370–730 КБ), на
 * экране они в разы меньше.
 *
 * Кто использует:
 * - фото зала g-* — /about/ (src/pages/about.astro, список SHOWROOM):
 *   srcset 480/700/960 для героя и ленты, 1280 — в лайтбоксе вместо оригинала;
 * - фасад vfd-out-* — /contacts/ и /dostavka-montazh-po-rayonam/
 *   (src/lib/facade-image.ts);
 * - director-500 — /about/, блок руководителя;
 * - avatar-al-2-160 — модалка разработчика в футере.
 *
 * Запуск:        node scripts/gen-about-images.mjs
 * Когда запускать снова: если поменяли исходные фото в public/media/about_page.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { readMedia } from './lib/media.mjs'

const OUT_DIR = new URL('../public/renders/about/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

/* Фото зала: одинаковый набор ширин у всех — srcset на странице строится
   одной функцией (showroomSrcset в about.astro). */
const SHOWROOM = ['g-1', 'g-2', 'g-3', 'g-5', 'g-6']
const SHOWROOM_WIDTHS = [480, 700, 960, 1280]

const jobs = [
  ...SHOWROOM.flatMap((name) => SHOWROOM_WIDTHS.map((width) => ({
    src: `/media/about_page/${name}.webp`,
    out: `${name}-${width}.webp`,
    width,
    quality: width >= 960 ? 74 : 76,
  }))),
  { src: '/media/about_page/vfd_out.webp', out: 'vfd-out-900.webp', width: 900, quality: 78 },
  { src: '/media/about_page/vfd_out.webp', out: 'vfd-out-480.webp', width: 480, quality: 78 },
  // Руководитель — колонка ~20rem, на retina берётся оригинал 853w.
  { src: '/media/about_page/director.webp', out: 'director-500.webp', width: 500, quality: 80 },
]

for (const { src, out, width, quality } of jobs) {
  const buf = await readMedia(src)
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}

/* Аватарка разработчика в модалке футера — показывается квадратом 64×64.
   Оригинал — квадрат 460×460, где лицо занимает небольшую часть кадра
   (фото на фоне гор/неба): без кропа на 64px лицо было бы крошечным.
   Вырезаем квадрат по голове и плечам (подобран по кадру), затем 160×160
   под retina — избыточные байты не грузим. */
{
  const src = '/media/Main_page_perfomance-covers/161125105.webp'
  const buf = await readMedia(src)
  const resized = await sharp(buf)
    .extract({ left: 118, top: 70, width: 280, height: 280 })
    .resize({ width: 160, height: 160, fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer()
  await writeFile(new URL('avatar-al-2-160.webp', OUT_DIR), resized)
  console.log(`avatar-al-2-160.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
