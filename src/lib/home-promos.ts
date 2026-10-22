/**
 * Промо-блоки новинок на главной (Техно, Штрих 2А, «Секрет», «Рефлекс») —
 * данные для одного шаблона components/home/ProductPromo.astro.
 *
 * Цены не пишем руками: Техно и Штрих — из того же Supabase-каталога, что
 * и /catalog/ (getCatalogCards + calcKitPrice), скрытые двери — из
 * data/skrytye-dveri-products.ts. Поменялась цена в источнике — блок
 * обновится при следующей сборке.
 */
import { getCatalogCards } from './catalog-data'
import { calcKitPrice } from '../data/accessories'
import { coatingGroupCopy } from '../data/series-descriptions'
import { formatDate } from './promo-dates'
import {
  REFLEX_IMAGE, REFLEX_MIN_BLADE_PRICE, REFLEX_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE, SECRET_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE_ORIGINAL, SECRET_MIN_KIT_PRICE_ORIGINAL,
  SECRET_PROMO_ACTIVE, SECRET_PROMO_DISCOUNT, SECRET_PROMO_VALID_UNTIL,
} from '../data/skrytye-dveri-products'

export interface PromoPrice {
  label: string
  value: number
  /** Цена до скидки — зачёркнутой рядом с подписью */
  old?: number
  /** Минимальная цена линейки — выводится с «от» */
  from?: boolean
}

export interface HomePromo {
  /** Ключ блока — из него id заголовка (aria-labelledby) */
  id:      string
  /** Статус над заголовком: «Новинка», «В наличии» */
  status:  string
  title:   string
  /** Одна-две фразы — суть, без пересказа списка */
  lead:    string
  /** Короткие факты; чётное число коротких — в две колонки */
  facts:   string[]
  /** Что именно лежит на складе — строка «В наличии: …» над ценами */
  stock?:  string
  /** Условие акции — строкой над ценами */
  offer?:  string
  prices:  PromoPrice[]
  cta:     { label: string; href: string }
  /** Кадры слайдера; /renders/home/<имя>.webp имеют ресайзы 640/960 */
  images:  string[]
  alt:     string
  /** Пропорции фото на телефоне (по умолчанию 4/3); с sm — общие */
  ratio?:  string
  /** Фото справа на десктопе — блоки чередуются, не читаются копией */
  reverse?: boolean
}

/** Цены «полотно / комплект» карточки каталога; null — карточки нет */
const catalogPrices = (card?: { price: number | null; coatingSlug: string; colorName: string }) => {
  if (!card?.price) return []
  return [
    { label: 'Полотно',  value: card.price },
    { label: 'Комплект', value: card.price + calcKitPrice(card.coatingSlug, card.colorName) },
  ]
}

/* «Штрих 2А» в каталоге две записи (чёрный и золотой молдинг) — ищем по id.
   Обложка карточки уже переставлена на бежевый из наличия (IN_STOCK_OVERRIDE
   в made-to-order.ts), поэтому price/colorName — именно он. */
const SHTRIH_2A_ID = '7434f55c-b2a8-4f12-b0c6-56c7c57888eb'

export async function getHomePromos() {
  const { cards } = await getCatalogCards()

  /* У «Техно 1» обложка карточки — цвет из наличия (withInStockFirst в
     catalog-data.ts), поэтому цена — белого */
  const tehnoCard  = cards.find(c => c.seriesSlug === 'tehno' && c.name === 'Техно 1')
  const shtrihCard = cards.find(c => c.id === SHTRIH_2A_ID)

  /* Эмалекс — те же официальные преимущества покрытия, что на /catalog/ */
  const emalex = coatingGroupCopy.emalex?.benefits ?? []

  const tehno: HomePromo = {
    id:     'tehno',
    status: 'Новинка',
    title:  'Серия Техно',
    lead:   'Коллекция на покрытии Эмалекс — сдержанный, технологичный характер интерьера.',
    facts:  [emalex[0]?.title, emalex[1]?.title, emalex[2] && 'Защита от УФ-лучей']
      .filter((t): t is string => Boolean(t)),
    stock:  'Техно 1 белый',
    prices: catalogPrices(tehnoCard),
    cta:    { label: 'Смотреть серию', href: '/catalog/series/tehno/' },
    images: ['/renders/home/tehno-1.webp', '/renders/home/tehno-2.webp', '/renders/home/tehno-3.webp'],
    alt:    'Межкомнатная дверь серии «Техно» в цвете Эмалекс белый',
  }

  const shtrih: HomePromo | null = shtrihCard ? {
    id:      'shtrih',
    status:  'Новинка',
    title:   'Урбан Штрих 2А',
    lead:    'Модель серии Урбан: графичный чёрный молдинг на спокойном бежевом полотне.',
    facts:   ['Эмалекс защищает от царапин и сколов', 'Алюминиевая кромка бережёт торцы'],
    stock:   'Эмалекс бежевый',
    prices:  catalogPrices(shtrihCard),
    cta:     { label: 'Смотреть модель', href: `/models/${shtrihCard.slug}/` },
    /* Кадры почти квадратные (1145×1374), дверь по центру — на телефоне
       5:6, чтобы не срезать полотно сверху и снизу */
    images:  ['/renders/home/shtrih-2a-1.webp', '/renders/home/shtrih-2a-2.webp', '/renders/home/shtrih-2a-3.webp'],
    alt:     'Межкомнатная дверь Урбан Штрих 2А в цвете Эмалекс бежевый с чёрным молдингом',
    ratio:   '5 / 6',
    reverse: true,
  } : null

  const secret: HomePromo = {
    id:     'secret',
    status: 'В наличии',
    title:  'Скрытые двери «Секрет»',
    lead:   'Полотно заподлицо со стеной: алюминиевый короб без наличников и видимых петель — под покраску, штукатурку или обои.',
    facts:  ['Алюминиевый короб', 'Реверсивный монтаж', 'Нестандартная высота', 'Грунт под покраску'],
    offer:  SECRET_PROMO_ACTIVE
      ? `Акция −${Math.round(SECRET_PROMO_DISCOUNT * 100)}% до ${formatDate(SECRET_PROMO_VALID_UNTIL)}`
      : undefined,
    prices: [
      { label: 'Полотно',  value: SECRET_MIN_BLADE_PRICE, from: true,
        old: SECRET_PROMO_ACTIVE ? SECRET_MIN_BLADE_PRICE_ORIGINAL : undefined },
      { label: 'Комплект', value: SECRET_MIN_KIT_PRICE, from: true,
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
    status:  'Новинка',
    title:   'Скрытая дверь с зеркалом «Рефлекс»',
    lead:    'Зеркало во всю высоту полотна, дверь вровень со стеной — комната визуально шире и светлее.',
    facts:   ['Индивидуальные размеры, высота до 2,5 м', 'Кромка: чёрная, серебро или золото'],
    prices:  [
      { label: 'Полотно',  value: REFLEX_MIN_BLADE_PRICE, from: true },
      { label: 'Комплект', value: REFLEX_MIN_KIT_PRICE,   from: true },
    ],
    cta:     { label: 'Смотреть «Рефлекс»', href: '/catalog/skrytye-dveri/#reflex' },
    images:  ['/renders/home/reflex-1.webp', '/renders/home/reflex-2.webp', '/renders/home/reflex-3.webp', REFLEX_IMAGE],
    alt:     'Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной',
    reverse: true,
  }

  return { tehno, shtrih, secret, reflex }
}
