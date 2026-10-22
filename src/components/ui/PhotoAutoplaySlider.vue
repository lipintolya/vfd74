<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

/**
 * Общий кросс-фейд автослайдер фото с точками-навигацией (.dot-nav__* из
 * global.css) — тот же паттерн, что в HeroSlider.vue. Корень заполняет
 * родителя: пропорции (aspect-ratio) задаёт вызывающая сторона.
 *
 * Фото здесь — к товару рядом, а не главное содержание: слайдер не должен
 * отвлекать от чтения. Поэтому смена раз в 8 с (на 5 с кадр менялся раньше,
 * чем успевали дочитать описание), автопрокрутка идёт только пока слайдер
 * на экране и вкладка активна, замирает под курсором и при фокусе на точках.
 * На телефоне листается свайпом.
 */
const props = defineProps<{
  images: string[]
  alt: string
  intervalMs?: number
  /** Для файлов /renders/home/<имя>.webp (1300w) есть ресайзы <имя>-640.webp и
      <имя>-960.webp (scripts/gen-home-slider-variants.mjs) — отдаём их через
      srcset. Остальные пути и вызовы без флага берутся как есть. */
  responsive?: boolean
  /** sizes для srcset — ширина слайдера в раскладке вызывающей стороны */
  sizes?: string
}>()

const SIZES = props.sizes ?? '(max-width: 1023px) 100vw, 55vw'
const SWIPE_PX = 40
const hasVariants = (src: string) => props.responsive && src.startsWith('/renders/home/')
const srcsetOf = (src: string) => {
  const base = src.replace(/\.webp$/, '')
  return `${base}-640.webp 640w, ${base}-960.webp 960w, ${src} 1300w`
}

const interval = props.intervalMs ?? 8000
const count = props.images.length

const root        = useTemplateRef<HTMLElement>('root')
const activeSlide = ref(0)

/* Все <img> стоят в DOM друг на друге (кросс-фейд по opacity), поэтому
   loading="lazy" их не откладывает — браузер тянет все сразу при подходе к
   секции. Запрос делаем только для текущего слайда и для следующего: пока
   src не задан, <img> ничего не грузит. */
const loaded = ref<boolean[]>(props.images.map((_, i) => i === 0))
const ensureLoaded = (i: number) => {
  if (count > 0) loaded.value[(i % count + count) % count] = true
}
watch(activeSlide, i => { ensureLoaded(i); ensureLoaded(i + 1) })

/* Автопрокрутка идёт, только когда нет ни одной причины стоять:
   слайдер за экраном, вкладка скрыта, курсор/фокус внутри, палец на фото */
const holds = new Set<string>()
const playing         = ref(false)
const autoplayEnabled = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const go   = (i: number) => { activeSlide.value = (i % count + count) % count }
const stop = () => { clearTimeout(timer); timer = undefined }
const schedule = () => {
  stop()
  playing.value = autoplayEnabled.value && count > 1 && holds.size === 0
  if (playing.value) timer = setTimeout(() => { go(activeSlide.value + 1); schedule() }, interval)
}
const hold    = (why: string) => { holds.add(why);    schedule() }
const release = (why: string) => { holds.delete(why); schedule() }

/* Выбор кадра вручную перезапускает отсчёт с полного интервала */
const goTo = (i: number) => { go(i); schedule() }

let touchX = 0
let touchY = 0
const onTouchStart = (e: TouchEvent) => {
  const t = e.touches[0]
  if (!t) return
  touchX = t.clientX
  touchY = t.clientY
  hold('touch')
}
const onTouchEnd = (e: TouchEvent) => {
  const t = e.changedTouches[0]
  if (t) {
    const dx = touchX - t.clientX
    const dy = touchY - t.clientY
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(activeSlide.value + (dx > 0 ? 1 : -1))
  }
  release('touch')
}

let io: IntersectionObserver | undefined
const onVisibility = () => (document.hidden ? hold('tab') : release('tab'))

onMounted(() => {
  autoplayEnabled.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  holds.add('offscreen')
  if (root.value && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(([e]) => {
      e?.isIntersecting ? release('offscreen') : hold('offscreen')
    }, { threshold: 0.4 })
    io.observe(root.value)
  } else {
    holds.delete('offscreen')
  }
  document.addEventListener('visibilitychange', onVisibility)
  schedule()
  ensureLoaded(1)
})
onUnmounted(() => {
  stop()
  io?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div
    ref="root"
    class="pas-root"
    @mouseenter="hold('hover')"
    @mouseleave="release('hover')"
    @focusin="hold('focus')"
    @focusout="release('focus')"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- loading="lazy" у всех, включая первый: слайдер везде стоит ниже
         первого экрана, eager первого кадра отбирал канал у LCP-картинки hero.
         Описание (alt) — у первого кадра; остальные — те же ракурсы того же
         товара, скринридер не читает одно и то же несколько раз. -->
    <img
      v-for="(src, i) in images"
      :key="src"
      :src="loaded[i] ? src : undefined"
      :srcset="hasVariants(src) && loaded[i] ? srcsetOf(src) : undefined"
      :sizes="hasVariants(src) ? SIZES : undefined"
      :alt="i === 0 ? alt : ''"
      :aria-hidden="i === 0 ? undefined : 'true'"
      loading="lazy"
      decoding="async"
      class="pas-img"
      :class="{ 'pas-img--on': i === activeSlide }"
    />

    <slot />

    <div
      v-if="count > 1"
      class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1"
      role="tablist"
      aria-label="Навигация по фото"
    >
      <button
        v-for="(src, i) in images"
        :key="src"
        type="button"
        role="tab"
        :aria-label="`Фото ${i + 1} из ${count}`"
        :aria-selected="i === activeSlide"
        class="dot-nav__btn"
        @click="goTo(i)"
      >
        <span
          class="dot-nav__item dot-nav__item--progress"
          :class="{ 'dot-nav__item--active': i === activeSlide }"
        >
          <span
            v-if="i === activeSlide && playing"
            :key="activeSlide"
            class="dot-nav__progress"
            :style="{ animationDuration: `${interval}ms` }"
          />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pas-root {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-y;  /* вертикальный скролл страницы — браузеру, горизонталь — свайпу */
}
.pas-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1000ms ease-in-out;
}
.pas-img--on {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .pas-img { transition: none; }
}
</style>
