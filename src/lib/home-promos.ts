/**
 * Товары на главной: «Новинки» (Техно, Штрих 2А, «Рефлекс») — открытая витрина
 * components/home/Novelties.astro, и отдельный блок «Скрытые двери»
 * («Секрет» — не новинка), который рисует HiddenDoorsFeature.astro.
 *
 * Цены не пишем руками: Техно и Штрих — из того же Supabase-каталога, что
 * и /catalog/ (getCatalogCards + calcKitPrice), скрытые двери — из
 * data/skrytye-dveri-products.ts. Поменялась цена в источнике — блок
 * обновится при следующей сборке.
 */
import { getCatalogCards } from './catalog-data'
import { inStockCards } from './in-stock'
import { rub } from '../data/services'
import { calcKitPrice } from '../data/accessories'
import { formatDate } from './promo-dates'
import {
  REFLEX_MIN_BLADE_PRICE, REFLEX_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE, SECRET_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE_ORIGINAL, SECRET_MIN_KIT_PRICE_ORIGINAL,
  SECRET_PROMO_ACTIVE, SECRET_PROMO_DISCOUNT, SECRET_PROMO_VALID_UNTIL,
  SECRET_ROW_PROMO, SECRET_MIN_DISCOUNTED,
} from '../data/skrytye-dveri-products'

export interface PromoPrice {
  value: number
  /** Цена до скидки — зачёркнутой рядом */
  old?:  number
  /** Минимальная цена линейки — выводится с «от» */
  from?: boolean
}

export interface HomePromo {
  /** Стабильный ключ записи. */
  id:      string
  title:   string
  /** Две короткие фразы живым текстом: что это и есть ли на складе.
      Статус и свойства — словами, без плашек, списков и цветных строк */
  text:    string
  /** Условие акции — фразой над ценой */
  offer?:  string
  /** Цена полотна — главная, крупно (как в карточках каталога) */
  price?:  PromoPrice
  /** Цена комплекта — второй строкой обычным текстом, с составом */
  kit?:    PromoPrice & { includes: string }
  cta:     { label: string; href: string }
  /** Главный кадр; /renders/home/<имя>.webp имеет ресайзы 640/960. */
  image:   string
  alt:     string
}

/** Состав комплекта межкомнатной двери (BASE_KIT_DESCRIPTION — короб
    2,5 шт, наличники 5 шт) — коротко для строки под ценой */
const KIT_INTERIOR = 'с коробом и наличниками'
/** У скрытых дверей наличников нет — комплект: полотно и алюминиевый короб */
const KIT_HIDDEN = 'с алюминиевым коробом'

/** Цены полотна и комплекта карточки каталога; карточки нет — без цен */
const catalogPrices = (card?: { price: number | null; coatingSlug: string; colorName: string }) =>
  card?.price
    ? {
        price: { value: card.price },
        kit:   { value: card.price + calcKitPrice(card.coatingSlug, card.colorName, card.seriesSlug, card.id), includes: KIT_INTERIOR },
      }
    : {}

/* «Штрих 2А» в каталоге две записи (чёрный и золотой молдинг) — ищем по id.
   Обложка карточки уже переставлена на бежевый из наличия (IN_STOCK_OVERRIDE
   в made-to-order.ts), поэтому price/colorName — именно он. */
const SHTRIH_2A_ID = '7434f55c-b2a8-4f12-b0c6-56c7c57888eb'

export interface HeroData {
  /** Карточек в каталоге — столько же, сколько видно на /catalog/ */
  models:   number
  /** Карточек со складским цветом — как на /catalog/v-nalichii/ */
  inStock:  number
  minPrice: number | null
  /** Факт на плитке «Скрытые двери»: цена КОМПЛЕКТА с коробом — полотно
      без короба скрытой дверью не поставить, «от» за одно полотно вводило бы
      в заблуждение */
  secretFact: string
}

