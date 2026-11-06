<script setup lang="ts">
/**
 * Первый экран страницы модели: фото слева, справа — «покупка».
 *
 * Порядок правой колонки (и на телефоне под фото): заголовок → цена →
 * цвет → действия → контакты → короткие факты. Заголовок и факты —
 * статический HTML страницы (SEO), приходят слотами `head` и `details`;
 * остров владеет только тем, что зависит от выбранного цвета (фото, цена,
 * статус), поэтому всё в одном острове и в одной сетке.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface ColorVariant {
  id:          string
  name:        string
  hex:         string
  photo:       string
  price:       number | null
  coatingSlug: string
  /** Зарезервировано под будущий сценарий частично доступных цветов —
      сейчас .astro отдаёт только сфотканные (available всегда true/undefined).
      Цвета без фото показаны отдельной строкой (extraColors), не свотчем. */
  available?:  boolean
}

import { calcKitPrice } from '../../data/accessories'
import { kitLabel, isScenePhoto } from '../../lib/hidden-doors-catalog'
import { companyLegalInfo } from '../../lib/contacts-data'
import { modelStatus, MODEL_STATUS_LABEL } from '../../lib/made-to-order'
import PriceCalculatorModal from './PriceCalculatorModal.vue'

const props = defineProps<{
  colors:      ColorVariant[]
  /** Остальные цвета покрытия, для которых у ЭТОЙ модели пока нет фото —
      справочная строка «Ещё под заказ», не свотч. */
  extraColors?: { name: string; hex: string }[]
  modelName:   string
  modelId:     string
  seriesSlug:  string
  isNew?:      boolean
  /** Вместо калькулятора погонажа — ссылка (скрытые двери: размер и короб
      подбираются на /catalog/skrytye-dveri/, наличников у них нет). */
  calcHref?:   string
}>()

const phone = companyLegalInfo.contacts.phone[0]!

const selectedIdx = ref(0)
const selected = computed(() => props.colors[selectedIdx.value] ?? props.colors[0])

/* Статус — та же функция и та же плашка, что у карточки в каталоге:
   «В наличии» относится к конкретной модели+цвету (IN_STOCK_OVERRIDE),
   поэтому пересчитывается при смене цвета. */
const status = computed(() =>
  modelStatus({ id: props.modelId, seriesSlug: props.seriesSlug, isNew: !!props.isNew }, selected.value.name)
)

/* Фото не пропадает при выборе цвета без снимка — остаётся фото первого
   сфотканного цвета вместо пустой подложки. */
const displayPhoto = computed(() =>
  selected.value.photo || props.colors.find(c => c.photo)?.photo || ''
)

const bladePrice = computed(() => (selected.value.available === false ? null : selected.value.price))

const kitTotal = computed(() => {
  if (!bladePrice.value) return null
  return bladePrice.value + calcKitPrice(selected.value.coatingSlug, selected.value.name, props.seriesSlug, props.modelId)
})

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const normalizeHex = (hex: string) => {
  const v = (hex ?? '').trim().replaceAll('С', 'C').replaceAll('с', 'c')
  return /^#[0-9a-fA-F]{3,6}$/.test(v) ? v : '#cccccc'
}

/* «Ещё под заказ: белый, графит, молочный» — без повтора названия покрытия
   в каждом цвете («Эмалекс белый, Эмалекс графит…»). Префикс убираем,
   только если он общий у всех цветов модели. */
const extraColorsLine = computed(() => {
  const list = props.extraColors ?? []
  if (!list.length) return ''
  const prefix = list[0]!.name.split(' ')[0] ?? ''
  const names = [...list, ...props.colors].map(c => c.name)
  const strip = prefix.length > 0 && names.every(n => n.startsWith(`${prefix} `))
  return list.map(c => (strip ? c.name.slice(prefix.length + 1) : c.name)).join(', ')
})

