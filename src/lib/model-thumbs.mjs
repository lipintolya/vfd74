/**
 * Эскизы фото моделей каталога: /media/<путь>.webp → /renders/models/<путь>-<ширина>.webp
 * (на диске public/renders/models/…). Фото цветов — вертикальные 500–1300 × 1100–2900 px
 * по 14–45 КБ, а в карточке каталога и в блоке «Другие модели» дверь показана
 * шириной ~130–300 CSS px; эскиз 320w весит ~3 КБ, 640w — ~8 КБ.
 *
 * Чистые функции без node:fs — общий код для сборки (Astro) и для Vue-карточки
 * каталога в браузере. Есть ли эскиз на диске, проверяет серверная сторона
 * (src/lib/media-resolve.ts → thumbExists) и помечает фото флагом noThumb —
 * тогда srcset не выводится и берётся оригинал.
 * Эскизы делает scripts/gen-model-thumbs.mjs (в составе `npm run media:sync`).
 */

/** Ширины эскизов (w-дескрипторы srcset): 320 — телефон/1x, 640 — retina. */
export const THUMB_WIDTHS = [320, 640]

export const THUMBS_URL_BASE = '/renders/models'

const SOURCE_RE = /^\/media\/(.+)\.webp$/i

const safeDecode = (s) => { try { return decodeURIComponent(s) } catch { return s } }

/**
 * Путь эскиза в «чистом» виде (без процент-кодирования, как лежит на диске
 * внутри public/) или '' — если фото не лежит в /media/ в формате webp
 * (облачная ссылка, другой формат), эскиза у него быть не может.
 * @param {string | null | undefined} photo
 * @param {number} width
 * @returns {string}
 */
export function thumbPath(photo, width) {
  const m = SOURCE_RE.exec(photo ?? '')
  return m ? `${THUMBS_URL_BASE}/${safeDecode(m[1])}-${width}.webp` : ''
}

/**
 * Значение srcset для фото ('' — эскизов нет, показывать оригинал). Сегменты
 * пути кодируются: в srcset пробел и запятая в URL ломают разбор списка.
 * @param {string | null | undefined} photo
 * @returns {string}
 */
export function thumbSrcset(photo) {
  if (!SOURCE_RE.test(photo ?? '')) return ''
  return THUMB_WIDTHS
    .map((w) => `${thumbPath(photo, w).split('/').map(encodeURIComponent).join('/')} ${w}w`)
    .join(', ')
}
