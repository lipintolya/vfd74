/**
 * src/lib/related-models.ts
 *
 * Подбор блока «Другие модели серии» для страницы модели (/models/[id].astro).
 *
 * Зачем: раньше у страницы модели была одна входящая ссылка (с каталога/серии),
 * поэтому поиск почти не видел отдельные модели. Блок даёт каждой модели
 * ссылки с соседей по серии — и покупателю альтернативы, и роботу путь по
 * сайту.
 *
 * Как выбираем: берём модели той же серии, упорядочиваем по цене и показываем
 * окно из `limit` ближайших по цене соседей вокруг текущей (окно прижимается
 * к краям списка, а не заворачивается). Такой набор и релевантен (похожая
 * цена и оформление), и раздаёт ссылки ровно: на каждую модель серии ссылается
 * не меньше половины окна соседей. Выбор детерминированный — без случайности,
 * иначе страницы менялись бы от сборки к сборке.
 */
import type { ModelEntry } from './model-entries'

export const RELATED_MODELS_LIMIT = 8

export interface RelatedModels {
  /** Соседи по серии в порядке возрастания цены, без самой модели. */
  models: ModelEntry[]
  /** Сколько всего моделей в серии (с учётом текущей) — для ссылки «Вся серия». */
  seriesTotal: number
}

/** В блок попадают только модели с фото обложки — карточка без фото выглядит сломанной. */
const showable = (e: ModelEntry) => Boolean(e.colors[0]?.photo)

const byPrice = (a: ModelEntry, b: ModelEntry) =>
  (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity) || a.slug.localeCompare(b.slug)

export function relatedModels(
  current: ModelEntry,
  all: ModelEntry[],
  limit: number = RELATED_MODELS_LIMIT,
): RelatedModels {
  if (!current.seriesSlug) return { models: [], seriesTotal: 0 }

  /* Текущую модель держим в списке, даже если у неё нет фото, — иначе
     не найти её позицию; в результат она всё равно не попадает. */
  const series = all
    .filter(e => e.seriesSlug === current.seriesSlug && (e.model.id === current.model.id || showable(e)))
    .sort(byPrice)

  const index = series.findIndex(e => e.model.id === current.model.id)
  const total = series.length
  const size  = Math.min(limit + 1, total)
  const start = Math.max(0, Math.min(index - Math.floor(limit / 2), total - size))

  const models = series
    .slice(start, start + size)
    .filter(e => e.model.id !== current.model.id)

  return { models, seriesTotal: total }
}
