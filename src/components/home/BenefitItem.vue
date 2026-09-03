<script setup lang="ts">
/**
 * src/components/home/BenefitItem.vue
 * Один пункт списка преимуществ — иконка + текст.
 */
defineProps<{ text: string }>()
</script>

<template>
  <li class="text-base text-slate-700">
    <span class="-mx-3 -my-1.5 flex items-center gap-3 rounded-xl px-3 py-1.5">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <slot />
      </span>
      <span>{{ text }}</span>
    </span>
  </li>
</template>
