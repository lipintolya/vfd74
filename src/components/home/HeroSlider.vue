<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { HERO_COVER_IMAGE, HERO_COVER_IMAGE_SRCSET } from '../../data/hero-image'
import HeroTile, { type Tile } from './HeroTile.vue'
import type { HeroData } from '../../lib/home-promos'
import { pluralRu } from '../../lib/plural'

/**
 * Первый экран главной.
 *
 * Слева — фото листаются, H1 постоянный («двери в Челябинске» — главный
 * запрос страницы, заголовок не должен зависеть от кадра). Под ним текст и
 * ссылка того, что на фото: у каждого кадра своя модель или серия. Внизу —
 * три подписанных отрезка вместо точек: видно, что дальше, и можно
 * переключить самому.
 * Справа — две плитки: что есть на складе и скрытые двери (цена комплекта
 * с коробом, не полотна).
 */
const props = defineProps<{
  hero: HeroData
}>()

/* Кадр держится 12 с — текст успевают дочитать (раньше 9 с) */
const SLIDER_INTERVAL_MS = 12_000
const SWIPE_THRESHOLD    = 50

interface Slide {
  id:     number
  image:  string
  /** srcset с ресайзами (public/renders/hero, scripts/gen-responsive.mjs);
      оригинал — самый широкий кандидат. У первого слайда свой набор. */
  srcset?: string
  /** object-position картинки, если главный объект не в центре кадра */
  imagePosition?: string
  /** Подпись отрезка навигации — коротко, что на кадре */
  nav:    string
  /** Текст под H1 — про то, что на фото. Факты — из series-descriptions.ts */
  lead:   string
  /** Ссылка на модель или серию с кадра */
  link:   { label: string; href: string } | null
}

const slides: Slide[] = [
  {
    id: 1,
    image: HERO_COVER_IMAGE,
    /* Дверь на рендере у правого края (~79% ширины) — на узком экране
       при центральном кропе ушла бы из кадра */
    imagePosition: '80% center',
    nav:  'Урбан ЗТ',
    lead: 'Двери, которые подчёркивают пространство: фактура дерева, чистые линии и тонкая кромка. Подберём модель под ваш интерьер.',
    link: props.hero.coverModel,
  },
  {
    id: 2,
    image: '/media/Main_page_perfomance-covers/innova_render.webp',
    srcset: '/renders/hero/innova-render-640.webp 640w, /renders/hero/innova-render-960.webp 960w, /media/Main_page_perfomance-covers/innova_render.webp 1448w',
    nav:  'Иннова',
    lead: 'Иннова в покрытии ПЭТ: мягкая на ощупь поверхность не собирает отпечатки, а полотно 39 мм из массива сосны и МДФ хорошо глушит звук.',
    link: { label: 'Серия Иннова', href: '/catalog/series/innova/' },
  },
  {
    id: 3,
    image: '/media/Main_page/left_bento/render_urban2.webp',
    srcset: '/renders/hero/urban2-render-640.webp 640w, /renders/hero/urban2-render-960.webp 960w, /media/Main_page/left_bento/render_urban2.webp 1254w',
    nav:  'Урбан 2ГР',
    lead: 'Урбан — строгая геометрия и алюминиевая кромка. Покрытие Эмалекс выглядит как эмаль и не боится царапин.',
    link: { label: 'Урбан 2ГР', href: '/models/urban-2gr-urban-a2d505/' },
  },
]

/* Плитки справа — один язык с плитками «Каталога» ниже (HeroTile.vue):
   фото на всю площадь, название, одна фраза, ссылка текстом. */
