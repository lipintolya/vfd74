<script setup lang="ts">
/**
 * Карта салона: SVG-геометрия (src/lib/salon-map.ts, кешируется один раз на
 * все страницы) и поверх неё живой HTML — метка с пульсом, карточка с
 * названием и плашки ориентиров (src/lib/salon-map-overlay.ts). HTML, а не
 * часть картинки, потому что в <img> нет шрифтов сайта и нельзя анимировать
 * по скроллу.
 *
 * Появление (один раз, когда карта заходит в окно): кадр медленно «наезжает»
 * и проявляется, ориентир, затем метка падает с лёгким отскоком, затем
 * выезжает карточка. Пока карта на экране, метка пульсирует; ушла с экрана —
 * анимация стоит. Если карта уже заметна при загрузке (якорь, страница
 * контактов) или включено «уменьшить движение» — без показа, сразу готовая.
 *
 * Кадр показан как object-cover, но наложение остаётся точным при любой
 * пропорции блока: сцена с тем же соотношением сторон, что у карты, растянута
 * до покрытия блока (container query units), метка — в её центре.
 * Размер задаёт родитель (высота), цвета — variant.
 */
import { ref, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { mapFrame, landmarkPins, type SalonMapVariant } from '../../lib/salon-map-overlay'

const props = defineProps<{
  variant: SalonMapVariant
  /** Ссылка на карточку салона в Яндекс Картах — вся карта кликабельна */
  href: string
  /** Подпись ссылки для скринридера */
  label: string
  /** Название на карточке метки */
  title: string
  /** Вторая строка карточки (адрес) */
  subtitle: string
}>()

const frame = mapFrame(props.variant)
const pins = landmarkPins(props.variant)

/* idle — рендер на сервере и до скрипта: всё видно; hidden — спрятано до
   появления; shown — показ. Без скрипта карта остаётся видимой. */
const phase = ref<'idle' | 'hidden' | 'shown'>('idle')
const active = ref(false)

const root = useTemplateRef<HTMLElement>('root')
let io: IntersectionObserver | null = null

onMounted(() => {
  const el = root.value
  if (!el || !('IntersectionObserver' in window)) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  /* Прячем, только если на экране не больше краешка карты (верх ниже 70%
     высоты окна); иначе — якорь или возврат назад: показываем сразу */
  const below = el.getBoundingClientRect().top >= innerHeight * 0.7
  if (!reduce && below) phase.value = 'hidden'
  else phase.value = 'shown'

  io = new IntersectionObserver(([e]) => {
    if (!e) return
    active.value = e.isIntersecting && !reduce
    if (phase.value === 'hidden' && e.intersectionRatio >= 0.3) phase.value = 'shown'
  }, { threshold: [0, 0.3] })
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="sm"
    :data-variant="variant"
    :data-phase="phase"
    :data-active="active"
    :style="{ '--ratio': frame.width / frame.height }"
  >
    <div class="sm-stage">
      <img
        class="sm-img"
        :src="`/salon-map-${variant}.svg`"
        alt=""
        :width="frame.width"
        :height="frame.height"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />

      <span
        v-for="p in pins"
        :key="p.text"
        class="sm-landmark"
        :style="{ left: `${p.x}%`, top: `${p.y}%` }"
        aria-hidden="true"
      >{{ p.text }}</span>

      <span class="sm-pin" aria-hidden="true">
        <span class="sm-dot" />
        <span class="sm-card">
          <strong>{{ title }}</strong>
          <span>{{ subtitle }}</span>
        </span>
      </span>
    </div>

    <span class="sm-credit">© участники OpenStreetMap</span>
    <a :href="href" target="_blank" rel="noopener noreferrer" class="absolute inset-0" :aria-label="label" />
  </div>
</template>

<style scoped>
/* Палитра по варианту: тёмная — футер, светлая — страница контактов */
.sm {
  --sm-signal: #14b8a6;                     /* teal-500, как --color-accent */
  --sm-ring: #fff;
  --sm-card-bg: #fff;
  --sm-card-line: var(--color-border);
  --sm-ink: var(--color-ink);
  --sm-sub: #64748b;                        /* slate-500 */
  --sm-shadow: 0 0.25rem 1rem rgb(15 23 42 / 0.12);
}
.sm[data-variant='dark'] {
  --sm-signal: #2dd4bf;                     /* teal-400 */
  --sm-ring: var(--color-graphite);
  --sm-card-bg: var(--color-graphite-card);
  --sm-card-line: rgb(255 255 255 / 0.12);
  --sm-ink: #fff;
  --sm-sub: rgb(255 255 255 / 0.6);
  --sm-shadow: 0 0.25rem 1rem rgb(0 0 0 / 0.4);
}

/* Родитель задаёт высоту; container-type: size нужен для cq-единиц сцены */
.sm {
  position: relative;
  overflow: hidden;
  container-type: size;
  background: var(--sm-ring);
}
.sm-stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: max(100cqw, calc(100cqh * var(--ratio)));
  aspect-ratio: var(--ratio);
  translate: -50% -50%;
  transition: scale 1600ms var(--ease-out);
}
.sm-img { display: block; width: 100%; height: 100%; transition: opacity 900ms var(--ease-out); }

/* Подпись авторства OSM — условие лицензии, всегда на виду */
.sm-credit {
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  font-size: var(--text-step-0);
  color: var(--sm-sub);
  pointer-events: none;
}

/* ── Ориентир ── */
.sm-landmark {
  position: absolute;
  translate: -50% -50%;
  padding: 0.375rem 0.75rem;
  border-radius: 0.625rem;
  border: 1px solid var(--sm-card-line);
  background: var(--sm-card-bg);
  font-size: var(--text-step-0);
  font-weight: 600;
  color: var(--sm-ink);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 600ms var(--ease-out) 900ms;
}

/* ── Метка салона: в центре кадра ── */
.sm-pin { position: absolute; left: 50%; top: 50%; pointer-events: none; }
.sm-dot {
  position: absolute;
  width: 1rem;
  height: 1rem;
  translate: -50% -50%;
  border-radius: 50%;
  background: var(--sm-signal);
  box-shadow: 0 0 0 0.25rem var(--sm-ring);
  transition: opacity 400ms var(--ease-out) 500ms, translate 700ms cubic-bezier(0.34, 1.4, 0.64, 1) 500ms;
}
/* Две волны с разбегом; идут только пока карта на экране */
.sm-dot::before,
.sm-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--sm-signal);
  opacity: 0;
  animation: sm-pulse 3s var(--ease-out) infinite paused;
}
.sm-dot::after { animation-delay: 1.5s; }
.sm[data-active='true'] .sm-dot::before,
.sm[data-active='true'] .sm-dot::after { animation-play-state: running; }
@keyframes sm-pulse {
  from { opacity: 0.5; scale: 1; }
  to   { opacity: 0;   scale: 3.6; }
}

