<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { companyLegalInfo } from '../../lib/contacts-data'
import {
  NAV_LINKS, MOBILE_MENU, SOCIAL_NETWORKS, FOCUS, BRAND_TEXT,
  isCurrentSection, isCurrentPage, isCurrentItem, navLinkClass,
  type NavLink,
} from '../../lib/header-nav'

/* ============================================================
   Constants
   ============================================================ */
const headerEl = ref<HTMLElement | null>(null)

const LOGO_URL = '/svg/logo.svg'

const CONTACTS = {
  phones:  companyLegalInfo.contacts.phone,
  address: companyLegalInfo.address.legal,
  entrance: companyLegalInfo.address.entrance,
  route:   companyLegalInfo.address.routeUrl,
  /** Улица и дом без «г. Челябинск,» — в меню город уже понятен, строка не рвётся на три */
  street:  companyLegalInfo.address.legal.replace(/^г\.\s*Челябинск,\s*/, ''),
  /** Будни/выходные — отдельные строки, а не одна склеенная через «·»:
      на узкой карточке попапа она переносилась посередине слова, неровно. */
  worktimeWeekdays: companyLegalInfo.workingHours.weekdays.label,
  worktimeWeekend:  `Сб–Вс: ${companyLegalInfo.workingHours.saturday.opens}–${companyLegalInfo.workingHours.saturday.closes}`,
  email:   companyLegalInfo.contacts.email,
}

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
/* Какое выпадающее меню открыто (href пункта) — одно на всю навигацию */
const openMenu     = ref<string | null>(null)
let   menuTimer: ReturnType<typeof setTimeout> | null = null
const logoError    = ref(false)

const now          = ref(new Date())
/* Шапка — client:only, window есть уже при создании: берём путь сразу, а не
   в onMounted, иначе первый кадр показывал «Главная» активной на любой
   странице и тут же переключал. */
const currentPath  = ref(window.location.pathname)

const contactsBtnRef   = ref<HTMLButtonElement | null>(null)
const contactsPanelRef = ref<HTMLDivElement | null>(null)
const mobileMenuRef    = ref<HTMLDivElement | null>(null)
const burgerBtnRef     = ref<HTMLButtonElement | null>(null)
const menuCloseRef     = ref<HTMLButtonElement | null>(null)

let timerId: ReturnType<typeof setInterval> | null = null

/* ============================================================
   Active link
   ============================================================ */
const isCurrent = (link: NavLink) => isCurrentSection(link, currentPath.value)
const isPage    = (link: NavLink) => isCurrentPage(link, currentPath.value)
const navClass  = (link: NavLink) => navLinkClass(link, currentPath.value)
const isItemCurrent = (item: { href: string; label: string; desc: string }) => isCurrentItem(item, currentPath.value)

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

/* Подложка и цвет статуса: открыто — зелёный градиент, закрыто — красный */
const statusSurface = computed(() =>
  isOpen.value ? 'bg-linear-to-br from-green-100 to-zinc-100' : 'bg-linear-to-br from-red-100 to-zinc-100',
)
const statusInk = computed(() => (isOpen.value ? 'text-green-800' : 'text-red-800'))

const pad2 = (h: number) => `${String(h).padStart(2, '0')}:00`

/* Статус — обычным текстом, без индикатора-точки и тревожной красной
   заливки: закрытый вечером салон — штатная ситуация, а не ошибка.
   Посекундный обратный отсчёт убран — полезнее время закрытия. */
const statusTitle = computed(() => (isOpen.value ? 'Сейчас открыто' : 'Сейчас закрыто'))

const statusDetail = computed(() => {
  const s = schedule.value
  if (isOpen.value) return `Работаем до ${pad2(s.close)}`

  // Ещё не наступило время открытия сегодня
  if (now.value.getHours() < s.open) return `Откроемся сегодня в ${pad2(s.open)}`

  // Уже закрылись — смотрим на завтра
  const tomorrow = new Date(now.value)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return `Откроемся завтра в ${pad2(getScheduleForDay(tomorrow).open)}`
})

/* ============================================================
   Handlers
   ============================================================ */
