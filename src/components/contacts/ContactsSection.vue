<template>
  <section class="section">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Левая колонка: Информация -->
        <div>
          <div class="mb-12">
            <h1 class="text-4xl lg:text-5xl font-medium mb-4 text-gray-900">Контакты</h1>
            <p class="text-lg text-gray-600 mb-1">Свяжитесь с нами удобным способом</p>
            <p class="text-sm text-gray-500 mb-6">Консультации и бесплатный выезд замерщика — по Челябинску и области</p>
            <div class="flex flex-wrap gap-3">
              <a
                href="https://t.me/vfddoors74"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Написать в Telegram
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a
                href="https://vk.com/vfddoors74"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Написать в VK
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a
                href="https://max.ru/id452402308842_biz"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Написать в MAX
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Телефоны -->
          <div class="mb-8">
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Телефоны</h3>
            <div class="space-y-3">
              <a
                href="tel:+79000297888"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <img src="/icons/phone-call.webp" alt="" class="w-9 h-9 shrink-0" />
                <div>
                  <p class="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">+7 (900) 029-78-88</p>
                  <p class="text-sm text-gray-500">Основной номер</p>
                </div>
              </a>
              <a
                href="tel:+79630807888"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <img src="/icons/phone-call.webp" alt="" class="w-9 h-9 shrink-0" />
                <div>
                  <p class="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">+7 (963) 080-78-88</p>
                  <p class="text-sm text-gray-500">Дополнительный номер</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Email -->
          <div class="mb-8">
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Электронная почта</h3>
            <a
              href="mailto:vfddoors74@mail.ru"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <img src="/icons/email_cover.webp" alt="" class="w-9 h-9 shrink-0" loading="eager" />
              <div>
                <p class="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">vfddoors74@mail.ru</p>
              </div>
            </a>
          </div>

          <!-- Время работы -->
          <div class="mb-8">
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Часы работы</h3>
            <div class="rounded-3xl bg-fg p-6 lg:p-8">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">Июнь – август</p>
                  <div class="space-y-3">
                    <div class="flex items-baseline justify-between gap-3">
                      <span class="text-sm text-white/55">Пн–Пт</span>
                      <span class="text-2xl font-medium text-white tracking-tight tabular-nums">10:00–20:00</span>
                    </div>
                    <div class="flex items-baseline justify-between gap-3">
                      <span class="text-sm text-white/55">Сб</span>
                      <span class="text-2xl font-medium text-white tracking-tight tabular-nums">11:00–16:00</span>
                    </div>
                    <div class="flex items-baseline justify-between gap-3">
                      <span class="text-sm text-white/55">Вс</span>
                      <span class="text-2xl font-medium text-white tracking-tight">Выходной</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">Сентябрь – май</p>
                  <div class="space-y-3">
                    <div class="flex items-baseline justify-between gap-3">
                      <span class="text-sm text-white/55">Пн–Пт</span>
                      <span class="text-2xl font-medium text-white tracking-tight tabular-nums">10:00–20:00</span>
                    </div>
                    <div class="flex items-baseline justify-between gap-3">
                      <span class="text-sm text-white/55">Сб</span>
                      <span class="text-2xl font-medium text-white tracking-tight tabular-nums">10:00–18:00</span>
                    </div>
                    <div class="flex items-baseline justify-between gap-3">
                      <span class="text-sm text-white/55">Вс</span>
                      <span class="text-2xl font-medium text-white tracking-tight tabular-nums">10:00–18:00</span>
                    </div>
                  </div>
                </div>
              </div>
              <p class="mt-6 pt-6 border-t border-white/10 text-xs text-white/50">
                По выходным вне графика возможна консультация и посещение по предварительной записи
              </p>
            </div>
          </div>

          <!-- Социальные сети -->
          <div class="mb-8">
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Мы в соцсетях</h3>
            <div class="flex gap-4">
              <a
                href="https://vk.com/vfddoors74"
                target="_blank"
                rel="noopener noreferrer"
                class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="ВКонтакте"
              >
                <img src="https://storage.yandexcloud.net/catalog-vfd/icons/vk_logo.svg" alt="ВКонтакте" class="w-6 h-6" />
              </a>
              <a
                href="https://t.me/vfddoors74"
                target="_blank"
                rel="noopener noreferrer"
                class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Telegram"
              >
                <img src="https://storage.yandexcloud.net/catalog-vfd/icons/tg_logo.svg" alt="Telegram" class="w-6 h-6" />
              </a>
              <a
                href="https://max.ru/id452402308842_biz"
                target="_blank"
                rel="noopener noreferrer"
                class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Max"
              >
                <img src="/icons/max-logo-v2.webp" alt="Max" class="w-6 h-6" loading="lazy" />
              </a>
            </div>
          </div>
        </div>

        <!-- Правая колонка: Адрес и реквизиты -->
        <div>
          <!-- Адрес -->
          <div class="mb-8">
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Адрес</h3>
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <p class="text-lg font-semibold text-gray-900 mb-2">
                г. Челябинск, ул. Братьев Кашириных, 131Б
              </p>
              <p class="text-gray-600 text-sm mb-4">Вход со стороны ул. Чичерина</p>
              <a
                href="https://yandex.ru/maps/-/CPTwZPi-"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                Смотреть на карте
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>

            <!-- Карта (встроенная) -->
            <div class="rounded-lg overflow-hidden h-64 bg-gray-100 mb-6">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=61.306572%2C55.172868&amp;z=17&amp;pt=61.306572%2C55.172868&amp;l=map&amp;source=constructor"
                width="100%"
                height="100%"
                frameborder="0"
                style="border: none;"
              />
            </div>
          </div>

          <!-- Реквизиты -->
          <div class="mb-8">
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Реквизиты компании</h3>
            <div class="bg-gray-50 rounded-lg p-6 space-y-3 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-1">Собственник</p>
                <p class="font-semibold text-gray-900">Липина Надежда Анатольевна</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Форма деятельности</p>
                <p class="font-semibold text-gray-900">Индивидуальный предприниматель</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">ОГРНИП</p>
                <p class="font-semibold text-gray-900 font-mono">323745600047178</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">ИНН</p>
                <p class="font-semibold text-gray-900 font-mono">452402308842</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Система налогообложения</p>
                <p class="font-semibold text-gray-900">УСН (упрощённая система)</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Дата регистрации</p>
                <p class="font-semibold text-gray-900">27 марта 2023 г.</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Регистратор</p>
                <p class="font-semibold text-gray-900">Межрайонная инспекция ФНС России № 17 по Челябинской области</p>
              </div>
            </div>
          </div>

          <!-- Способы оплаты -->
          <div>
            <h3 class="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Способы оплаты</h3>
            <div class="bg-gray-50 rounded-lg p-6">
              <ul class="space-y-3">
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700">Наличные деньги</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700">Банковские карты (Visa, MasterCard)</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700">Платёжная система МИР</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700">Переводы через Сбербанк</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительная информация — стек карточек, "переворот" на скролле (мобайл) -->
      <div class="mt-16 pt-12 border-t border-gray-200">
        <h3 class="text-2xl font-medium text-gray-900 mb-6">Что вы получаете</h3>
        <div class="wtg-stack">
          <article class="wtg-card wtg-card--1" style="--wtg-i: 0">
            <div class="wtg-card__body">
              <h4 class="wtg-card__title">Бесплатные консультации</h4>
              <div class="wtg-card__tags">
                <span>Подбор моделей</span>
                <span>Образцы покрытий</span>
                <span>Помощь дизайнера</span>
              </div>
              <p class="wtg-card__text">
                Специалист салона поможет подобрать модель, покрытие и цвет под ваш интерьер и бюджет — вживую, с образцами материалов на руках. Консультация ни к чему не обязывает.
              </p>
            </div>
          </article>

          <article class="wtg-card wtg-card--2" style="--wtg-i: 1">
            <div class="wtg-card__body">
              <h4 class="wtg-card__title">Бесплатный выезд на замер</h4>
              <div class="wtg-card__tags">
                <span>Челябинск и область</span>
                <span>Точные размеры</span>
                <span>Без обязательств</span>
              </div>
              <p class="wtg-card__text">
                Мастер выезжает на объект, снимает точные размеры проёма и учитывает особенности стен — от этого зависят итоговая смета и корректность монтажа. Выезд бесплатный независимо от того, оформите вы заказ или нет.
              </p>
            </div>
          </article>

          <article class="wtg-card wtg-card--3" style="--wtg-i: 2">
            <div class="wtg-card__body">
              <h4 class="wtg-card__title">Гарантия на монтаж и материалы</h4>
              <div class="wtg-card__tags">
                <span>12 месяцев на работы</span>
                <span>Гарантия производителя</span>
                <span>Постгарантийная поддержка</span>
              </div>
              <p class="wtg-card__text">
                На монтажные работы даём гарантию 12 месяцев, на сами двери и перегородки — по условиям производителя. Если после установки что-то потребует внимания, обращайтесь напрямую в салон, без посредников.
              </p>
            </div>
          </article>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* .section/.container намеренно не переопределяются — используются
   глобальные классы (см. global.css), чтобы контент совпадал по ширине
   с остальной страницей (хлебные крошки, FAQ — тоже на глобальном
   .container). Раньше здесь был локальный .container:1200px при
   глобальном 1280px — блок FAQ ниже был на 80px шире контента. */

