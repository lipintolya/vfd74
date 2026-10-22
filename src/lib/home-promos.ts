/**
 * Новинки на главной (Техно, Штрих 2А, «Секрет», «Рефлекс») — данные для
 * одного блока с вкладками components/home/Novelties.astro.
 *
 * Цены не пишем руками: Техно и Штрих — из того же Supabase-каталога, что
 * и /catalog/ (getCatalogCards + calcKitPrice), скрытые двери — из
 * data/skrytye-dveri-products.ts. Поменялась цена в источнике — блок
 * обновится при следующей сборке.
 */
import { getCatalogCards } from './catalog-data'
import { calcKitPrice } from '../data/accessories'
import { formatDate } from './promo-dates'
import {
  REFLEX_IMAGE, REFLEX_MIN_BLADE_PRICE, REFLEX_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE, SECRET_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE_ORIGINAL, SECRET_MIN_KIT_PRICE_ORIGINAL,
  SECRET_PROMO_ACTIVE, SECRET_PROMO_DISCOUNT, SECRET_PROMO_VALID_UNTIL,
} from '../data/skrytye-dveri-products'

export interface PromoPrice {
  value: number
  /** Цена до скидки — зачёркнутой рядом */
  old?:  number
  /** Минимальная цена линейки — выводится с «от» */
  from?: boolean
}

export interface HomePromo {
  /** Ключ — из него id вкладки и панели */
  id:      string
  /** Короткое имя на вкладке: на телефоне 4 вкладки делят ширину экрана */
  tab:     string
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
  /** Кадры слайдера; /renders/home/<имя>.webp имеют ресайзы 640/960 */
  images:  string[]
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
        kit:   { value: card.price + calcKitPrice(card.coatingSlug, card.colorName), includes: KIT_INTERIOR },
      }
    : {}

/* «Штрих 2А» в каталоге две записи (чёрный и золотой молдинг) — ищем по id.
   Обложка карточки уже переставлена на бежевый из наличия (IN_STOCK_OVERRIDE
   в made-to-order.ts), поэтому price/colorName — именно он. */
const SHTRIH_2A_ID = '7434f55c-b2a8-4f12-b0c6-56c7c57888eb'

export async function getHomePromos(): Promise<HomePromo[]> {
  const { cards } = await getCatalogCards()

  /* У «Техно 1» обложка карточки — цвет из наличия (withInStockFirst в
     catalog-data.ts), поэтому цена — белого */
  const tehnoCard  = cards.find(c => c.seriesSlug === 'tehno' && c.name === 'Техно 1')
  const shtrihCard = cards.find(c => c.id === SHTRIH_2A_ID)

  const tehno: HomePromo = {
    id:     'tehno',
    tab:    'Техно',
    title:  'Серия Техно',
    /* Свойства — из преимуществ Эмалекса на /catalog/ (coatingGroupCopy) */
    text:   'Новая коллекция в покрытии Эмалекс: не боится царапин, легко моется и не желтеет. Техно 1 белый — на складе.',
    ...catalogPrices(tehnoCard),
    cta:    { label: 'Смотреть серию', href: '/catalog/series/tehno/' },
    images: ['/renders/home/tehno-1.webp', '/renders/home/tehno-2.webp', '/renders/home/tehno-3.webp'],
    alt:    'Межкомнатная дверь серии «Техно» в цвете Эмалекс белый',
  }

  const shtrih: HomePromo | null = shtrihCard ? {
    id:      'shtrih',
    tab:     'Штрих 2А',
    title:   'Урбан Штрих 2А',
    text:    'Бежевый Эмалекс с графичным чёрным молдингом и алюминиевой кромкой. Есть на складе — без ожидания.',
    ...catalogPrices(shtrihCard),
    cta:     { label: 'Смотреть модель', href: `/models/${shtrihCard.slug}/` },
    images:  ['/renders/home/shtrih-2a-1.webp', '/renders/home/shtrih-2a-2.webp', '/renders/home/shtrih-2a-3.webp'],
    alt:     'Межкомнатная дверь Урбан Штрих 2А в цвете Эмалекс бежевый с чёрным молдингом',
  } : null

  const secret: HomePromo = {
    id:     'secret',
    tab:    'Секрет',
    title:  'Скрытые двери «Секрет»',
    text:   'Полотно вровень со стеной, без наличников и видимых петель — красится в цвет стены. Есть в наличии в Челябинске.',
    offer:  SECRET_PROMO_ACTIVE
      ? `Акция −${Math.round(SECRET_PROMO_DISCOUNT * 100)}% до ${formatDate(SECRET_PROMO_VALID_UNTIL)}`
      : undefined,
    price:  { value: SECRET_MIN_BLADE_PRICE, from: true,
              old: SECRET_PROMO_ACTIVE ? SECRET_MIN_BLADE_PRICE_ORIGINAL : undefined },
    kit:    { value: SECRET_MIN_KIT_PRICE, from: true, includes: KIT_HIDDEN,
              old: SECRET_PROMO_ACTIVE ? SECRET_MIN_KIT_PRICE_ORIGINAL : undefined },
    cta:    { label: 'Смотреть скрытые двери', href: '/catalog/skrytye-dveri/' },
    /* Последний кадр — оригинал из /media: он и так лёгкий (15 КБ) */
    images: [
      '/renders/home/secret-cover.webp',
      '/renders/home/secret-2.webp',
      '/renders/home/secret-3.webp',
      '/media/invisible/reverse_render_11zon.webp',
    ],
    alt:    'Скрытая дверь серии «Секрет» — полотно заподлицо со стеной',
  }

  const reflex: HomePromo = {
    id:      'reflex',
    tab:     'Рефлекс',
    title:   'Скрытая дверь с зеркалом «Рефлекс»',
    text:    'Зеркало во всю высоту полотна, дверь вровень со стеной. Размеры под проём, высота до 2,5 м.',
    price:   { value: REFLEX_MIN_BLADE_PRICE, from: true },
    kit:     { value: REFLEX_MIN_KIT_PRICE,   from: true, includes: KIT_HIDDEN },
    cta:     { label: 'Смотреть «Рефлекс»', href: '/catalog/skrytye-dveri/#reflex' },
    images:  ['/renders/home/reflex-1.webp', '/renders/home/reflex-2.webp', '/renders/home/reflex-3.webp', REFLEX_IMAGE],
    alt:     'Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной',
  }

  /* Порядок вкладок; Штрих — только если модель нашлась в каталоге */
  return [tehno, shtrih, secret, reflex].filter((p): p is HomePromo => p !== null)
}
