/**
 * src/data/promos.ts
 *
 * Акции и спецпредложения — блок Promo.astro на главной показывает активные
 * (validUntil ещё не прошёл), страница /promo-archive — истёкшие.
 *
 * КАК ДОБАВИТЬ АКЦИЮ: добавь объект в конец массива PROMOS. Когда validUntil
 * пройдёт, акция сама уйдёт с главной в архив — ничего вручную переносить
 * не нужно, дата решает.
 */

export interface Promo {
  id:            number
  title:         string
  subtitle:      string
  description:   string
  image:         string
  /** 640w/800w локальные срезы (см. gen-promo-images.mjs) — оригиналы с
      Yandex Cloud кратно крупнее реального размера карточки (~400px CSS,
      800px на retina). Опционально: пока не сгенерирован набор под новую
      акцию, компоненты падают обратно на просто image. */
  imageSrcset?:  string
  ctaText?:      string
  ctaLink?:      string
  discount?:     string
  validUntil:    string
}

export const PROMOS: Promo[] = [
  {
    id: 1,
    title: 'Бесплатный замер',
    subtitle: 'По Челябинску, при оформлении заказа',
    description:
      'Выезд замерщика по Челябинску — бесплатно при заказе межкомнатных дверей в нашем салоне на Братьев Кашириных. Гарантируем точность замеров и расчёт без лишних позиций.',
    image: '/renders/promo/zamer-render-800.webp',
    imageSrcset: '/renders/promo/zamer-render-640.webp 640w, /renders/promo/zamer-render-800.webp 800w',
    ctaText: 'Подробнее',
    ctaLink: '/contacts/',
    discount: 'Бесплатно',
    validUntil: '2026-12-31',
  },
  {
    id: 2,
    title: 'Дверь Бэйсик 1В из наличия',
    subtitle: 'Цвет Эмалекс бежевый — скидка 10%',
    description:
      'Уже на складе — не нужно ждать поставку. Комплект (полотно + короб + наличники) — 14 560 ₽. Предложение ограничено складским остатком.',
    image: '/renders/promo/basic-render-800.webp',
    imageSrcset: '/renders/promo/basic-render-640.webp 640w, /renders/promo/basic-render-800.webp 800w',
    ctaText: 'Узнать наличие',
    ctaLink: '/contacts/',
    discount: '-10%',
    validUntil: '2026-09-30',
  },
  {
    id: 3,
    title: 'Акция на скрытые двери «Секрет»',
    subtitle: 'Скидка -8% на полный комплект',
    description:
      'В комплект входят полотно с алюминиевой кромкой с 4-х сторон, усиленный короб, скрытые петли и магнитный замок Morelli. Полотно прямого открывания — 10 460 ₽, реверсивного — 14 650 ₽. Комплект усиленного короба «Секрет» алюминиевый — 18 250 ₽, комбинированный Лайт — 12 460 ₽. Успейте оформить заказ до конца месяца.',
    image: '/renders/promo/invisible-800.webp',
    imageSrcset: '/renders/promo/invisible-640.webp 640w, /renders/promo/invisible-800.webp 800w',
    ctaText: 'Смотреть «Секрет»',
    ctaLink: '/catalog/skrytye-dveri/',
    discount: '-8%',
    validUntil: '2026-08-30',
  },
  {
    id: 4,
    title: 'Дверь Бэйсик ЗТ из наличия',
    subtitle: 'Скидка -8% на полотна, -5% на погонаж',
    description:
      'Уже на складе — не нужно ждать поставку. Скидка на полотна и погонажные изделия (короб, наличники, добор).',
    image: '/renders/promo/basic-z-800.webp',
    imageSrcset: '/renders/promo/basic-z-640.webp 640w, /renders/promo/basic-z-800.webp 800w',
    ctaText: 'Смотреть в каталоге',
    ctaLink: 'https://vfd74.ru/catalog/series/basic/',
    discount: '-8%',
    validUntil: '2026-09-30',
  },
  {
    id: 5,
    title: 'Акция на Эмалекс ЕС2',
    subtitle: 'Серый цвет — -8% на полотно, -5% на погонаж',
    description:
      'Время обновить интерьер — с выгодой! Только сейчас специальные условия на одну из наших популярных моделей Эмалекс ЕС2: -8% на дверное полотно, -5% на погонажные изделия. Элегантный дизайн, классические формы и современная подача — ЕС2 отлично вписывается в интерьеры современной классики и добавляет пространству стиль и завершённость. А сейчас оформить дверь можно ещё выгоднее — скидка действует и на полотно, и на погонаж. Если давно присматривались к ЕС2 — самое время заказать. Уточняйте условия акции у наших менеджеров и выбирайте свой вариант отделки. Эмалекс ЕС2 — классика, которая выглядит современно.',
    image: '/renders/promo/emalex-ec2-promo-800.webp',
    imageSrcset: '/renders/promo/emalex-ec2-promo-640.webp 640w, /renders/promo/emalex-ec2-promo-800.webp 800w',
    ctaText: 'Смотреть Эмалекс ЕС2',
    ctaLink: '/catalog/series/emalex/',
    discount: '-8%',
    validUntil: '2026-08-30',
  },
  {
    id: 6,
    title: 'Урбан 1, цвет графит — в наличии',
    subtitle: 'Скидка -8% на полотно, -5% на погонаж',
    description:
      'Глубокий графитовый оттенок, строгая геометрия — для интерьеров в стиле лофт и минимализм. Уже в наличии, не нужно ждать производства.',
    image: '/renders/promo/urban-graphite-800.webp',
    imageSrcset: '/renders/promo/urban-graphite-640.webp 640w, /renders/promo/urban-graphite-800.webp 800w',
    ctaText: 'Смотреть Урбан',
    ctaLink: '/catalog/series/urban/',
    discount: '-8%',
    validUntil: '2026-09-30',
  },
  {
    id: 7,
    title: 'Двери «Феникс» в эмали Магнолия',
    subtitle: 'Скидка -10% на полотно, -5% на погонаж',
    description:
      'Элегантная классика, светостойкое эмалевое покрытие и безупречный белый цвет — для интерьеров, которые останутся актуальными надолго. Серия «Феникс» сочетает МДФ и инженерный массив, а эмаль обладает высоким укрывным эффектом. Акция действует до 31.10.2026, количество товара ограничено.',
    image: '/renders/promo/fenix2-magnolia-800.webp',
    imageSrcset: '/renders/promo/fenix2-magnolia-640.webp 640w, /renders/promo/fenix2-magnolia-800.webp 800w',
    ctaText: 'Смотреть «Феникс 2»',
    ctaLink: '/models/feniks-2-skinel/',
    discount: '-10%',
    validUntil: '2026-10-31',
  },
  {
    id: 8,
    title: 'Двери «Маями»',
    subtitle: 'Скидка -10% на полотно, -5% на погонаж',
    description:
      'Лаконичная геометрия, матовая эмаль и актуальный дизайн для интерьеров в стиле лофт, минимализм и современная классика. Прочная щитовая конструкция толщиной 37 мм и светостойкая итальянская эмаль делают модель практичным решением на каждый день. Акция действует до 31.10.2026.',
    image: '/renders/promo/miami-800.webp',
    imageSrcset: '/renders/promo/miami-640.webp 640w, /renders/promo/miami-800.webp 800w',
    ctaText: 'Смотреть «Маями»',
    ctaLink: '/models/mayami-winter/',
    discount: '-10%',
    validUntil: '2026-10-31',
  },
  {
    id: 9,
    title: 'Двери скрытого монтажа — акция до конца октября',
    subtitle: 'Скидка -9% на полотно, -5% на усиленный короб',
    description:
      'Минимализм, стиль и идеальная геометрия интерьера: дверь скрытого монтажа делает полотно практически незаметным и создаёт цельное современное пространство. В комплекте: полотно прямого или реверсивного открывания, комплект короба усиленный или комбинированный, скрытые петли и магнитный замок Morelli, отделка полотна — кромка с 4 сторон, чёрная или хром. Акция действует до 31.10.2026. Актуальную цену и комплектацию уточняйте у менеджера.',
    image: '/renders/promo/invisible-800.webp',
    imageSrcset: '/renders/promo/invisible-640.webp 640w, /renders/promo/invisible-800.webp 800w',
    ctaText: 'Смотреть «Секрет»',
    ctaLink: '/catalog/skrytye-dveri/',
    discount: '-9%',
    validUntil: '2026-10-31',
  },
]
