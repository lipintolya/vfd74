<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { companyLegalInfo } from '../../lib/contacts-data'

/* ============================================================
   Constants
   ============================================================ */
const HEADER_HEIGHT     = 72
const HEADER_TOP_OFFSET = 16

const LOGO_URL = '/svg/logo.svg'

const SOCIAL_NETWORKS = [
  {
    name: 'VK',
    label: 'ВКонтакте',
    url: 'https://vk.com/vfddoors74',
    icon: '/icons/b_vk_logo.webp',
  },
  {
    name: 'Telegram',
    label: 'Telegram',
    url: 'https://t.me/vfddoors74',
    icon: '/icons/b_tg_logo.webp',
  },
  {
    name: 'MAX',
    label: 'Max',
    url: 'https://max.ru/id452402308842_biz',
    icon: '/icons/b_max_logo.webp',
  },
] as const

const CONTACTS = {
  phones:   companyLegalInfo.contacts.phone,
  address:  `${companyLegalInfo.address.legal} (${companyLegalInfo.address.entrance})`,
  worktime: `${companyLegalInfo.workingHours.winter.weekdays.label}  ·  Сб–Вс: ${companyLegalInfo.workingHours.winter.saturday.opens}–${companyLegalInfo.workingHours.winter.saturday.closes}`,
  email:    companyLegalInfo.contacts.email,
}

const NAV_LINKS = [
  { href: '/',            label: 'Главная' },
  { href: '/catalog/',    label: 'Каталог' },
  { href: '/partitions/', label: 'Перегородки' },
  { href: '/designers/',  label: 'Дизайнерам' },
  { href: '/about/',      label: 'О нас' },
  { href: '/contacts/',   label: 'Контакты' },
] as const

