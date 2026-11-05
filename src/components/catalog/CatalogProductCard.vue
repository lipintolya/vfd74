<script setup lang="ts">
/**
 * Карточка модели в каталоге и на странице серии. Дверь целиком на светлой
 * подложке (как «Другие модели серии» на странице модели), под ней цвета,
 * название, покрытие и цена. Вся карточка — ссылка на модель (растянутая
 * ссылка у названия); кружки цветов лежат выше неё и переключают фото и цену.
 *
 * Статус — одно слово в углу подложки, без плашки: «В наличии» бирюзой,
 * «Новинка» графитом, «Под заказ» серым (src/lib/made-to-order.ts).
 */
import { computed, ref, watch } from 'vue'
import { calcKitPrice } from '../../data/accessories'
import { modelStatus, MODEL_STATUS_LABEL } from '../../lib/made-to-order'
import { thumbSrcset } from '../../lib/model-thumbs.mjs'
import type { ColorFamilySlug } from '../../data/color-families'
import type { CatalogCardItem } from './types'

const props = withDefaults(defineProps<{
  card: CatalogCardItem
  /** Выбранные в фильтре группы цветов — карточка сразу показывает такой цвет */
  preferFamilies?: ColorFamilySlug[]
  /** Первый ряд сетки — фото сразу, не lazy: иначе тормозим LCP */
  priority?: boolean
}>(), {
  preferFamilies: () => [],
  priority: false,
})

/* Неразрывные пробелы: «12 002 ₽» не рвётся на две строки */
const rub = (price: number) => `${price.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')}\u00a0₽`

/* До 5 кружков и «+N» — остальные цвета на странице модели */
const MAX_VISIBLE_SWATCHES = 5
const visibleSwatches = computed(() => props.card.colorSwatches.slice(0, MAX_VISIBLE_SWATCHES))
const extraSwatchCount = computed(() => Math.max(0, props.card.colorSwatches.length - MAX_VISIBLE_SWATCHES))

const activeSwatchIdx = ref(0)
/* Фильтр «белые» — у карточки сразу белый цвет, а не тот, что был первым */
watch(() => props.preferFamilies, (families) => {
  if (!families.length) return
  const current = props.card.colorSwatches[activeSwatchIdx.value]
  if (current && families.includes(current.family)) return
  const idx = props.card.colorSwatches.findIndex((s) => families.includes(s.family))
  if (idx !== -1) activeSwatchIdx.value = idx
}, { immediate: true })

const activeSwatch = computed(() => props.card.colorSwatches[activeSwatchIdx.value] ?? props.card.colorSwatches[0])
/* У цвета без фото под эту модель остаётся прежнее фото, а не пустое место */
const activePhoto = computed(() => activeSwatch.value?.photo || props.card.photo)
/* Цена цвета без фото не подтверждена — «по запросу», а не чужая цифра */
const activePrice = computed(() => activeSwatch.value?.available === false ? null : (activeSwatch.value?.price ?? props.card.price))
const activeColorName = computed(() => activeSwatch.value?.name ?? props.card.colorName)

/* Эскизы фото (scripts/gen-model-thumbs.mjs): дверь в карточке 130–300 CSS px,
   оригинал — 500–1300 px. Нет эскиза (noThumb) — один оригинал.
   sizes — ширина фото в сетке CatalogGrid за вычетом полей подложки. */
const THUMB_SIZES = '(min-width: 1536px) 260px, (min-width: 1280px) 220px, (min-width: 1000px) calc((100vw - 24rem) / 3), (min-width: 576px) calc(33vw - 3rem), calc(50vw - 3rem)'
const photoSrcset = computed(() => {
  const noThumb = activeSwatch.value?.photo ? activeSwatch.value.noThumb : props.card.noThumb
  return noThumb ? undefined : thumbSrcset(activePhoto.value) || undefined
})

const selectSwatch = (idx: number) => { activeSwatchIdx.value = idx }

