/**
 * src/lib/site-links.ts
 *
 * Единый источник ссылок для сквозной перелинковки: блок «Разделы сайта»
 * (SiteLinks.astro, на каждой странице) и «Смотрите также» на SEO-лендингах.
 *
 * Зачем: Header и Footer — Vue-острова `client:only`, в статическом HTML их
 * нет, поэтому без этого блока робот видит на странице лишь ссылки из её
 * контента, а лендинги (цвета, стили, покрытия, скрытые двери) получают
 * входящие ссылки только из каталога. Блок рендерится на сервере и отдаёт
 * каждой странице сайта прямые ссылки на все ключевые разделы.
 *
 * Лендинги по покрытию/цвету/стилю берутся из data-модулей — новый лендинг
 * попадает в перелинковку без правки этого файла.
 */
import { DOOR_CATEGORIES } from '../data/door-categories'
import { COLOR_CATEGORIES } from '../data/color-categories'
import { STYLE_CATEGORIES } from '../data/style-categories'

export interface SiteLink {
  href:  string
  label: string
}

export interface SiteLinkGroup {
  title: string
  links: SiteLink[]
}

/** «Белые двери в Челябинске» → «Белые двери»: в списке город не повторяем. */
const anchorFrom = (h1: string): string => h1.replace(/\s+в\s+Челябинске$/u, '')

export const COATING_LINKS: SiteLink[] = DOOR_CATEGORIES.map(c => ({
  href: `/catalog/${c.slug}/`, label: anchorFrom(c.h1),
}))

export const COLOR_LINKS: SiteLink[] = COLOR_CATEGORIES.map(c => ({
  href: `/catalog/${c.slug}/`, label: anchorFrom(c.h1),
}))

export const STYLE_LINKS: SiteLink[] = STYLE_CATEGORIES.map(c => ({
  href: `/catalog/${c.slug}/`, label: anchorFrom(c.h1),
}))

export const HIDDEN_DOOR_LINKS: SiteLink[] = [
  { href: '/catalog/skrytye-dveri/',              label: 'Скрытые двери' },
  { href: '/catalog/skrytye-dveri-dlya-doma/',    label: 'Скрытые двери для дома' },
  { href: '/catalog/skrytye-dveri-dlya-ofisa/',   label: 'Скрытые двери для офиса' },
  { href: '/catalog/skrytye-dveri-novostroyka/',  label: 'Скрытые двери в новостройку' },
  { href: '/catalog/skrytye-dveri-dizayn-proekt/', label: 'Скрытые двери для дизайн-проекта' },
  { href: '/catalog/skrytye-dveri/raboty/',       label: 'Наши работы со скрытыми дверями' },
]

export const SITE_LINK_GROUPS: SiteLinkGroup[] = [
  {
    title: 'Каталог',
    links: [
      { href: '/catalog/',        label: 'Межкомнатные двери' },
      { href: '/catalog/series/', label: 'Все серии дверей' },
      { href: '/vhodnye-dveri/',  label: 'Входные двери' },
      { href: '/partitions/',     label: 'Алюминиевые перегородки' },
      { href: '/catalog/decor/',  label: 'Декор для дверей' },
      { href: '/akcii/',          label: 'Акции' },
    ],
  },
  { title: 'По покрытию',      links: COATING_LINKS },
  { title: 'По цвету и стилю', links: [...COLOR_LINKS, ...STYLE_LINKS] },
  { title: 'Скрытые двери',    links: HIDDEN_DOOR_LINKS },
  {
    title: 'Компания',
    links: [
      { href: '/portfolio/',                   label: 'Портфолио' },
      { href: '/reviews/',                     label: 'Отзывы клиентов' },
      { href: '/articles/',                    label: 'Статьи' },
      { href: '/designers/',                   label: 'Дизайнерам и архитекторам' },
      { href: '/dostavka-montazh-po-rayonam/', label: 'Доставка и монтаж по районам' },
      { href: '/about/',                      label: 'О салоне' },
      { href: '/o-fabrike/',                   label: 'О фабрике' },
      { href: '/contacts/',                    label: 'Контакты' },
    ],
  },
]

/**
 * «Смотрите также» для лендинга: соседние страницы того же типа и по одной
 * из соседних групп — чтобы лендинги связывались друг с другом, а не только
 * через каталог. Текущая страница (по href) исключается.
 */
export function relatedLandings(currentHref: string, kind: 'coating' | 'color' | 'style'): SiteLinkGroup[] {
  const groups: SiteLinkGroup[] = [
    { title: 'По покрытию', links: COATING_LINKS },
    { title: 'По цвету',    links: COLOR_LINKS },
    { title: 'По стилю',    links: STYLE_LINKS },
  ]
  const order = { coating: 0, color: 1, style: 2 }[kind]
  return [groups[order]!, ...groups.filter((_, i) => i !== order)]
    .map(g => ({ ...g, links: g.links.filter(l => l.href !== currentHref) }))
    .filter(g => g.links.length > 0)
}