/* ── mounted-гейт для обоих Teleport ниже (зум-фото и калькулятор): на
   client:load Teleport в SSR-разметке конфликтует с служебным <style>
   astro-island и ломает гидратацию (первый клик не открывал модалку).
   Тот же гейт, что в Reviews.vue и FigureLightbox.vue. ── */
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const zoomOpen = ref(false)
const openZoom = () => {
  if (!displayPhoto.value) return
  zoomOpen.value = true
  document.body.style.overflow = 'hidden'
}
const closeZoom = () => {
  zoomOpen.value = false
  document.body.style.overflow = ''
}
const onZoomKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeZoom() }

onMounted(() => window.addEventListener('keydown', onZoomKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onZoomKeydown)
  document.body.style.overflow = ''
  if (shareCopiedTimer) clearTimeout(shareCopiedTimer)
})

const calcOpen = ref(false)

/* ── Поделиться — Web Share API там, где он есть (в основном телефоны),
   иначе копируем ссылку; подпись кнопки сама говорит, что скопировано. ── */
const shareCopied = ref(false)
let shareCopiedTimer: ReturnType<typeof setTimeout> | null = null
const shareModel = async () => {
  const url = window.location.href
  const title = `${props.modelName}${selected.value.name ? ` — ${selected.value.name}` : ''}`
  if (navigator.share) {
    try { await navigator.share({ title, url }) } catch { /* отмена — не ошибка */ }
    return
  }
  try {
    await navigator.clipboard.writeText(url)
    shareCopied.value = true
    if (shareCopiedTimer) clearTimeout(shareCopiedTimer)
    shareCopiedTimer = setTimeout(() => { shareCopied.value = false }, 2500)
  } catch { /* буфер недоступен — молча */ }
}
</script>

