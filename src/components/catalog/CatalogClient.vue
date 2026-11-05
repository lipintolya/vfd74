<script setup lang="ts">
/**
 * Каталог моделей: покрытия сверху (карточки с фото на /catalog/, сегменты на
 * лендингах), фильтры, сортировка, сетка и страницы. Всё считается в браузере
 * (src/lib/catalog-filter.ts), без перезагрузки; выбранное пишется в адрес
 * (?coating=&series=&color=&price=&glass=) — ссылкой можно поделиться.
 *
 * Компьютер: фильтры колонкой слева, липкие. Телефон и планшет: строка
 * «порядок / фильтры» прилипает под шапкой, фильтры — шторкой снизу; кнопка
 * внизу шторки сразу говорит, сколько моделей останется.
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import CatalogEmptyState from './CatalogEmptyState.vue'
import CatalogFilters from './CatalogFilters.vue'
import CatalogGrid from './CatalogGrid.vue'
import CatalogPagination from './CatalogPagination.vue'
import type { CatalogCardItem, CatalogFilterOption, CatalogSort } from './types'
import {
  filterCards, sortCards, facetCounts, coatingRank, parseFilterParams, filterParamsString,
  PRICE_BUCKETS, GLASS_OPTIONS, type CatalogFilterState, type GlassOption,
} from '../../lib/catalog-filter'
import { COLOR_FAMILIES, type ColorFamilySlug } from '../../data/color-families'
import { pluralRu } from '../../lib/plural'

export interface CoatingCard {
  value: string
  label: string
  /** Фото двери в интерьере (превью 900w) */
  cover: string
  minPrice: number | null
}

const props = withDefaults(defineProps<{
  cards: CatalogCardItem[]
  series: CatalogFilterOption[]
  coatings: CatalogFilterOption[]
  /** Покрытие, выбранное сразу (лендинги по покрытию) */
  initialCoating?: string
  /** Карточки покрытий с фото над каталогом; нет — покрытия сегментами */
  coatingCards?: CoatingCard[]
  title?: string
  /** Заголовок только для экранных читалок — у страницы свой H1 прямо над каталогом */
  hideTitle?: boolean
}>(), {
  initialCoating: '',
  coatingCards: () => [],
  title: 'Каталог межкомнатных дверей',
  hideTitle: false,
})

const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')}\u00a0₽`
const modelsWord = (n: number) => pluralRu(n, ['модель', 'модели', 'моделей'])

/* ── Выбранное ── */
const coating = ref(props.initialCoating)
const series  = ref<string[]>([])
const colors  = ref<ColorFamilySlug[]>([])
const prices  = ref<string[]>([])
const glass   = ref<GlassOption[]>([])
const sortBy  = ref<CatalogSort>('popular')
const currentPage = ref(1)
/* 24 делится на 2, 3 и 4 колонки — последний ряд страницы всегда полный */
const ITEMS_PER_PAGE = 24

const filters = computed<CatalogFilterState>(() => ({
  coating: coating.value, series: series.value, colors: colors.value, prices: prices.value, glass: glass.value,
}))

/* Сайт статический: на сборке адрес без параметров — фильтры из ссылки
   читаем уже в браузере. Старые ссылки ?color=<название цвета> переводим
   в группу этого цвета. */
const familyByColorName = new Map(props.cards.flatMap((c) => c.colorSwatches.map((s) => [s.name, s.family] as const)))
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (![...params.keys()].length) return
  const state = parseFilterParams(params, (name) => familyByColorName.get(name) ?? null)
  coating.value = state.coating || coating.value
  series.value = state.series
  colors.value = state.colors
  prices.value = state.prices
  glass.value = state.glass
})

const filteredCards = computed(() => sortCards(filterCards(props.cards, filters.value), sortBy.value))

/* ── Варианты фильтров: только те, при которых что-то найдётся ── */
const coatingOfSeries = new Map(props.cards.map((c) => [c.seriesSlug, c.coatingSlug]))
const keep = (counts: Map<string, number>, selected: readonly string[]) => (value: string) =>
  (counts.get(value) ?? 0) > 0 || selected.includes(value)

const coatingCounts = computed(() => facetCounts(props.cards, filters.value, 'coating'))
const coatingTotal  = computed(() => filterCards(props.cards, filters.value, 'coating').length)
const coatingOptions = computed(() =>
  [...props.coatings]
    .sort((a, b) => coatingRank(a.value) - coatingRank(b.value))
    .filter((o) => keep(coatingCounts.value, [coating.value])(o.value)),
)