const CATALOG_DROPDOWN = [
  { href: '/catalog/',               label: 'Все двери',      desc: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери', desc: 'Скрытый монтаж' },
  { href: '/vhodnye-dveri/',         label: 'Входные двери', desc: 'С монтажом' },
  { href: '/catalog/decor/',         label: 'Декор',         desc: 'Плинтус, фрамуги, рейки' },
] as const

const WORK_SCHEDULE = {
  weekday: { open: 10, close: 20 }, // Пн-Пт: 10:00-20:00
  weekend: { open: 10, close: 18 }, // Сб-Вс: 10:00-18:00
} as const

/* ============================================================
   State
   ============================================================ */
const scrolled     = ref(false)
const mobileOpen   = ref(false)
const contactsOpen = ref(false)
const catalogOpen  = ref(false)
let   catalogTimer: ReturnType<typeof setTimeout> | null = null
const logoLoaded   = ref(false)
const logoError    = ref(false)

const now          = ref(new Date())
const currentPath  = ref('/')

const contactsBtnRef   = ref<HTMLButtonElement | null>(null)
const contactsPanelRef = ref<HTMLDivElement | null>(null)
const mobileMenuRef    = ref<HTMLDivElement | null>(null)
const burgerBtnRef     = ref<HTMLButtonElement | null>(null)

let timerId: ReturnType<typeof setInterval> | null = null

/* ============================================================
   Active link
   ============================================================ */
const isActive = (href: string) => currentPath.value === href

/* ============================================================
   Work-hours logic
   ============================================================ */
const getScheduleForDay = (date: Date) => {
  const day = date.getDay()
  if (day === 0 || day === 6) return WORK_SCHEDULE.weekend // Сб-Вс
  return WORK_SCHEDULE.weekday                               // Пн-Пт
}

const schedule = computed(() => getScheduleForDay(now.value))

const isOpen = computed(() => {
  const h = now.value.getHours()
  const s = schedule.value
  return h >= s.open && h < s.close
})

const timeUntilCloseText = computed(() => {
  if (!isOpen.value) return null
  const close = new Date(now.value)
  close.setHours(schedule.value.close, 0, 0, 0)
  const diff = close.getTime() - now.value.getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  return [h > 0 && `${h} ч`, (m > 0 || h > 0) && `${m} мин`, `${s} сек`]
    .filter(Boolean).join(' ')
})

const closedMessage = computed(() => {
  const h = now.value.getHours()
  const s = schedule.value

  // Ещё не наступило время открытия сегодня
  if (h < s.open) {
    return `Закрыто · Откроемся сегодня в ${String(s.open).padStart(2, '0')}:00`
  }

  // Уже закрылись — смотрим на завтра (открытие в 10:00 каждый день недели)
  const tomorrow = new Date(now.value)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextOpen = getScheduleForDay(tomorrow).open
  return `Закрыто · Откроемся завтра в ${String(nextOpen).padStart(2, '0')}:00`
})

/* ============================================================
   Handlers
   ============================================================ */
const setHeaderVar = () =>
  document.documentElement.style.setProperty(
    '--header-height',
    `${HEADER_HEIGHT + HEADER_TOP_OFFSET}px`
  )

const onScroll = () => { scrolled.value = window.scrollY > 20 }

const onResize = () => {
  if (window.innerWidth >= 1280) {
    closeMobileMenu()
    // Закрываем contacts-попап тоже — он hidden на мобильном через CSS,
    // но state может остаться true если resized с открытым мобильным меню
    closeContacts(false)
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  // Закрываем только верхний слой
  if (contactsOpen.value) { closeContacts(); return }
  if (mobileOpen.value)   { closeMobileMenu() }
}

const onClickOutside = (e: MouseEvent) => {
  const t = e.target as Node

  if (
    contactsOpen.value &&
    contactsPanelRef.value &&
    !contactsPanelRef.value.contains(t) &&
    !contactsBtnRef.value?.contains(t)
  ) closeContacts(false)

  if (
    mobileOpen.value &&
    mobileMenuRef.value &&
    !mobileMenuRef.value.contains(t) &&
    !burgerBtnRef.value?.contains(t)
  ) closeMobileMenu()
}

const openMobileMenu   = () => { mobileOpen.value = true;  document.body.style.overflow = 'hidden' }
const closeMobileMenu  = () => { mobileOpen.value = false; document.body.style.overflow = '' }
const toggleMobileMenu = () => mobileOpen.value ? closeMobileMenu() : openMobileMenu()

const openCatalog  = () => { if (catalogTimer !== null) clearTimeout(catalogTimer); catalogOpen.value = true }
const closeCatalog = () => { catalogTimer = setTimeout(() => { catalogOpen.value = false }, 150) }

const openContacts = async () => {
  contactsOpen.value = true
  await nextTick()
  contactsPanelRef.value
    ?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
    ?.focus()
}
const closeContacts = (returnFocus = true) => {
  contactsOpen.value = false
  // Возвращаем фокус на кнопку только при закрытии с клавиатуры (Escape) —
  // иначе после клика мышью (вне попапа или по ссылке внутри) на кнопке
  // повисает focus-visible обводка, хотя пользователь работал мышью.
  if (returnFocus) contactsBtnRef.value?.focus()
}
const toggleContacts = () => contactsOpen.value ? closeContacts() : openContacts()

// Используем первый телефон — optional chaining страхует от пустого массива
const callPrimary = () => {
  const phone = CONTACTS.phones[0]
  if (phone) window.location.href = `tel:${phone.raw}`
}

/* ============================================================
   Lifecycle
   ============================================================ */
onMounted(() => {
  currentPath.value = window.location.pathname
  setHeaderVar()
  window.addEventListener('scroll',  onScroll,       { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize',  onResize,       { passive: true })
  document.addEventListener('click', onClickOutside, { capture: true })
  timerId = setInterval(() => { now.value = new Date() }, 1_000)
})

onUnmounted(() => {
  window.removeEventListener('scroll',  onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize',  onResize)
  document.removeEventListener('click', onClickOutside, { capture: true })
  document.body.style.overflow = ''
  if (timerId !== null) clearInterval(timerId)
  if (catalogTimer !== null) clearTimeout(catalogTimer)
})
</script>

<template>
  <header
    class="fixed inset-x-0 z-50"
    :style="{
      top: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
      paddingLeft:  'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    }"
  >
    <div class="container">

      <!-- ── Pill bar ── -->
      <div
        class="flex items-center justify-between rounded-full border px-5 py-3 transition-all duration-300"
        :class="scrolled
          ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.10)]'
          : 'bg-white/88 backdrop-blur-sm border-gray-200'"
      >

        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 shrink-0 group" aria-label="ВФД на Кашириных — главная">
          <div class="relative w-9 h-9 flex items-center justify-center">
            <div
              v-if="!logoLoaded && !logoError"
              class="absolute inset-0 bg-gray-200 rounded-lg animate-pulse"
              aria-hidden="true"
            />
            <img
              v-if="!logoError"
              :src="LOGO_URL"
              alt=""
              class="h-9 w-auto object-contain transition-opacity duration-300"
              :class="logoLoaded ? 'opacity-100' : 'opacity-0'"
              width="36"
              height="36"
              loading="eager"
              decoding="async"
              @load="logoLoaded = true"
              @error="logoError = true"
            />
            <!-- Fallback если картинка не загрузилась -->
            <div
              v-if="logoError"
              class="w-9 h-9 rounded-lg bg-linear-to-br from-gray-700 to-gray-900
                     text-white flex items-center justify-center text-xs font-semibold"
              aria-hidden="true"
            >
              ВФД
            </div>
          </div>
          <span
            class="hidden sm:block overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide
                   transition-colors duration-300 ease-in-out
                   group-hover:text-teal-600"
          >
            ВФД НА КАШИРИНЫХ
          </span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden xl:flex gap-7 text-sm" aria-label="Основная навигация">
          <template v-for="link in NAV_LINKS" :key="link.href">

            <!-- Обычная ссылка -->
            <a
              v-if="link.href !== '/catalog/'"
              :href="link.href"
              class="transition-colors duration-200"
              :class="isActive(link.href)
                ? 'text-gray-900 font-semibold'
                : 'text-gray-500 hover:text-gray-900'"
              :aria-current="isActive(link.href) ? 'page' : undefined"
            >{{ link.label }}</a>

            <!-- Каталог с дропдауном -->
            <div
              v-else
              class="relative"
              @mouseenter="openCatalog"
              @mouseleave="closeCatalog"
              @focusin="openCatalog"
              @focusout="closeCatalog"
            >
              <a
                :href="link.href"
                class="flex items-center gap-0.5 transition-colors duration-200"
                :class="currentPath.startsWith('/catalog')
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900'"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                :aria-haspopup="true"
                :aria-expanded="catalogOpen"
              >
                {{ link.label }}
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="{ 'rotate-180': catalogOpen }"
                  viewBox="0 0 24 24" fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </a>

              <Transition name="fade-slide">
                <div
                  v-if="catalogOpen"
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl
                         bg-white border border-gray-100 shadow-lg shadow-black/5 p-1.5 z-50"
                  role="menu"
                  aria-label="Категории каталога"
                >
                  <a
                    v-for="item in CATALOG_DROPDOWN"
                    :key="item.href"
                    :href="item.href"
                    class="flex flex-col px-3.5 py-2.5 rounded-xl hover:bg-gray-50
                           transition-colors duration-150 text-left"
                    role="menuitem"
                    @click="catalogOpen = false"
                  >
                    <span class="text-sm font-semibold text-gray-900">{{ item.label }}</span>
                    <span class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</span>
                  </a>
                </div>
              </Transition>
            </div>

          </template>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">

          <!-- Desktop actions -->
          <div class="hidden xl:flex items-center gap-3">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (открывается в новой вкладке)`"
              class="hover:scale-105 transition-transform duration-200"
            >
              <img :src="s.icon" :alt="s.label" class="w-7 h-7" width="28" height="28" loading="eager" fetchpriority="high" />
            </a>

            <!-- Contacts dropdown -->
            <div class="relative">
              <button
                ref="contactsBtnRef"
                type="button"
                class="btn btn-primary"
                aria-haspopup="dialog"
                :aria-expanded="contactsOpen"
                aria-controls="contacts-panel"
                @click="toggleContacts"
              >
                Связаться
              </button>

              <!-- Contacts popover -->
              <Transition name="fade-slide">
                <div
                  v-if="contactsOpen"
                  id="contacts-panel"
                  ref="contactsPanelRef"
                  role="dialog"
                  aria-label="Контактная информация"
                  aria-modal="false"
                  class="absolute top-full right-0 mt-2 w-80 rounded-2xl
                         bg-white border border-gray-100 p-5 z-50"
                >
                  <div class="space-y-4 text-sm">

                    <div>
                      <p class="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Телефоны</p>
                      <a
                        v-for="p in CONTACTS.phones"
                        :key="p.raw"
                        :href="`tel:${p.raw}`"
                        class="flex items-center gap-2.5 font-semibold text-gray-800 hover:text-teal-600
                               transition-colors duration-200 py-0.5"
                      >
                        <img src="/icons/phone-call.webp" alt="" class="w-6 h-6 shrink-0" loading="eager" fetchpriority="high" />
                        {{ p.label }}
                      </a>
                    </div>

                    <div>
                      <p class="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Адрес</p>
                      <p class="text-gray-700 leading-snug">{{ CONTACTS.address }}</p>
                    </div>

                    <div>
                      <p class="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Время работы</p>
                      <p class="text-gray-700">{{ CONTACTS.worktime }}</p>
                    </div>

                    <!-- Open / closed badge -->
                    <div
                      class="rounded-xl px-3 py-2.5 font-medium"
                      :class="isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="w-2 h-2 rounded-full shrink-0"
                          :class="isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
                          aria-hidden="true"
                        />
                        <span class="flex-1">
                          {{ isOpen ? 'Салон открыт' : closedMessage }}
                        </span>
                        <span v-if="isOpen && timeUntilCloseText" class="text-xs text-gray-400 shrink-0">
                          ({{ timeUntilCloseText }})
                        </span>
                      </div>
                    </div>

                    <div>
                      <p class="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Email</p>
                      <a
                        :href="`mailto:${CONTACTS.email}`"
                        class="underline underline-offset-2 hover:text-teal-600 transition-colors duration-200"
                      >
                        {{ CONTACTS.email }}
                      </a>
                    </div>

                    <a
                      href="/contacts/"
                      class="btn btn-primary w-full justify-center inline-flex items-center"
                      @click="closeContacts(false)"
                    >
                      Перейти к контактам
                    </a>

                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Mobile: socials + burger -->
          <div class="xl:hidden flex items-center gap-2.5 ml-auto">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (открывается в новой вкладке)`"
            >
              <img :src="s.icon" :alt="s.label" class="w-7 h-7" width="28" height="28" loading="eager" fetchpriority="high" />
            </a>

            <button
              ref="burgerBtnRef"
              type="button"
              class="w-10 h-10 flex items-center justify-center rounded-xl
                     hover:bg-gray-100 transition-colors shrink-0"
              :aria-expanded="mobileOpen"
              :aria-label="mobileOpen ? 'Закрыть меню' : 'Открыть меню'"
              aria-controls="mobile-menu"
              @click="toggleMobileMenu"
            >
              <!-- Иконки в aria-hidden — смысл несёт aria-label кнопки -->
              <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

    </div><!-- /container -->

    <!-- ── Mobile menu — полноэкранная тёмная панель (не плавающая карточка):
         своя шапка (метка города + закрыть), звонок и соцсети сверху,
         прокручиваемая навигация в середине, номер телефона закреплён внизу.
         Teleport на body: внутри <header z-50> собственный z-index панели
         (10000) сравнивался бы только относительно других детей header —
         cookie-баннер (z-index:9999) висит в root, вне header, и перекрывал
         бы панель, будь она вложена. -->
    <!-- top:-100px + компенсирующий paddingTop ниже: iOS Safari закрашивает
         зону safe-area (чёлку) отдельным композитинг-проходом, привязанным
         к границе вьюпорта — если фон fixed-элемента начинается ровно на
         top:0, при появлении элемента эта полоса на кадр-два остаётся
         непрокрашенной (виден фон страницы под меню). translateZ(0)/GPU-слой
         это не чинит — проблема не в промоутинге слоя, а в самой границе.
         Уводим фон на 100px выше вьюпорта (граница исчезает, чёлка — уже
         середина закрашенной области, а не край) и добавляем те же 100px
         к paddingTop, чтобы контент визуально остался на прежнем месте. -->
    <Teleport to="body">
    <Transition name="menu-fade">
      <div
        v-if="mobileOpen"
        id="mobile-menu"
        ref="mobileMenuRef"
        role="dialog"
        aria-label="Мобильное меню"
        aria-modal="true"
        class="xl:hidden fixed inset-0 z-10000 flex flex-col bg-zinc-900"
        :style="{
          top:           '-100px',
          paddingTop:    'calc(env(safe-area-inset-top, 0px) + 100px)',
          paddingLeft:   'env(safe-area-inset-left)',
          paddingRight:  'env(safe-area-inset-right)',
        }"
      >
        <!-- Верхняя строка: город + адрес + закрыть -->
        <div class="flex items-start justify-between px-5 pt-4 pb-6 shrink-0">
          <span class="flex flex-col gap-0.5">
            <span class="flex items-center gap-1.5 text-sm font-medium text-white/70">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/>
                <circle cx="12" cy="9.5" r="2.25" stroke-linecap="round"/>
              </svg>
              Челябинск
            </span>
            <span class="pl-5.5 text-xs text-white/40">ул. Братьев Кашириных, 131Б</span>
          </span>
          <button
            type="button"
            class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Закрыть меню"
            @click="closeMobileMenu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Звонок + соцсети -->
        <div class="flex items-center gap-2.5 px-5 pb-4 shrink-0">
          <a
            :href="`tel:${CONTACTS.phones[0]?.raw}`"
            class="flex-1 flex items-center justify-center gap-2 rounded-full bg-white text-ink font-semibold text-sm py-3 transition-opacity active:opacity-80"
            @click="closeMobileMenu"
          >
            <img src="/icons/phone-call.webp" alt="" class="w-5 h-5" width="20" height="20" loading="eager" fetchpriority="high" />
            Позвонить
          </a>
          <a
            v-for="s in SOCIAL_NETWORKS"
            :key="s.name"
            :href="s.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${s.label} (открывается в новой вкладке)`"
            class="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-white transition-opacity active:opacity-80"
          >
            <img :src="s.icon" :alt="s.label" class="w-5 h-5" width="20" height="20" loading="eager" fetchpriority="high" />
          </a>
        </div>

        <!-- Навигация — прокручиваемая середина -->
        <nav class="flex-1 overflow-y-auto px-5" aria-label="Мобильная навигация">
          <ul class="border-t border-white/10" role="list">
            <li v-for="link in NAV_LINKS" :key="link.href" class="border-b border-white/10">
              <a
                :href="link.href"
                class="flex items-center justify-between py-4 text-base font-semibold transition-colors"
                :class="isActive(link.href) ? 'text-white' : 'text-white/85 hover:text-white'"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                @click="closeMobileMenu"
              >
                {{ link.label }}
                <svg class="w-4 h-4 shrink-0 text-white/30" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
                </svg>
              </a>
              <!-- Подразделы каталога -->
              <ul v-if="link.href === '/catalog/'" class="mb-3 -mt-1 space-y-0.5" role="list">
                <li v-for="item in CATALOG_DROPDOWN" :key="item.href">
                  <a
                    :href="item.href"
                    class="block rounded-xl px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90"
                    @click="closeMobileMenu"
                  >{{ item.label }}</a>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Open/closed badge mobile -->
          <div
            class="mt-4 mb-5 rounded-xl px-4 py-3 text-sm font-medium"
            :class="isOpen ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'"
            aria-live="polite"
            aria-atomic="true"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'"
                aria-hidden="true"
              />
              <span class="flex-1">
                {{ isOpen ? 'Салон открыт' : closedMessage }}
              </span>
              <span v-if="isOpen && timeUntilCloseText" class="text-xs text-white/40 shrink-0">
                ({{ timeUntilCloseText }})
              </span>
            </div>
          </div>
        </nav>

        <!-- Телефоны — закреплены внизу -->
        <div
          class="shrink-0 border-t border-white/10 bg-zinc-900 px-5 pt-4 flex flex-col items-center gap-1"
          :style="{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }"
        >
          <a
            v-for="p in CONTACTS.phones"
            :key="p.raw"
            :href="`tel:${p.raw}`"
            class="text-center text-lg font-bold text-white transition-opacity active:opacity-80"
            @click="closeMobileMenu"
          >
            {{ p.label }}
          </a>
        </div>
      </div>
    </Transition>
    </Teleport>

  </header>
</template>