/* Свайп по фото листает цвета. Слушатели — на <article>: растянутая ссылка
   перекрывает фото, касание долетает до неё; свайп ловим только над фото.
   Реальный свайп (> 40px) браузер не превращает в клик — тап открывает модель. */
const SWIPE_THRESHOLD = 40
const photoBoxRef = ref<HTMLElement | null>(null)
let touchStartX = 0
let touchStartY = 0
let touchActive = false

const onPhotoTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  const box = photoBoxRef.value
  touchActive = false
  if (!touch || !box) return
  const rect = box.getBoundingClientRect()
  if (touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom) return
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchActive = true
}
const onPhotoTouchEnd = (e: TouchEvent) => {
  if (!touchActive || !e.changedTouches[0] || props.card.colorSwatches.length < 2) return
  touchActive = false
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) <= SWIPE_THRESHOLD) return
  const total = props.card.colorSwatches.length
  selectSwatch(dx > 0 ? (activeSwatchIdx.value + 1) % total : (activeSwatchIdx.value - 1 + total) % total)
}

/* Комплект (полотно, короб, наличники) — тот же расчёт, что на странице модели */
const kitPrice = computed(() =>
  activePrice.value ? activePrice.value + calcKitPrice(props.card.coatingSlug, activeColorName.value) : null
)

/* Покрытие и кромка/стекло — одной строкой, цвет — второй. Покрытие не
   повторяем, если оно уже в названии цвета («Эмалекс белый») */
const meta = computed(() => {
  const coatingInColor = activeColorName.value.toLowerCase().includes(props.card.coating.toLowerCase())
  return [coatingInColor ? '' : props.card.coating, props.card.trim].filter(Boolean).join(' · ')
})
const colorLine = computed(() =>
  `${activeColorName.value}${activeSwatch.value?.available === false ? ' · фото уточняется' : ''}`)

const status = computed(() => modelStatus(props.card, activeColorName.value))
</script>

<template>
  <article
    class="pc"
    @touchstart.passive="onPhotoTouchStart"
    @touchend="onPhotoTouchEnd"
  >
    <div ref="photoBoxRef" class="pc__media">
      <img
        v-if="activePhoto"
        :key="activePhoto"
        :src="activePhoto"
        :srcset="photoSrcset"
        :sizes="photoSrcset ? THUMB_SIZES : undefined"
        :alt="`Межкомнатная дверь ${card.name}, ${activeColorName}`"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        decoding="async"
        width="320"
        height="480"
      />
      <span v-if="status" class="pc__status" :data-status="status">{{ MODEL_STATUS_LABEL[status] }}</span>
    </div>

    <!-- Строка цветов есть всегда: у соседних карточек названия на одной линии -->
    <div class="pc__colors">
      <span
        v-if="card.colorSwatches.length < 2"
        class="pc__swatch pc__swatch--static"
        :style="{ backgroundColor: activeSwatch?.hex ?? card.colorHex }"
        aria-hidden="true"
      />
      <template v-else>
        <button
          v-for="(swatch, idx) in visibleSwatches"
          :key="swatch.name"
          type="button"
          class="pc__swatch"
          :class="{ 'is-empty': swatch.available === false }"
          :style="{ backgroundColor: swatch.hex }"
          :title="swatch.name"
          :aria-label="`Цвет: ${swatch.name}`"
          :aria-pressed="idx === activeSwatchIdx"
          @click="selectSwatch(idx)"
        />
      </template>
      <span v-if="extraSwatchCount > 0" class="pc__more">+{{ extraSwatchCount }}</span>
    </div>

    <h3 class="pc__name">
      <a :href="`/models/${card.slug}/`" class="pc__link">{{ card.name }}</a>
    </h3>
    <p class="pc__meta">{{ colorLine }}</p>
    <p v-if="meta" class="pc__meta pc__meta--sub">{{ meta }}</p>

    <div class="pc__price">
      <p class="pc__blade">
        <span class="pc__value">{{ activePrice ? rub(activePrice) : 'Цена по запросу' }}</span>
        <span v-if="activePrice" class="pc__unit">за полотно</span>
      </p>
      <p v-if="kitPrice" class="pc__kit">С коробом и наличниками <span class="pc__nowrap">{{ rub(kitPrice) }}</span></p>
    </div>
  </article>
