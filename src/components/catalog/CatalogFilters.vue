<script setup lang="ts">
/**
 * Фильтры каталога — списки с галочками: цена, серия, цвет, остекление.
 * Внутри группы можно отметить несколько вариантов («белые» и «серые»),
 * группы складываются. Цвет — словами, по группам (src/data/color-families.ts):
 * названия цветов в базе привязаны к покрытию («Эмалекс белый», «Эмаль
 * белая»), и фильтр по точному названию находил лишь часть белых дверей.
 * Варианты, при которых ничего не найдётся, не показываются — их отбирает
 * CatalogClient. Один компонент — в колонке на компьютере и в шторке на телефоне.
 */
import { computed, ref, useId } from 'vue'

export interface FilterOption {
  value: string
  label: string
  /** Образец цвета рядом с подписью */
  color?: string
}

/* Варианты — *Options; выбранное — v-model с теми же именами без суффикса */
const props = defineProps<{
  priceOptions: FilterOption[]
  seriesOptions: FilterOption[]
  colorGroups: { title: string; items: FilterOption[] }[]
  glassOptions: FilterOption[]
}>()

const prices = defineModel<string[]>('prices', { required: true })
const series = defineModel<string[]>('series', { required: true })
const colors = defineModel<string[]>('colors', { required: true })
const glass = defineModel<string[]>('glass', { required: true })

const uid = useId()

const models = { prices, series, colors, glass }
type ModelKey = keyof typeof models
const toggle = (key: ModelKey, value: string) => {
  const model = models[key]
  model.value = model.value.includes(value) ? model.value.filter((v) => v !== value) : [...model.value, value]
}

/* Группы раскрыты; заголовок группы сворачивает её */
const collapsed = ref<Record<string, boolean>>({})
const flip = (key: string) => { collapsed.value[key] = !collapsed.value[key] }

/* Серий около двадцати — первые шесть, остальные по кнопке. Отмеченная
   серия видна всегда, даже если она дальше в списке. */
const SERIES_VISIBLE = 6
const seriesExpanded = ref(false)
const visibleSeries = computed(() => {
  if (seriesExpanded.value || props.seriesOptions.length <= SERIES_VISIBLE + 1) return props.seriesOptions
  return props.seriesOptions.filter((s, i) => i < SERIES_VISIBLE || series.value.includes(s.value))
})
const hiddenSeriesCount = computed(() => props.seriesOptions.length - visibleSeries.value.length)

const groups = computed(() => [
  { key: 'prices' as const, title: 'Цена за полотно', show: props.priceOptions.length > 0 },
  { key: 'series' as const, title: 'Серия', show: props.seriesOptions.length > 1 },
  { key: 'colors' as const, title: 'Цвет', show: props.colorGroups.length > 0 },
  { key: 'glass' as const,  title: 'Остекление', show: props.glassOptions.length > 1 },
].filter((g) => g.show))
</script>

<template>
  <div class="cf">
    <section v-for="g in groups" :key="g.key" class="cf__group">
      <h3 class="cf__heading">
        <button
          type="button"
          class="cf__head"
          :aria-expanded="!collapsed[g.key]"
          :aria-controls="`${uid}-${g.key}`"
          @click="flip(g.key)"
        >
          {{ g.title }}
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 10 4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </h3>

      <div v-show="!collapsed[g.key]" :id="`${uid}-${g.key}`" class="cf__body">
        <template v-if="g.key === 'colors'">
          <div v-for="cg in colorGroups" :key="cg.title" class="cf__sub">
            <p v-if="colorGroups.length > 1" class="cf__subtitle">{{ cg.title }}</p>
            <label v-for="o in cg.items" :key="o.value" class="cf__row">
              <input type="checkbox" class="cf__input" :checked="colors.includes(o.value)" @change="toggle('colors', o.value)" />
              <span class="cf__box" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
              <span v-if="o.color" class="cf__sample" :style="{ backgroundColor: o.color }" aria-hidden="true" />
              <span class="cf__text">{{ o.label }}</span>
            </label>
          </div>
        </template>

        <template v-else>
          <label
            v-for="o in (g.key === 'series' ? visibleSeries : g.key === 'prices' ? priceOptions : glassOptions)"
            :key="o.value"
            class="cf__row"
          >
            <input type="checkbox" class="cf__input" :checked="models[g.key].value.includes(o.value)" @change="toggle(g.key, o.value)" />
            <span class="cf__box" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            <span class="cf__text">{{ o.label }}</span>
          </label>
          <button
            v-if="g.key === 'series' && (hiddenSeriesCount > 0 || seriesExpanded)"
            type="button"
            class="cf__more"
            :aria-expanded="seriesExpanded"
            @click="seriesExpanded = !seriesExpanded"
          >
            {{ seriesExpanded ? 'Свернуть' : `Показать ещё ${hiddenSeriesCount}` }}
          </button>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cf { display: flex; flex-direction: column; }

/* Группы под тонкими линейками */
.cf__group { border-top: 1px solid #e4e4e7; }
.cf__group:first-child { border-top: 0; }
.cf__heading { margin: 0; }
.cf__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-height: 3.25rem;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: var(--text-step-1);
  font-weight: 600;
  color: var(--color-ink);
  text-align: left;
  cursor: pointer;
}
.cf__head svg { flex: none; width: 1rem; height: 1rem; color: #a1a1aa; transition: transform 200ms var(--ease-out); }
.cf__head[aria-expanded='false'] svg { transform: rotate(180deg); }
.cf__body { padding-bottom: 1rem; }

.cf__sub + .cf__sub { margin-top: 0.75rem; }
.cf__subtitle { margin: 0.25rem 0; font-size: 0.8125rem; font-weight: 600; color: #71717a; }

/* Строка-галочка: настоящий checkbox (клавиатура, читалки) спрятан,
   рисуется квадрат рядом */
.cf__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.25rem;
  font-size: 0.9375rem;
  line-height: 1.3;
  color: #52525b;
  cursor: pointer;
  transition: color 150ms var(--ease-out);
}
.cf__row:hover { color: var(--color-ink); }
.cf__input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; pointer-events: none; }
.cf__box {
  display: grid;
  place-items: center;
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 1px solid #a1a1aa;
  background: #fff;
  color: transparent;
  transition: background-color 150ms var(--ease-out), border-color 150ms var(--ease-out);
}
.cf__box svg { width: 0.875rem; height: 0.875rem; }
.cf__row:hover .cf__box { border-color: var(--color-fg); }
.cf__input:checked + .cf__box { border-color: var(--color-fg); background: var(--color-fg); color: #fff; }
.cf__input:checked ~ .cf__text { color: var(--color-ink); font-weight: 500; }
.cf__input:focus-visible + .cf__box { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.cf__sample {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid rgb(0 0 0 / 0.16);
  border-radius: 50%;
}

.cf__more {
  margin-top: 0.25rem;
  padding: 0.375rem 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f766e;
  cursor: pointer;
}
.cf__more:hover { color: #115e59; }

@media (prefers-reduced-motion: reduce) {
  .cf__head svg, .cf__row, .cf__box { transition: none; }
}
</style>
