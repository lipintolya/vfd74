<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  visiblePages: Array<number | string>
}>()

defineEmits<{
  change: [page: number]
}>()
</script>

<template>
  <nav v-if="totalPages > 1" class="pg" aria-label="Страницы каталога">
    <button
      type="button"
      class="pg__step"
      :disabled="currentPage <= 1"
      @click="$emit('change', currentPage - 1)"
    >
      Назад
    </button>
    <ol class="pg__pages" role="list">
      <li v-for="(page, i) in visiblePages" :key="`${page}-${i}`">
        <span v-if="page === '...'" class="pg__gap" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          class="pg__page"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="`Страница ${page}`"
          @click="$emit('change', page as number)"
        >
          {{ page }}
        </button>
      </li>
    </ol>
    <button
      type="button"
      class="pg__step"
      :disabled="currentPage >= totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      Далее
    </button>
  </nav>
</template>

<style scoped>
/* Номера — круги, текущая — графитовая «таблетка», как выбранная вкладка
   «Новинок»; «Назад»/«Далее» — контурные, как .btn-outline */
.pg {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.pg__pages { display: flex; flex-wrap: wrap; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }
.pg__page,
.pg__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-fg);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color 180ms var(--ease-out), border-color 180ms var(--ease-out);
}
.pg__page { min-width: 2.75rem; padding: 0 0.5rem; }
.pg__page:hover { background: #f4f4f5; }
.pg__page[aria-current='page'] { background: var(--color-fg); color: #fff; cursor: default; }
.pg__step { padding: 0 1.25rem; border-color: #d4d4d8; }
.pg__step:hover:not(:disabled) { border-color: var(--color-fg); }
.pg__step:disabled { opacity: 0.4; cursor: default; }
.pg__gap { display: inline-grid; place-items: center; min-width: 1.5rem; min-height: 2.75rem; color: #a1a1aa; }
@media (max-width: 29.9375rem) {
  /* Телефон: «Назад» и «Далее» под номерами, во всю ширину пополам */
  .pg__pages { order: -1; width: 100%; justify-content: center; }
  .pg__step { flex: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .pg__page, .pg__step { transition: none; }
}
</style>
