<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import CatalogEmptyState from './CatalogEmptyState.vue'
import CatalogFilters from './CatalogFilters.vue'
import CatalogGrid from './CatalogGrid.vue'
import CatalogPagination from './CatalogPagination.vue'
import type { CatalogCardItem, CatalogFilterOption, CatalogSort } from './types'

const mobileFiltersOpen = ref(false)

/* ============================================================
   Props
   ============================================================ */
const props = defineProps<{
  cards: CatalogCardItem[]
  series: CatalogFilterOption[]
  coatings: CatalogFilterOption[]
  colors: CatalogFilterOption[]
  initialSeries: string
  initialCoating: string
  initialColor: string
}>()

const allCards    = props.cards
const allSeries   = props.series
const allCoatings = props.coatings
const allColors   = props.colors

/* ============================================================
   Filter state
   ============================================================ */
const activeSeries  = ref(props.initialSeries)
const activeCoating = ref(props.initialCoating)
const activeColor   = ref(props.initialColor)

/* initialSeries/initialCoating/initialColor приходят из Astro.url.searchParams
   на сервере — при статической сборке (output: "static") этот URL всегда
   пустой, так что пропы всегда ''. Ссылки вида /catalog?series=X реально
   фильтруют только благодаря этому: читаем настоящий URL браузера при
   маунте и досеиваем состояние фильтров. */
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const series  = params.get('series')
  const coating = params.get('coating')
  const color   = params.get('color')
  if (series)  activeSeries.value  = series
  if (coating) activeCoating.value = coating
  if (color)   activeColor.value   = color
})
const glassOnly     = ref(false)
const searchQuery   = ref('')
const sortBy        = ref<CatalogSort>('popular')
const currentPage   = ref(1)
// 24 = кратно и 2, и 3, и 4 колонкам грида (sm/lg/xl) — последняя строка
// страницы всегда заполнена целиком, без одинокой карточки в углу
const itemsPerPage  = 24

/* ============================================================
   Filtered & sorted cards
   ============================================================ */
const filteredCards = computed(() => {
  let result = allCards

  if (activeSeries.value)
    result = result.filter(c => c.seriesSlug === activeSeries.value)

  if (activeCoating.value)
    result = result.filter(c => c.coatingSlug === activeCoating.value)

  if (activeColor.value)
    result = result.filter(c => c.colorNames.includes(activeColor.value))

  if (glassOnly.value)
    result = result.filter(c => c.hasGlass)

  const query = searchQuery.value.trim().toLowerCase()
  if (query)
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.series.toLowerCase().includes(query) ||
      c.coating.toLowerCase().includes(query) ||
      c.colorNames.some(name => name.toLowerCase().includes(query))
    )

  // Сортировка по цене — всегда по цене за полотно (card.price), не за комплект:
  // комплект зависит от цвета/покрытия и не задаёт единый порядок по всему каталогу.
  if (sortBy.value === 'popular')
    // Серии из popular-series.ts — вперёд (сейчас есть в наличии/в работе),
    // внутри группы — по цене по возрастанию. Дефолт каталога: раньше им
    // была чистая price_asc, из-за неё каталог открывался Протач-сериями
    // (Некст и т.п. — самые дешёвые, но не в наличии), это не в интересах
    // салона.
    result = [...result].sort((a, b) => {
      const byPopularity = Number(b.isPopular) - Number(a.isPopular)
      if (byPopularity !== 0) return byPopularity
      return (a.price ?? 999999) - (b.price ?? 999999)
    })
  else if (sortBy.value === 'price_asc')
    result = [...result].sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999))
  else if (sortBy.value === 'price_desc')
    result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  else
    result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ru'))

  return result
})

/* ============================================================
   Helpers
   ============================================================ */
const resetFilters = () => {
  activeSeries.value  = ''
  activeCoating.value = ''
  activeColor.value   = ''
  glassOnly.value     = false
  searchQuery.value   = ''
  sortBy.value        = 'popular'
}

const hasActiveFilters = computed(() =>
  Boolean(activeSeries.value || activeCoating.value || activeColor.value || glassOnly.value || searchQuery.value)
)

const activeSeriesLabel = computed(() =>
  allSeries.find(item => item.value === activeSeries.value)?.label
)

const activeCoatingLabel = computed(() =>
  allCoatings.find(item => item.value === activeCoating.value)?.label
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCards.value.length / itemsPerPage))
)

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCards.value.slice(start, start + itemsPerPage)
})

const visiblePages = computed<Array<number | string>>(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})

const goToPage = (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

watch(
  [activeSeries, activeCoating, activeColor],
  ([series, coating, color]) => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    series ? url.searchParams.set('series', series) : url.searchParams.delete('series')
    coating ? url.searchParams.set('coating', coating) : url.searchParams.delete('coating')
    color ? url.searchParams.set('color', color) : url.searchParams.delete('color')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }
)

watch(
  [activeSeries, activeCoating, activeColor, glassOnly, searchQuery, sortBy],
  () => {
    currentPage.value = 1
  }
)
</script>

<template>
  <section class="grid scroll-mt-28 gap-8" aria-labelledby="catalog-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id="catalog-title" class="t-h1 text-step-5 m-0 mb-1.5 leading-tight">Каталог межкомнатных дверей</h2>
        <p class="m-0 text-base text-slate-600">
          Найдено: <strong class="font-medium text-ink">{{ filteredCards.length }}</strong>
          {{ filteredCards.length === 1 ? 'товар' : 'товаров' }}
        </p>
      </div>

      <label class="flex items-center gap-2.5">
        <span class="text-step-1 font-semibold text-slate-600">Сортировка:</span>
        <select v-model="sortBy" class="min-h-11.5 min-w-62 rounded-lg border-2 border-slate-200 bg-white px-4 text-step-1 font-semibold text-ink focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15">
          <option value="popular">Популярные</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="name">По названию</option>
        </select>
      </label>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[15rem_1fr] lg:gap-7">

      <div>
        <!-- Mobile filter toggle -->
        <button
          type="button"
          class="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-200 px-4.5 py-2.5 text-sm font-semibold text-slate-600 transition lg:hidden"
          :class="hasActiveFilters ? 'border-teal-300 text-teal-700' : ''"
          @click="mobileFiltersOpen = !mobileFiltersOpen"
        >
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h18M7 10h10M11 16h2" />
          </svg>
          <span>{{ mobileFiltersOpen ? 'Скрыть фильтры' : 'Показать фильтры' }}</span>
          <span v-if="hasActiveFilters" class="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">
            {{ [activeSeries, activeCoating, activeColor, glassOnly, searchQuery].filter(Boolean).length }}
          </span>
        </button>

        <CatalogFilters
          class="lg:block"
          :class="mobileFiltersOpen ? 'block' : 'hidden'"
          v-model:active-series="activeSeries"
          v-model:active-coating="activeCoating"
          v-model:active-color="activeColor"
          v-model:glass-only="glassOnly"
          v-model:search-query="searchQuery"
          :series="allSeries"
          :coatings="allCoatings"
          :colors="allColors"
          :total-count="allCards.length"
          :filtered-count="filteredCards.length"
          :has-active-filters="hasActiveFilters"
          @reset="resetFilters"
        />
      </div>

      <div class="flex flex-col gap-6">
        <CatalogEmptyState
          v-if="filteredCards.length === 0"
          @reset="resetFilters"
        />
        <CatalogGrid
          v-else
          :cards="paginatedCards"
        />

        <CatalogPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :visible-pages="visiblePages"
          @change="goToPage"
        />
      </div>
    </div>
  </section>
</template>
