<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/styles/layouts/MainLayout.css'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const navContentRef = ref(null)
const horiSelectorRef = ref(null)
const navListRef = ref(null)
const menuOpen = ref(false)

function updateSelector () {
  const list = navListRef.value
  const selector = horiSelectorRef.value
  if (!list || !selector) return
  const active = list.querySelector('li.active')
  if (!active) {
    selector.style.opacity = '0'
    return
  }
  selector.style.opacity = '1'
  const top = active.offsetTop
  const left = active.offsetLeft
  const width = active.offsetWidth
  const height = active.offsetHeight
  selector.style.top = `${top}px`
  selector.style.left = `${left}px`
  selector.style.width = `${width}px`
  selector.style.height = `${height}px`
}

function toggleMenu () {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) setTimeout(updateSelector, 50)
}

function isActive (name) {
  return route.name === name
}

onMounted(() => {
  nextTick(updateSelector)
  window.addEventListener('resize', updateSelector)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSelector)
})
watch(() => route.name, () => {
  nextTick(updateSelector)
})

function handleLogout () {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="main-layout">
    <nav class="navbar navbar-expand-custom navbar-mainbg">
      <RouterLink to="/" class="navbar-brand navbar-logo">Pokemon TCG Subasta</RouterLink>
      <button
        type="button"
        class="navbar-toggler"
        aria-controls="navbarSupportedContent"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation"
        @click="toggleMenu"
      >
        <span class="toggler-icon" />
      </button>
      <div
        id="navbarSupportedContent"
        class="navbar-collapse"
        :class="{ show: menuOpen }"
      >
        <ul ref="navListRef" class="navbar-nav ml-auto">
          <div ref="horiSelectorRef" class="hori-selector">
            <div class="left" />
            <div class="right" />
          </div>
          <li class="nav-item" :class="{ active: isActive('home') }">
            <RouterLink to="/" class="nav-link">Inicio</RouterLink>
          </li>
          <template v-if="auth.isAuthenticated">
            <li class="nav-item" :class="{ active: isActive('profile') }">
              <RouterLink to="/profile" class="nav-link">Mi perfil</RouterLink>
            </li>
            <li class="nav-item" :class="{ active: isActive('buy') }">
              <RouterLink to="/buy" class="nav-link">Comprar cartas</RouterLink>
            </li>
            <li class="nav-item" :class="{ active: isActive('sell') }">
              <RouterLink to="/sell" class="nav-link">Vender cartas</RouterLink>
            </li>
            <li class="nav-item" :class="{ active: isActive('listings') }">
              <RouterLink to="/listings" class="nav-link">Anuncios de venta</RouterLink>
            </li>
            <li class="nav-item">
              <button type="button" class="nav-link nav-link-btn" @click="handleLogout">
                Cerrar sesión
              </button>
            </li>
          </template>
          <template v-else>
            <li class="nav-item" :class="{ active: isActive('login') }">
              <RouterLink to="/login" class="nav-link">Iniciar sesión</RouterLink>
            </li>
            <li class="nav-item" :class="{ active: isActive('register') }">
              <RouterLink to="/register" class="nav-link nav-link-cta">Registrarse</RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
