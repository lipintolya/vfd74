<script setup lang="ts">
import { ref, computed } from 'vue'

const CDN = 'https://storage.yandexcloud.net/catalog-vfd/invisible/'

const COVERS = [
  { id: 'modern',  label: 'Современный', src: `${CDN}cover.webp`        },
  { id: 'loft',    label: 'Лофт',        src: `${CDN}cover_black.webp`   },
  { id: 'artdeco', label: 'Арт-деко',    src: `${CDN}cover_artdeco.webp` },
] as const

type CoverId = typeof COVERS[number]['id']

const activeId = ref<CoverId>('modern')
</script>

<template>
  <div class="csw-host">
    <!-- Background images (all mounted, opacity toggled) -->
    <div class="csw-bg" aria-hidden="true">
      <img
        v-for="cover in COVERS"
        :key="cover.id"
        :src="cover.src"
        :alt="cover.label"
        class="csw-bg__img"
        :class="{ 'csw-bg__img--on': cover.id === activeId }"
        :loading="cover.id === activeId ? 'eager' : 'lazy'"
        :fetchpriority="cover.id === activeId ? 'high' : undefined"
        decoding="async"
        width="1440"
        height="840"
      />
      <div class="csw-bg__grad" />
    </div>

    <!-- Switcher -->
    <div class="csw-switcher" role="group" aria-label="Выберите стиль интерьера">
      <p class="csw-switcher__label">Выбери свой стиль</p>
      <div class="csw-switcher__row">
        <button
          v-for="cover in COVERS"
          :key="cover.id"
          type="button"
          class="csw-thumb"
          :class="{ 'csw-thumb--on': cover.id === activeId }"
          :aria-pressed="cover.id === activeId"
          :aria-label="`Стиль: ${cover.label}`"
          @click="activeId = cover.id"
        >
          <img :src="cover.src" alt="" class="csw-thumb__img" decoding="async" />
          <span class="csw-thumb__name">{{ cover.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Background ── */
.csw-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.csw-bg__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 550ms ease;
}
.csw-bg__img--on { opacity: 1; }
.csw-bg__grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.52) 0%,
    rgba(15, 23, 42, 0.22) 45%,
    rgba(15, 23, 42, 0.06) 100%
  );
}

/* ── Switcher ── */
/* Привязан к верху, а не к низу: текстовый блок hero всегда прижат к низу
   карточки (align-items: flex-end на .sd-hero), поэтому верх остаётся
   свободным при любой ширине — переключатель не может налезть на текст. */
.csw-switcher {
  position: absolute;
  top: clamp(1.25rem, 3vw, 2rem);
  right: clamp(1.25rem, 3vw, 2rem);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}
.csw-switcher__label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.csw-switcher__row {
  display: flex;
  gap: 0.5rem;
}

/* ── Thumbnail ── */
.csw-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  border-radius: 0.625rem;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  width: 5.5rem;
  transition: border-color 180ms ease, transform 150ms ease;
}
.csw-thumb:hover {
  border-color: rgba(255, 255, 255, 0.65);
  transform: translateY(-2px);
}
.csw-thumb--on {
  border-color: #fff;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.25);
}
.csw-thumb__img {
  display: block;
  width: 100%;
  height: 3.5rem;
  object-fit: cover;
}
.csw-thumb__name {
  display: block;
  padding: 0.28rem 0.375rem 0.32rem;
  width: 100%;
  text-align: center;
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0,0,0,0.28);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.csw-thumb--on .csw-thumb__name { color: #fff; }

/* ── Responsive ── */
/* На мобильном переключатель встаёт в обычный поток над заголовком —
   не абсолютным слоем, поэтому не может налезть на текст ниже, какой бы
   высоты он ни был (перенос строк, длинные подписи и т.п.). position: relative,
   а не static — иначе z-index перестаёт действовать и фоновое фото (position:
   absolute) перекрывает переключатель сверху, как только успевает загрузиться. */
@media (max-width: 640px) {
  .csw-switcher {
    position: relative;
    width: 100%;
    padding: 0.75rem 0.75rem 0;
  }
  .csw-switcher__row { flex-wrap: wrap; justify-content: flex-end; }
}
@media (max-width: 520px) {
  .csw-thumb { width: 4.25rem; }
  .csw-thumb__img { height: 2.25rem; }
  .csw-switcher__label { font-size: 0.625rem; letter-spacing: 0.06em; }
  .csw-thumb__name {
    font-size: 0.5rem;
    padding: 0.2rem 0.25rem 0.24rem;
    /* «Современный» — одно длинное слово без пробелов, обычный перенос
       по словам его не разбивает (негде), поэтому вместо многоточия
       («СОВРЕМ...») переносим по буквам на 2 строки. */
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    overflow-wrap: anywhere;
    line-height: 1.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .csw-bg__img,
  .csw-thumb { transition: none; }
}
</style>