</template>

<style scoped>
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Подложка — как фото в «Других моделях серии»: дверь целиком, не режется.
   Сверху поле под статус, он не ложится на дверь. */
.pc__media {
  position: relative;
  aspect-ratio: 2 / 3;
  /* Прямые углы и подложка темнее белого фона — решение владельца (05.11.2026) */
  background: #d8d8db;
  overflow: hidden;
  transition: background-color 200ms var(--ease-out);
}
.pc:hover .pc__media { background: #cfcfd3; }
.pc__media img {
  position: absolute;
  inset: 2.25rem 0.75rem 0.75rem;
  width: calc(100% - 1.5rem);
  height: calc(100% - 3rem);
  object-fit: contain;
  object-position: center bottom;
}

/* Статус — слово, не плашка */
.pc__status {
  position: absolute;
  top: 0.75rem;
  left: 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  color: #52525b;  /* zinc-600 — «Под заказ»: справка, не сигнал; на подложке ≥ 4.5:1 */
}
.pc__status[data-status='stock'] { color: #115e59; }  /* teal-800: на подложке ≥ 4.5:1 */
.pc__status[data-status='new'] { color: var(--color-fg); }

/* Кружки цветов — над растянутой ссылкой */
.pc__colors {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.25rem;
  margin-top: 0.875rem;
}
.pc__swatch {
  position: relative;
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 1px solid rgb(0 0 0 / 0.14);
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 150ms var(--ease-out);
}
/* Палец попадает в 2.25rem, кружок остаётся маленьким */
.pc__swatch::before { content: ''; position: absolute; inset: -0.5rem; }
.pc__swatch:hover { box-shadow: 0 0 0 2px #fff, 0 0 0 3px #d4d4d8; }
.pc__swatch[aria-pressed='true'] { box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--color-fg); }
.pc__swatch--static { cursor: default; }
.pc__swatch--static::before { content: none; }
.pc__swatch.is-empty { border: 2px dashed rgb(0 0 0 / 0.3); }
.pc__more { font-size: 0.8125rem; font-weight: 600; color: #71717a; }

.pc__name {
  margin: 0.625rem 0 0;
  /* Основной шрифт, как у «Других моделей серии»: Rubik у h3 на узкой
     карточке читался жирным */
  font-family: var(--font-sans);
  font-size: var(--text-step-2);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}
.pc__link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  transition: text-decoration-color 180ms var(--ease-out);
}
/* Растянутая ссылка: вся карточка открывает модель */
.pc__link::after { content: ''; position: absolute; inset: 0; }
.pc:hover .pc__link { text-decoration-color: currentColor; }
.pc__link:focus-visible { outline: none; }
.pc__link:focus-visible::after { outline: 2px solid var(--color-accent); outline-offset: 3px; }

.pc__meta {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #71717a;
}
.pc__meta--sub { margin-top: 0.0625rem; }

/* Цена прижата к низу: у соседних карточек — на одной линии */
.pc__price { margin-top: auto; padding-top: 0.875rem; }
.pc__blade { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.125rem 0.375rem; margin: 0; }
.pc__value {
  font-size: clamp(1.1875rem, 1.6vw, 1.375rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pc__unit { font-size: 0.8125rem; color: #71717a; }
.pc__nowrap { white-space: nowrap; }
.pc__kit {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #52525b;  /* zinc-600 */
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .pc__media, .pc__link, .pc__swatch { transition: none; }
}
</style>
