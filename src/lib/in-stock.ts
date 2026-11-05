/**
 * src/lib/in-stock.ts
 *
 * Подборка «Двери в наличии» (/catalog/v-nalichii/) из карточек каталога.
 * Что на складе — один источник, IN_STOCK_OVERRIDE в made-to-order.ts: он же
 * даёт плашку «В наличии» в каталоге и в пикере цвета на странице модели.
 *
 * На странице наличия у карточки остаются только цвета со склада: свотч
 * цвета «под заказ» на странице «в наличии» обещал бы то, чего на складе нет.
 * Обложка, цена и цвет карточки — первого цвета со склада.
 */
import type { CatalogCardItem } from '../components/catalog/types'
import { isInStock } from './made-to-order'

export function inStockCards(cards: readonly CatalogCardItem[]): CatalogCardItem[] {
  const result: CatalogCardItem[] = []
  for (const card of cards) {
    const swatches = card.colorSwatches.filter((s) => s.available && isInStock(card.id, s.name))
    const cover = swatches[0]
    if (!cover) continue
    const { noThumb: _coverOfOtherColor, ...rest } = card
    result.push({
      ...rest,
      colorSwatches: swatches,
      colorNames:    swatches.map((s) => s.name),
      colorFamilies: [...new Set(swatches.map((s) => s.family))],
      colorName:     cover.name,
      colorHex:      cover.hex,
      photo:         cover.photo || card.photo,
      price:         cover.price ?? card.price,
      ...(cover.noThumb ? { noThumb: true as const } : {}),
    })
  }
  return result
}
