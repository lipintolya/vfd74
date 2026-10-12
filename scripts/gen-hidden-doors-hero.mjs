/**
 * Перегенерирует public/renders/hidden-doors/*.webp — уменьшенные локальные
 * копии ключевых фото серий «Секрет»/«Секрет Реверс»/«Рефлекс».
 *
 * Зачем: оригиналы на Yandex Cloud — 1122×1402 / 1672×941 (60-156 КБ), а
 * реальный экранный размер в вёрстке (товарная карточка на /catalog/
 * skrytye-dveri/, hero на 5 сегментных лендингах) — максимум ~900px по
 * широкой стороне даже на десктопе. Эти три файла используются суммарно
 * на 6 страницах (главная + 4 сегментных лендинга + /raboty/), поэтому
 * экономия применяется сразу везде.
 *
 * Запуск: node scripts/gen-hidden-doors-hero.mjs
 * Когда запускать снова: если оригиналы в public/media заменили на новые фото.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { readMedia } from './lib/media.mjs'

const OUT_DIR = new URL('../public/renders/hidden-doors/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const jobs = [
  { src: '/media/invisible/invisible.webp',         out: 'sekret-900.webp',       width: 900, quality: 80 },
  { src: '/media/invisible/invisible_reverse.webp', out: 'sekret-revers-900.webp', width: 900, quality: 80 },
  { src: '/media/invisible/invisible_door.webp',        out: 'reflex-900.webp',       width: 900, quality: 80 },
]

for (const { src, out, width, quality } of jobs) {
  const buf = await readMedia(src)
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
