<script setup lang="ts">
defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="ce" role="status">
    <p class="t-h3 ce__title">Таких моделей нет</p>
    <p class="t-body ce__text">Уберите часть фильтров — или позвоните в салон: подберём похожую дверь.</p>
    <button type="button" class="btn btn-primary ce__btn" @click="$emit('reset')">Сбросить фильтры</button>
  </div>
</template>

<style scoped>
.ce {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(2rem, 5vw, 3.5rem);
  background: #d8d8db;
}
.ce__title { margin: 0; }
.ce__text { margin: 0.5rem 0 0; max-width: 28rem; color: #52525b; }
.ce__btn { margin-top: 1.5rem; }
</style>