/* ── «Что вы получаете» — стек карточек ──
   Мобайл: карточки залипают (position: sticky) на разных отступах сверху
   и с ростом z-index — при скролле каждая следующая карточка наезжает на
   предыдущую, оставляя виден верхний край с бейджем (эффект "переворота
   колоды"). Десктоп: обычная сетка в 3 колонки, без sticky. */
.wtg-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border-radius: 1.5rem;
  min-height: 20rem;
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.35);
}
/* Оттенки серого вместо фото — каждая карточка своим тоном */
.wtg-card--1 { background: #3a3a3d; }
.wtg-card--2 { background: #29292b; }
.wtg-card--3 { background: #18181a; }

.wtg-card__body {
  position: relative;
  z-index: 1;
  padding: 2rem;
}
.wtg-card__title {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #fff;
  margin-bottom: 1rem;
}
.wtg-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.wtg-card__tags span {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}
.wtg-card__text {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.65);
  max-width: 34rem;
}

@media (max-width: 767px) {
  .wtg-stack {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .wtg-card {
    position: sticky;
    top: calc(5.5rem + var(--wtg-i) * 1.75rem);
    z-index: calc(var(--wtg-i) + 1);
    min-height: 16rem;
    margin-bottom: 1.75rem;
  }
}

@media (min-width: 768px) {
  .wtg-stack {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wtg-card { transition: none; }
}
</style>
