/**
 * Эскизы фото моделей каталога: public/renders/models/<путь>-<320|640>.webp из
 * оригиналов public/media/<путь>.webp. Оригиналы — вертикальные 500–1300 px
 * шириной по 14–45 КБ, а в карточках каталога и в блоке «Другие модели» дверь
 * показана шириной 130–300 CSS px; эскиз весит 3–9 КБ. Карточки подставляют их
 * через srcset (src/lib/model-thumbs.mjs), оригинал остаётся запасным src.
 *
 * Какие фото: все model_colors.photo_url из Supabase, которые уже скачаны в
 * public/media (npm run media:sync докачивает). Идемпотентно: существующие
 * эскизы пропускаются, поэтому скрипт входит в `npm run media:sync` и после
 * добавления нового цвета делает эскиз только для него.
 *
 * Запуск:   npm run gen:model-thumbs
 *           npm run gen:model-thumbs -- --force   пересоздать все (смена ширин/качества)
 * Нет эскиза — страница не ломается: карточка берёт оригинал (флаг noThumb).
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cloudToLocal } from '../src/lib/media-path.mjs'
import { THUMB_WIDTHS, thumbPath } from '../src/lib/model-thumbs.mjs'
import { dbPhotos } from './lib/db-photos.mjs'

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url))
const FORCE  = process.argv.includes('--force')
const quality = (w) => (w <= 320 ? 74 : 78)

const decode = (p) => { try { return decodeURIComponent(p) } catch { return p } }

const photos = [...new Set((await dbPhotos()).map(cloudToLocal))]
  .filter((p) => /^\/media\/.+\.webp$/i.test(p))

let made = 0, kept = 0, noSource = 0, before = 0, after = 0
const queue = [...photos]

async function work() {
  while (queue.length) {
    const photo = queue.pop()
    const source = path.join(PUBLIC, decode(photo.slice(1)))
    if (!existsSync(source)) { noSource++; continue }
    let buf = null
    for (const width of THUMB_WIDTHS) {
      const out = path.join(PUBLIC, thumbPath(photo, width).slice(1))
      if (!FORCE && existsSync(out)) { kept++; continue }
      buf ??= await readFile(source)
      const img = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: quality(width) }).toBuffer()
      await mkdir(path.dirname(out), { recursive: true })
      await writeFile(out, img)
      made++; before += buf.length; after += img.length
    }
  }
}
// Несколько потоков хватает: sharp сам параллелит внутри; на VPS с 1 ГБ памяти не больше 4 кадров одновременно.
await Promise.all(Array.from({ length: 4 }, work))

console.log(`Фото из БД: ${photos.length}; эскизов создано: ${made}, уже было: ${kept}` +
  (noSource ? `, без оригинала в public/media: ${noSource} (npm run media:sync)` : ''))
if (made) console.log(`Вес: ${(before / 1024).toFixed(0)} КБ оригиналов (по числу эскизов) → ${(after / 1024).toFixed(0)} КБ эскизов`)
