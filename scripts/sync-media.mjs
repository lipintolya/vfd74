#!/usr/bin/env node
/**
 * Локальное зеркало медиафайлов: public/media/<путь>.
 *
 * Зачем: фото, схемы и видео раньше грузились прямо из Yandex Cloud
 * (storage.yandexcloud.net, бакеты catalog-vfd и vfd74ru). Сбой облака ронял
 * картинки по всему сайту и ломал сборку скриптов-генераторов. Теперь всё
 * лежит в репозитории и отдаётся тем же nginx, что и страницы; облако нужно
 * только как место, куда загружают новое.
 *
 * Правило путей: https://storage.yandexcloud.net/<бакет>/<путь>
 *             →  /media/<путь>          (public/media/<путь> на диске)
 * Бакет в пути не нужен: пересечений между двумя бакетами нет (проверено).
 * Ссылки в БД Supabase (model_colors.photo_url) остаются облачными — при
 * сборке их превращает в локальные src/lib/media-resolve.ts по тому же правилу.
 *
 * Режимы:
 *   node scripts/sync-media.mjs          локализовать: найти в src/ и
 *                                        astro.config.mjs облачные ссылки, скачать
 *                                        файлы, переписать ссылки на /media/…;
 *                                        докачать фото из БД
 *   node scripts/sync-media.mjs --check  ничего не менять; проверить, что все
 *                                        /media/… из исходников и БД есть на диске
 *                                        (код выхода 1, если чего-то нет)
 *   node scripts/sync-media.mjs --dist   то же для собранного dist/ — ловит ссылки,
 *                                        которые собираются в коде (база + имя)
 *   node scripts/sync-media.mjs --from-list файл.txt
 *                                        скачать URL из файла (по одному в строке)
 *
 * Типичный сценарий нового контента: загрузил фото в облако → вставил URL
 * в src/data/… → `npm run media:sync` → закоммитил public/media и правки.
 */
import { readFile, writeFile, mkdir, readdir, rename, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CLOUD_BUCKETS } from '../src/lib/media-path.mjs'

const ROOT      = fileURLToPath(new URL('..', import.meta.url))
const MEDIA_DIR = path.join(ROOT, 'public/media')
const SCAN_ROOTS = ['src', 'astro.config.mjs']
const SCAN_EXT   = /\.(ts|mjs|vue|astro|mdoc|md|json|html)$/

const EXT = 'webp|jpe?g|png|svg|gif|avif|mp4|webm'
const BUCKETS = CLOUD_BUCKETS.join('|')
/* Полная ссылка на файл. Нежадный хвост до расширения — имена бывают со
   скобками и пробелами («19.08.26(1).webp»). */
const REMOTE_FILE_RE = new RegExp(
  `https://storage\\.yandexcloud\\.net/(?:${BUCKETS})/([^'"\`<>\\\\]+?\\.(?:${EXT}))(?![A-Za-z0-9])`, 'gi')
/* Любой «хвост» облака, в т.ч. константы-базы без имени файла
   ('…/vfd74ru/metal_doors/') — для замены префикса. */
const REMOTE_PREFIX_RE = new RegExp(`https://storage\\.yandexcloud\\.net/(?:${BUCKETS})(?=[/'"\`])`, 'g')
const LOCAL_REF_RE = new RegExp(`/media/([^'"\`<>\\\\]+?\\.(?:${EXT}))(?![A-Za-z0-9])`, 'gi')

const args = new Set(process.argv.slice(2))
const listFlag = process.argv.indexOf('--from-list')
const CHECK = args.has('--check')
const DIST  = args.has('--dist')

const decode = (p) => { try { return decodeURIComponent(p) } catch { return p } }
const toDiskPath = (rel) => path.join(MEDIA_DIR, decode(rel))
const fileOk = async (p) => existsSync(p) && (await stat(p)).size > 0

async function* walk(target) {
  const abs = path.join(ROOT, target)
  if (!existsSync(abs)) return
  if ((await stat(abs)).isFile()) { yield abs; return }
  for (const e of await readdir(abs, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    yield* walk(path.join(target, e.name))
  }
}

async function sourceFiles(roots, ext = SCAN_EXT) {
  const out = []
  for (const r of roots) for await (const f of walk(r)) if (ext.test(f)) out.push(f)
  return out
}

/* Фото цветов из Supabase — единственный источник картинок вне исходников. */
async function dbPhotos() {
  let env = {}
  try {
    const t = await readFile(path.join(ROOT, '.env'), 'utf8')
    for (const l of t.split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim() }
  } catch { /* .env может не быть — тогда берём из окружения */ }
  const url = process.env.PUBLIC_SUPABASE_URL ?? env.PUBLIC_SUPABASE_URL
  const key = process.env.PUBLIC_SUPABASE_ANON_KEY ?? env.PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) { console.warn('! Supabase не настроен — фото каталога пропущены'); return [] }
  const res = await fetch(`${url}/rest/v1/model_colors?select=photo_url`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Range: '0-9999' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Supabase: HTTP ${res.status}`)
  return (await res.json()).map((r) => r.photo_url).filter(Boolean)
}

async function download(rel, tries = 5) {
  const dest = toDiskPath(rel)
  if (await fileOk(dest)) return 'exists'
  const url = `https://storage.yandexcloud.net/${await bucketFor(rel)}/${rel.split('/').map(encodeURIComponent).join('/')}`
  let lastErr
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(90_000) })
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); if (res.status === 404) break; throw lastErr }
      const buf = Buffer.from(await res.arrayBuffer())
      const want = Number(res.headers.get('content-length') ?? 0)
      if (want && buf.length !== want) throw new Error(`обрыв: ${buf.length}/${want}`)
      await mkdir(path.dirname(dest), { recursive: true })
      await writeFile(dest + '.part', buf)
      await rename(dest + '.part', dest)
      return 'downloaded'
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 1000 * i))
    }
  }
  throw new Error(`${rel}: ${lastErr?.message ?? lastErr}`)
}

