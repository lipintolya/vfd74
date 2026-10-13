<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * Общий кросс-фейд автослайдер с точками-навигацией (.dot-nav__* из
 * global.css) — тот же паттерн, что в HeroSlider.vue, вынесенный в
 * компонент после третьего дублирования (HiddenDoorsPromo, SherwoodPromo).
 * Корень — position:relative на всю ширину/высоту родителя: сам блок
 * с пропорциями (aspect-*) задаёт вызывающая сторона через class на теге
 * <PhotoAutoplaySlider>.
 */
const props = defineProps<{
  images: string[]
  alt: string
  intervalMs?: number
  /** Для файлов /renders/home/<имя>.webp (1300w) есть ресайзы <имя>-640.webp и
      <имя>-960.webp (scripts/gen-home-slider-variants.mjs) — отдаём их через
      srcset. Остальные пути и вызовы без флага берутся как есть. */
  responsive?: boolean
}>()

/* Карточка слайдера: на мобильном/планшете во всю ширину, с lg — ~55vw. */
const SIZES = '(max-width: 1023px) 100vw, 55vw'
const hasVariants = (src: string) => props.responsive && src.startsWith('/renders/home/')
const srcsetOf = (src: string) => {
  const base = src.replace(/\.webp$/, '')
  return `${base}-640.webp 640w, ${base}-960.webp 960w, ${src} 1300w`
}

const interval = props.intervalMs ?? 5000

const activeSlide      = ref(0)

/* Все <img> стоят в DOM друг на друге (кросс-фейд по opacity), поэтому
   loading="lazy" их не откладывает — браузер тянет все сразу при подходе к
   секции. Запрос делаем только для текущего слайда и для следующего: пока
   src не задан, <img> ничего не грузит. */
const loaded = ref<boolean[]>(props.images.map((_, i) => i === 0))
const ensureLoaded = (i: number) => {
  const n = props.images.length
  if (n > 0) loaded.value[(i % n + n) % n] = true
}
watch(activeSlide, i => { ensureLoaded(i); ensureLoaded(i + 1) })
const isPaused         = ref(false)
const autoplayEnabled  = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const next  = () => { activeSlide.value = (activeSlide.value + 1) % props.images.length }
const stop  = () => { if (timer) { clearInterval(timer); timer = undefined } }
const start = () => { stop(); if (autoplayEnabled.value && props.images.length > 1) timer = setInterval(next, interval) }
const goTo  = (i: number) => { activeSlide.value = i; start() }

const onPauseStart = () => { isPaused.value = true;  stop() }
const onPauseEnd   = () => { isPaused.value = false; start() }

onMounted(() => {
  autoplayEnabled.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  start()
  ensureLoaded(1)
})
onUnmounted(stop)
</script>

<template>
  <div
    class="pas-root"
    @mouseenter="onPauseStart"
    @mouseleave="onPauseEnd"
    @touchstart.passive="onPauseStart"
    @touchend.passive="onPauseEnd"
  >
    <!-- loading="lazy" у всех, включая первый: слайдер везде стоит ниже
         первого экрана, eager первого кадра отбирал канал у LCP-картинки hero. -->
    <img
      v-for="(src, i) in images"
      :key="src"
      :src="loaded[i] ? src : undefined"
      :srcset="hasVariants(src) && loaded[i] ? srcsetOf(src) : undefined"
      :sizes="hasVariants(src) ? SIZES : undefined"
      :alt="alt"
      loading="lazy"
      decoding="async"
      width="1672"
      height="941"
      class="pas-img"
      :class="{ 'pas-img--on': i === activeSlide }"
    />

    <slot />

    <div
      v-if="images.length > 1"
      class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
      role="tablist"
      aria-label="Навигация по фото"
    >
      <button
        v-for="(src, i) in images"
        :key="src"
        type="button"
        role="tab"
        :aria-label="`Фото ${i + 1}`"
        :aria-selected="i === activeSlide"
        class="dot-nav__btn"
        @click="goTo(i)"
      >
        <span
          class="dot-nav__item dot-nav__item--progress"
          :class="{ 'dot-nav__item--active': i === activeSlide }"
        >
          <span
            v-if="i === activeSlide && autoplayEnabled && !isPaused"
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
}
.pas-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1250ms ease-in-out;
}
.pas-img--on {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .pas-img { transition: none; }
}
</style>
