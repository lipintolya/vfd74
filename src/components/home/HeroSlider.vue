<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { HERO_COVER_IMAGE, HERO_COVER_IMAGE_SRCSET } from '../../data/hero-image'
import HeroTile, { type Tile } from './HeroTile.vue'
import type { HeroData } from '../../lib/home-promos'
import { companyLegalInfo } from '../../lib/contacts-data'
import { salonStatus } from '../../lib/salon-hours'
import { pluralRu } from '../../lib/plural'

/**
 * Первый экран главной.
 *
 * Слева — постоянный текст (H1 под «двери в Челябинске», лид, кнопка, три
 * цифры каталога), за ним листаются фото; у каждого кадра подпись «На фото»
 * со ссылкой на модель. Раньше H1 менялся вместе со слайдом — заголовок
 * страницы не должен зависеть от того, какой кадр сейчас показан.
 * Справа — то, что спрашивают следующим: что есть на складе, скрытые двери
 * по акции, где салон и открыт ли он сейчас.
 */
const props = defineProps<{
  hero: HeroData
}>()

const SLIDER_INTERVAL_MS = 9000
const SWIPE_THRESHOLD    = 50

interface Slide {
  id:          number
  image:       string
  /** srcset с ресайзами (public/renders/hero, scripts/gen-responsive.mjs);
      оригинал — самый широкий кандидат. У первого слайда свой набор. */
  srcset?:     string
  /** «На фото: …» — подпись кадра со ссылкой на модель/серию */
  photoOf?:    { label: string; href: string } | null
  /** object-position картинки, если главный объект не в центре кадра
      (по умолчанию — center). */
  imagePosition?: string
}

const slides: Slide[] = [
  {
    /* Первый слайд — единственный <h1> на главной (см. шаблон ниже), поэтому
       именно он должен нести ключевые запросы. "ВФД Челябинск" — самый частый
       брендовый запрос (по нему в органике выше нас страница самой фабрики,
       не салона — см. обсуждение), поэтому фраза идёт слитно в начале H1,
       а не разбита "ВФД на Кашириных ... в Челябинске" как раньше. */
    id: 1,
    image: HERO_COVER_IMAGE,
    /* Скрытая дверь на рендере у правого края (~79% ширины): при
       центральном кропе на узком экране (телефон, DPR 3 берёт полный
       оригинал из srcset) она уходила бы из кадра — держим кадр на ней. */
    imagePosition: '80% center',
    photoOf: props.hero.coverModel,
  },
  {
    id: 2,
    image: '/media/Main_page_perfomance-covers/innova_render.webp',
    srcset: '/renders/hero/innova-render-640.webp 640w, /renders/hero/innova-render-960.webp 960w, /media/Main_page_perfomance-covers/innova_render.webp 1448w',
    photoOf: { label: 'серия Иннова, покрытие ПЭТ', href: '/catalog/series/innova/' },
  },
  {
    id: 4,
    image: '/media/Main_page/left_bento/render_urban2.webp',
    srcset: '/renders/hero/urban2-render-640.webp 640w, /renders/hero/urban2-render-960.webp 960w, /media/Main_page/left_bento/render_urban2.webp 1254w',
    photoOf: { label: 'Урбан 2ГР, Эмалекс', href: '/models/urban-2gr-urban-a2d505/' },
  },
]

const rub = (n: number) => `${n.toLocaleString('ru-RU')}\u00a0₽`

/* Цифры под лидом — то, что отличает салон: ассортимент, цена входа, склад */
const facts = [
  { value: String(props.hero.models), label: `${pluralRu(props.hero.models, ['модель', 'модели', 'моделей'])} в каталоге` },
  ...(props.hero.minPrice ? [{ value: `от ${rub(props.hero.minPrice)}`, label: 'за полотно' }] : []),
  { value: '12 мес.', label: 'гарантия на монтаж' },
]

const street = companyLegalInfo.address.legal.replace(/^г\.\s*[^,]+,\s*/, '')

/* Статус салона — только на клиенте и по времени Челябинска (lib/salon-hours):
   в статичном HTML нейтральное «Без выходных», после загрузки — «Открыто
   до 20:00» / «Откроемся в 10:00». Пересчёт раз в минуту. */
const status = ref({ time: 'с 10:00', label: 'Без выходных' })
let statusTimer: ReturnType<typeof setInterval> | null = null

/* Плитки справа — один язык с плитками «Каталога» ниже (HeroTile.vue):
   фото на всю площадь или графит, название, одна фраза, ссылка текстом. */
const tiles = computed<Tile[]>(() => [
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
      sizes: '(max-width: 1023px) 50vw, 20vw',
      width: 960, height: 1158,
    },
  },
  {
    id: 'salon',
    href: '/contacts/',
    title: status.value.label,
    fact: `Салон на ${street}`,
    cta: 'Как добраться',
    big: status.value.time,
  },
])

