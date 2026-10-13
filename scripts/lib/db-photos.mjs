/**
 * Фото цветов моделей из Supabase (model_colors.photo_url) — единственный
 * источник картинок вне исходников. Общий код для scripts/sync-media.mjs и
 * scripts/gen-model-thumbs.mjs.
 *
 * Ключи Supabase — из окружения или .env в корне проекта (как на сборке).
 * Нет ключей — предупреждение и пустой список (скрипт не падает).
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))

/** @returns {Promise<string[]>} URL фото как они лежат в БД (облачные ссылки) */
export async function dbPhotos() {
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
