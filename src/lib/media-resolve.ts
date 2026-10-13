/**
 * Облачная ссылка на фото из Supabase → локальный файл из public/media.
 *
 * В БД (model_colors.photo_url) фото по-прежнему лежат ссылками на Yandex
 * Cloud — админка заливает туда. На сборке каждую такую ссылку заменяем на
 * локальную /media/…, если файл уже есть в репозитории (scripts/sync-media.mjs
 * докачивает новые). Нет файла — отдаём исходную облачную ссылку, чтобы
 * свежедобавленное фото не пропало, и один раз предупреждаем в логе сборки.
 *
 * Только для серверного кода (build-time): использует node:fs. Статические
 * данные (src/data/*) уже содержат готовые /media/… и сюда не ходят.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { cloudToLocal, localToPublicPath } from './media-path.mjs'
import { THUMB_WIDTHS, thumbPath } from './model-thumbs.mjs'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const warned = new Set<string>()

/**
 * true — у фото из /media/ нет (или не всех) эскизов из scripts/gen-model-thumbs.mjs:
 * карточка берёт оригинал, srcset не выводится. Для остальных ссылок (облачные,
 * не webp) эскизов не бывает по определению — это не «потерянный» эскиз, false.
 * Только для серверного кода (node:fs).
 */
export function thumbMissing(photo: string | null | undefined): boolean {
  if (!thumbPath(photo, THUMB_WIDTHS[0]!)) return false
  const ok = THUMB_WIDTHS.every(w => existsSync(path.join(PUBLIC_DIR, thumbPath(photo, w).slice(1))))
  if (!ok && !warned.has(`thumb:${photo}`)) {
    warned.add(`thumb:${photo}`)
    console.warn(`[media] нет эскиза для ${photo} — карточка возьмёт оригинал. Запустите: npm run gen:model-thumbs`)
  }
  return !ok
}

export function resolveMedia(url: string | null | undefined): string {
  const local = cloudToLocal(url)
  if (local === (url ?? '')) return local // не облачная ссылка — не наша забота

  const rel = localToPublicPath(local)
  if (rel && existsSync(path.join(PUBLIC_DIR, rel))) return local

  if (!warned.has(local)) {
    warned.add(local)
    console.warn(`[media] нет локального файла ${local} — оставлена облачная ссылка. Запустите: npm run media:sync`)
  }
  return url ?? ''
}
