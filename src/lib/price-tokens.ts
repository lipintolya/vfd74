/**
 * src/lib/price-tokens.ts
 *
 * Живые цены в текстах frontmatter статей (description, FAQ): в .mdoc пишется
 * `{hingeHidden}`, на сборке подставляется цена из данных калькулятора. Тело
 * статьи для этого использует Markdoc-теги ({% linePrices of="hinges" /%}),
 * а frontmatter тегов не понимает — отсюда токены. Подстановка — в схеме
 * коллекции (src/content.config.ts), поэтому цена одинакова везде: <meta>,
 * JSON-LD, карточки статей.
 *
 * Неизвестный токен роняет сборку: фигурные скобки в сниппете поиска хуже
 * упавшего билда.
 */
import { HINGE_PRICE, HINGE_QTY } from '../data/hardware'
import { rub } from '../data/services'

const TOKENS: Record<string, string> = {
  hingeHidden:       rub(HINGE_PRICE.hidden),
  hingeStandard:     rub(HINGE_PRICE.standard),
  hingeHiddenDoor:   rub(HINGE_PRICE.hidden * HINGE_QTY),
  hingeStandardDoor: rub(HINGE_PRICE.standard * HINGE_QTY),
}

export function fillPriceTokens(text: string): string {
  return text.replace(/\{([A-Za-z]+)\}/g, (_, name: string) => {
    const value = TOKENS[name]
    if (value === undefined) throw new Error(`[price-tokens] неизвестный токен {${name}} в тексте: «${text.slice(0, 80)}…»`)
    return value
  })
}