<template>
  <div class="pdp">
    <!-- Фото -->
    <div class="pdp__media" :class="{ 'is-scene': isScenePhoto(seriesSlug) }">
      <button
        v-if="displayPhoto"
        type="button"
        class="pdp__photo-btn"
        :aria-label="`Увеличить фото: ${modelName} — ${selected.name}`"
        @click="openZoom"
      >
        <img
          :key="displayPhoto"
          :src="displayPhoto"
          :alt="`${modelName} — ${selected.name}`"
          class="pdp__photo"
          width="600"
          height="780"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </button>
      <p v-else class="pdp__no-photo">Фото уточняется</p>

      <span v-if="status" class="pdp__status" :data-status="status">{{ MODEL_STATUS_LABEL[status] }}</span>
    </div>

    <!-- Покупка -->
    <div class="pdp__panel">
      <slot name="head" />

      <div class="pdp__price">
        <p class="pdp__blade">
          <span class="pdp__value">{{ bladePrice ? rub(bladePrice) : 'Цена по запросу' }}</span>
          <span v-if="bladePrice" class="pdp__unit">за полотно</span>
        </p>
        <p v-if="kitTotal" class="pdp__kit">
          {{ kitLabel(seriesSlug) }} <span class="pdp__kit-value">{{ rub(kitTotal) }}</span>
        </p>
      </div>

      <div class="pdp__colors">
        <p class="pdp__color-name">
          Цвет: <strong>{{ selected.name }}</strong><span v-if="selected.available === false">, фото уточняется</span>
        </p>
        <div
          v-if="colors.length > 1"
          class="pdp__swatches"
          role="radiogroup"
          :aria-label="`Цвет: ${modelName}`"
        >
          <button
            v-for="(color, i) in colors"
            :key="color.id"
            type="button"
            class="pdp__swatch"
            :class="{ 'is-empty': color.available === false }"
            :style="{ backgroundColor: normalizeHex(color.hex) }"
            :title="color.name"
            :aria-label="color.available === false ? `${color.name}, фото уточняется` : color.name"
            :aria-pressed="String(i === selectedIdx)"
            @click="selectedIdx = i"
          />
        </div>
        <p v-if="extraColorsLine" class="pdp__extra">Ещё под заказ: {{ extraColorsLine }}</p>
      </div>

      <div class="pdp__actions">
        <a v-if="calcHref" :href="calcHref" class="btn btn-primary pdp__cta">Подобрать размер</a>
        <button v-else type="button" class="btn btn-primary pdp__cta" @click="calcOpen = true">
          Рассчитать комплект
        </button>
        <a href="https://t.me/vfddoors74" target="_blank" rel="noopener" class="btn btn-outline pdp__cta">
          Написать в Telegram
        </a>
      </div>

      <p class="pdp__contacts">
        <a :href="`tel:${phone.raw}`">{{ phone.label }}</a>
        <a href="https://vk.com/vfddoors74" target="_blank" rel="noopener">VK</a>
        <a href="https://max.ru/id452402308842_biz" target="_blank" rel="noopener">MAX</a>
        <button type="button" aria-live="polite" @click="shareModel">
          {{ shareCopied ? 'Ссылка скопирована' : 'Поделиться' }}
        </button>
      </p>

      <slot name="details" />
    </div>

    <!-- Зум-модалка -->
    <Teleport v-if="mounted" to="body">
      <Transition name="zoom-fade">
        <div
          v-if="zoomOpen"
          class="pdp-zoom"
          role="dialog"
          aria-modal="true"
          :aria-label="`${modelName} — ${selected.name}`"
          @click.self="closeZoom"
        >
          <button class="pdp-zoom__close" type="button" aria-label="Закрыть" @click="closeZoom">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <figure class="pdp-zoom__figure" @click.self="closeZoom">
            <img :src="displayPhoto" :alt="`${modelName} — ${selected.name}`" class="pdp-zoom__img" decoding="async" />
            <figcaption class="pdp-zoom__caption">{{ modelName }} — {{ selected.name }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>

    <PriceCalculatorModal
      v-if="!calcHref"
      :open="calcOpen"
      :mounted="mounted"
      :model-name="modelName"
      :photo="displayPhoto"
      :coating-slug="selected.coatingSlug"
      :series-slug="seriesSlug"
      :color-name="selected.name"
      :blade-price="bladePrice ?? 0"
      @close="calcOpen = false"
    />
  </div>
</template>

<style scoped>
/* ── Сетка: фото | покупка. На телефоне — одна колонка, фото сверху ── */
.pdp {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.75rem;
  align-items: start;
}
@media (min-width: 900px) {
  .pdp {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: clamp(2.5rem, 5vw, 5rem);
  }
  /* Фото выше панели — панель с ценой и кнопками едет рядом при прокрутке */
  .pdp__panel {
    position: sticky;
    top: calc(var(--header-height) + 1.5rem);
  }
}

/* ── Фото: подложка и прямые углы — как у карточки в каталоге, чтобы
   дверь из выдачи «переезжала» на страницу без смены языка ── */
.pdp__media {
  position: relative;
  aspect-ratio: 4 / 5;
  /* Одна колонка на планшете: 4:5 во всю ширину давало фото ~880 px,
     цена и кнопки уходили за первый экран. Телефон (≈450 px) не задевает. */
  /* width задана явно — иначе aspect-ratio под max-height сужает блок */
  width: 100%;
  max-height: 36rem;
  background: #d8d8db;
  overflow: hidden;
}
@media (min-width: 900px) {
  .pdp__media { aspect-ratio: 1 / 1; max-height: none; }
}

.pdp__photo-btn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
}

.pdp__photo {
  position: absolute;
  inset: 3rem 1.5rem 1.5rem;
  width: calc(100% - 3rem);
  height: calc(100% - 4.5rem);
  object-fit: contain;
  display: block;
}