/* Карточки покрытий — описание ассортимента, не зависят от других фильтров */
const coatingCardItems = computed(() =>
  [...props.coatingCards]
    .sort((a, b) => coatingRank(a.value) - coatingRank(b.value))
    .map((c) => ({ ...c, count: props.cards.filter((m) => m.coatingSlug === c.value).length })),
)

const seriesOptions = computed(() => {
  const ok = keep(facetCounts(props.cards, filters.value, 'series'), series.value)
  return props.series
    .filter((o) => ok(o.value))
    .sort((a, b) =>
      coatingRank(coatingOfSeries.get(a.value) ?? '') - coatingRank(coatingOfSeries.get(b.value) ?? '') ||
      a.label.localeCompare(b.label, 'ru'))
})

/* Образец группы цвета — самый частый в ней цвет у моделей каталога
   (у «серых» — серый, а не голубоватый «муссон») */
const familySample = (() => {
  const counts = new Map<string, Map<string, number>>()
  for (const s of props.cards.flatMap((c) => c.colorSwatches)) {
    const byHex = counts.get(s.family) ?? new Map<string, number>()
    byHex.set(s.hex, (byHex.get(s.hex) ?? 0) + 1)
    counts.set(s.family, byHex)
  }
  return new Map([...counts].map(([family, byHex]) => [family, [...byHex].sort((a, b) => b[1] - a[1])[0]?.[0]]))
})()

const colorGroups = computed(() => {
  const ok = keep(facetCounts(props.cards, filters.value, 'colors'), colors.value)
  const items = COLOR_FAMILIES.filter((f) => ok(f.slug))
  return [...new Set(items.map((f) => f.group))].map((title) => ({
    title,
    items: items.filter((f) => f.group === title).map((f) => ({ value: f.slug, label: f.label, color: familySample.get(f.slug) })),
  }))
})

const priceOptions = computed(() => {
  const ok = keep(facetCounts(props.cards, filters.value, 'prices'), prices.value)
  return PRICE_BUCKETS.filter((b) => ok(b.slug)).map((b) => ({ value: b.slug, label: b.label }))
})

const glassOptions = computed(() => {
  const ok = keep(facetCounts(props.cards, filters.value, 'glass'), glass.value)
  return GLASS_OPTIONS.filter((g) => ok(g.slug)).map((g) => ({ value: g.slug, label: g.label }))
})

/* ── Выбранное чипами — снимается по одному ── */
type ChipKey = 'coating' | 'series' | 'colors' | 'prices' | 'glass'
const labelOf = (list: readonly { value?: string; slug?: string; label: string }[], value: string) =>
  list.find((o) => (o.value ?? o.slug) === value)?.label ?? value
const chips = computed(() => [
  ...(coating.value && coating.value !== props.initialCoating
    ? [{ key: 'coating' as ChipKey, value: coating.value, label: labelOf(props.coatings, coating.value) }] : []),
  ...series.value.map((v) => ({ key: 'series' as ChipKey, value: v, label: `Серия ${labelOf(props.series, v)}` })),
  ...colors.value.map((v) => ({ key: 'colors' as ChipKey, value: v, label: labelOf(COLOR_FAMILIES, v) })),
  ...prices.value.map((v) => ({ key: 'prices' as ChipKey, value: v, label: labelOf(PRICE_BUCKETS, v) })),
  ...glass.value.map((v) => ({ key: 'glass' as ChipKey, value: v, label: labelOf(GLASS_OPTIONS, v) })),
])
const removeChip = (key: ChipKey, value: string) => {
  if (key === 'coating') coating.value = props.initialCoating
  else if (key === 'series') series.value = series.value.filter((v) => v !== value)
  else if (key === 'colors') colors.value = colors.value.filter((v) => v !== value)
  else if (key === 'prices') prices.value = prices.value.filter((v) => v !== value)
  else glass.value = glass.value.filter((v) => v !== value)
}
/* Фильтры в колонке/шторке (покрытие — отдельно, наверху) */
const panelCount = computed(() => series.value.length + colors.value.length + prices.value.length + glass.value.length)

const resetPanel = () => {
  series.value = []
  colors.value = []
  prices.value = []
  glass.value = []
}
const resetFilters = () => {
  coating.value = props.initialCoating
  resetPanel()
}

