/**
 * src/lib/hidden-doors-catalog.ts
 *
 * Скрытые двери «Секрет» в общем каталоге (/catalog/, страницы /models/…).
 *
 * Модели заведены в Supabase как обычные (серия sekret, покрытие
 * «Финиш-грунт» — scripts/sql/2026-11-sekret-catalog.sql), но ЦЕНЫ берутся
 * не из price_rrp, а из src/data/skrytye-dveri-products.ts — того же
 * источника, что у страницы /catalog/skrytye-dveri/. Так у двери одна цена
 * на всём сайте, и акции (SECRET_PRICES[].promo) сами начинаются и
 * заканчиваются в каталоге вместе со страницей скрытых дверей.
 *
 * Одна карточка = полотно + тип короба: «Секрет Стандарт» (алюминиевый
 * короб) и «Секрет Лайт» (комбинированный: алюминий + массив сосны).
 * Комплект скрытой двери — короб с петлями, без наличников.
 */
import {
  SECRET_PRICES, secretRowPrices, BOX_PRO_IMAGE, BOX_LITE_IMAGE,
  type SecretEdgeColor,
} from '../data/skrytye-dveri-products'

export const HIDDEN_SERIES_SLUG = 'sekret'

export type HiddenBox = 'standard' | 'lite'

interface HiddenModel {
  edge:    SecretEdgeColor
  reverse: boolean
  box:     HiddenBox
}

/** id моделей в Supabase (models.id) → какая строка прайса и какой короб. */
export const HIDDEN_MODELS: Record<string, HiddenModel> = {
  '01da3484-3994-49d2-a25a-e3f79cb73575': { edge: 'black', reverse: false, box: 'standard' }, // Секрет Стандарт, кромка чёрная
  'b5580517-9dfa-46b9-9b86-29bdffeb82a0': { edge: 'black', reverse: false, box: 'lite' },     // Секрет Лайт, кромка чёрная
}

export const isHiddenSeries = (seriesSlug: string | undefined) => seriesSlug === HIDDEN_SERIES_SLUG

/** Текущие цены модели: полотно и короб (комплект минус полотно). null — не скрытая дверь. */
export function hiddenModelPrices(modelId: string | undefined): { blade: number; box: number } | null {
  const m = modelId ? HIDDEN_MODELS[modelId] : undefined
  if (!m) return null
  const row = SECRET_PRICES.find(r => r.edgeColor === m.edge && r.reverse === m.reverse)
  if (!row) return null
  const p   = secretRowPrices(row)
  const kit = m.box === 'lite' ? p.kitLitePrice : p.kitStandardPrice
  if (kit == null) return null
  return { blade: p.bladePrice, box: kit - p.bladePrice }
}

/** Фото — интерьерная сцена (рендер на всю площадь), а не вырезанная дверь:
    карточка и страница модели показывают его на всю подложку (cover). */
export const isScenePhoto = (seriesSlug: string | undefined) => isHiddenSeries(seriesSlug)

/** Подпись комплекта у цены: у скрытой двери наличников нет. */
export const kitLabel = (seriesSlug: string | undefined) =>
  isHiddenSeries(seriesSlug) ? 'С коробом' : 'С коробом и наличниками'

/** Разрез короба для страницы модели — те же рендеры, что на /catalog/skrytye-dveri/. */
export const HIDDEN_BOX_INFO: Record<HiddenBox, { name: string; image: string; caption: string; alt: string; text: string }> = {
  lite: {
    name:    'Короб Лайт',
    image:   BOX_LITE_IMAGE,
    caption: 'Короб «Секрет Лайт» — разрез',
    alt:     'Разрез короба «Секрет Лайт»: алюминиевый профиль с наполнением из массива сосны',
    text:    'Комбинированный: тонкостенный алюминиевый профиль задаёт геометрию, массив сосны внутри держит крепёж.',
  },
  standard: {
    name:    'Короб Стандарт',
    image:   BOX_PRO_IMAGE,
    caption: 'Короб «Секрет» — профиль',
    alt:     'Профиль короба «Секрет»: монолитный алюминиевый сплав со штукатурным крылом',
    text:    'Монолитный алюминиевый профиль со штукатурным крылом: переход к стене без трещин при усадке.',
  },
}

export const hiddenBoxOf = (modelId: string | undefined): HiddenBox | null =>
  (modelId && HIDDEN_MODELS[modelId]?.box) || null
