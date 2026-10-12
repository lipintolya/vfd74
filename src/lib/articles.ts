/**
 * src/lib/articles.ts
 *
 * Единая точка чтения статей блога с учётом отложенной публикации.
 *
 * Статья попадает на сайт, когда наступила её `publishDate`: сайт статический,
 * поэтому решает дата СБОРКИ — страница статьи с будущей датой не
 * генерируется, не попадает в sitemap, на главную, в «Читайте также» и в
 * блоки «Статья по теме». Чтобы статья вышла в нужный день, достаточно
 * любого деплоя в этот день или позже (git push на production).
 *
 * Так даты публикаций остаются настоящими — без «задним числом»: дата на
 * странице, в JSON-LD (datePublished) и og:article:published_time совпадает
 * с днём, когда статья реально появилась.
 *
 * Предпросмотр запланированных статей: `npm run dev` показывает всё;
 * для собранного сайта — ARTICLES_PREVIEW=1 npm run build.
 */
import { getCollection, type CollectionEntry } from 'astro:content'

export type Article = CollectionEntry<'articles'>

const SHOW_SCHEDULED = import.meta.env.DEV || process.env.ARTICLES_PREVIEW === '1'

/** Опубликована ли статья на момент сборки. */
export const isPublished = (article: Article, now: number = Date.now()): boolean =>
  article.data.publishDate.getTime() <= now

/** Все статьи, которые должны быть на сайте при этой сборке. */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles')
  return SHOW_SCHEDULED ? all : all.filter(a => isPublished(a))
}

/** Статьи от новых к старым. */
export const newestFirst = (articles: Article[]): Article[] =>
  [...articles].sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
