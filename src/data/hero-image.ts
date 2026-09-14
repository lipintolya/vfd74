/* Обложка первого слайда HeroSlider — единственный источник правды,
   используется и в самом слайдере, и как preload-хинт в index.astro
   (BaseLayout preloadImage). Раньше preload тянул отдельный захардкоженный
   URL, который разъехался с реальной первой картинкой слайдера — браузер
   грел не тот ресурс, а настоящий LCP-кадр грузился без буста. */
export const HERO_COVER_IMAGE = 'https://storage.yandexcloud.net/vfd74ru/promo_main/main_render_innova.webp'