export async function getHomePromos(): Promise<{
  novelties: HomePromo[]
  inStock: HomePromo
  /** Минимальная цена полотна по каталогу — «от …» на плитке «Каталога»;
      считаем здесь, чтобы не делать второй запрос к Supabase */
  interiorMinPrice: number | null
  /** Первый экран главной (HeroSlider): цифры и подписи — из того же каталога */
  hero: HeroData
}> {
  const { cards } = await getCatalogCards()
  const prices = cards.map(c => c.price).filter((p): p is number => p != null && p > 0)
  const interiorMinPrice = prices.length ? Math.min(...prices) : null

  /* У «Техно 1» обложка карточки — цвет из наличия (withInStockFirst в
     catalog-data.ts), поэтому цена — белого */
  const tehnoCard  = cards.find(c => c.seriesSlug === 'tehno' && c.name === 'Техно 1')
  const shtrihCard = cards.find(c => c.id === SHTRIH_2A_ID)

  const tehno: HomePromo = {
    id:     'tehno',
    title:  'Серия Техно',
    /* Свойства — из преимуществ Эмалекса на /catalog/ (coatingGroupCopy) */
    text:   'Новая коллекция в покрытии Эмалекс: не боится царапин, легко моется и не желтеет. Техно 1 белый — на складе.',
    ...catalogPrices(tehnoCard),
    cta:    { label: 'Смотреть серию', href: '/catalog/series/tehno/' },
    image:  '/renders/home/tehno-1.webp',
    alt:    'Межкомнатная дверь серии «Техно» в цвете Эмалекс белый',
  }

  const shtrih: HomePromo | null = shtrihCard ? {
    id:      'shtrih',
    title:   'Урбан Штрих 2А',
    text:    'Бежевый Эмалекс с графичным чёрным молдингом и алюминиевой кромкой. Есть на складе — без ожидания.',
    ...catalogPrices(shtrihCard),
    cta:     { label: 'Смотреть модель', href: `/models/${shtrihCard.slug}/` },
    image:   '/renders/home/shtrih-2a-1.webp',
    alt:     'Межкомнатная дверь Урбан Штрих 2А в цвете Эмалекс бежевый с чёрным молдингом',
  } : null

  const secret: HomePromo = {
    id:     'secret',
    /* В наличии — кромки чёрная и серебро («хром»), см. SECRET_PRICES;
       минимальные цены ниже — как раз у них (золото дороже) */
    title:  'Скрытые двери «Секрет»',
    text:   'Полотно вровень со стеной, под покраску в её цвет. Чёрная и хромированная кромки — в наличии в Челябинске.',
    offer:  SECRET_PROMO_ACTIVE
      ? `Акция −${Math.round(SECRET_PROMO_DISCOUNT * 100)}% до ${formatDate(SECRET_PROMO_VALID_UNTIL)}`
      : SECRET_ROW_PROMO
        ? 'Скрытые двери по акции'
        : undefined,
    price:  { value: SECRET_MIN_BLADE_PRICE, from: true,
              old: SECRET_MIN_DISCOUNTED ? SECRET_MIN_BLADE_PRICE_ORIGINAL : undefined },
    kit:    { value: SECRET_MIN_KIT_PRICE, from: true, includes: KIT_HIDDEN,
              old: SECRET_MIN_DISCOUNTED ? SECRET_MIN_KIT_PRICE_ORIGINAL : undefined },
    cta:    { label: 'Смотреть скрытые двери', href: '/catalog/skrytye-dveri/' },
    image:  '/renders/home/secret-cover.webp',
    alt:    'Скрытая дверь серии «Секрет» — полотно заподлицо со стеной',
  }

  const reflex: HomePromo = {
    id:      'reflex',
    title:   'Скрытая дверь с зеркалом «Рефлекс»',
    text:    'Зеркало во всю высоту полотна, дверь вровень со стеной. Размеры под проём, высота до 2,5 м.',
    price:   { value: REFLEX_MIN_BLADE_PRICE, from: true },
    kit:     { value: REFLEX_MIN_KIT_PRICE,   from: true, includes: KIT_HIDDEN },
    cta:     { label: 'Смотреть «Рефлекс»', href: '/catalog/skrytye-dveri/#reflex' },
    image:   '/renders/home/reflex-1.webp',
    alt:     'Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной',
  }

  const hero: HeroData = {
    models:   cards.length,
    inStock:  inStockCards(cards).length,
    minPrice: interiorMinPrice,
    secretFact: `С коробом от ${rub(SECRET_MIN_KIT_PRICE)}${SECRET_MIN_DISCOUNTED ? ' по акции' : ''}`,
  }

  return {
    hero,
    /* Порядок в витрине; Штрих — только если модель нашлась в каталоге */
    novelties: [tehno, shtrih, reflex].filter((p): p is HomePromo => p !== null),
    inStock:   secret,
    interiorMinPrice,
  }
}
