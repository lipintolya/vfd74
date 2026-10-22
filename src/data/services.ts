/**
 * Цены услуг салона — единственный источник для «Как мы работаем» на главной
 * (и любых будущих упоминаний). Меняете цену — обновите и PRICES_DATE: она
 * выводится в сноске под ценами.
 */

const NBSP = '\u00a0'

/** Дата, на которую цены актуальны (ГГГГ-ММ-ДД) */
export const PRICES_DATE = '2026-10-22'

export const SERVICES = {
  /** Замер межкомнатных дверей по Челябинску — бесплатно при оформлении
      заказа (та же формулировка, что в FAQ и на /contacts/) */
  measure: { free: true },
  /** Монтаж: за дверь — от priceFrom, если дверь одна — от singleFrom */
  install: { priceFrom: 5600, singleFrom: 7500 },
} as const

/** 5600 → «5 600 ₽» (пробелы неразрывные) */
export const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, NBSP)}${NBSP}₽`

/** «от 5 600 ₽» */
export const rubFrom = (n: number) => `от${NBSP}${rub(n)}`

/** «22 октября 2026 г.» */
export const PRICES_DATE_LABEL = new Date(PRICES_DATE)
  .toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
