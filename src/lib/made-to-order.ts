/**
 * src/lib/made-to-order.ts
 *
 * Серии, которых нет на складе постоянно — доступны только под заказ.
 * Бейдж «Под заказ» на карточке каталога и странице товара.
 *
 * Добавлять/убирать вручную, когда серия появляется/уходит со склада.
 */
export const MADE_TO_ORDER_SERIES: ReadonlySet<string> = new Set([
  'next',
  'smart',
  'urban-drevesnyy',
])

export const isMadeToOrder = (seriesSlug: string): boolean => MADE_TO_ORDER_SERIES.has(seriesSlug)
