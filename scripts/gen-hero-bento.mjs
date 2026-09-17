/**
 * Генерирует локальные ресайзы для двух картинок правого bento-блока
 * HeroSlider (алюминиевые перегородки + инструмент Makita в карточке
 * «Портфолио») — тот же приём, что и gen-hero-mobile.mjs: Yandex Cloud
 * storage не ресайзит по query-параметрам, а оригиналы кратно крупнее,
 * чем их реальный экранный размер в вёрстке.
 *
 * - tg1.webp (перегородки, фон карточки): 1080×1346 источник, но карточка
 *   у неё максимум ~2:1 на sm и не выше lg:h-full — на мобильном и планшете
 *   реальная ширина показа намного меньше оригинала. Даём 640w/960w срез.
 * - makita_cover.webp (декоративная PNG-подобная картинка инструмента):
 *   886×838 источник, но на экране максимум w-44 (176px CSS, ×2 DPR = 352px).
 *   Один 360w webp с сохранённой прозрачностью полностью покрывает все брейкпоинты.
 *
 * Запуск:        node scripts/gen-hero-bento.mjs
 * Когда запускать снова: если исходники в HeroSlider.vue поменяли на другие URL.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/hero/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const jobs = [
  {
    src: 'https://storage.yandexcloud.net/catalog-vfd/alum/saint_p_alum/tg1.webp',
    out: 'partitions-tg1-640.webp',
    width: 640,
    quality: 76,
  },
  {
    src: 'https://storage.yandexcloud.net/catalog-vfd/alum/saint_p_alum/tg1.webp',
    out: 'partitions-tg1-960.webp',
    width: 960,
    quality: 78,
  },
  {
    src: 'https://storage.yandexcloud.net/vfd74ru/Main_page/makita_cover.webp',
    out: 'makita-cover-360.webp',
    width: 360,
    quality: 82,
  },
]

for (const { src, out, width, quality } of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