/* ── Slider state ── */
const activeIndex     = ref(0)
const touchStartX     = ref(0)
const touchStartY     = ref(0)
const isPaused        = ref(false)
const autoplayEnabled = ref(true)

const currentSlide = computed(() => slides[activeIndex.value] ?? slides[0])

/* Пока слайды листаются сами, смену текста скринридеру не зачитываем —
   иначе он перебивает чтение страницы каждые 9 секунд. После паузы или
   ручного управления — polite. */
const liveMode = computed(() => (autoplayEnabled.value && !isPaused.value ? 'off' : 'polite'))

/* Картинки слайдов лежат в DOM все сразу (кросс-фейд по opacity), поэтому
   loading="lazy" их не откладывает: они «в зоне видимости» и браузер тянет
   все пять сразу после LCP (~500 КБ на телефоне, мимо глаз пользователя).
   Загружаем слайд только когда он активен или станет следующим/предыдущим —
   пока src не задан, <img> запроса не делает. */
const loaded = ref<boolean[]>(slides.map((_, i) => i === 0))
const ensureLoaded = (i: number) => {
  const n = slides.length
  loaded.value[(i % n + n) % n] = true
}
watch(activeIndex, i => { ensureLoaded(i); ensureLoaded(i + 1); ensureLoaded(i - 1) })

let timer: ReturnType<typeof setInterval> | null = null

const next  = () => { activeIndex.value = (activeIndex.value + 1) % slides.length }
const prev  = () => { activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length }
const stop  = () => { if (timer !== null) { clearInterval(timer); timer = null } }
const start = () => { stop(); timer = setInterval(next, SLIDER_INTERVAL_MS) }

const goTo = (i: number) => { activeIndex.value = i; start() }

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
  const tick = () => { status.value = salonStatus() }
  tick()
  statusTimer = setInterval(tick, 60_000)

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  autoplayEnabled.value = !prefersReduced
  if (!prefersReduced) start()

  /* Следующий слайд подгружаем заранее, когда страница уже дорисована и
     канал свободен, — к первой смене (через 9 с) он будет готов. */
  const warmNext = () => setTimeout(() => ensureLoaded(1), 1500)
  if (document.readyState === 'complete') warmNext()
  else window.addEventListener('load', warmNext, { once: true })
})
onUnmounted(() => { stop(); if (statusTimer) clearInterval(statusTimer) })
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 lg:min-h-125 xl:min-h-140">

        <!-- ══ HERO SLIDER ══ -->
        <div
          class="hero-main lg:col-span-7 relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[36rem] sm:min-h-[38rem] md:min-h-0 md:aspect-16/11 lg:aspect-auto lg:h-auto"
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
          <!-- Backgrounds — все слайды смонтированы всегда, активный переключается
               прозрачностью. Раньше 1-й слайд жил на v-if (жёсткое размонтирование
               без анимации), остальные — на v-show (display toggle, transition на
               opacity не срабатывал, т.к. opacity не менялся). Из-за этого переход
               был рваным. Теперь у всех один и тот же кросс-фейд. -->
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

          <!-- Затемнение — z-10, т.к. активный слайд в .hero-slide-active получил
               z-index:1 для кросс-фейда и без явного z-index здесь оказывался
               бы поверх затемнения. Плотное снизу, где текст, и прозрачное
               сверху, чтобы кадр не тускнел целиком. -->
          <div class="hero-scrim absolute inset-0 z-10" aria-hidden="true" />

          <!-- Content — постоянный: H1 страницы не меняется вместе с кадром -->
          <div class="relative z-10 flex h-full items-end">
            <div class="hero-content-text p-5 pb-16 sm:p-8 sm:pb-20 lg:p-10 lg:pb-22 max-w-2xl text-white">
              <h1 class="hero-title text-step-5 font-medium mb-3 sm:mb-4">
                Межкомнатные и входные двери в&nbsp;Челябинске
              </h1>
              <p class="hero-lead text-step-1 sm:text-step-2 text-white/85 mb-6 sm:mb-7 leading-relaxed max-w-lg">
                Фирменный салон Владимирской фабрики дверей на&nbsp;Братьев Кашириных,&nbsp;131Б: замер, доставка и&nbsp;установка своей бригадой.
              </p>
              <a href="/catalog/" class="hero-cta">
                Смотреть каталог
                <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <dl class="hero-facts">
                <div v-for="f in facts" :key="f.label" class="hero-fact">
                  <dt class="hero-fact__label">{{ f.label }}</dt>
                  <dd class="hero-fact__value">{{ f.value }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Нижняя строка: точки слайдов слева, «На фото» справа -->
          <div class="hero-bottom absolute inset-x-5 bottom-5 sm:inset-x-8 sm:bottom-8 lg:inset-x-10 lg:bottom-10 z-20 flex items-center justify-between gap-4">
            <div
              class="-ml-0.5 flex shrink-0"
              role="tablist"
              aria-label="Фото в слайдере"
            >
              <button
                v-for="(slide, i) in slides"
                :key="i"
                type="button"
                role="tab"
                :aria-label="slide.photoOf ? `Фото ${i + 1}: ${slide.photoOf.label}` : `Фото ${i + 1}`"
                :aria-selected="i === activeIndex"
                class="dot-nav__btn"
                @click="goTo(i)"
              >
                <span
                  class="dot-nav__item dot-nav__item--progress"
                  :class="{ 'dot-nav__item--active': i === activeIndex }"
                >
                  <span
                    v-if="i === activeIndex && autoplayEnabled && !isPaused"
                    :key="activeIndex"
                    class="dot-nav__progress"
                    :style="{ animationDuration: `${SLIDER_INTERVAL_MS}ms` }"
                  />
                </span>
              </button>
            </div>
            <Transition name="hero-content" mode="out-in">
              <a
                v-if="currentSlide.photoOf"
                :key="currentSlide.id"
                :href="currentSlide.photoOf.href"
                class="hero-photo-of"
                :aria-live="liveMode"
              >
                На фото: {{ currentSlide.photoOf.label }}
              </a>
            </Transition>
          </div>
        </div>

        <!-- ══ RIGHT BENTO ══ -->
        <!-- Строки равной высоты только на десктопе: на планшете плитки идут
             своей высотой, иначе под широкой образуется пустота -->
        <div class="lg:col-span-5 grid lg:grid-rows-2 gap-4 sm:gap-5 lg:gap-6">

          <HeroTile :tile="tiles[0]!" wide />
          <div class="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <HeroTile :tile="tiles[1]!" />
            <HeroTile :tile="tiles[2]!" />
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ════ SLIDER OPTIMIZATION ════ */
/* Container optimization for LCP */
.hero-main {
  content-visibility: auto;
  contain-intrinsic-size: auto 37.5rem;
}

/* Затемнение: плотное снизу, где текст и точки, к верху сходит на нет.
   Равномерная вуаль (было) тускнила весь кадр и всё равно не держала
   белый текст на светлых деталях — штора, рейки, дверь. */
.hero-scrim {
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 0.78) 0%,
    rgb(0 0 0 / 0.55) 28%,
    rgb(0 0 0 / 0.18) 58%,
    rgb(0 0 0 / 0) 80%
  );
}

