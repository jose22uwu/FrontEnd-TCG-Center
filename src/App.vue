<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScreenDust } from '@/composables/useScreenDust'
import '@/styles/screen-dust.css'

const dustRef = ref(null)
const { start, stop } = useScreenDust(dustRef, { intensity: 1.5 })

onMounted(() => {
  start()
  const auth = useAuthStore()
  if (auth.isAuthenticated) {
    auth.validateSession()
  }
})
onBeforeUnmount(() => {
  stop()
})
</script>

<template>
  <div id="app" class="app-root">
    <div ref="dustRef" class="screen-dust" aria-hidden="true" />
    <div class="app-content">
      <RouterView />
    </div>
  </div>
</template>
