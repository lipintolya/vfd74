/**
 * Навигация шапки — данные и правила подсветки, общие для Header.vue
 * (живая шапка) и HeaderFallback.astro (статичная заглушка до загрузки
 * скрипта): оба рисуют один и тот же набор пунктов и одинаково выбирают
 * активный.
 */
export interface MenuItem { href: string; label: string; desc: string }

export interface NavLink {
  href:  string
  label: string
  /** Префиксы путей раздела: пункт подсвечен на всех его страницах, а не
      только на самой ссылке (на карточке модели «Каталог» — текущий раздел) */
  match: readonly string[]
  /** Выпадающее меню (десктоп) и подпункты (мобильное меню) */
  menu?:      readonly MenuItem[]
  menuLabel?: string
}

export const CATALOG_DROPDOWN: readonly MenuItem[] = [
  { href: '/catalog/',               label: 'Все двери',      desc: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери', desc: 'Скрытый монтаж' },
  { href: '/vhodnye-dveri/',         label: 'Входные двери', desc: 'С монтажом' },
  { href: '/catalog/decor/',         label: 'Декор',         desc: 'Плинтус, фрамуги, рейки' },
]

export const ABOUT_DROPDOWN: readonly MenuItem[] = [
  { href: '/about/',     label: 'О салоне',   desc: 'Адрес, реквизиты, руководство' },
  { href: '/o-fabrike/', label: 'О фабрике',  desc: 'Производитель дверей ВФД' },
]

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/',            label: 'Главная',     match: [] },
  { href: '/catalog/',    label: 'Каталог',     match: ['/catalog', '/vhodnye-dveri', '/models/'], menu: CATALOG_DROPDOWN, menuLabel: 'Категории каталога' },
  { href: '/partitions/', label: 'Перегородки', match: ['/partitions'] },
  { href: '/designers/',  label: 'Дизайнерам',  match: ['/designers'] },
  { href: '/about/',      label: 'О нас',       match: ['/about', '/o-fabrike'], menu: ABOUT_DROPDOWN, menuLabel: 'О компании' },
  { href: '/contacts/',   label: 'Контакты',    match: ['/contacts'] },
]

export interface MenuGroup { label: string; items: readonly MenuItem[] }

/** Мобильное меню: те же разделы, что в шапке, но сгруппированы под
    подписями (каждый пункт — название и пояснение). «Главная» нет: на неё
    ведёт логотип в шапке меню. */
export const MOBILE_MENU: readonly MenuGroup[] = [
  { label: 'Каталог', items: CATALOG_DROPDOWN },
  {
    label: 'Перегородки',
    items: [{ href: '/partitions/', label: 'Алюминиевые перегородки', desc: 'Изготовление до 45 рабочих дней' }],
  },
  {
    label: 'Компания',
    items: [
      { href: '/designers/', label: 'Дизайнерам', desc: 'Партнёрская программа' },
      ...ABOUT_DROPDOWN,
      { href: '/contacts/',  label: 'Контакты',   desc: 'Адрес, часы и как добраться' },
    ],
  },
]

/** Пункт мобильного меню — текущая страница; «Все двери» — только сам каталог,
    остальные — и вложенные страницы */
export const isCurrentItem = (item: MenuItem, path: string): boolean =>
  item.href === '/catalog/' ? path === item.href : path.startsWith(item.href)

export const SOCIAL_NETWORKS = [
  { name: 'VK',       label: 'ВКонтакте', url: 'https://vk.com/vfddoors74',          icon: '/icons/b_vk_logo.webp' },
  { name: 'Telegram', label: 'Telegram',  url: 'https://t.me/vfddoors74',            icon: '/icons/b_tg_logo.webp' },
  { name: 'MAX',      label: 'Max',       url: 'https://max.ru/id452402308842_biz', icon: '/icons/b_max_logo.webp' },
] as const

/** Раздел текущий: главная — только на «/», остальные — по префиксам путей */
export const isCurrentSection = (link: NavLink, path: string): boolean =>
  link.href === '/' ? path === '/' : link.match.some((p) => path.startsWith(p))

/** aria-current="page" — только на самой странице пункта, не на разделе */
export const isCurrentPage = (link: NavLink, path: string): boolean => path === link.href

const NAV_BASE =
  'flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500'

/** Классы пункта десктопной навигации */
export const navLinkClass = (link: NavLink, path: string): string =>
  `${NAV_BASE} ${isCurrentSection(link, path) ? 'bg-fg text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`

/** Подпись «ДВЕРИ НА КАШИРИНЫХ» рядом с логотипом: шрифт заголовков сайта
    (Rubik), как у H1–H3, а не шрифт текста — подпись читается частью бренда,
    а не строкой интерфейса */
export const BRAND_TEXT =
  'font-(family-name:--font-display) text-sm font-medium uppercase tracking-wide whitespace-nowrap'

/** Кольцо фокуса — одно на все ссылки и кнопки шапки */
export const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500'