.hero-title {
  line-height: 1.1;
  letter-spacing: -0.025em;
  text-wrap: balance;
}
.hero-lead { text-wrap: pretty; }

/* Цифры под кнопкой: значение крупно и моноширинно, подпись под ним.
   dl ради семантики, визуально значение идёт первым (column-reverse). */
.hero-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  margin: 1.75rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid rgb(255 255 255 / 0.22);
}
.hero-fact {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.25rem;
}
.hero-fact__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 0.9vw + 0.95rem, 1.75rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.hero-fact__label {
  font-size: 0.8125rem;
  color: rgb(255 255 255 / 0.72);
}

/* «На фото: …» — подпись кадра текстом, без плашки */
.hero-photo-of {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  color: rgb(255 255 255 / 0.8);
  text-decoration: underline;
  text-decoration-color: rgb(255 255 255 / 0.35);
  text-underline-offset: 0.3em;
  transition: color 150ms ease, text-decoration-color 150ms ease;
}
.hero-photo-of:hover { color: #fff; text-decoration-color: #fff; }

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
  background: #f4f4f5;  /* zinc-100 */
  transform: translateY(-1px);
}
.hero-cta:hover .btn-arrow-icon { transform: translateX(2px); }
.hero-cta:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* Кросс-фейд фона — все слайды в стеке, активный получает opacity:1 */
.hero-slide {
  opacity: 0;
  z-index: 0;
  will-change: opacity;
  transition: opacity 900ms ease-in-out;
}
.hero-slide-active {
  opacity: 1;
  z-index: 1;
}

/* Плавная смена текста (заголовок/описание/CTA) синхронно с фоном */
.hero-content-enter-active,
.hero-content-leave-active {
  transition: opacity 350ms ease, transform 350ms ease;
}
.hero-content-enter-from,
.hero-content-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Точки-навигация — общий вид и прогресс-бар вынесены в global.css
   (.dot-nav__btn/.dot-nav__item/.dot-nav__progress), единая система для
   всех автослайдеров сайта (Hero, PhotoAutoplaySlider). */
@media (prefers-reduced-motion: reduce) {
  .hero-slide,
  .hero-content-enter-active,
  .hero-content-leave-active,
  .hero-cta {
    transition: none;
    animation: none;
  }
}
</style>