/* Раньше высота считалась хардкодом (72 + 16px top-offset), без учёта
   env(safe-area-inset-top) — на iOS с чёлкой/Dynamic Island реальный низ
   шапки оказывался кратно ниже расчётных 88px, и SectionNav (плавающая
   пилюля-навигация на /catalog, /partitions), позиционированный по
   --header-height, наслаивался прямо на шапку вместо появления под ней.
   Меряем реальный DOM-элемент — единственный источник истины, учитывающий
   safe-area, перенос строк и любые будущие правки разметки шапки. */
const setHeaderVar = () => {
  if (!headerEl.value) return
  const rect = headerEl.value.getBoundingClientRect()
  document.documentElement.style.setProperty('--header-height', `${Math.ceil(rect.bottom)}px`)
}

const onScroll = () => { scrolled.value = window.scrollY > 20 }

const onResize = () => {
  setHeaderVar()
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
  if (mobileOpen.value)   { closeMobileMenu(true); return }
  if (openMenu.value)     { hideMenuNow() }
}

/* Фокус не уходит из открытого мобильного меню: Tab с последнего элемента —
   на первый и обратно */
const onMobileMenuKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Tab' || !mobileMenuRef.value) return
  const items = mobileMenuRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  const first = items[0]
  const last  = items[items.length - 1]
  if (!first || !last) return
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
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

const openMobileMenu = async () => {
  mobileOpen.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  menuCloseRef.value?.focus()
}
/* returnFocus — только при закрытии с клавиатуры (Esc, крестик); после
   перехода по ссылке страница всё равно перезагрузится */
const closeMobileMenu = (returnFocus = false) => {
  mobileOpen.value = false
  document.body.style.overflow = ''
  if (returnFocus) burgerBtnRef.value?.focus()
}
const toggleMobileMenu = () => mobileOpen.value ? closeMobileMenu(true) : openMobileMenu()

/* Выпадающие меню: мышь — с задержкой закрытия 150 мс (чтобы курсор
   доезжал до панели), фокус — сразу, Esc — закрывает */
const showMenu = (href: string) => {
  if (menuTimer !== null) clearTimeout(menuTimer)
  openMenu.value = href
}
const hideMenu = () => {
  if (menuTimer !== null) clearTimeout(menuTimer)
  menuTimer = setTimeout(() => { openMenu.value = null }, 150)
}
const hideMenuNow = () => {
  if (menuTimer !== null) clearTimeout(menuTimer)
  openMenu.value = null
}

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

/* ============================================================
   Lifecycle
   ============================================================ */
