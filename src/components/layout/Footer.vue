<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { companyLegalInfo } from '../../lib/contacts-data'

/* ============================================================
   Data
   ============================================================ */
const year = new Date().getFullYear()

const NAV_LINKS = [
  { href: '/',           label: 'Главная' },
  { href: '/catalog/',    label: 'Каталог' },
  { href: '/partitions/', label: 'Перегородки' },
  { href: '/designers/',  label: 'Дизайнерам' },
  { href: '/about/',      label: 'О нас' },
  { href: '/reviews/',    label: 'Отзывы' },
  { href: '/contacts/',   label: 'Контакты' },
] as const

const LEGAL_LINKS = [
  { href: '/promo-archive/', label: 'Архив акций' },
] as const

const CATEGORY_LINKS = [
  { href: '/catalog/',                label: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/',  label: 'Скрытые двери' },
  { href: '/vhodnye-dveri/',          label: 'Входные' },
  { href: '/partitions/',             label: 'Перегородки' },
  { href: '/catalog/decor/',          label: 'Декор' },
] as const

const CONTACTS = {
  phones:  companyLegalInfo.contacts.phone,
  email:   companyLegalInfo.contacts.email,
  address: companyLegalInfo.address.legal,
}

const { lat, lng } = companyLegalInfo.address.coordinates
const MAP_EMBED_URL = `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=16&pt=${lng}%2C${lat}&l=map&source=constructor`
const MAP_LINK = 'https://yandex.ru/maps/-/CPTwZPi-'

/* ============================================================
   Legal modal
   ============================================================ */
const isModalOpen  = ref(false)
const legalTrigger = useTemplateRef<HTMLButtonElement>('legalTriggerEl')
const legalPanel   = useTemplateRef<HTMLDivElement>('legalPanelEl')

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
  // Фокус внутрь модала после рендера
  requestAnimationFrame(() => {
    legalPanel.value
      ?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
      ?.focus()
  })
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
  legalTrigger.value?.focus()   // возвращаем фокус на триггер
}

