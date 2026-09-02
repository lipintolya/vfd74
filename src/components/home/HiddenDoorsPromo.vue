<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import {
  SECRET_MIN_BLADE_PRICE, SECRET_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE_ORIGINAL, SECRET_MIN_KIT_PRICE_ORIGINAL,
  SECRET_PROMO_ACTIVE,
} from '../../data/skrytye-dveri-products'
import BenefitItem from './BenefitItem.vue'

const COVER_IMAGE = 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/secret_render_cover.webp'

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="hidden-doors-heading">
    <div class="container">
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1.1fr_1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Фото — без текстового оверлея, суть продукта в том, что дверь
             сливается со стеной. lg:aspect-auto + items-stretch на родителе
             тянет фото на всю высоту текстовой колонки — без потолка по
             высоте: с потолком (было lg:max-h-125) фото не дотягивалось до
             низа карточки и выглядело подвешенным. -->
        <div class="relative aspect-4/3 sm:aspect-video lg:aspect-auto">
          <img
            :src="COVER_IMAGE"
            alt="Скрытая дверь серии «Секрет» — полотно заподлицо со стеной"
            loading="lazy"
            decoding="async"
            width="1672"
            height="941"
            class="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <!-- Контент -->
        <div class="flex flex-col gap-5 p-8 sm:gap-6 sm:p-10">
          <div>
            <h2
              id="hidden-doors-heading"
              class="text-2xl font-medium leading-tight tracking-tight text-slate-900 sm:text-3xl"
            >
              Скрытые двери из наличия в Челябинске
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Полотно заподлицо со стеной. Алюминиевый короб без наличников и видимых петель — под покраску, штукатурку или обои в цвет стены.
            </p>
          </div>

          <ul class="flex flex-col gap-3 border-y border-slate-100 py-4 sm:gap-3.5 sm:py-5" role="list">
            <BenefitItem text="Полностью алюминиевый короб">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 8l9-5 9 5-9 5-9-5Z"/>
                <path d="M3 8v8l9 5 9-5V8"/>
                <path d="M12 13v8"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Реверсивный монтаж — сторона открывания на выбор">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 12h18"/>
                <path d="M7 8l-4 4 4 4"/>
                <path d="M17 8l4 4-4 4"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Полотна нестандартной высоты">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3v18"/>
                <path d="M8 7l4-4 4 4"/>
                <path d="M8 17l4 4 4-4"/>
              </svg>
            </BenefitItem>
            <BenefitItem text="Грунт — готово под покраску или декор">
              <svg class="h-5.5 w-5.5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="14" height="6" rx="1.5"/>
                <path d="M8 10v4a2 2 0 0 0 2 2h1v4"/>
              </svg>
            </BenefitItem>
          </ul>

          <div
            v-if="SECRET_PROMO_ACTIVE"
            class="inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
          >
            🔥 Акция -8% до 31 августа
          </div>

          <div>
            <div class="flex items-baseline justify-between text-base text-slate-500">
              <span>Полотно от</span>
              <span class="flex items-baseline gap-1.5">
                <span v-if="SECRET_PROMO_ACTIVE" class="text-sm text-slate-600 line-through">{{ fmt(SECRET_MIN_BLADE_PRICE_ORIGINAL) }}</span>
                <span class="text-lg font-medium text-slate-900 sm:text-xl">{{ fmt(SECRET_MIN_BLADE_PRICE) }}</span>
              </span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-base text-slate-500"><span class="sm:hidden">Комплект от</span><span class="hidden sm:inline">Комплект под ключ от</span></span>
              <span class="flex items-baseline gap-1.5">
                <span v-if="SECRET_PROMO_ACTIVE" class="text-base text-slate-600 line-through">{{ fmt(SECRET_MIN_KIT_PRICE_ORIGINAL) }}</span>
                <span class="text-2xl font-medium text-slate-900 sm:text-3xl">{{ fmt(SECRET_MIN_KIT_PRICE) }}</span>
              </span>
            </div>
          </div>

          <a
            href="/catalog/skrytye-dveri/"
            class="flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 text-base font-medium text-white transition-colors hover:bg-slate-800"
          >
            Смотреть скрытые двери
            <svg class="h-4.5 w-4.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