/* Бакет по пути не определить — пробуем оба (файл есть ровно в одном). */
const bucketCache = new Map()
async function bucketFor(rel) {
  if (bucketCache.has(rel)) return bucketCache.get(rel)
  const enc = rel.split('/').map(encodeURIComponent).join('/')
  for (const b of CLOUD_BUCKETS) {
    try {
      const r = await fetch(`https://storage.yandexcloud.net/${b}/${enc}`, { method: 'HEAD', signal: AbortSignal.timeout(30_000) })
      if (r.ok) { bucketCache.set(rel, b); return b }
    } catch { /* следующий бакет */ }
  }
  throw new Error(`${rel}: файл не найден ни в одном бакете`)
}

async function pool(items, worker, size = 8) {
  const results = { downloaded: 0, exists: 0, failed: [] }
  let i = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) {
      const item = items[i++]
      try { results[await worker(item)]++ } catch (e) { results.failed.push(e.message) }
    }
  }))
  return results
}

function report(res) {
  console.log(`скачано: ${res.downloaded}, уже было: ${res.exists}, ошибок: ${res.failed.length}`)
  for (const f of res.failed) console.log('  ✗', f)
}

/* ── --from-list ── */
if (listFlag !== -1) {
  const file = process.argv[listFlag + 1]
  const lines = (await readFile(file, 'utf8')).split('\n').map((s) => s.trim()).filter(Boolean)
  const rels = []
  for (const u of lines) {
    const m = u.match(/^https:\/\/storage\.yandexcloud\.net\/([^/]+)\/(.+)$/)
    if (!m) continue
    const rel = decode(m[2])
    bucketCache.set(rel, m[1]) // бакет известен из ссылки — лишние HEAD не нужны
    rels.push(rel)
  }
  report(await pool(rels, download))
  process.exit(0)
}

/* ── --check / --dist ── */
if (CHECK || DIST) {
  const missing = new Set()
  const remote  = new Set()
  const files = DIST
    ? await sourceFiles(['dist'], /\.(html|js|css|xml|json)$/)
    : await sourceFiles(SCAN_ROOTS)
  for (const f of files) {
    const text = await readFile(f, 'utf8')
    for (const m of text.matchAll(LOCAL_REF_RE)) {
      if (!(await fileOk(toDiskPath(m[1])))) missing.add(decode(m[1]))
    }
    for (const m of text.matchAll(REMOTE_FILE_RE)) remote.add(decode(m[1]))
  }
  if (!DIST) {
    for (const url of await dbPhotos()) {
      const m = url.match(/^https:\/\/storage\.yandexcloud\.net\/[^/]+\/(.+)$/)
      if (m && !(await fileOk(toDiskPath(m[1])))) missing.add(decode(m[1]))
    }
  }
  console.log(`Проверено файлов: ${files.length}`)
  if (remote.size) console.log(`${DIST ? '! ' : ''}Облачных ссылок осталось: ${remote.size} (npm run media:sync переведёт их на /media)`)
  if (missing.size) { console.log(`Нет на диске (${missing.size}):`); for (const m of missing) console.log('  ✗', m) }
  else console.log('Все /media/… на месте')
  // В dist облачные ссылки — предупреждение (так работает запасной вариант для
  // фото из БД, которых ещё нет в public/media); сломанная локальная — ошибка.
  process.exit(missing.size || (!DIST && remote.size) ? 1 : 0)
}

/* ── локализация ── */
const files = await sourceFiles(SCAN_ROOTS)
const wanted = new Map() // rel(decoded) → true
for (const f of files) {
  const text = await readFile(f, 'utf8')
  for (const m of text.matchAll(REMOTE_FILE_RE)) wanted.set(decode(m[1]), true)
}
for (const url of await dbPhotos()) {
  const m = url.match(/^https:\/\/storage\.yandexcloud\.net\/[^/]+\/(.+)$/)
  if (m) wanted.set(decode(m[1]), true)
}
console.log(`К загрузке: ${wanted.size} файлов`)
const res = await pool([...wanted.keys()], download)
report(res)
if (res.failed.length) { console.log('Ссылки не переписаны: сначала докачайте файлы (повторный запуск безопасен)'); process.exit(1) }

let rewritten = 0
for (const f of files) {
  const text = await readFile(f, 'utf8')
  const next = text.replace(REMOTE_PREFIX_RE, '/media')
  if (next !== text) { await writeFile(f, next); rewritten++ }
}
console.log(`Переписано файлов: ${rewritten}`)