const onKeydown = (e: KeyboardEvent) => {
  if (!isModalOpen.value) return
  if (e.key === 'Escape') { e.preventDefault(); closeModal() }

  // Фокус-ловушка внутри модала
  if (e.key === 'Tab' && legalPanel.value) {
    const focusable = Array.from(
      legalPanel.value.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
    if (!focusable.length) return
    const first = focusable[0]!
    const last  = focusable[focusable.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }
}

onMounted(()  => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <footer class="bg-fg text-white/80" aria-label="Подвал сайта">
    <div class="container">
      <div class="pt-16 pb-10">

        <!-- ── 4-колонка grid ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <!-- Brand -->
          <div>
            <a href="/" class="flex items-center gap-2 mb-4 w-fit" aria-label="ВФД на Кашириных — главная">
              <span class="text-lg font-semibold text-white tracking-wide">VFD</span>
              <span class="text-xs text-white/40 uppercase tracking-widest">Кашириных</span>
            </a>
            <p class="text-sm leading-relaxed text-white/60 max-w-xs">
              Фирменный салон дверей и интерьерных решений в Челябинске.
              Работаем с 2014 года.
            </p>
            <!-- Socials -->
            <div class="flex gap-4 mt-5" role="list" aria-label="Социальные сети">
              <div role="listitem">
                <a
                  href="https://vk.com/vfddoors74"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ВКонтакте (открывается в новой вкладке)"
                  class="opacity-60 hover:opacity-100 transition-opacity duration-200 block"
                >
                  <img src="/icons/w_vk.webp" alt="" class="w-6 h-6" width="24" height="24" loading="eager" fetchpriority="high" />
                </a>
              </div>
              <div role="listitem">
                <a
                  href="https://t.me/vfddoors74"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram (открывается в новой вкладке)"
                  class="opacity-60 hover:opacity-100 transition-opacity duration-200 block"
                >
                  <img src="/svg/w_tg_logo.svg" alt="" class="w-6 h-6" width="24" height="24" loading="eager" fetchpriority="high" />
                </a>
              </div>
              <div role="listitem">
                <a
                  href="https://max.ru/id452402308842_biz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Max (открывается в новой вкладке)"
                  class="opacity-60 hover:opacity-100 transition-opacity duration-200 block"
                >
                  <img src="/icons/w_max.webp" alt="" class="w-6 h-6" width="24" height="24" loading="eager" fetchpriority="high" />
                </a>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav aria-label="Навигация футера">
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Навигация
            </h2>
            <ul class="space-y-2.5 text-sm">
              <li v-for="link in NAV_LINKS" :key="link.href + link.label">
                <a
                  :href="link.href"
                  class="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Categories -->
          <nav aria-label="Категории товаров">
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Категории
            </h2>
            <ul class="space-y-2.5 text-sm">
              <li v-for="link in CATEGORY_LINKS" :key="link.label">
                <a
                  :href="link.href"
                  class="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Contacts -->
          <address class="not-italic">
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Контакты
            </h2>
            <ul class="space-y-3 text-sm">
              <li v-for="p in CONTACTS.phones" :key="p.raw">
                <a
                  :href="`tel:${p.raw}`"
                  class="text-white hover:text-teal-400 transition-colors duration-200 font-medium"
                >
                  {{ p.label }}
                </a>
              </li>
              <li>
                <a
                  :href="`mailto:${CONTACTS.email}`"
                  class="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {{ CONTACTS.email }}
                </a>
              </li>
              <li class="text-white/40 leading-relaxed">
                {{ CONTACTS.address }}
              </li>
            </ul>
          </address>

        </div>

        <!-- ── Как нас найти: адрес + мини-карта ── -->
        <div class="mt-12 pt-10 border-t border-white/10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-10">
          <div>
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Как нас найти
            </h2>
            <p class="text-base font-medium text-white">{{ CONTACTS.address }}</p>
            <p class="mt-1 text-sm text-white/50">{{ companyLegalInfo.address.entrance }}</p>
            <a
              :href="MAP_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors duration-200"
            >
              Построить маршрут
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
          <div class="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <iframe
              :src="MAP_EMBED_URL"
              title="Карта проезда — ВФД на Кашириных, Челябинск"
              width="100%"
              height="100%"
              loading="lazy"
              style="border: none; pointer-events: none;"
              aria-hidden="true"
              tabindex="-1"
            />
            <a
              :href="MAP_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="absolute inset-0"
              aria-label="Открыть карту с расположением салона на Яндекс Картах (открывается в новой вкладке)"
            />
          </div>
        </div>

        <!-- ── Bottom bar ── -->
        <div class="mt-8 pt-6 border-t border-white/10
                    flex flex-col sm:flex-row gap-3
                    sm:items-center sm:justify-between
                    text-xs text-white/40">
          <span>
            © {{ year }} VFD. Все права защищены.
            <a href="/privacy/" class="text-white/60 hover:text-white transition-colors duration-200 ml-3">
              Политика конфиденциальности
            </a>
            <a
              v-for="link in LEGAL_LINKS"
              :key="link.href"
              :href="link.href"
              class="text-white/60 hover:text-white transition-colors duration-200 ml-3"
            >
              {{ link.label }}
            </a>
          </span>
          <span>
            Разработка и дизайн —
            <a
              href="https://t.me/tolyalipin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Анатолий Липин (открывается в новой вкладке)"
              class="text-white/60 hover:text-white transition-colors duration-200"
            >
              Анатолий Липин
            </a>
          </span>
        </div>

        <!-- Legal trigger -->
        <div class="mt-4 text-center">
          <button
            ref="legalTriggerEl"
            type="button"
            class="text-xs text-white/30 hover:text-white/60 transition-colors duration-200 underline underline-offset-2"
            aria-haspopup="dialog"
            :aria-expanded="isModalOpen"
            @click="openModal"
          >
            Правовая информация
          </button>
        </div>

      </div>
    </div>

    <!-- ── Legal modal ── -->
    <Transition name="modal">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        role="presentation"
        @click="closeModal"
      >
        <div
          ref="legalPanelEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
          @click.stop
        >
          <!-- Close -->
          <button
            type="button"
            class="absolute top-4 right-4 w-8 h-8 rounded-full
                   bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                   transition-colors duration-200"
            aria-label="Закрыть окно правовой информации"
            @click="closeModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="space-y-6 text-sm">

            <h3 id="legal-title" class="text-base font-medium text-gray-900">Правовая информация</h3>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Авторские права</h4>
              <p class="text-gray-600 leading-relaxed">
                Все изображения, тексты и дизайн сайта являются объектами авторского права VFD Кашириных.
                Любое использование материалов возможно только с письменного разрешения правообладателя
                и обязательным указанием источника:
                <a href="https://vfd74.ru" class="text-teal-600 hover:underline">vfd74.ru</a>
              </p>
            </div>

            <div class="border-t border-gray-100 pt-5">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Публичная оферта</h4>
              <p class="text-gray-600 leading-relaxed">
                Сайт не является публичной офертой в соответствии со ст. 437 ГК РФ.
                Цены указаны для ознакомления. Актуальную стоимость уточняйте в салоне
                или у менеджеров компании.
              </p>
            </div>

            <div class="border-t border-gray-100 pt-5">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Контакты</h4>
              <p class="text-gray-600 leading-relaxed">
                г. Челябинск, ул. Братьев Кашириных, 131Б<br />
                Телефон: <a href="tel:+79000297888" class="text-teal-600 hover:underline">+7 (900) 029-78-88</a><br />
                Email: <a href="mailto:vfddoors74@mail.ru" class="text-teal-600 hover:underline">vfddoors74@mail.ru</a><br />
                Сайт: <a href="https://vfd74.ru" class="text-teal-600 hover:underline">vfd74.ru</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </Transition>

  </footer>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
/* Модальное окно тоже анимируем — лёгкий scale */
.modal-enter-from :deep(.bg-white),
.modal-leave-to   :deep(.bg-white) {
  transform: scale(0.97);
}
.modal-enter-active :deep(.bg-white),
.modal-leave-active :deep(.bg-white) {
  transition: transform 200ms ease;
}
</style>