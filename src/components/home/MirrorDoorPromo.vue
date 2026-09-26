<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import { REFLEX_IMAGE, REFLEX_MIN_BLADE_PRICE, REFLEX_MIN_KIT_PRICE } from '../../data/skrytye-dveri-products'
import BenefitItem from './BenefitItem.vue'
import PhotoAutoplaySlider from '../ui/PhotoAutoplaySlider.vue'

// Локальные копии 1300w (scripts/gen-home-images.mjs) вместо CDN-оригиналов.
const SLIDES = [
  '/renders/home/reflex-1.webp',
  '/renders/home/reflex-2.webp',
  '/renders/home/reflex-3.webp',
  REFLEX_IMAGE,
]

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="reflex-promo-heading">
    <div class="container">
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1fr_1.1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Контент — тот же приём, что в HiddenDoorsPromo/TehnoPromo:
             список преимуществ в 2 колонки, цена одной строкой. -->
        <div class="order-2 flex flex-col gap-3.5 p-6 sm:gap-4 sm:p-7 lg:order-1">
          <div>
            <p class="t-eyebrow mb-2">Новинка</p>
            <h2
              id="reflex-promo-heading"
              class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl"
            >
              Скрытая дверь с зеркалом «Рефлекс»
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Зеркало во всю высоту полотна визуально расширяет пространство и добавляет
              комнате света. Дверь устанавливается вровень со стеной — тот же эффект
              скрытности, что и у «Секрета», плюс полноценное зеркало вместо глухого полотна.
            </p>
          </div>

          <ul class="grid grid-cols-1 gap-x-4 gap-y-1.5 border-y border-slate-100 py-3 sm:grid-cols-2" role="list">
            <BenefitItem text="Зеркало во всю высоту полотна">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="6" y="2" width="12" height="20" rx="1.5"/>
                <path d="M9 2v20M15 2v20" opacity="0.5"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Вровень со стеной — эффект скрытности">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 8l9-5 9 5-9 5-9-5Z"/>
                <path d="M3 8v8l9 5 9-5V8"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Индивидуальные размеры, высота до 2,5 м">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3v18"/>
                <path d="M8 7l4-4 4 4"/>
                <path d="M8 17l4 4 4-4"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Кромка: чёрная, серебро или золото">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a4 4 0 0 0 4-4c0-4.4-3.6-8-8-8Z"/>
                <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/>
                <circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="13" cy="8" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </BenefitItem>
          </ul>

          <div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
              Полотно
              <span class="text-lg font-medium text-slate-900">{{ fmt(REFLEX_MIN_BLADE_PRICE) }}</span>
            </span>
            <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
              Комплект
              <span class="text-lg font-medium text-slate-900">{{ fmt(REFLEX_MIN_KIT_PRICE) }}</span>
            </span>
          </div>

          <a href="/catalog/skrytye-dveri/#reflex" class="group/link mt-1 inline-flex w-full items-center justify-between gap-3 rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Смотреть «Рефлекс»
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500">
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </a>
        </div>

        <!-- Фото — lg:aspect-auto + items-stretch на родителе тянет фото на
             всю высоту текстовой колонки (без зазора сверху/снизу) — после
             сокращения отступов колонки высота уже соразмерна Hero,
             растяжка больше не выглядит непропорционально вытянутой. -->
        <div class="order-1 relative aspect-4/3 sm:aspect-video lg:order-2 lg:aspect-auto">
          <PhotoAutoplaySlider
            :images="SLIDES"
            alt="Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной"
          />
        </div>
      </div>
    </div>
  </section>
</template>
