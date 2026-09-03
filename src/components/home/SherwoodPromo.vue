<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'

/**
 * Промо серии «Урбан Древесный» — коллекция оттенков Шервуд.
 * Стоит между хиро и плашкой акций. Обложка ландшафтная (16:9), поэтому
 * лежит во всю ширину карточки в почти естественных пропорциях, а не в
 * боковой колонке (там object-cover зумил её до одной двери). Ссылок на
 * каталог пока нет намеренно: моделей серии ещё нет в каталоге, блок
 * имиджевый — вместо CTA тег «Новинка. Скоро в каталоге». Когда серия
 * появится — заменить тег на CTA по образцу MirrorDoorPromo.vue.
 */

const CDN = 'https://storage.yandexcloud.net/vfd74ru/promo_main/sherwood/'

const COVER = `${CDN}sherwood_promo.webp`

interface Shade {
  name: string
  description: string
  swatch: string
}

const SHADES: Shade[] = [
  { name: 'Янтарь',   description: 'золотистое тепло, создающее атмосферу уюта',          swatch: `${CDN}yantar.webp` },
  { name: 'Бурбон',   description: 'насыщенная глубина для статусных интерьеров',         swatch: `${CDN}burbon.webp` },
  { name: 'Солярис',  description: 'солнечная лёгкость, наполняющая пространство светом', swatch: `${CDN}soliaris.webp` },
  { name: 'Вишня',    description: 'благородный характер для изысканных решений',         swatch: `${CDN}cherry.webp` },
]

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white pb-0!" aria-labelledby="sherwood-promo-heading">
    <div class="container">
      <div
        class="overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Фото — ландшафтное, во всю ширину, без агрессивного кропа.
             Поверх — затемнение и 4 двери коллекции, проявляются по очереди
             (CSS transition + transition-delay, без JS-анимаций). -->
        <div class="relative aspect-3/2 sm:aspect-21/10 lg:aspect-3/1">
          <img
            :src="COVER"
            alt="Дверь серии Урбан Древесный с текстурой дерева коллекции Шервуд в интерьере"
            loading="lazy"
            decoding="async"
            width="1672"
            height="941"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <!-- Тег вместо CTA — серии пока нет в каталоге, ссылке некуда вести. -->
          <span class="absolute bottom-[8%] left-[4%] inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-sm font-medium tracking-wide text-white backdrop-blur-md">
            Новинка. Скоро в каталоге
          </span>
        </div>

        <!-- Контент -->
        <div class="grid grid-cols-1 gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div class="flex flex-col justify-center gap-4">
            <div>
              <p class="t-eyebrow mb-2">Серия Урбан Древесный</p>
              <h2
                id="sherwood-promo-heading"
                class="text-2xl font-medium leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl"
              >
                Характер интерьера — в&nbsp;текстуре дерева
              </h2>
              <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
                Четыре уникальных оттенка коллекции Шервуд вдохновлены природой
                и&nbsp;созданы для современных интерьеров.
              </p>
            </div>
            <p class="hidden text-base font-medium leading-relaxed text-slate-900 sm:text-lg lg:block">
              Откройте для себя разницу текстур.
              Найдите свой оттенок характера.
            </p>
          </div>

          <!-- Оттенки коллекции Шервуд -->
          <div class="border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400 sm:mb-5">
              Коллекция Шервуд
            </p>
            <ul class="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:gap-6" role="list">
              <li
                v-for="shade in SHADES"
                :key="shade.name"
                class="group flex items-center gap-4"
              >
                <span class="relative shrink-0 rounded-full p-1 ring-1 ring-slate-200 transition-shadow duration-300 group-hover:ring-2 group-hover:ring-teal-500/60">
                  <img
                    :src="shade.swatch"
                    :alt="`Оттенок ${shade.name} — текстура дерева коллекции Шервуд`"
                    loading="lazy"
                    decoding="async"
                    width="160"
                    height="160"
                    class="h-16 w-16 rounded-full object-cover shadow-inner transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20"
                  />
                </span>
                <span class="flex flex-col gap-0.5">
                  <span class="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{{ shade.name }}</span>
                  <span class="text-sm leading-snug text-slate-500 sm:text-step-1">{{ shade.description }}</span>
                </span>
              </li>
            </ul>
            <p class="mt-6 text-base font-medium leading-relaxed text-slate-900 sm:text-lg lg:hidden">
              Откройте для себя разницу текстур.
              Найдите свой оттенок характера.
            </p>
            <!-- Мобильный тег — на фото ему не хватает места -->
            <span class="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium tracking-wide text-slate-700 lg:hidden">
              Новинка. Скоро в каталоге
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
