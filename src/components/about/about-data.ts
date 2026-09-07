// src/components/about/about-data.ts

export const companyInfo = {
  name: 'Владимирская фабрика дверей — фирменный салон',
  shortName: 'ВФД',
  founded: 2014,
  address: 'г. Челябинск, ул. Братьев Кашириных, 131Б',
  phone: '+7 (963) 029-78-88',
  email: 'info@vfd74.ru',
  description: `Салон дверей VFD в Челябинске с 2014 г. Официальный дилер Владимирской фабрики дверей. 500+ моделей дверей и перегородок. Замер, подбор, монтаж с гарантией. Честные цены.`,
  advantages: [
    { icon: '🏆', title: 'С 2014 года', text: 'Более 10 лет на рынке Челябинска' },
    { icon: '🚪', title: '500+ моделей', text: 'Широкий выбор дверей в наличии' },
    { icon: '🔧', title: 'Монтаж', text: 'Профессиональная установка дверей "под ключ"' },
    { icon: '📐', title: 'Замер', text: 'Бесплатный выезд специалиста при заказе' },
  ],
}

export const director = {
  name: 'Липина Надежда Анатольевна',
  position: 'Руководитель салона ВФД на Кашириных',
  experience: 'Более 20 лет в дверной отрасли',
  quote:
    '«Дверь выбирают не на сезон, а на годы. Поэтому мы не просто показываем каталог, а помогаем найти модель, которая точно подойдёт вашему интерьеру, бюджету и условиям эксплуатации. А наш монтаж — это гарантия качества и надежности.» — Надежда Липина',
  photo: 'https://storage.yandexcloud.net/catalog-vfd/about_page/director.webp',
}

export const galleryImages = [
  {
    id: 1,
    src: 'https://storage.yandexcloud.net/catalog-vfd/about_page/vfd_out.webp',
    alt: 'Вывеска салона ВФД на Кашириных, Челябинск',
  },
  // Для блока IMAGE LINKS GRID — разные ракурсы
  {
    id: 2,
    src: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-1.webp',
    alt: 'Общий вид выставочного зала салона ВФД — широкий выбор дверей',
  },
  {
    id: 3,
    src: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-5.webp',
    alt: 'Примеры межкомнатных дверей в экспозиции салона ВФД',
  },
  {
    id: 4,
    src: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-3.webp',
    alt: 'Образцы фурнитуры и материалов для дверей в салоне ВФД',
  },
  // Для галереи ниже
  {
    id: 5,
    src: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-2.webp',
    alt: 'Экспозиция межкомнатных дверей в салоне ВФД',
  },
  {
    id: 6,
    src: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-6.webp',
    alt: 'Интерьер салона ВФД — зона консультаций',
  },
]

export const requisites = {
  legalName:    'ИП Липина Надежда Анатольевна',
  inn:          '452402308842',
  ogrnip:       '323745600047178',
  legalAddress: 'г. Челябинск, ул. Братьев Кашириных, 131Б',
}

export const paymentMethods = [
  {
    id: 1,
    title: 'Наличные',
    description: 'Оплата наличными в салоне для оформления заказа',
    iconPath: '/icons/w_cash_icon.webp',
  },
  {
    id: 2,
    title: 'Банковская карта',
    description: 'Оплата картами Visa, Mastercard, МИР через терминал в салоне',
    iconPath: '/icons/w_bank_card.webp',
  },
  {
    id: 3,
    title: 'Безналичный расчёт',
    description: 'Оплата по счёту для юридических лиц и ИП без НДС',
    iconPath: '/icons/w_transaction_icon.webp',
  },
  {
    id: 4,
    title: 'QR-код СБП',
    description: 'Быстрая оплата через Систему быстрых платежей по QR-коду',
    iconPath: '/icons/w_sbp.webp',
  },
]