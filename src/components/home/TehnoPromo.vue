<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import { coatingGroupCopy } from '../../data/series-descriptions'
import BenefitItem from './BenefitItem.vue'
import PhotoAutoplaySlider from '../ui/PhotoAutoplaySlider.vue'

/* Цена — пропы из index.astro (живой запрос к Supabase через getCatalogCards,
   тот же путь, что у каталога), не хардкод: если цена в базе поменяется,
   плитка на главной обновится сама при следующей сборке. */
const props = defineProps<{
  bladePrice: number | null
  kitPrice:   number | null
}>()

const RENDER_CDN = 'https://storage.yandexcloud.net/vfd74ru/doors-main_renders/tehno/'
const SLIDES = [
  `${RENDER_CDN}tehno_render_1.webp`,
  `${RENDER_CDN}tehno_render.webp`,
  `${RENDER_CDN}render_3.webp`,
]

/* Эмалекс — те же 3 официальных преимущества покрытия, что и на /catalog/
   (coatingGroupCopy), не отдельный маркетинговый текст под эту плитку. */
const benefits = coatingGroupCopy.emalex?.benefits ?? []

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="tehno-heading">
    <div class="container">
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1.1fr_1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <div class="relative aspect-4/3 sm:aspect-video lg:aspect-auto">
          <PhotoAutoplaySlider
            :images="SLIDES"
            alt="Межкомнатная дверь серии «Техно» в цвете Эмалекс белый"
          />
        </div>

        <!-- Контент -->
        <div class="flex flex-col gap-4 p-6 sm:gap-5 sm:p-8">
          <div>
            <p class="t-eyebrow mb-2">Новинка</p>
            <h2
              id="tehno-heading"
              class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl"
            >
              Серия Техно
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Новая коллекция на покрытии Эмалекс для тех, кто ищет сдержанный,
              технологичный характер интерьера.
            </p>
          </div>

          <ul class="flex flex-col gap-2 border-y border-slate-100 py-3 sm:gap-2.5 sm:py-4" role="list">
            <BenefitItem v-for="b in benefits" :key="b.title" :text="b.title">
              <svg class="h-4 w-4 shrink-0 text-teal-600" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </BenefitItem>
          </ul>

          <div class="inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            Техно 1, белый — в наличии на складе
          </div>

          <div v-if="bladePrice">
            <div class="flex items-baseline justify-between text-base text-slate-500">
              <span>Полотно от</span>
              <span class="text-lg font-medium text-slate-900 sm:text-xl">{{ fmt(bladePrice) }}</span>
            </div>
            <div v-if="kitPrice" class="mt-2 flex items-baseline justify-between">
              <span class="text-base text-slate-500"><span class="sm:hidden">Комплект от</span><span class="hidden sm:inline">Комплект под ключ от</span></span>
              <span class="text-2xl font-medium text-slate-900 sm:text-3xl">{{ fmt(kitPrice) }}</span>
            </div>
          </div>

          <a href="/catalog/series/tehno/" class="btn btn-primary w-full">
            Смотреть серию Техно
            <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