/* Сцена портретная (≈4:5) — на десктопе не режем её в квадрат */
@media (min-width: 900px) {
  .pdp__media.is-scene { aspect-ratio: 4 / 5; }
}
.pdp__media.is-scene .pdp__photo {
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdp__no-photo {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  font-size: 0.875rem;
  color: #71717a;
}

/* Плашка статуса — один в один .pc__status карточки каталога.
   Палитра (решение владельца, 05.11.2026): «Новинка» — красный,
   «В наличии» — зелёный, «Под заказ» — графит. */
.pdp__status {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.005em;
  white-space: nowrap;
  background: var(--color-fg);
  color: #fff;
  pointer-events: none;
}
.pdp__status[data-status='new']   { background: #dc2626; }
.pdp__status[data-status='stock'] { background: #15803d; }

/* ── Панель ── */
.pdp__panel {
  min-width: 0;
}

/* Цена: полотно крупно, комплект строкой ниже и заметно мельче —
   две цены одним кеглем читались одинаково. */
.pdp__price {
  margin-top: 1.75rem;
}
.pdp__blade {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.625rem;
  margin: 0;
}
.pdp__value {
  font-size: clamp(2rem, 3.2vw, 2.5rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  white-space: nowrap;
}
.pdp__unit {
  font-size: 0.9375rem;
  color: var(--color-fg-muted);
}
.pdp__kit {
  margin: 0.625rem 0 0;
  font-size: 0.9375rem;
  color: var(--color-fg-muted);
}
.pdp__kit-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  white-space: nowrap;
}

/* ── Цвет ── */
.pdp__colors {
  margin-top: 1.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}
.pdp__color-name {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-fg-muted);
}
.pdp__color-name strong {
  font-weight: 600;
  color: var(--color-ink);
}
.pdp__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.875rem;
}
/* Кружок как в каталоге (тонкая кайма, выбранный — тёмное кольцо), крупнее:
   здесь это основной выбор на странице */
.pdp__swatch {
  position: relative;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid rgb(0 0 0 / 0.14);
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 150ms var(--ease-out);
}
.pdp__swatch:hover { box-shadow: 0 0 0 3px #fff, 0 0 0 4px #d4d4d8; }
.pdp__swatch[aria-pressed='true'] { box-shadow: 0 0 0 3px #fff, 0 0 0 4.5px var(--color-fg); }
.pdp__swatch.is-empty { border: 2px dashed rgb(0 0 0 / 0.3); }
.pdp__swatch:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 5px;
}
.pdp__extra {
  margin: 0.875rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-fg-muted);
}

/* ── Действия: два равных по высоте пункта, главный — тёмный ── */
.pdp__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.625rem;
  margin-top: 2rem;
}
@media (min-width: 480px) {
  .pdp__actions { grid-template-columns: 1fr 1fr; }
}
.pdp__cta {
  min-height: 3.25rem;
  padding-inline: 1.25rem;
  font-size: 0.9375rem;
}

/* Контакты — строка текстовых ссылок, без иконок-кнопок */
.pdp__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 1.125rem 0 0;
  font-size: 0.9375rem;
}
.pdp__contacts a,
.pdp__contacts button {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 500;
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.3em;
  cursor: pointer;
  transition: text-decoration-color 150ms var(--ease-out), color 150ms var(--ease-out);
}
.pdp__contacts a:hover,
.pdp__contacts button:hover {
  color: var(--color-accent-hover);
  text-decoration-color: currentColor;
}

/* ── Зум-модалка ── */
.pdp-zoom {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.pdp-zoom__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 150ms ease;
}
.pdp-zoom__close:hover { background: rgba(255, 255, 255, 0.22); }
.pdp-zoom__close svg { width: 1.375rem; height: 1.375rem; }
.pdp-zoom__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
}
.pdp-zoom__img {
  max-width: min(95vw, 1100px);
  max-height: 85vh;
  object-fit: contain;
  background: #d8d8db;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
.pdp-zoom__caption {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.72);
}

.zoom-fade-enter-active,
.zoom-fade-leave-active { transition: opacity 180ms ease; }
.zoom-fade-enter-from,
.zoom-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .zoom-fade-enter-active,
  .zoom-fade-leave-active { transition: none; }
}
</style>
