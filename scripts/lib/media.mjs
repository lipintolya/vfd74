/**
 * Источник картинок для скриптов gen-*.mjs: локальный файл из public/,
 * а не облако. Раньше каждый скрипт делал fetch к storage.yandexcloud.net —
 * при сбое облака регенерация превью была невозможна.
 *
 * Принимает путь сайта: '/media/…' (зеркало) или '/renders/…' (уже готовые
 * превью). Нужного файла нет — подсказывает, как его получить.
 */
import { readFile } from 'node:fs/promises'

const PUBLIC = new URL('../../public/', import.meta.url)

export async function readMedia(src) {
  if (!src.startsWith('/')) throw new Error(`Ожидался путь сайта (/media/…), получено: ${src}`)
  let rel = src.slice(1)
  try { rel = decodeURIComponent(rel) } catch { /* имя без процент-кодирования */ }
  try {
    return await readFile(new URL(rel, PUBLIC))
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error(`Нет файла public/${rel}. Если это новое фото из облака — npm run media:sync`)
    }
    throw e
  }
}
