/**
 * Правило путей локального зеркала медиа — единое место для сборки, sitemap
 * (astro.config.mjs) и скрипта scripts/sync-media.mjs. Простой .mjs без
 * зависимостей, чтобы его можно было импортировать и из конфига, и из TS.
 *
 *   https://storage.yandexcloud.net/<бакет>/<путь>  →  /media/<путь>
 *   (на диске: public/media/<путь>)
 */

/** Облачные бакеты, из которых раньше грузились файлы. */
export const CLOUD_BUCKETS = ['catalog-vfd', 'vfd74ru']

/** URL-префикс, под которым зеркало отдаётся сайтом. */
export const MEDIA_URL_BASE = '/media'

const CLOUD_RE = new RegExp(`^https://storage\\.yandexcloud\\.net/(?:${CLOUD_BUCKETS.join('|')})/(.+)$`)

/**
 * Облачная ссылка → локальный путь сайта («/media/…»).
 * Любую другую строку (уже локальную, чужую, пустую) возвращает как есть.
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function cloudToLocal(url) {
  const value = url ?? ''
  const match = CLOUD_RE.exec(value)
  return match ? `${MEDIA_URL_BASE}/${match[1]}` : value
}

/**
 * Локальный путь сайта («/media/info/petli/in.webp») → путь внутри public/
 * («media/info/petli/in.webp»), либо null, если это не медиа-ссылка.
 * @param {string} localUrl
 * @returns {string | null}
 */
export function localToPublicPath(localUrl) {
  if (!localUrl.startsWith(`${MEDIA_URL_BASE}/`)) return null
  let path = localUrl.slice(1)
  try { path = decodeURIComponent(path) } catch { /* оставляем как есть */ }
  return path.includes('..') ? null : path
}

/** Корневые папки public/, чьи относительные пути нужно делать абсолютными. */
const ASSET_PATH_RE = /^\/(?:media|renders|svg|icons|favicons)\//

/**
 * Относительные пути ассетов («/media/…», «/renders/…») → абсолютные URL.
 * Нужно там, где картинку читает не браузер на этом сайте, а внешний
 * потребитель: og:image, JSON-LD (Google), фиды. Обходит объекты и массивы
 * рекурсивно; прочие строки и значения не меняет.
 * @template T
 * @param {T} value
 * @param {string | URL} origin
 * @returns {T}
 */
export function absolutizeAssets(value, origin) {
  if (typeof value === 'string') {
    return /** @type {any} */ (ASSET_PATH_RE.test(value) ? new URL(value, origin).href : value)
  }
  if (Array.isArray(value)) return /** @type {any} */ (value.map((v) => absolutizeAssets(v, origin)))
  if (value && typeof value === 'object') {
    return /** @type {any} */ (Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, absolutizeAssets(v, origin)]),
    ))
  }
  return value
}
