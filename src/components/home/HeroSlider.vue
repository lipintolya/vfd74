<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const SLIDER_INTERVAL_MS = 9000
const SWIPE_THRESHOLD    = 50

interface Slide {
  id:          number
  image:       string
  title:       string
  subtitle:    string
  description: string
  cta?:        string
  ctaHref?:    string
}

const slides: Slide[] = [
  {
    /* Первый слайд — единственный <h1> на главной (см. шаблон ниже), поэтому
       именно он должен нести ключевые запросы ("двери Челябинск", "купить
       двери Челябинск"), а не промо конкретной модели — иначе H1 страницы
       вообще не содержит основной ключевик. Штрих-промо ушёл на 2-й слайд
       (крутится через 9с и доступен по точкам навигации), сам по себе он
       никуда не делся. */
    id: 1,
    image: 'https://storage.yandexcloud.net/vfd74ru/promo_main/main_render_innova.webp',
    title: 'ВФД на Кашириных — двери в Челябинске',
    subtitle: 'Официальный дилер',
    description: 'Подберём дверь для дома или квартиры: каталог моделей, цены и установка',
    cta: 'Смотреть каталог',
    ctaHref: '/catalog/',
  },
  {
    /* Сезонное промо — начался сезон входных дверей для частных домов,
       второй слайд (сразу после H1) для максимальной видимости. */
    id: 6,
    image: '/renders/hero/comforttermo-promo.webp',
    title: 'Входные двери с терморазрывом',
    subtitle: 'Уличная дверь «Комфорт Термо» для частного дома',
    description: 'Полотно 110 мм, короб с терморазрывом 150 мм, 3 контура EPDM-уплотнения, цвет «Букле графит» — от 42 660 ₽',
    cta: 'Смотреть дверь',
    ctaHref: '/vhodnye-dveri/#comforttermo',
  },
  {
    id: 5,
    image: 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/strix_render.webp',
    title: 'Премиум дизайн по доступной цене',
    subtitle: 'Новинка — «Штрих» уже в каталоге',
    description: 'Серия Урбан: алюминиевая кромка с графичным акцентом, покрытие Эмалекс — от 14 300 ₽ за полотно',
    cta: 'Смотреть модель',
    ctaHref: '/models/shtrih-2a-urban-78543d/',
  },
  {
    id: 2,
    image: 'https://storage.yandexcloud.net/catalog-vfd/covers/innova-1.webp',
    title: 'Серия «Иннова» уже в салоне',
    subtitle: 'Не оставляет отпечатков пальцев',
    description: 'Новинка в инновационном покрытии ПЭТ',
    cta: 'Смотреть каталог',
    ctaHref: '/catalog/',
  },
  {
    id: 3,
    image: 'https://storage.yandexcloud.net/catalog-vfd/covers/linea-1.webp',
    title: 'Серия «Линеа» уже в салоне',
    subtitle: 'Современный дизайн по доступной цене',
    description: 'Светостойкая эмаль с фрезерованными элементами и алюминиевым декором',
    cta: 'Смотреть каталог',
    ctaHref: '/catalog/',
  },
  {
    id: 4,
    image: 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/render_urban2.webp',
    title: 'Урбан — городской стиль для вашего интерьера',
    subtitle: 'Двери от 18 000 ₽ за комплект',
    description: 'Лаконичные формы, полипропиленовое покрытие Ренолит (Германия) с эффектом эмали',
    cta: 'Смотреть модель',
    ctaHref: '/models/urban-2gr-urban-a2d505/',
  },
]

/* ── Slider state ── */
const activeIndex = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isPaused    = ref(false)

const currentSlide = computed(() => slides[activeIndex.value] ?? slides[0])

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
  stop()
}

const onTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches[0]) return
  const dx = touchStartX.value - e.changedTouches[0].clientX
  const dy = touchStartY.value - e.changedTouches[0].clientY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    dx > 0 ? next() : prev()
  }
  setTimeout(start, 400)
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft')  { prev(); start() }
  if (e.key === 'ArrowRight') { next(); start() }
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersReduced) start()
})
onUnmounted(stop)
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 lg:min-h-130">

        <!-- ══ HERO SLIDER ══ -->
        <div
          class="lg:col-span-7 relative overflow-hidden rounded-3xl min-h-96 lg:h-auto"
          role="region"
          aria-label="Слайдер акций и новинок"
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
              :src="slide.image"
              alt=""
              :fetchpriority="i === 0 ? 'high' : undefined"
              :loading="i === 0 ? 'eager' : 'lazy'"
              :decoding="i === 0 ? 'sync' : 'async'"
              class="hero-slide absolute inset-0 w-full h-full object-cover object-center"
              :class="{ 'hero-slide-active': i === activeIndex }"
              aria-hidden="true"
            />
          </div>

          <!-- Overlay — z-10, т.к. активный слайд в .hero-slide-active получил
               z-index:1 для кросс-фейда и без явного z-index здесь оказывался
               бы поверх затемнения ── -->
          <div class="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/35 to-black/10" aria-hidden="true" />

          <!-- Content -->
          <div class="relative z-10 flex h-full items-end min-h-96 lg:min-h-0">
            <Transition name="hero-content" mode="out-in">
              <div :key="currentSlide.id" class="p-6 sm:p-8 lg:p-10 max-w-2xl text-white pb-16" aria-live="polite" aria-atomic="true">
                <p class="text-xs uppercase tracking-widest text-white/60 mb-2">
                  {{ currentSlide.subtitle }}
                </p>
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-medium mb-3 leading-tight">
                  {{ currentSlide.title }}
                </h1>
                <p class="text-sm sm:text-base text-white/85 mb-6 leading-relaxed">
                  {{ currentSlide.description }}
                </p>
                <a
                  v-if="currentSlide.cta && currentSlide.ctaHref"
                  :href="currentSlide.ctaHref"
                  class="btn btn-ghost"
                >
                  {{ currentSlide.cta }}
                  <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </Transition>
          </div>

          <!-- Dots -->
          <div
            class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2"
            role="tablist"
            aria-label="Навигация слайдера"
          >
            <button
              v-for="(slide, i) in slides"
              :key="i"
              type="button"
              role="tab"
              :aria-label="`Слайд ${i + 1}: ${slide.title}`"
              :aria-selected="i === activeIndex"
              class="dot"
              :class="i === activeIndex ? 'dot-active' : ''"
              @click="goTo(i)"
            />
          </div>
        </div>

        <!-- ══ RIGHT BENTO ══ -->
        <div class="lg:col-span-5 grid grid-rows-2 gap-5 lg:gap-6">

          <!-- Перегородки -->
          <div class="relative overflow-hidden rounded-3xl min-h-56">
            <img
              src="https://storage.yandexcloud.net/catalog-vfd/covers/alum-hero.webp"
              alt=""
              loading="lazy"
              decoding="async"
              class="absolute inset-0 w-full h-full object-cover object-center"
              aria-hidden="true"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-transparent" aria-hidden="true" />
            <div class="relative z-10 h-full p-6 flex flex-col justify-end text-white min-h-56">
              <p class="text-xs uppercase tracking-widest text-white/60 mb-1">Дизайнерские решения</p>
              <h3 class="text-xl font-medium mb-2 leading-snug">
                Алюминиевые перегородки и системы открывания
              </h3>
              <p class="text-sm text-white/80 mb-4">
                Изготовление в течение 45 дней после оформления заказа
              </p>
              <a href="/partitions/" class="btn btn-ghost">
                Узнать больше
                <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Bottom row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">

            <!-- О компании — тёмный фон по образцу карточек «Почему выбирают
                 нас» на /contacts/ (wtg-card--3, #18181a), а не teal-градиент. -->
            <div class="relative overflow-hidden rounded-2xl min-h-44" style="background-color: #18181a">
              <div class="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-black/25" aria-hidden="true" />
              <div class="relative z-10 h-full p-6 flex flex-col justify-between text-white min-h-44">
                <div>
                  <p class="text-xs uppercase tracking-widest text-white/60 mb-1">Салон ВФД на Кашириных</p>
                  <h4 class="font-medium text-base mb-2 leading-snug">Полный цикл: от замера до монтажа</h4>
                  <p class="text-sm text-white/75">Работаем в Челябинске с 2014 года</p>
                </div>
                <a href="/about/" class="btn btn-ghost mt-4">
                  Подробнее
                  <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Портфолио -->
            <div class="relative overflow-hidden rounded-2xl min-h-44">
              <img
                src="https://storage.yandexcloud.net/catalog-vfd/covers/ourworks.webp"
                alt=""
                loading="lazy"
                decoding="async"
                class="absolute inset-0 w-full h-full object-cover object-center"
                aria-hidden="true"
              />
              <div class="absolute inset-0 bg-black/55" aria-hidden="true" />
              <div class="relative z-10 h-full p-6 flex flex-col justify-between text-white min-h-44">
                <div>
                  <p class="text-xs uppercase tracking-widest text-white/60 mb-1">Портфолио</p>
                  <h4 class="font-medium text-base leading-snug mb-1">Фотоотчёты с объектов</h4>
                  <p class="text-sm text-white/75">Живые фото с монтажей — помогут определиться с выбором</p>
                </div>
                <a href="/portfolio/" class="btn btn-ghost mt-4">
                  Смотреть
                  <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ════ SLIDER OPTIMIZATION ════ */
/* Container optimization for LCP */
.lg\:col-span-7 {
  content-visibility: auto;
  contain-intrinsic-size: auto 520px;
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

/* Dots navigation */
.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 300ms ease-out, transform 200ms ease-out;
}
.dot:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.2);
}
.dot-active {
  background: #fff;
  transform: scale(1.3);
}
.dot:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .dot,
  .hero-slide,
  .hero-content-enter-active,
  .hero-content-leave-active {
    transition: none;
    animation: none;
  }
}
</style>