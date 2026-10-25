/**
 * Появление плиток на телефоне и планшете — общее для блоков главной
 * («Официальный салон ВФД», «Каталог»). Стили — в global.css
 * («Появление плиток»), разметка — data-атрибуты:
 *   [data-tile-reveal]  контейнер плиток
 *   [data-reveal-tile]  плитка
 *   [data-reveal-img]   фото внутри (оседает с scale 1.08)
 *   [data-reveal-body]  текст: дети проявляются следом с шагом
 *
 * Плитка проявляется, когда доходит до экрана; вошедшие одной пачкой
 * (рядом в строке) — с шагом 90 мс. Без анимации: на десктопе (там блоки
 * видны целиком), при prefers-reduced-motion, без IntersectionObserver и
 * для плиток, уже видимых при загрузке (не мигают).
 *
 * Можно вызывать из каждого компонента: обработанный контейнер помечается
 * и второй раз не трогается.
 */
export function revealTiles(maxWidth = '64rem'): void {
  if (!matchMedia(`(width < ${maxWidth})`).matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!('IntersectionObserver' in window)) return

  document.querySelectorAll<HTMLElement>('[data-tile-reveal]:not([data-reveal-ready])').forEach((root) => {
    root.dataset.revealReady = ''
    const tiles = [...root.querySelectorAll<HTMLElement>('[data-reveal-tile]')]
      .filter((t) => t.getBoundingClientRect().top > innerHeight)
    if (!tiles.length) return
    tiles.forEach((t) => { t.dataset.state = 'hidden' })

    const io = new IntersectionObserver((entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => tiles.indexOf(a) - tiles.indexOf(b))
        .forEach((tile, i) => {
          tile.style.setProperty('--reveal-delay', `${i * 90}ms`)
          tile.dataset.state = 'shown'
          io.unobserve(tile)
        })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })

    tiles.forEach((t) => io.observe(t))
  })
}
