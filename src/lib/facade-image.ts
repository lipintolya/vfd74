/**
 * Фото фасада салона (Братьев Кашириных, 131Б) — одно описание для <img> на
 * /contacts/ и для preload в BaseLayout: srcset/sizes обязаны совпадать,
 * иначе браузер скачает картинку дважды. Ресайзы 480/900 делает
 * scripts/gen-about-images.mjs, оригинал 1536×1024 — в public/media.
 */
export const FACADE_IMAGE = {
  src:    '/renders/about/vfd-out-900.webp',
  srcset: '/renders/about/vfd-out-480.webp 480w, /renders/about/vfd-out-900.webp 900w, /media/about_page/vfd_out.webp 1536w',
  /* Правая колонка первого экрана /contacts/ — 7/12 контейнера на десктопе */
  sizes:  '(min-width: 1280px) 700px, (min-width: 1024px) 56vw, calc(100vw - 2rem)',
  width:  1536,
  height: 1024,
} as const
