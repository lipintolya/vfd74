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
  /** Что стоит эту цену — обычным текстом после цифры: «за полотно» */
  per:   string
  /** Цена до скидки — зачёркнутой после цены */
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
  /** Две-три фразы живым текстом: что это, чем хорошо, есть ли на
      складе. Статус и свойства — словами в тексте, не плашкой над
      заголовком, не списком и не цветной строкой под ценой */
  text:    string
  /** Условие акции — фразой над ценами */
  offer?:  string
  prices:  PromoPrice[]
  cta:     { label: string; href: string }
  /** Кадры слайдера; /renders/home/<имя>.webp имеют ресайзы 640/960 */
  images:  string[]
  alt:     string
  /** Пропорции фото на телефоне (по умолчанию 4/3); с sm — общие */
  ratio?:  string
}

/** Цены «полотно / комплект» карточки каталога; null — карточки нет */
const catalogPrices = (card?: { price: number | null; coatingSlug: string; colorName: string }) => {
  if (!card?.price) return []
  return [
    { value: card.price, per: 'за полотно' },
    { value: card.price + calcKitPrice(card.coatingSlug, card.colorName), per: 'за комплект' },
  ]
}

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
    text:   'Новая коллекция в покрытии Эмалекс — сдержанный, технологичный характер интерьера. Покрытие не боится царапин и сколов, легко моется и не желтеет от солнца. Техно 1 в белом есть на складе.',
    prices: catalogPrices(tehnoCard),
    cta:    { label: 'Смотреть серию', href: '/catalog/series/tehno/' },
    images: ['/renders/home/tehno-1.webp', '/renders/home/tehno-2.webp', '/renders/home/tehno-3.webp'],
    alt:    'Межкомнатная дверь серии «Техно» в цвете Эмалекс белый',
  }

  const shtrih: HomePromo | null = shtrihCard ? {
    id:      'shtrih',
    tab:     'Штрих 2А',
    title:   'Урбан Штрих 2А',
    text:    'Новая модель серии Урбан: графичный чёрный молдинг на бежевом полотне. Эмалекс защищает от царапин и сколов, алюминиевая кромка бережёт торцы. Есть на складе — без ожидания изготовления.',
    prices:  catalogPrices(shtrihCard),
    cta:     { label: 'Смотреть модель', href: `/models/${shtrihCard.slug}/` },
    /* Кадры почти квадратные (1145×1374), дверь по центру — на телефоне
       5:6, чтобы не срезать полотно сверху и снизу */
    images:  ['/renders/home/shtrih-2a-1.webp', '/renders/home/shtrih-2a-2.webp', '/renders/home/shtrih-2a-3.webp'],
    alt:     'Межкомнатная дверь Урбан Штрих 2А в цвете Эмалекс бежевый с чёрным молдингом',
    ratio:   '5 / 6',
  } : null

  const secret: HomePromo = {
    id:     'secret',
    tab:    'Секрет',
    title:  'Скрытые двери «Секрет»',
    text:   'Полотно заподлицо со стеной, алюминиевый короб без наличников и видимых петель. Приходит в грунте — под покраску, штукатурку или обои в цвет стены. Есть в наличии в Челябинске.',
    offer:  SECRET_PROMO_ACTIVE
      ? `Акция −${Math.round(SECRET_PROMO_DISCOUNT * 100)}% до ${formatDate(SECRET_PROMO_VALID_UNTIL)}`
      : undefined,
    prices: [
      { value: SECRET_MIN_BLADE_PRICE, per: 'за полотно', from: true,
        old: SECRET_PROMO_ACTIVE ? SECRET_MIN_BLADE_PRICE_ORIGINAL : undefined },
      { value: SECRET_MIN_KIT_PRICE, per: 'за комплект', from: true,
        old: SECRET_PROMO_ACTIVE ? SECRET_MIN_KIT_PRICE_ORIGINAL : undefined },
    ],
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
    text:    'Новинка среди скрытых дверей: зеркало во всю высоту полотна, дверь вровень со стеной — комната визуально шире и светлее. Размеры индивидуальные, высота до 2,5 м, кромка чёрная, серебро или золото.',
    prices:  [
      { value: REFLEX_MIN_BLADE_PRICE, per: 'за полотно',  from: true },
      { value: REFLEX_MIN_KIT_PRICE,   per: 'за комплект', from: true },
    ],
    cta:     { label: 'Смотреть «Рефлекс»', href: '/catalog/skrytye-dveri/#reflex' },
    images:  ['/renders/home/reflex-1.webp', '/renders/home/reflex-2.webp', '/renders/home/reflex-3.webp', REFLEX_IMAGE],
    alt:     'Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной',
  }

  /* Порядок вкладок; Штрих — только если модель нашлась в каталоге */
  return [tehno, shtrih, secret, reflex].filter((p): p is HomePromo => p !== null)
}
