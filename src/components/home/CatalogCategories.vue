<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'

interface Category {
  title:    string
  subtitle: string
  image:    string
  href:     string
  cta:      string
}

const CATEGORIES: Category[] = [
  {
    title:    'Межкомнатные двери',
    subtitle: 'Широкий выбор моделей, покрытий и цветов от официального дилера ВФД',
    image:    'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/cover_doors.webp',
    href:     '/catalog/',
    cta:      'Смотреть каталог',
  },
  {
    title:    'Входные двери',
    subtitle: 'Стальные двери с накладкой изнутри под интерьер — с монтажом в Челябинске',
    image:    'https://storage.yandexcloud.net/vfd74ru/metal_doors/Optima/render_optima.webp',
    href:     '/vhodnye-dveri/',
    cta:      'Смотреть входные',
  },
  {
    title:    'Алюминиевые перегородки',
    subtitle: 'Стеклянные перегородки с алюминиевым профилем — под ключ за 45 дней',
    image:    'https://storage.yandexcloud.net/catalog-vfd/catalog_preview/catalog-preview3.webp',
    href:     '/partitions/',
    cta:      'Смотреть перегородки',
  },
]

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section
    ref="sectionEl"
    class="section bg-white"
    aria-labelledby="cat-heading"
  >
    <div class="container">

      <!-- ── Header ── -->
      <header
        class="mb-10 max-w-3xl transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:mb-16"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'"
      >
        <p class="t-eyebrow mb-3">
          Что мы предлагаем
        </p>
        <h2 id="cat-heading" class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
          Каталог
        </h2>
        <p class="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          Межкомнатные и входные двери, алюминиевые перегородки
          от официального дилера Владимирской фабрики дверей
        </p>
      </header>

      <!-- ── Bento grid ── -->
      <div
        class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-[1fr_2fr] lg:gap-5"
      >

        <!-- Hero card -->
        <article
          class="overflow-hidden rounded-3xl transition-[opacity,transform] duration-600 ease-out motion-reduce:transition-none"
          :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          <a
            :href="CATEGORIES[0]!.href"
            class="group relative flex h-full aspect-4/3 flex-col overflow-hidden rounded-3xl no-underline md:aspect-auto md:min-h-105 lg:min-h-135 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-3"
            :aria-label="CATEGORIES[0]!.title"
          >
            <!-- Background -->
            <div
              class="absolute inset-0 bg-cover bg-center transition-transform duration-600 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              :style="{ backgroundImage: `url(${CATEGORIES[0]!.image})` }"
              aria-hidden="true"
            />
            <!-- Overlay -->
            <div
              class="absolute inset-0 bg-linear-to-t from-black/75 via-slate-900/25 to-transparent"
              aria-hidden="true"
            />
            <!-- Content -->
            <div class="relative z-10 mt-auto flex flex-col gap-4 p-5 sm:p-8">
              <div class="flex flex-col gap-2">
                <h3 class="text-xl font-medium leading-snug text-white">{{ CATEGORIES[0]!.title }}</h3>
                <p class="max-w-md text-sm leading-relaxed text-white/80">{{ CATEGORIES[0]!.subtitle }}</p>
              </div>
              <span
                class="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-white/50 px-4 py-2 text-step-0 font-semibold text-white transition-[background-color,border-color,transform] duration-200 ease-out group-hover:-translate-y-px group-hover:border-white group-hover:bg-white/15"
                aria-hidden="true"
              >
                {{ CATEGORIES[0]!.cta }}
                <svg class="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </a>
        </article>

        <!-- Right column — 2 cards -->
        <div class="grid grid-rows-2 gap-4 lg:gap-5">
          <article
            v-for="(cat, idx) in CATEGORIES.slice(1)"
            :key="cat.href"
            class="overflow-hidden rounded-3xl transition-[opacity,transform] duration-600 ease-out motion-reduce:transition-none"
            :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
            :style="{ transitionDelay: visible ? `${(idx + 1) * 130}ms` : '0ms' }"
          >
            <a
              :href="cat.href"
              class="group relative flex h-full aspect-3/2 flex-col overflow-hidden rounded-3xl no-underline md:aspect-auto md:min-h-50 lg:min-h-63.75 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-3"
              :aria-label="cat.title"
            >
              <!-- Background -->
              <div
                class="absolute inset-0 bg-cover bg-center transition-transform duration-600 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                :style="{ backgroundImage: `url(${cat.image})` }"
                aria-hidden="true"
              />
              <!-- Overlay -->
              <div
                class="absolute inset-0 bg-linear-to-t from-black/75 via-slate-900/25 to-transparent"
                aria-hidden="true"
              />
              <!-- Content -->
              <div class="relative z-10 mt-auto flex flex-col gap-3 p-5 sm:p-6">
                <div class="flex flex-col gap-1.5">
                  <h3 class="text-lg font-medium leading-snug text-white">{{ cat.title }}</h3>
                  <p class="max-w-md text-sm leading-relaxed text-white/80">{{ cat.subtitle }}</p>
                </div>
                <span
                  class="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-white/50 px-4 py-2 text-step-0 font-semibold text-white transition-[background-color,border-color,transform] duration-200 ease-out group-hover:-translate-y-px group-hover:border-white group-hover:bg-white/15"
                  aria-hidden="true"
                >
                  {{ cat.cta }}
                  <svg class="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </a>
          </article>
        </div>

      </div>
    </div>
  </section>
</template>