const tiles: Tile[] = [
  {
    id: 'in-stock',
    href: '/catalog/v-nalichii/',
    title: `${props.hero.inStock} ${pluralRu(props.hero.inStock, ['модель', 'модели', 'моделей'])} в наличии`,
    fact: 'Со склада в Челябинске — без ожидания изготовления',
    cta: 'Смотреть',
    img: {
      src: '/renders/hero/instock-emalex-960.webp',
      srcset: '/renders/hero/instock-emalex-640.webp 640w, /renders/hero/instock-emalex-960.webp 960w',
      sizes: '(max-width: 1023px) 100vw, 40vw',
      width: 960, height: 720,
    },
  },
  {
    id: 'hidden',
    href: '/catalog/skrytye-dveri/',
    title: 'Скрытые двери',
    fact: props.hero.secretFact,
    cta: 'Смотреть',
    img: {
      src: '/renders/hero/secret-two-doors-960.webp',
      srcset: '/renders/hero/secret-two-doors-640.webp 640w, /renders/hero/secret-two-doors-960.webp 960w',
      sizes: '(max-width: 1023px) 100vw, 40vw',
      width: 960, height: 1158,
    },
  },
]

/* ── Slider state ── */
const activeIndex     = ref(0)
const touchStartX     = ref(0)
const touchStartY     = ref(0)
const isPaused        = ref(false)
const autoplayEnabled = ref(true)
/* Номер «прогона» таймера: ключ полоски прогресса — при каждом перезапуске
   таймера анимация начинается заново и идёт ровно в такт смене кадра */
const cycle           = ref(0)

const currentSlide = computed(() => slides[activeIndex.value] ?? slides[0]!)

/* Пока слайды листаются сами, смену текста скринридеру не зачитываем —
   иначе он перебивает чтение страницы каждые 12 секунд. После паузы или
   ручного управления — polite. */
const liveMode = computed(() => (autoplayEnabled.value && !isPaused.value ? 'off' : 'polite'))

/* Картинки слайдов лежат в DOM все сразу (кросс-фейд по opacity), поэтому
   loading="lazy" их не откладывает. Загружаем слайд, только когда он активен
   или станет следующим/предыдущим — пока src не задан, <img> запроса не делает. */
const loaded = ref<boolean[]>(slides.map((_, i) => i === 0))
const ensureLoaded = (i: number) => {
  const n = slides.length
  loaded.value[(i % n + n) % n] = true
}
watch(activeIndex, i => { ensureLoaded(i); ensureLoaded(i + 1); ensureLoaded(i - 1) })

let timer: ReturnType<typeof setInterval> | null = null

const stop  = () => { if (timer !== null) { clearInterval(timer); timer = null } }
const start = () => {
  stop()
  if (!autoplayEnabled.value) return
  cycle.value++
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slides.length
    cycle.value++
  }, SLIDER_INTERVAL_MS)
}
const next  = () => { activeIndex.value = (activeIndex.value + 1) % slides.length }
const prev  = () => { activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length }

const goTo = (i: number) => { activeIndex.value = i; if (!isPaused.value) start() }

const onMouseEnter = () => { isPaused.value = true;  stop() }
const onMouseLeave = () => { isPaused.value = false; start() }

const onTouchStart = (e: TouchEvent) => {
  if (!e.touches[0]) return
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isPaused.value = true
  stop()
}

const onTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches[0]) return
  const dx = touchStartX.value - e.changedTouches[0].clientX
  const dy = touchStartY.value - e.changedTouches[0].clientY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    dx > 0 ? next() : prev()
  }
  setTimeout(() => { isPaused.value = false; start() }, 400)
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft')  { prev(); start() }
  if (e.key === 'ArrowRight') { next(); start() }
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  autoplayEnabled.value = !prefersReduced
  start()

  /* Следующий слайд подгружаем заранее, когда страница уже дорисована и
     канал свободен, — к первой смене он будет готов. */
  const warmNext = () => setTimeout(() => ensureLoaded(1), 1500)
  if (document.readyState === 'complete') warmNext()
  else window.addEventListener('load', warmNext, { once: true })
})
onUnmounted(stop)
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 lg:min-h-125 xl:min-h-140">

        <!-- ══ HERO SLIDER ══ -->
        <div
          class="hero-main lg:col-span-7 relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[34rem] sm:min-h-[36rem] md:min-h-0 md:aspect-16/11 lg:aspect-auto lg:h-auto"
          role="region"
          aria-label="Двери в Челябинске — салон ВФД"
          aria-roledescription="carousel"
          tabindex="0"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @keydown="onKeyDown"
        >
          <!-- Фон: все кадры в стеке, активный — opacity:1 (кросс-фейд) -->
          <div class="absolute inset-0">
            <img
              v-for="(slide, i) in slides"
              :key="slide.id"
              :src="loaded[i] ? slide.image : undefined"
              :srcset="i === 0 ? HERO_COVER_IMAGE_SRCSET : loaded[i] ? slide.srcset : undefined"
              :sizes="i === 0 || slide.srcset ? '(max-width: 1023px) 100vw, 55vw' : undefined"
              alt=""
              :fetchpriority="i === 0 ? 'high' : undefined"
              :loading="i === 0 ? 'eager' : 'lazy'"
              :decoding="i === 0 ? 'sync' : 'async'"
              class="hero-slide absolute inset-0 w-full h-full object-cover object-center"
              :style="slide.imagePosition ? { objectPosition: slide.imagePosition } : undefined"
              :class="{ 'hero-slide-active': i === activeIndex }"
              aria-hidden="true"
            />
          </div>

          <!-- Затемнение: плотное снизу, где текст -->
          <div class="hero-scrim absolute inset-0 z-10" aria-hidden="true" />

          <div class="hero-body relative z-10 flex h-full flex-col justify-end p-5 sm:p-8 lg:p-10 text-white">
            <div class="max-w-2xl">
              <h1 class="hero-title">Межкомнатные и входные двери в&nbsp;Челябинске</h1>

              <!-- Текст и ссылка — про кадр; меняются вместе с фото -->
              <div class="hero-lead-stack" :aria-live="liveMode" aria-atomic="true">
                <p
                  v-for="(slide, i) in slides"
                  :key="slide.id"
                  class="hero-lead"
                  :class="{ 'is-active': i === activeIndex }"
                  :aria-hidden="i !== activeIndex"
                >{{ slide.lead }}</p>
              </div>

              <div class="hero-actions">
                <a href="/catalog/" class="hero-cta">
                  Смотреть каталог
                  <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
                <Transition name="hero-content" mode="out-in">
                  <a v-if="currentSlide.link" :key="currentSlide.id" :href="currentSlide.link.href" class="hero-link">
                    {{ currentSlide.link.label }}
                  </a>
                </Transition>
              </div>
            </div>

            <!-- Навигация: три отрезка с подписями, активный заполняется
                 за время показа кадра -->
            <div class="hero-nav" role="tablist" aria-label="Фото в слайдере">
              <button
                v-for="(slide, i) in slides"
                :key="slide.id"
                type="button"
                role="tab"
                class="hero-nav__item"
                :class="{ 'is-active': i === activeIndex }"
                :aria-selected="i === activeIndex"
                :aria-label="`Фото ${i + 1}: ${slide.nav}`"
                @click="goTo(i)"
              >
                <span class="hero-nav__bar" aria-hidden="true">
                  <span
                    v-if="i === activeIndex && autoplayEnabled && !isPaused"
                    :key="cycle"
                    class="hero-nav__fill is-running"
                    :style="{ animationDuration: `${SLIDER_INTERVAL_MS}ms` }"
                  />
                  <span v-else-if="i === activeIndex" class="hero-nav__fill" />
                </span>
                <span class="hero-nav__label">{{ slide.nav }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ══ RIGHT BENTO ══ -->
        <div class="lg:col-span-5 grid lg:grid-rows-2 gap-4 sm:gap-5 lg:gap-6">
          <HeroTile :tile="tiles[0]!" wide />
          <HeroTile :tile="tiles[1]!" wide />
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* Скругление держим явной обрезкой: overflow:hidden + border-radius в
   части браузеров теряет углы, пока кадры меняют прозрачность на своих
   слоях (на скрине владельца — прямые нижние углы). content-visibility
   здесь не нужен — блок в первом экране — и тоже ломал обрезку. */
.hero-main {
  clip-path: inset(0 round 1rem);
  isolation: isolate;
}
@media (width >= 40rem) {
  .hero-main { clip-path: inset(0 round 1.5rem); }
}
/* Фокус с клавиатуры — внутри блока, иначе его срежет clip-path */
.hero-main:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -4px;
}

