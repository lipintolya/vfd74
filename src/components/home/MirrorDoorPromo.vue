<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import { REFLEX_IMAGE, REFLEX_MIN_BLADE_PRICE, REFLEX_MIN_KIT_PRICE } from '../../data/skrytye-dveri-products'
import BenefitItem from './BenefitItem.vue'

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
        <!-- Контент -->
        <div class="order-2 flex flex-col gap-5 p-8 sm:gap-6 sm:p-10 lg:order-1">
          <div>
            <p class="t-eyebrow mb-2">Новинка</p>
            <h2
              id="reflex-promo-heading"
              class="text-2xl font-medium leading-tight tracking-tight text-slate-900 sm:text-3xl"
            >
              Скрытая дверь с зеркалом «Рефлекс»
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Зеркало во всю высоту полотна визуально расширяет пространство и добавляет
              комнате света. Дверь устанавливается вровень со стеной — тот же эффект
              скрытности, что и у «Секрета», плюс полноценное зеркало вместо глухого полотна.
            </p>
          </div>

          <ul class="flex flex-col gap-3 border-y border-slate-100 py-4 sm:gap-3.5 sm:py-5" role="list">
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

          <div>
            <div class="flex items-baseline justify-between text-base text-slate-500">
              <span>Полотно от</span>
              <span class="text-lg font-medium text-slate-900 sm:text-xl">{{ fmt(REFLEX_MIN_BLADE_PRICE) }}</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-base text-slate-500"><span class="sm:hidden">Комплект от</span><span class="hidden sm:inline">Комплект под ключ от</span></span>
              <span class="text-2xl font-medium text-slate-900 sm:text-3xl">{{ fmt(REFLEX_MIN_KIT_PRICE) }}</span>
            </div>
          </div>

          <a
            href="/catalog/skrytye-dveri/#reflex"
            class="flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 text-base font-medium text-white transition-colors hover:bg-slate-800"
          >
            Смотреть «Рефлекс»
            <svg class="h-4.5 w-4.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>

        <!-- Фото -->
        <div class="order-1 relative aspect-4/3 sm:aspect-video lg:order-2 lg:aspect-auto lg:max-h-125">
          <img
            :src="REFLEX_IMAGE"
            alt="Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной"
            loading="lazy"
            decoding="async"
            width="1920"
            height="1080"
            class="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  </section>
</template>
