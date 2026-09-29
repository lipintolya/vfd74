<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import BenefitItem from './BenefitItem.vue'
import PhotoAutoplaySlider from '../ui/PhotoAutoplaySlider.vue'

/* Цена и ссылка — пропы из index.astro (живой каталог через getCatalogCards,
   как у TehnoPromo), не хардкод: цена в базе поменяется — плитка обновится
   при следующей сборке; слаг модели тоже берётся из каталога (у «Штрих 2А»
   две записи — чёрный и золотой молдинг, — поэтому слаг с суффиксом id). */
defineProps<{
  modelHref:  string
  bladePrice: number | null
  kitPrice:   number | null
}>()

// Локальные копии 1300w (scripts/gen-home-images.mjs) вместо CDN-оригиналов.
const SLIDES = [
  '/renders/home/shtrih-2a-1.webp',
  '/renders/home/shtrih-2a-2.webp',
]

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="shtrih-heading">
    <div class="container">
      <!-- Зеркально TehnoPromo (фото справа на десктопе), чтобы два соседних
           промо-блока не читались как копия друг друга. -->
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1fr_1.1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Кадры почти квадратные (1145×1374), дверь по центру — на мобильном
             5:6, чтобы не срезать полотно сверху и снизу. -->
        <div class="relative aspect-5/6 sm:aspect-4/3 lg:order-last lg:aspect-auto">
          <PhotoAutoplaySlider
            :images="SLIDES"
            alt="Межкомнатная дверь Урбан Штрих 2А в цвете Эмалекс бежевый с чёрным молдингом"
          />
        </div>

        <div class="flex flex-col gap-3.5 p-6 sm:gap-4 sm:p-7">
          <div>
            <p class="t-eyebrow mb-2">В наличии</p>
            <h2
              id="shtrih-heading"
              class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl"
            >
              Урбан Штрих 2А
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Цвет Эмалекс бежевый с чёрным молдингом — модель есть на складе,
              без ожидания изготовления.
            </p>
          </div>

          <ul class="grid grid-cols-1 gap-y-1.5 border-y border-slate-100 py-3" role="list">
            <BenefitItem text="Прочное покрытие Эмалекс защищает полотно от царапин и сколов">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3.5 19 6.3v5.2c0 4.7-3 7.9-7 9.5-4-1.6-7-4.8-7-9.5V6.3l7-2.8Z"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Алюминиевая кромка усиливает торцы и сохраняет аккуратный вид">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="6" y="3" width="12" height="18" rx="1.5"/>
                <path d="M9 3v18"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Надёжная конструкция для долгой ежедневной эксплуатации">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6"/>
              </svg>
            </BenefitItem>
          </ul>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="inline-flex w-fit items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              Эмалекс бежевый — в наличии на складе
            </div>
            <div v-if="bladePrice" class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
                Полотно
                <span class="text-lg font-medium text-slate-900">{{ fmt(bladePrice) }}</span>
              </span>
              <span v-if="kitPrice" class="flex items-baseline gap-1.5 text-sm text-slate-500">
                Комплект
                <span class="text-lg font-medium text-slate-900">{{ fmt(kitPrice) }}</span>
              </span>
            </div>
          </div>

          <a :href="modelHref" class="group/link mt-1 inline-flex w-full items-center justify-between gap-3 rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Смотреть модель
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500">
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