.hero-scrim {
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 0.8) 0%,
    rgb(0 0 0 / 0.55) 32%,
    rgb(0 0 0 / 0.15) 62%,
    rgb(0 0 0 / 0) 82%
  );
}

.hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.6vw + 1.3rem, 3.125rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

/* Все три текста в одной ячейке сетки, видим активный: высоту задаёт самый
   длинный, и при смене кадра кнопки под текстом не прыгают */
.hero-lead-stack {
  display: grid;
  margin-top: 1rem;
  font-size: var(--text-step-1);
  line-height: 1.6;
}
@media (width >= 40rem) {
  .hero-lead-stack { font-size: var(--text-step-2); }
}
.hero-lead {
  grid-area: 1 / 1;
  margin: 0;
  max-width: 34rem;
  color: rgb(255 255 255 / 0.85);
  text-wrap: pretty;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 500ms ease, transform 500ms ease;
}
.hero-lead.is-active {
  opacity: 1;
  transform: none;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.875rem;
  margin-top: 1.5rem;
}
/* Узкий экран: ссылка всегда под кнопкой — иначе короткая («Урбан 2ГР»)
   вставала в строку с кнопкой, длинная переносилась, и блок прыгал */
@media (width >= 40rem) {
  .hero-actions { flex-direction: row; align-items: center; gap: 1.5rem; }
}

/* Кнопка на фото: белая пилюля, стрелка без «кружка» */
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 999px;
  background: #fff;
  color: var(--color-ink);
  font-size: var(--text-step-1);
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color var(--duration-base) var(--ease-out),
    transform        var(--duration-base) var(--ease-out);
}
.hero-cta:hover {
  background: #f4f4f5;
  transform: translateY(-1px);
}
.hero-cta:hover .btn-arrow-icon { transform: translateX(2px); }
.hero-cta:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* Вторая ссылка — то, что на фото: текстом, без кнопки */
.hero-link {
  font-size: var(--text-step-1);
  font-weight: 500;
  color: #fff;
  text-decoration: underline;
  text-decoration-color: rgb(255 255 255 / 0.4);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.3em;
  transition: text-decoration-color 150ms ease;
}
.hero-link:hover { text-decoration-color: #fff; }
.hero-link:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: 2px;
}

/* ── Навигация: колонки на линейке ── */
.hero-nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 2rem;
}
@media (width >= 40rem) {
  .hero-nav { gap: 1.25rem; margin-top: 2.5rem; }
}
.hero-nav__item {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.5rem 0 0;
  border: none;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.hero-nav__bar {
  position: relative;
  display: block;
  height: 2px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.28);
  overflow: hidden;
}
.hero-nav__fill {
  position: absolute;
  inset: 0;
  background: #fff;
  transform-origin: left center;
}
.hero-nav__fill.is-running {
  animation: hero-progress linear forwards;
}
@keyframes hero-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.hero-nav__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(255 255 255 / 0.6);
  transition: color 200ms ease;
}
.hero-nav__item:hover .hero-nav__label,
.hero-nav__item.is-active .hero-nav__label { color: #fff; }
.hero-nav__item:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
  border-radius: 2px;
}

/* Кросс-фейд фона */
.hero-slide {
  opacity: 0;
  z-index: 0;
  transition: opacity 1200ms ease-in-out;
}
.hero-slide-active {
  opacity: 1;
  z-index: 1;
}

/* Плавная смена текста синхронно с фоном */
.hero-content-enter-active,
.hero-content-leave-active {
  transition: opacity 400ms ease, transform 400ms ease;
}
.hero-content-enter-from,
.hero-content-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide,
  .hero-lead,
  .hero-content-enter-active,
  .hero-content-leave-active,
  .hero-cta {
    transition: none;
  }
  .hero-nav__fill.is-running { animation: none; transform: none; }
}
</style>
