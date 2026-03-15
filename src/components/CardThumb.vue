<template>
  <img
    v-if="src"
    loading="lazy"
    :src="src"
    :alt="alt"
    class="card-thumb-img"
  />
</template>

<script setup>
defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' }
})
</script>

<style scoped>
.card-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
