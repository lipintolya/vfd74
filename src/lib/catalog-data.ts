/**
 * src/lib/catalog-data.ts
 * Единый источник карточек каталога (модель+цвет из Supabase, нормализованные
 * в CatalogCardItem) — используется /catalog и страницами серий, чтобы не
 * дублировать JOIN и нормализацию цветов в каждом месте.
 */
import { supabase } from './supabase'
import { buildModelSlugMap } from './slugify'
import { getSeriesSpec } from '../data/series-descriptions'
import { adjustPrice } from './price-adjustments'
import { isNewModel } from './new-models'
import { isPopularSeries } from './popular-series'
import { formatTrim } from './trim-labels'
import type { CatalogCardItem } from '../components/catalog/types'

const normalizeHexColor = (value: string | null | undefined) => {
  const normalized = (value ?? '')
    .trim()
    .replaceAll('С', 'C')
    .replaceAll('с', 'c')

  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(normalized)
    ? normalized
    : '#cccccc'
}

export async function getCatalogCards(): Promise<{
  cards: CatalogCardItem[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('model_colors')
    .select(`
      price_rrp,
      photo_url,
      colors (
        id,
        name,
        hex_preview,
        coating_id,
        coatings ( id, name, slug )
      ),
      models (
        id,
        name,
        has_glass,
        trim,
        series (
          id,
          name,
          slug,
          coating_id,
          coatings ( id, name, slug )
        )
      )
    `)
    .order('price_rrp', { ascending: true })

  if (error) console.error('Supabase error:', error.message)

  /* ── Полный набор цветов на модель (по всем строкам, не только первой) —
     нужен для корректной фильтрации: модель может подходить под фильтр
     «цвет X», даже если её карточка показывает другой цвет как основной.
     Свотчи (name+hex) — та же карта, чтобы на карточке в каталоге сразу было
     видно все доступные цвета, а не только тот, что выбран для обложки. ── */
  const colorsByModel = new Map<string, string[]>()
  const colorSwatchesByModel = new Map<string, { name: string; hex: string; price: number | null; photo: string; available: boolean }[]>()
  for (const row of (data ?? [])) {
    const model = row.models as any
    const color = row.colors as any
    if (!model || !color?.name) continue
    const seriesSlug = model?.series?.slug ?? ''
    const list = colorsByModel.get(model.id) ?? []
    if (!list.includes(color.name)) list.push(color.name)
    colorsByModel.set(model.id, list)

    const swatches = colorSwatchesByModel.get(model.id) ?? []
    if (row.photo_url && !swatches.some(s => s.name === color.name)) {
      swatches.push({
        name:      color.name,
        hex:       normalizeHexColor(color.hex_preview),
        price:     adjustPrice(seriesSlug, row.price_rrp ?? null),
        photo:     row.photo_url,
        available: true,
      })
    }
    colorSwatchesByModel.set(model.id, swatches)
  }

  /* ── Нормализуем: 1 модель = 1 карточка (первый цвет — для витрины) ── */
  const cards: CatalogCardItem[] = []
  const seen = new Set<string>()

  for (const row of (data ?? [])) {
    const model   = row.models as any
    const color   = row.colors as any
    if (!model || !color) continue
    if (seen.has(model.id)) continue
    seen.add(model.id)

    const series  = model?.series  as any
    const coating = series?.coatings ?? color?.coatings as any
    const seriesSlug = series?.slug ?? ''

    cards.push({
      id:          model.id,
      slug:        '',
      name:        model.name,
      series:      series?.name   ?? '—',
      seriesSlug,
      coating:     coating?.name  ?? '—',
      coatingSlug: coating?.slug  ?? '',
      colorName:   color.name,
      colorHex:    normalizeHexColor(color.hex_preview),
      trim:        formatTrim(model.trim),
      colorNames:  colorsByModel.get(model.id) ?? [color.name],
      colorSwatches: colorSwatchesByModel.get(model.id) ?? [{ name: color.name, hex: normalizeHexColor(color.hex_preview), price: adjustPrice(seriesSlug, row.price_rrp ?? null), photo: row.photo_url ?? '', available: Boolean(row.photo_url) }],
      photo:       row.photo_url  ?? '',
      price:       adjustPrice(seriesSlug, row.price_rrp ?? null),
      hasGlass:    model.has_glass ?? false,
      isNew:       isNewModel(model.id),
      isPopular:   isPopularSeries(seriesSlug),
    })
  }

  /* ── Читаемые слаги вместо UUID — та же функция, что и в /models/[id].astro,
     иначе ссылки карточек разойдутся с реально сгенерированными маршрутами ── */
  const slugMap = buildModelSlugMap(cards.map(c => ({ id: c.id, name: c.name, seriesSlug: c.seriesSlug })))
  for (const card of cards) {
    card.slug = slugMap.get(card.id)!
  }

  return { cards, error: error?.message ?? null }
}

export interface SeriesListItem {
  slug:        string
  name:        string
  coatingSlug: string
  coatingName: string
  modelCount:  number
  minPrice:    number | null
}

/** Группирует уже загруженные карточки по сериям — без второго запроса к Supabase. */
export function getSeriesList(cards: CatalogCardItem[]): SeriesListItem[] {
  const bySlug = new Map<string, SeriesListItem>()

  for (const card of cards) {
    if (!card.seriesSlug) continue
    const existing = bySlug.get(card.seriesSlug)
    if (existing) {
      existing.modelCount++
      if (card.price != null && (existing.minPrice == null || card.price < existing.minPrice)) {
        existing.minPrice = card.price
      }
      continue
    }
    bySlug.set(card.seriesSlug, {
      slug:        card.seriesSlug,
      name:        card.series,
      coatingSlug: card.coatingSlug,
      coatingName: card.coating,
      modelCount:  1,
      minPrice:    card.price,
    })
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

/** Карточки одной серии, отсортированные по цене — для страницы серии. */
export function getSeriesCards(cards: CatalogCardItem[], seriesSlug: string): CatalogCardItem[] {
  return cards
    .filter(c => c.seriesSlug === seriesSlug)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
}

export interface SeriesCardData extends SeriesListItem {
  tagline: string
  /** Обложка — heroImage из SeriesSpec, либо фото первой (по цене) модели серии. */
  cover: string
}

/** Данные для карточки серии (хаб /catalog/series, полоса серий на /catalog) —
    та же форма в обоих местах, чтобы не расходились при правках. */
export function getSeriesCardsData(cards: CatalogCardItem[]): SeriesCardData[] {
  return getSeriesList(cards).map(series => {
    const spec = getSeriesSpec(series.slug, series.coatingSlug)
    const seriesCards = getSeriesCards(cards, series.slug)
    return {
      ...series,
      tagline: spec.tagline,
      cover:   spec.previewImage || spec.heroImage || seriesCards[0]?.photo || '',
    }
  })
}