/* ── Страницы ── */
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCards.value.length / ITEMS_PER_PAGE)))
const pageStart = computed(() => (currentPage.value - 1) * ITEMS_PER_PAGE)
const paginatedCards = computed(() => filteredCards.value.slice(pageStart.value, pageStart.value + ITEMS_PER_PAGE))

const visiblePages = computed<Array<number | string>>(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})

/* Новая страница — к началу сетки: иначе после «Далее» внизу страницы
   человек остаётся под новыми карточками */
const resultsRef = ref<HTMLElement | null>(null)
const smoothScroll = () => !matchMedia('(prefers-reduced-motion: reduce)').matches
const toResults = () => resultsRef.value?.scrollIntoView({ behavior: smoothScroll() ? 'smooth' : 'auto', block: 'start' })
const goToPage = async (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  await nextTick()
  toResults()
}

/* Выбор покрытия карточкой: если сетка ниже экрана — показываем её */
const pickCoating = async (value: string) => {
  coating.value = coating.value === value ? '' : value
  await nextTick()
  if ((resultsRef.value?.getBoundingClientRect().top ?? 0) > window.innerHeight * 0.6) toResults()
}

/* Покрытие лендинга в адрес не пишем — оно и так в самой странице.
   Фильтр поменяли, листая сетку ниже её начала, — выдача стала короче, и
   человек оказался бы под ней: возвращаем к началу выдачи. */
