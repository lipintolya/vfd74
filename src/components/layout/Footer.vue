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
  { href: '/dostavka-montazh-po-rayonam/', label: 'Доставка и монтаж по районам' },
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

/* Раньше здесь был живой iframe Yandex Maps (свой JS + тайлы) — карта
   декоративная (pointer-events:none, aria-hidden, клик ведёт по MAP_LINK
   отдельной ссылкой), но футер общий для всех ~400 страниц сайта, так что
   iframe грузился на каждой. Заменён на статичный скриншот Static Maps API
   (см. scripts/gen-footer-map.mjs) — то же визуально, без JS-рантайма. */
const MAP_PREVIEW_IMAGE = '/renders/footer-map.webp'
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

/* ============================================================
   Developer modal — контакты разработчика сайта
   ============================================================ */
const isDevModalOpen = ref(false)
const devTrigger = useTemplateRef<HTMLButtonElement>('devTriggerEl')
const devPanel    = useTemplateRef<HTMLDivElement>('devPanelEl')

const DEV_CONTACTS = {
  telegram: 'https://t.me/tolyalipin',
  email:    'ttolyalipin@gmail.com',
  github:   'https://github.com/lipintolya',
}

const openDevModal = () => {
  isDevModalOpen.value = true
  document.body.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    devPanel.value
      ?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
      ?.focus()
  })
}

const closeDevModal = () => {
  isDevModalOpen.value = false
  document.body.style.overflow = ''
  devTrigger.value?.focus()
}

/* Общий keydown/фокус-ловушка на оба модала — открыт максимум один
   за раз (оба триггера — обычные кнопки в одном футере), поэтому
   достаточно проверить, какой сейчас активен, и применить ловушку
   к его панели. */
const onKeydown = (e: KeyboardEvent) => {
  const activePanel = isModalOpen.value ? legalPanel.value : isDevModalOpen.value ? devPanel.value : null
  if (!activePanel) return

  if (e.key === 'Escape') {
    e.preventDefault()
    if (isModalOpen.value) closeModal()
    else closeDevModal()
    return
  }

  if (e.key === 'Tab') {
    const focusable = Array.from(
      activePanel.querySelectorAll<HTMLElement>(
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
            <img
              :src="MAP_PREVIEW_IMAGE"
              alt=""
              width="650"
              height="450"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
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

        <!-- Дисклеймер оферты — вынесен из-под клика по «Правовая информация»
             в модалку: там тот же текст остаётся полностью, но для защиты
             от претензий по ст. 437 ГК РФ дисклеймер должен быть явно виден
             на странице, а не только доступен по дополнительному действию. -->
        <p class="mt-8 pt-6 border-t border-white/10 text-xs leading-relaxed text-white/35">
          Информация и цены на сайте носят справочный характер и не являются публичной офертой
          (ст. 437 ГК РФ). Актуальную стоимость и наличие уточняйте в салоне или у менеджера.
        </p>

        <!-- ── Bottom bar ── -->
        <div class="mt-4
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
            <button
              ref="devTriggerEl"
              type="button"
              aria-haspopup="dialog"
              :aria-expanded="isDevModalOpen"
              class="text-white/60 underline underline-offset-2 decoration-white/20 transition-colors duration-200 hover:text-white hover:decoration-white/40"
              @click="openDevModal"
            >
              Анатолий Липин
            </button>
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

    <!-- ── Developer modal ── -->
    <Transition name="modal">
      <div
        v-if="isDevModalOpen"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        role="presentation"
        @click="closeDevModal"
      >
        <div
          ref="devPanelEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dev-modal-title"
          class="relative w-full max-w-sm rounded-3xl bg-white p-1.5 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.35)]"
          @click.stop
        >
          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-slate-600 transition-colors duration-200 hover:bg-black/10"
            aria-label="Закрыть окно контактов разработчика"
            @click="closeDevModal"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="rounded-[1.375rem] bg-slate-50 p-6 sm:p-7">

            <img
              src="/renders/about/avatar-al-160.webp"
              alt="Анатолий Липин"
              width="80"
              height="80"
              loading="lazy"
              decoding="async"
              class="mb-5 h-14 w-14 rounded-2xl object-cover"
            />

            <h3 id="dev-modal-title" class="m-0 mb-1 text-lg font-medium text-ink">Анатолий Липин</h3>
            <p class="m-0 mb-3 text-sm leading-relaxed text-slate-600">
              Разрабатываю сайты и мобильные приложения, боты и системы автоматизации аналитики
              и бизнес-процессов — от простого лендинга до сложного сервиса. Быстрый современный
              стек, аккуратная вёрстка, SEO-основа, подключение CRM.
            </p>

            <div class="mb-5 flex flex-col gap-1 text-xs text-slate-500">
              <span>Опыт разработки — более 5 лет</span>
              <span>Высшее техническое образование: прикладная математика и информатика (бакалавриат и магистратура), направление «Математическое моделирование и искусственный интеллект»</span>
            </div>

            <div class="flex flex-col gap-2">
              <a
                href="https://t.me/tolyalipin"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 transition-colors duration-200 hover:ring-slate-300"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-graphite">
                  <img src="/icons/b_tg_logo.webp" alt="" width="18" height="18" class="h-4.5 w-4.5" />
                </span>
                <span class="flex-1 text-sm font-medium text-ink">Telegram</span>
                <span class="text-xs text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </a>

              <a
                href="mailto:ttolyalipin@gmail.com"
                class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 transition-colors duration-200 hover:ring-slate-300"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-graphite">
                  <img src="/icons/w_mail_logo.webp" alt="" width="18" height="18" class="h-4.5 w-4.5" />
                </span>
                <span class="flex-1 truncate text-sm font-medium text-ink">ttolyalipin@gmail.com</span>
                <span class="text-xs text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </a>

              <a
                href="https://github.com/lipintolya"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 transition-colors duration-200 hover:ring-slate-300"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-graphite text-white">
                  <svg class="h-4.5 w-4.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
                  </svg>
                </span>
                <span class="flex-1 text-sm font-medium text-ink">GitHub</span>
                <span class="text-xs text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </a>
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