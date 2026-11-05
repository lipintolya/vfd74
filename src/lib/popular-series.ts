/**
 * src/lib/popular-series.ts
 *
 * Порядок каталога по умолчанию (сортировка «Сначала популярные»,
 * sortCards в src/lib/catalog-filter.ts). В Supabase поля под это нет —
 * ключ по series.slug, как у seriesSlug на карточке.
 *
 * LEAD_SERIES_SLUGS открывают каталог в этом порядке: Урбан, затем Эмалексы
 * (решение салона, 05.11.2026). Дальше — остальные POPULAR_SERIES_SLUGS
 * (есть на складе или в работе), потом все прочие серии. Внутри серии —
 * по цене за полотно. Чистая сортировка по цене открывала каталог дешёвым
 * Протачем под заказ (Некст/Смарт) — салону это не выгодно.
 *
 * Добавлять/убирать вручную по факту наличия и продаж.
 */
export const LEAD_SERIES_SLUGS: readonly string[] = [
  'urban',         // Урбан
  'emalex',        // Эмалекс
  'emalex-modern', // Эмалекс Модерн
]

export const POPULAR_SERIES_SLUGS: ReadonlySet<string> = new Set([
  ...LEAD_SERIES_SLUGS,
  'stockholm',     // Стокгольм
  'skinel',        // Скинель
])

/** Место серии в «Популярных»: ведущие — по порядку списка, затем популярные, затем остальные */
export function popularRank(seriesSlug: string): number {
  const lead = LEAD_SERIES_SLUGS.indexOf(seriesSlug)
  if (lead !== -1) return lead
  return LEAD_SERIES_SLUGS.length + (POPULAR_SERIES_SLUGS.has(seriesSlug) ? 0 : 1)
}