watch(filters, async (f) => {
  const qs = filterParamsString(f.coating === props.initialCoating ? { ...f, coating: '' } : f)
  window.history.replaceState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`)
  await nextTick()
  if ((resultsRef.value?.getBoundingClientRect().top ?? 0) < 0) toResults()
})

watch([filters, sortBy], () => { currentPage.value = 1 })

/* ── Шторка фильтров на телефоне — модальный диалог ── */
const sheetOpen = ref(false)
const sheetToggleRef = ref<HTMLButtonElement | null>(null)
const sheetCloseRef  = ref<HTMLButtonElement | null>(null)
watch(sheetOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    sheetCloseRef.value?.focus()
  } else {
    sheetToggleRef.value?.focus({ preventScroll: true })
  }
})
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && sheetOpen.value) sheetOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (sheetOpen.value) document.body.style.overflow = ''
})

/* Teleport в серверно-отрисованном острове — только после монтирования:
   на сервере содержимое Teleport уходит в отдельный буфер, и гидратация
   не сходится («Hydration completed but contains mismatches») */
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })
</script>

<template>
  <section class="cat" aria-labelledby="catalog-title">
    <h2 id="catalog-title" class="t-h2 cat__title" :class="{ 'sr-only': hideTitle }">{{ title }}</h2>

    <!-- Покрытия — главный выбор, поэтому над каталогом -->
    <ul v-if="coatingCardItems.length" class="cc" role="list" aria-label="Покрытие">
      <li v-for="(c, i) in coatingCardItems" :key="c.value">
        <button
          type="button"
          class="cc__card"
          :class="{ 'is-dim': coating && coating !== c.value }"
          :aria-pressed="coating === c.value"
          @click="pickCoating(c.value)"
        >
          <span class="cc__media">
            <img
              v-if="c.cover"
              :src="c.cover"
              :alt="`Межкомнатная дверь, покрытие ${c.label}, в интерьере`"
              width="360"
              height="450"
              :loading="i < 3 ? 'eager' : 'lazy'"
              decoding="async"
            />
          </span>
          <span class="cc__name">{{ c.label }}</span>
          <span class="cc__meta">{{ c.count }} {{ modelsWord(c.count) }}<template v-if="c.minPrice">, от&nbsp;{{ rub(c.minPrice) }}</template></span>
        </button>
      </li>
    </ul>
    <div v-else-if="coatingOptions.length > 1" class="seg" role="group" aria-label="Покрытие">
      <button type="button" class="seg__btn" :aria-pressed="!coating" @click="coating = ''">
        Все <span class="seg__count">{{ coatingTotal }}</span>
      </button>
      <button
        v-for="o in coatingOptions"
        :key="o.value"
        type="button"
        class="seg__btn"
        :aria-pressed="coating === o.value"
        @click="coating = coating === o.value ? '' : o.value"
      >
        {{ o.label }} <span class="seg__count">{{ coatingCounts.get(o.value) ?? 0 }}</span>
      </button>
    </div>

    <div class="cat__layout">
      <aside class="cat__aside" aria-label="Фильтры каталога">
        <div class="cat__aside-head">
          <p class="cat__aside-title">Фильтры</p>
          <button v-if="panelCount" type="button" class="cat__reset" @click="resetPanel">Сбросить</button>
        </div>
        <CatalogFilters
          v-model:prices="prices"
          v-model:series="series"
          v-model:colors="colors"
          v-model:glass="glass"
          :price-options="priceOptions"
          :series-options="seriesOptions"
          :color-groups="colorGroups"
          :glass-options="glassOptions"
        />
      </aside>

      <div ref="resultsRef" class="cat__results">
        <div class="cat__bar">
          <label class="cat__sort">
            <span class="sr-only">Порядок</span>
            <select v-model="sortBy" class="cat__select">
              <option value="popular">Сначала популярные</option>
              <option value="price_asc">Сначала дешевле</option>
              <option value="price_desc">Сначала дороже</option>
              <option value="name">По названию</option>
            </select>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </label>
          <p class="cat__found" aria-live="polite">Найдено {{ filteredCards.length }} {{ modelsWord(filteredCards.length) }}</p>
          <button ref="sheetToggleRef" type="button" class="cat__filters-btn" aria-haspopup="dialog" @click="sheetOpen = true">
            Фильтры
            <span v-if="panelCount" class="cat__badge">{{ panelCount }}</span>
            <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5.5h14M5.5 10h9M8 14.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </button>
        </div>

        <ul v-if="chips.length" class="cat__chips" role="list" aria-label="Выбранные фильтры">
          <li v-for="chip in chips" :key="`${chip.key}-${chip.value}`">
            <button type="button" class="cat__chip" :aria-label="`Убрать фильтр: ${chip.label}`" @click="removeChip(chip.key, chip.value)">
              {{ chip.label }}
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </button>
          </li>
          <li v-if="chips.length > 1">
            <button type="button" class="cat__reset" @click="resetFilters">Сбросить всё</button>
          </li>
        </ul>

        <div class="cat__list">
          <CatalogEmptyState v-if="filteredCards.length === 0" @reset="resetFilters" />
          <CatalogGrid v-else :cards="paginatedCards" :prefer-families="colors" />
        </div>

        <div v-if="totalPages > 1" class="cat__pages">
          <CatalogPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :visible-pages="visiblePages"
            @change="goToPage"
          />
          <p class="cat__range">
            {{ pageStart + 1 }}–{{ pageStart + paginatedCards.length }} из {{ filteredCards.length }}
          </p>
        </div>
      </div>
    </div>

    <!-- Шторка фильтров на телефоне -->
    <Teleport v-if="isMounted" to="body">
      <Transition name="cat-fade">
        <div v-if="sheetOpen" class="cat-sheet__backdrop" @click="sheetOpen = false" />
      </Transition>
      <Transition name="cat-sheet">
        <div v-if="sheetOpen" class="cat-sheet" role="dialog" aria-modal="true" aria-labelledby="cat-sheet-title">
          <div class="cat-sheet__head">
            <h2 id="cat-sheet-title" class="cat-sheet__title">Фильтры</h2>
            <button ref="sheetCloseRef" type="button" class="cat-sheet__close" aria-label="Закрыть фильтры" @click="sheetOpen = false">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </button>
          </div>
          <div class="cat-sheet__body">
            <CatalogFilters
              v-model:prices="prices"
              v-model:series="series"
              v-model:colors="colors"
              v-model:glass="glass"
              :price-options="priceOptions"
              :series-options="seriesOptions"
              :color-groups="colorGroups"
              :glass-options="glassOptions"
            />
          </div>
          <div class="cat-sheet__foot">
            <button v-if="panelCount" type="button" class="btn btn-outline cat-sheet__btn" @click="resetPanel">Сбросить</button>
            <button type="button" class="btn btn-primary cat-sheet__btn cat-sheet__btn--main" @click="sheetOpen = false">
              Показать {{ filteredCards.length }} {{ modelsWord(filteredCards.length) }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.cat {
  /* = поле .container (global.css) — ленты и липкая строка уходят до края экрана */
  --cat-pad: clamp(1rem, 4vw, 2rem);
}
.cat__title { margin: 0 0 clamp(1.5rem, 3vw, 2rem); }

/* ── Покрытия карточками: фото в интерьере ── */
.cc {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: clamp(1rem, 1.6vw, 1.5rem);
  margin: 0 0 clamp(2.5rem, 5vw, 3.5rem);
  padding: 0;
  list-style: none;
}
.cc__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  color: var(--color-ink);
  cursor: pointer;
  transition: opacity 200ms var(--ease-out);
}
.cc__card.is-dim { opacity: 0.45; }
.cc__card.is-dim:hover { opacity: 0.8; }
.cc__media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #e4e4e7;
  transition: box-shadow 200ms var(--ease-out);
}
.cc__media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 600ms var(--ease-out); }
@media (hover: hover) {
  .cc__card:hover .cc__media img { transform: scale(1.03); }
}
/* Выбранное покрытие — графитовое кольцо вокруг фото */
.cc__card[aria-pressed='true'] .cc__media { box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color-fg); }
.cc__name { margin-top: 0.875rem; font-size: var(--text-step-2); font-weight: 600; letter-spacing: -0.01em; }
.cc__meta { margin-top: 0.125rem; font-size: 0.875rem; color: #71717a; font-variant-numeric: tabular-nums; }
.cc__card:focus-visible { outline: none; }
.cc__card:focus-visible .cc__media { outline: 2px solid var(--color-accent); outline-offset: 3px; }

/* Телефон: лента вбок — край следующей карточки подсказывает, что листается */
@media (max-width: 47.9375rem) {
  .cc {
    grid-auto-flow: column;
    grid-auto-columns: 40%;
    grid-template-columns: none;
    gap: 0.75rem;
    margin-inline: calc(-1 * var(--cat-pad));
    padding: 0.25rem var(--cat-pad);
    scroll-padding-inline: var(--cat-pad);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .cc::-webkit-scrollbar { display: none; }
  .cc > li { scroll-snap-align: start; }
  .cc__name { font-size: var(--text-step-1); }
  .cc__meta { font-size: 0.8125rem; }
}

/* ── Покрытия сегментами (лендинги): дорожка и графитовая «таблетка»,
   как вкладки «Новинок» на главной ── */
.seg {
  display: flex;
  gap: 0.25rem;
  width: fit-content;
  max-width: 100%;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  padding: 0.25rem;
  border-radius: 999px;
  background: #f4f4f5;
  overflow-x: auto;
  scrollbar-width: none;
}
.seg::-webkit-scrollbar { display: none; }
.seg__btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border: 0;
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #52525b;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 200ms var(--ease-out), color 200ms var(--ease-out);
}
.seg__btn:hover { color: var(--color-fg); }
.seg__btn[aria-pressed='true'] { background: var(--color-fg); color: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / 0.2); }
.seg__count { font-weight: 500; opacity: 0.6; font-variant-numeric: tabular-nums; }

/* ── Колонка фильтров и сетка ── */
.cat__layout { display: grid; gap: 0 2.5rem; align-items: start; }
.cat__aside { display: none; }
@media (min-width: 64rem) {
  .cat__layout { grid-template-columns: 15rem minmax(0, 1fr); }
  /* Липкая колонка; длиннее экрана — прокручивается сама */
  .cat__aside {
    position: sticky;
    top: calc(var(--header-height) + 1.25rem);
    display: block;
    max-height: calc(100dvh - var(--header-height) - 2.5rem);
    margin: -0.25rem;
    padding: 0.25rem 0.75rem 1rem 0.25rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
}
.cat__aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-fg);
}
.cat__aside-title { margin: 0; font-size: var(--text-step-2); font-weight: 600; letter-spacing: -0.01em; color: var(--color-ink); }

.cat__results { min-width: 0; scroll-margin-top: calc(var(--header-height) + 1rem); }

/* Строка над сеткой: порядок и «найдено»; на телефоне — ещё «Фильтры» */
.cat__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e4e4e7;
}
.cat__found { margin: 0; font-size: 0.9375rem; color: #71717a; font-variant-numeric: tabular-nums; }
.cat__sort { position: relative; display: inline-flex; align-items: center; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cat__select {
  min-height: 2.75rem;
  padding: 0 1.5rem 0 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  appearance: none;
  cursor: pointer;
}
.cat__select:focus-visible { outline: none; }
.cat__sort:has(.cat__select:focus-visible) { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: 0.375rem; }
.cat__sort svg { position: absolute; right: 0; width: 1rem; height: 1rem; pointer-events: none; }
.cat__filters-btn {
  display: none;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  cursor: pointer;
}
.cat__filters-btn svg { width: 1.25rem; height: 1.25rem; }
.cat__badge {
  display: inline-grid;
  place-items: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  background: var(--color-fg);
  font-size: 0.75rem;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.cat__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin: 1rem 0 0; padding: 0; list-style: none; }
.cat__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.25rem;
  padding: 0 0.625rem 0 0.875rem;
  border: 0;
  border-radius: 999px;
  background: #f4f4f5;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ink);
  cursor: pointer;
  transition: background-color 150ms var(--ease-out);
}
.cat__chip:hover { background: #e4e4e7; }
.cat__chip svg { width: 0.875rem; height: 0.875rem; color: #71717a; }
.cat__reset {
  padding: 0.375rem 0.25rem;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f766e;
  cursor: pointer;
}
.cat__reset:hover { color: #115e59; }
.cat__aside-head .cat__reset { padding-inline: 0; }

.cat__list { margin-top: clamp(1.5rem, 3vw, 2rem); }
.cat__pages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: clamp(3rem, 5vw, 4rem);
  padding-top: clamp(1.5rem, 3vw, 2rem);
  border-top: 1px solid #e4e4e7;
}
.cat__range { margin: 0; font-size: 0.875rem; color: #a1a1aa; font-variant-numeric: tabular-nums; }

/* Телефон и планшет: колонки фильтров нет — строка «порядок / фильтры»
   прилипает под шапкой, «найдено» — под ней */
@media (max-width: 63.9375rem) {
  .cat__bar {
    position: sticky;
    top: var(--header-height);
    z-index: 5;
    flex-wrap: wrap;
    gap: 0 1rem;
    margin-inline: calc(-1 * var(--cat-pad));
    padding: 0.25rem var(--cat-pad) 0.5rem;
    background: #fff;
  }
  .cat__filters-btn { display: inline-flex; }
  .cat__found { order: 3; width: 100%; font-size: 0.8125rem; }
}

@media (prefers-reduced-motion: reduce) {
  .cc__card, .cc__media, .cc__media img, .cat__chip, .seg__btn { transition: none; }
  .cc__card:hover .cc__media img { transform: none; }
}
</style>

<!-- Шторка уходит в <body> через Teleport — scoped-стили до неё не
     достают, поэтому отдельный блок с уникальным префиксом -->
<style>
.cat-sheet__backdrop {
  position: fixed;
  inset: 0;
  /* Над баннером cookie (9999, BaseLayout): иначе он закрывал кнопку
     «Показать N моделей» у нового посетителя. Мобильное меню — тоже 10000. */
  z-index: 10000;
  background: rgb(0 0 0 / 0.4);
}
.cat-sheet {
  position: fixed;
  inset: auto 0 0;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  max-height: 88dvh;
  background: #fff;
}
.cat-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem 0.5rem 1.25rem;
  border-bottom: 1px solid #e4e4e7;
}
.cat-sheet__title { margin: 0; font-size: var(--text-step-2); font-weight: 600; letter-spacing: -0.01em; color: var(--color-ink); }
.cat-sheet__close {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 999px;
  background: none;
  color: #52525b;
  cursor: pointer;
}
.cat-sheet__close:hover { background: #f4f4f5; }
.cat-sheet__close svg { width: 1.25rem; height: 1.25rem; }
.cat-sheet__body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 0 1.25rem 1rem; }
.cat-sheet__foot {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem max(0.75rem, env(safe-area-inset-bottom));
  border-top: 1px solid #e4e4e7;
}
.cat-sheet__btn { min-height: 3rem; justify-content: center; font-size: 0.9375rem; }
.cat-sheet__btn--main { flex: 1; }

.cat-sheet-enter-active, .cat-sheet-leave-active { transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1); }
.cat-sheet-enter-from, .cat-sheet-leave-to { transform: translateY(100%); }
.cat-fade-enter-active, .cat-fade-leave-active { transition: opacity 250ms ease; }
.cat-fade-enter-from, .cat-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .cat-sheet-enter-active, .cat-sheet-leave-active, .cat-fade-enter-active, .cat-fade-leave-active { transition: none; }
}
</style>
