<script lang="ts">
export interface Tile {
  id:    string
  href:  string
  title: string
  /** Одна короткая фраза под названием */
  fact:  string
  cta:   string
  /** Фото-плитка; без img — графитовая с крупной подписью `big` */
  img?:  { src: string; srcset: string; sizes: string; width: number; height: number }
  big?:  string
}
</script>

<script setup lang="ts">
/**
 * Плитка правого бенто на главной — тот же язык, что у плиток «Каталога»
 * (CatalogCategories.astro): фото на всю площадь с затемнением снизу
 * (или графит --color-graphite), название, одна фраза, ссылка текстом со
 * стрелкой. Вся плитка — одна ссылка: ::after у .hb-link растянут на неё.
 * wide — широкая плитка над парой квадратных.
 */
defineProps<{ tile: Tile; wide?: boolean }>()
</script>

<template>
  <div
    class="hb-tile relative isolate overflow-hidden rounded-2xl sm:rounded-3xl lg:h-full"
    :class="[
      wide ? 'aspect-16/10 sm:aspect-2/1 lg:aspect-auto' : 'aspect-4/5 sm:aspect-square lg:aspect-auto',
      tile.img ? 'hb-tile--photo' : 'hb-tile--plain',
    ]"
  >
    <img
      v-if="tile.img"
      :src="tile.img.src"
      :srcset="tile.img.srcset"
      :sizes="tile.img.sizes"
      :width="tile.img.width"
      :height="tile.img.height"
      alt=""
      loading="lazy"
      decoding="async"
      class="hb-img"
      aria-hidden="true"
    />

    <div class="hb-body" :class="{ 'hb-body--wide': wide }">
      <p v-if="tile.big" class="hb-big">{{ tile.big }}</p>
      <div>
        <p class="hb-title">{{ tile.title }}</p>
        <p class="hb-fact">{{ tile.fact }}</p>
        <!-- Название уже на плитке — ссылка коротко; для скринридера её
             имя — название плитки -->
        <a class="hb-link" :href="tile.href" :aria-label="tile.title">
          {{ tile.cta }}
          <svg class="btn-arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hb-tile { color: #fff; }
.hb-tile--photo { background: #27272a; }  /* zinc-800 — пока грузится фото */
.hb-tile--plain { background: var(--color-graphite); }

.hb-img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 700ms var(--ease-out);
}
/* Затемнение как у плиток «Каталога»: плотное внизу, где текст */
.hb-tile--photo::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to top, rgb(0 0 0 / 0.8) 0%, rgb(0 0 0 / 0.4) 45%, rgb(0 0 0 / 0) 78%);
}

.hb-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 1rem;
}
@media (width >= 40rem) {
  .hb-body { padding: 1.5rem; }
}
/* Графитовая: крупная подпись сверху, текст снизу */
.hb-tile--plain .hb-body { justify-content: space-between; }

.hb-big {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.1vw + 1.4rem, 3rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

/* Размер названия растёт с шириной экрана: узкая плитка 235px на 1440
   и 370px на 1920 */
.hb-title {
  margin: 0;
  font-family: var(--font-display);  /* как у h1–h3 сайта; у <p> по умолчанию шрифт текста */
  font-size: clamp(0.9375rem, 0.35vw + 0.75rem, 1.25rem);
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.hb-body--wide .hb-title {
  font-size: clamp(1.0625rem, 0.5vw + 0.85rem, 1.5rem);
  letter-spacing: -0.015em;
}
.hb-fact {
  margin: 0.375rem 0 0;
  font-size: var(--text-step-0);
  line-height: 1.4;
  color: rgb(255 255 255 / 0.8);
}
@media (width >= 40rem) {
  .hb-fact { font-size: var(--text-step-1); }
}

.hb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.875rem;
  font-size: var(--text-step-0);
  font-weight: 600;
  color: #fff;
  text-decoration: none;
}
@media (width >= 40rem) {
  .hb-link { margin-top: 1rem; font-size: var(--text-step-1); }
}
.hb-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
.hb-link:focus-visible { outline: none; }
.hb-tile:has(.hb-link:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

@media (hover: hover) {
  .hb-tile:hover .hb-img { transform: scale(1.03); }
  .hb-tile:hover .btn-arrow-icon { transform: translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .hb-img { transition: none; }
  .hb-tile:hover .hb-img { transform: none; }
}
</style>