.sm-card {
  /* Справа от метки, вровень с ней: выше стоит здание салона (бирюзовая
     полоса идёт от метки вверх-вправо), карточка его не закрывает */
  --cx: 0px;
  --cy: -50%;
  --lift: 0px;
  position: absolute;
  left: 1.5rem;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid var(--sm-card-line);
  background: var(--sm-card-bg);
  box-shadow: var(--sm-shadow);
  font-size: var(--text-step-0);
  line-height: 1.3;
  color: var(--sm-sub);
  white-space: nowrap;
  translate: var(--cx) calc(var(--cy) + var(--lift));
  transition: opacity 500ms var(--ease-out) 850ms, translate 600ms var(--ease-out) 850ms;
}
.sm-card strong {
  font-family: var(--font-display);
  font-size: var(--text-step-1);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--sm-ink);
}
/* Узкая карта (телефон): карточка над меткой по центру, а не справа — иначе
   выходит за край */
@container (max-width: 32rem) {
  .sm-landmark { display: none; }  /* на телефоне наезжал бы на подпись OSM */
  .sm-card { left: 0; top: auto; bottom: 1.75rem; --cx: -50%; --cy: 0px; }
}

/* ── Появление ── */
.sm[data-phase='hidden'] .sm-stage { scale: 1.08; }
.sm[data-phase='hidden'] .sm-img,
.sm[data-phase='hidden'] .sm-landmark { opacity: 0; }
.sm[data-phase='hidden'] .sm-dot { opacity: 0; translate: -50% -220%; }
.sm[data-phase='hidden'] .sm-card { opacity: 0; --lift: 0.5rem; }

/* Наведение (мышь): метка и карточка отвечают на курсор */
@media (hover: hover) {
  .sm-dot { transition-property: opacity, translate, scale; }
  .sm:hover .sm-dot { scale: 1.25; transition-delay: 0s; transition-duration: 200ms; }
  .sm:hover .sm-card { --lift: -0.25rem; transition-delay: 0s; transition-duration: 250ms; }
}

@media (prefers-reduced-motion: reduce) {
  .sm-stage, .sm-img, .sm-landmark, .sm-dot, .sm-card { transition: none; }
  .sm-dot::before, .sm-dot::after { animation: none; }
}
</style>
