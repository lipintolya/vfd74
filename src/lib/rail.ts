/**
 * Горизонтальная лента с прокруткой по карточкам (scroll-snap) — общая для
 * «Фотоотчётов с объектов» и «Отзывов».
 *
 * Лента листается нативно (свайп, трекпад), скрипт только добавляет стрелки
 * «назад/вперёд» для мыши: они показываются лишь при hover-устройстве, шагают
 * на ширину видимой части и гаснут на краях.
 *
 * Разметка внутри [data-rail-scope]:
 *   [data-rail]          сама лента (ul/div с overflow-x)
 *   [data-rail-arrows]   обёртка стрелок (hidden до инициализации)
 *   [data-rail-prev]     кнопка «назад»
 *   [data-rail-next]     кнопка «вперёд»
 */
export function initRail(scope: HTMLElement): void {
  /* Повторный вызов на той же секции навесил бы обработчики дважды —
     стрелка листала бы на две страницы */
  if (scope.dataset.railReady != null) return
  scope.dataset.railReady = ''
  const rail = scope.querySelector<HTMLElement>('[data-rail]')
  const arrows = scope.querySelector<HTMLElement>('[data-rail-arrows]')
  const prev = scope.querySelector<HTMLButtonElement>('[data-rail-prev]')
  const next = scope.querySelector<HTMLButtonElement>('[data-rail-next]')
  if (!rail || !arrows || !prev || !next) return
  if (!matchMedia('(hover: hover)').matches) return
  arrows.hidden = false

  /* Шаг — ширина карточки с промежутком, но не меньше видимой части ленты,
     чтобы на широком экране стрелка листала целыми страницами карточек */
  const step = () => {
    const item = rail.querySelector<HTMLElement>(':scope > *')
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0
    const card = item ? item.offsetWidth + gap : rail.clientWidth
    return Math.max(card, Math.floor(rail.clientWidth / card) * card)
  }
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth - 2
    prev.disabled = rail.scrollLeft <= 2
    next.disabled = rail.scrollLeft >= max
  }
  const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: smooth }))
  next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: smooth }))
  rail.addEventListener('scroll', update, { passive: true })
  new ResizeObserver(update).observe(rail)
  update()
}