onMounted(() => {
  setHeaderVar()
  nextTick(setHeaderVar)
  window.addEventListener('scroll',  onScroll,       { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize',  onResize,       { passive: true })
  document.addEventListener('click', onClickOutside, { capture: true })
  timerId = setInterval(() => { now.value = new Date() }, 30_000)
})

onUnmounted(() => {
  window.removeEventListener('scroll',  onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize',  onResize)
  document.removeEventListener('click', onClickOutside, { capture: true })
  document.body.style.overflow = ''
  if (timerId !== null) clearInterval(timerId)
  if (menuTimer !== null) clearTimeout(menuTimer)
})
</script>

<template>
  <header
    ref="headerEl"
    class="fixed inset-x-0 z-50"
    :style="{
      top: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
      paddingLeft:  'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    }"
  >
    <div class="container">

      <!-- ── Pill bar ──
           Высота фиксирована (--header-bar в global.css), а не складывается из
           паддингов и содержимого: тот же размер задаёт заглушка до загрузки
           шапки (HeaderFallback) и отступ <main> — иначе страница сдвигалась
           на 10px, когда --header-height пересчитывался.
           Сетка: на xl — три колонки с равными боковыми, поэтому навигация
           стоит ровно по центру, а не там, где остаётся место между логотипом
           и кнопками разной ширины. -->
      <div
        class="grid h-(--header-bar) grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 rounded-full border px-5
               transition-[background-color,box-shadow] duration-300
               xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
        :class="scrolled
          ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-lg shadow-black/10'
          : 'bg-white/88 backdrop-blur-sm border-gray-200'"
      >

        <!-- Logo -->
        <a
          href="/"
          class="group flex w-fit items-center gap-3 rounded-full"
          :class="FOCUS"
          aria-label="ВФД на Кашириных — главная"
        >
          <img
            v-if="!logoError"
            :src="LOGO_URL"
            alt=""
            class="h-9 w-auto shrink-0 object-contain"
            width="36"
            height="36"
            decoding="async"
            @error="logoError = true"
          />
          <!-- Запасной вариант, если файл логотипа не загрузился -->
          <span
            v-else
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-gray-700 to-gray-900 text-xs font-semibold text-white"
            aria-hidden="true"
          >ВФД</span>
          <span
            class="hidden transition-colors duration-300 ease-in-out sm:block group-hover:text-teal-600"
            :class="BRAND_TEXT"
          >
            ДВЕРИ НА КАШИРИНЫХ
          </span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-1 xl:flex" aria-label="Основная навигация">
          <template v-for="link in NAV_LINKS" :key="link.href">

            <!-- Пункт с выпадающим меню -->
            <div
              v-if="link.menu"
              class="relative"
              @mouseenter="showMenu(link.href)"
              @mouseleave="hideMenu"
              @focusin="showMenu(link.href)"
              @focusout="hideMenu"
            >
              <a
                :href="link.href"
                class="group/nav"
                :class="navClass(link)"
                :aria-current="isPage(link) ? 'page' : undefined"
                :aria-expanded="openMenu === link.href"
              >
                {{ link.label }}
                <svg
                  class="h-3.5 w-3.5 transition-transform duration-200 group-hover/nav:translate-y-px"
                  :class="{ 'rotate-180': openMenu === link.href }"
                  viewBox="0 0 24 24" fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </a>

              <!-- Обёртка с pt вместо margin: между пунктом и панелью нет
                   «мёртвой» полосы, курсор не теряет hover на пути к ссылкам -->
              <Transition name="fade-slide">
                <div
                  v-if="openMenu === link.href"
                  class="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
                >
                  <div
                    class="w-60 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-black/5"
                    :aria-label="link.menuLabel"
                  >
                    <a
                      v-for="item in link.menu"
                      :key="item.href"
                      :href="item.href"
                      class="flex flex-col rounded-xl px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-gray-50"
                      :class="FOCUS"
                      @click="hideMenuNow"
                    >
                      <span class="text-sm font-semibold text-gray-900">{{ item.label }}</span>
                      <span class="mt-0.5 text-xs text-gray-500">{{ item.desc }}</span>
                    </a>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Обычный пункт -->
            <a
              v-else
              :href="link.href"
              :class="navClass(link)"
              :aria-current="isPage(link) ? 'page' : undefined"
            >{{ link.label }}</a>

          </template>
        </nav>

        <!-- Actions -->
        <div class="flex items-center justify-self-end">

          <!-- Desktop actions -->
          <div class="hidden items-center gap-1 xl:flex">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (открывается в новой вкладке)`"
              class="flex h-9 w-9 items-center justify-center rounded-full transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-gray-50"
              :class="FOCUS"
            >
              <img :src="s.icon" alt="" class="h-7 w-7" width="28" height="28" />
            </a>

            <!-- Contacts dropdown -->
            <div class="relative ml-2">
              <button
                ref="contactsBtnRef"
                type="button"
                class="btn btn-primary h-10 px-5 text-sm"
                aria-haspopup="dialog"
                :aria-expanded="contactsOpen"
                aria-controls="contacts-panel"
                @click="toggleContacts"
              >
                Связаться
              </button>

              <!-- Contacts popover — outer shell (double-bezel) держит мягкую
                   подложку и hairline-рамку, inner-карточки внутри группируют
                   телефоны/адрес отдельно от статуса и CTA. -->
              <Transition name="fade-slide">
                <div
                  v-if="contactsOpen"
                  id="contacts-panel"
                  ref="contactsPanelRef"
                  role="dialog"
                  aria-label="Контактная информация"
                  aria-modal="false"
                  class="absolute right-0 top-full z-50 mt-3 w-80 rounded-3xl bg-white/95 p-1.5 ring-1 ring-black/5 backdrop-blur-xl
                         shadow-2xl shadow-black/10"
                >
                  <div class="space-y-4 rounded-2xl bg-white p-5 text-sm">

                    <div>
                      <p class="mb-2 text-sm font-semibold text-gray-500">Телефоны</p>
                      <div class="flex flex-col gap-1">
                        <a
                          v-for="p in CONTACTS.phones"
                          :key="p.raw"
                          :href="`tel:${p.raw}`"
                          class="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 font-semibold text-gray-800
                                 transition-colors duration-200 hover:bg-teal-50/70 hover:text-teal-700"
                          :class="FOCUS"
                        >
                          <img src="/icons/phone-call.webp" alt="" class="h-8 w-8 shrink-0" width="32" height="32" />
                          {{ p.label }}
                        </a>
                      </div>
                    </div>

                    <!-- Вертикальный стек: пятистрочный адрес с «вход со стороны»
                         и часы работы в две колонки рвались неровно. -->
                    <div class="flex flex-col gap-2.5">
                      <div class="rounded-xl bg-gray-50 p-3.5">
                        <p class="mb-1.5 text-sm font-semibold text-gray-500">Адрес</p>
                        <p class="text-step-0 leading-snug text-gray-800">{{ CONTACTS.address }}</p>
                        <p class="mt-0.5 text-xs leading-snug text-gray-500">{{ CONTACTS.entrance }}</p>
                      </div>
                      <div class="rounded-xl p-3.5" :class="statusSurface">
                        <p class="mb-1.5 text-sm font-semibold text-gray-500">Часы работы</p>
                        <p class="text-step-0 leading-snug text-gray-800">{{ CONTACTS.worktimeWeekdays }}</p>
                        <p class="mt-0.5 text-xs leading-snug text-gray-500">{{ CONTACTS.worktimeWeekend }}</p>
                        <p
                          class="mt-3 border-t border-black/5 pt-2.5 text-sm leading-snug"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <span class="font-semibold" :class="statusInk">{{ statusTitle }}</span>
                          <span class="block text-gray-600">{{ statusDetail }}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p class="mb-1.5 text-sm font-semibold text-gray-500">Почта</p>
                      <a
                        :href="`mailto:${CONTACTS.email}`"
                        class="font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors duration-200 hover:text-teal-600 hover:decoration-teal-400"
                        :class="FOCUS"
                      >
                        {{ CONTACTS.email }}
                      </a>
                    </div>

                    <a
                      href="/contacts/"
                      class="btn btn-primary w-full py-3 text-sm"
                      @click="closeContacts(false)"
                    >
                      Перейти к контактам
                      <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </a>

                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Mobile: socials + burger -->
          <div class="flex items-center gap-1 xl:hidden">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (открывается в новой вкладке)`"
              class="flex h-10 w-10 items-center justify-center rounded-full"
              :class="FOCUS"
            >
              <img :src="s.icon" alt="" class="h-7 w-7" width="28" height="28" />
            </a>

            <button
              ref="burgerBtnRef"
              type="button"
              class="burger-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-gray-100"
              :class="[{ 'is-open': mobileOpen }, FOCUS]"
              :aria-expanded="mobileOpen"
              :aria-label="mobileOpen ? 'Закрыть меню' : 'Открыть меню'"
              aria-controls="mobile-menu"
              @click="toggleMobileMenu"
            >
              <!-- Три линии, трансформируются в крестик через CSS вместо
                   переключения двух разных svg — плавная анимация вместо
                   резкой замены иконки. aria-hidden — смысл несёт
                   aria-label кнопки. -->
              <span class="burger-icon" aria-hidden="true">
                <span class="burger-icon__line" />
                <span class="burger-icon__line" />
                <span class="burger-icon__line" />
              </span>
            </button>
          </div>

        </div>
      </div>

    </div><!-- /container -->

    <!-- ── Mobile menu — полноэкранная тёмная панель (не плавающая карточка):
         своя шапка (город + закрыть), звонок и соцсети сверху,
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
        class="fixed inset-0 z-10000 flex touch-manipulation flex-col bg-white xl:hidden"
        :style="{
          top:           '-100px',
          paddingTop:    'calc(env(safe-area-inset-top, 0px) + 100px)',
          paddingLeft:   'env(safe-area-inset-left)',
          paddingRight:  'env(safe-area-inset-right)',
        }"
        @keydown="onMobileMenuKeydown"
      >
        <!-- Шапка меню — на том же месте и с теми же отступами, что плавающая
             шапка под ней (mt-4, высота --header-bar, border и px-5 как у
             пилюли): логотип и крестик встают ровно туда, где были логотип и
             бургер, поэтому при открытии ничего не «прыгает». Затухание без
             масштаба — масштаб сам по себе сдвигал все элементы. -->
        <div class="shrink-0 border-b border-gray-200">
          <div class="container">
            <div class="mt-4 flex h-(--header-bar) items-center justify-between gap-6 border border-transparent px-5">
              <a href="/" class="flex min-w-0 items-center gap-3 rounded-full" :class="FOCUS" @click="closeMobileMenu()">
                <img src="/svg/logo.svg" alt="" class="h-9 w-auto shrink-0 object-contain" width="36" height="36" decoding="async" />
                <span class="truncate" :class="BRAND_TEXT">ДВЕРИ НА КАШИРИНЫХ</span>
              </a>
              <button
                ref="menuCloseRef"
                type="button"
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-fg text-white transition-opacity active:opacity-80"
                :class="FOCUS"
                aria-label="Закрыть меню"
                @click="closeMobileMenu(true)"
              >
                <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Прокручиваемая середина. overscroll-contain: прокрутка меню не
             тянет за собой страницу под ним (iOS игнорирует overflow:hidden
             у body). -->
        <div class="flex-1 touch-manipulation space-y-6 overflow-y-auto overscroll-contain px-5 py-5">

          <!-- Статус и адрес: открыто — зелёный градиент, закрыто — красный -->
          <div class="rounded-2xl p-5" :class="statusSurface">
            <p class="text-base leading-snug" aria-live="polite" aria-atomic="true">
              <span class="font-semibold" :class="statusInk">{{ statusTitle }}</span>
              <span class="ml-2 text-gray-700">{{ statusDetail }}</span>
            </p>
            <div class="mt-4 flex items-end justify-between gap-4 border-t border-black/5 pt-4">
              <div class="min-w-0 text-sm leading-relaxed">
                <p class="font-medium text-ink">{{ CONTACTS.street }}</p>
                <p class="text-gray-500">{{ CONTACTS.worktimeWeekdays }}</p>
                <p class="text-gray-500">{{ CONTACTS.worktimeWeekend }}</p>
              </div>
              <a
                :href="CONTACTS.route"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink ring-1 ring-black/5 transition-opacity active:opacity-80"
                :class="FOCUS"
                aria-label="Маршрут в Яндекс Картах (открывается в новой вкладке)"
              >
                Маршрут
                <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M5 11l6-6M6 5h5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Разделы: подпись группы и серая плашка с рядами «название,
               пояснение, шеврон». Разделитель — от текста до края плашки. -->
          <nav class="space-y-6" aria-label="Мобильная навигация">
            <section v-for="group in MOBILE_MENU" :key="group.label">
              <h2 class="mb-2 px-1 text-sm font-semibold text-gray-500">{{ group.label }}</h2>
              <ul class="overflow-hidden rounded-2xl bg-zinc-100" role="list">
                <li
                  v-for="item in group.items"
                  :key="item.href"
                  class="relative before:absolute before:left-5 before:right-0 before:top-0 before:h-px before:bg-black/5 first:before:hidden"
                >
                  <a
                    :href="item.href"
                    class="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors active:bg-black/5"
                    :aria-current="item.href === currentPath ? 'page' : undefined"
                    @click="closeMobileMenu()"
                  >
                    <span class="min-w-0">
                      <span class="block text-step-2 font-medium leading-snug" :class="isItemCurrent(item) ? 'text-teal-700' : 'text-ink'">{{ item.label }}</span>
                      <span class="block text-sm leading-snug text-gray-500">{{ item.desc }}</span>
                    </span>
                    <svg class="size-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 class="mb-2 px-1 text-sm font-semibold text-gray-500">Телефоны</h2>
              <ul class="overflow-hidden rounded-2xl bg-zinc-100" role="list">
                <li
                  v-for="p in CONTACTS.phones"
                  :key="p.raw"
                  class="relative before:absolute before:left-5 before:right-0 before:top-0 before:h-px before:bg-black/5 first:before:hidden"
                >
                  <a
                    :href="`tel:${p.raw}`"
                    :aria-label="`Позвонить: ${p.label}`"
                    class="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors active:bg-black/5"
                    @click="closeMobileMenu()"
                  >
                    <span class="min-w-0">
                      <span class="block text-step-2 font-medium tabular-nums leading-snug text-ink">{{ p.label }}</span>
                      <span class="block text-sm leading-snug text-gray-500">{{ p.title }}</span>
                    </span>
                    <span class="shrink-0 text-sm font-semibold text-gray-500" aria-hidden="true">Позвонить</span>
                  </a>
                </li>
              </ul>
            </section>
          </nav>
        </div>

        <!-- Закреплено внизу: главное действие и мессенджеры. Кнопка — общий
             .btn-primary (цвет --color-fg), значки — те же чёрные круглые, что
             в шапке: готовая круглая картинка, без второй подложки. -->
        <div
          class="flex shrink-0 touch-manipulation items-center gap-3 border-t border-gray-200 bg-white px-5 pt-3"
          :style="{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }"
        >
          <a
            :href="`tel:${CONTACTS.phones[0]?.raw}`"
            class="btn btn-primary h-11 flex-1 text-base active:opacity-80"
            @click="closeMobileMenu()"
          >
            Позвонить
          </a>
          <a
            v-for="s in SOCIAL_NETWORKS"
            :key="s.name"
            :href="s.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${s.label} (открывается в новой вкладке)`"
            class="block size-11 shrink-0 rounded-full transition-opacity active:opacity-80"
            :class="FOCUS"
          >
            <img :src="s.icon" alt="" class="size-full" width="44" height="44" />
          </a>
        </div>
      </div>
    </Transition>
    </Teleport>

  </header>
</template>

<style scoped>
/* ── Burger → крестик: 3 линии transform'ятся вместо переключения svg ── */
.burger-icon {
  position: relative;
  display: block;
  width: 1.125rem;
  height: 0.8125rem;
}
.burger-icon__line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  transition: transform .28s cubic-bezier(.4,0,.2,1), opacity .2s ease, top .28s cubic-bezier(.4,0,.2,1);
}
.burger-icon__line:nth-child(1) { top: 0; }
.burger-icon__line:nth-child(2) { top: 50%; transform: translateY(-50%); }
.burger-icon__line:nth-child(3) { top: 100%; transform: translateY(-100%); }

.burger-btn.is-open .burger-icon__line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
.burger-btn.is-open .burger-icon__line:nth-child(2) {
  opacity: 0;
}
.burger-btn.is-open .burger-icon__line:nth-child(3) {
  top: 50%;
  transform: translateY(-50%) rotate(-45deg);
}

/* Уважение к prefers-reduced-motion — линии просто переключаются без анимации */
@media (prefers-reduced-motion: reduce) {
  .burger-icon__line { transition: none; }
}

/* ── Активный пункт мобильной навигации — акцентная полоска слева.
   Смены цвета текста (white/85 → white) недостаточно для быстрого
   сканирования списка — полоска даёт однозначный визуальный якорь. */
.nav-item {
  position: relative;
}
.nav-item--active::before {
  content: '';
  position: absolute;
  left: -1.25rem;
  top: 0.875rem;
  bottom: 0.875rem;
  width: 3px;
  border-radius: 2px;
  background: var(--color-accent, #14b8a6);
}
</style>
