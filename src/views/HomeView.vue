<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { cardImageSrc } from '@/utils/cardImage'
import { normalizeApiList } from '@/utils/apiResponse'
import '@/styles/views/HomeView.css'

const CAROUSEL_SIZE = 15
const CAROUSEL_AUTO_MS = 4500

const auth = useAuthStore()
const cards = ref([])
const loading = ref(false)
const error = ref('')
const trackRef = ref(null)
const wrapRef = ref(null)
const current = ref(0)
let autoIntervalId = null

const displayName = computed(() => {
  if (!auth.user) return ''
  return auth.user.name || auth.user.username || auth.user.email || 'Usuario'
})

const carouselCards = computed(() => cards.value.slice(0, CAROUSEL_SIZE))

function isMobile () {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
}

function center (i) {
  const track = trackRef.value
  const wrap = wrapRef.value
  if (!track || !wrap) return
  const cardEls = Array.from(track.children)
  const card = cardEls[i]
  if (!card) return
  const axis = isMobile() ? 'top' : 'left'
  const size = isMobile() ? 'clientHeight' : 'clientWidth'
  const start = isMobile() ? card.offsetTop : card.offsetLeft
  wrap.scrollTo({
    [axis]: start - (wrap[size] / 2 - card[size] / 2),
    behavior: 'smooth'
  })
}

function toggleUI (i) {
  const track = trackRef.value
  if (!track) return
  const activeCard = carouselCards.value[i]
  const activeId = activeCard ? String(activeCard.id) : null
  const cardEls = Array.from(track.children)
  cardEls.forEach((el) => {
    el.toggleAttribute('active', el.dataset.cardId === activeId)
  })
}

function activate (i, scroll) {
  if (i === current.value) return
  current.value = i
  toggleUI(i)
  if (scroll) center(i)
}

function go (step) {
  const n = carouselCards.value.length
  if (n === 0) return
  activate(Math.min(Math.max(current.value + step, 0), n - 1), true)
}

function onKeydown (e) {
  if (['ArrowRight', 'ArrowDown'].includes(e.key)) go(1)
  if (['ArrowLeft', 'ArrowUp'].includes(e.key)) go(-1)
}

function onCardEnter (i) {
  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
    activate(i, true)
  }
}

let touchStartX = 0
let touchStartY = 0
function onTouchStart (e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchEnd (e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  const threshold = 60
  if (isMobile()) {
    if (Math.abs(dy) > threshold) go(dy > 0 ? -1 : 1)
  } else {
    if (Math.abs(dx) > threshold) go(dx > 0 ? -1 : 1)
  }
}

async function loadCarouselCards () {
  if (cards.value.length) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/carousel')
    cards.value = normalizeApiList(data, [])
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudieron cargar las cartas.'
  } finally {
    loading.value = false
  }
}

function onResize () {
  center(current.value)
}

function startAutoAdvance () {
  stopAutoAdvance()
  if (carouselCards.value.length <= 1) return
  autoIntervalId = setInterval(() => {
    const n = carouselCards.value.length
    if (n <= 1) return
    if (current.value >= n - 1) {
      activate(0, true)
    } else {
      go(1)
    }
  }, CAROUSEL_AUTO_MS)
}

function stopAutoAdvance () {
  if (autoIntervalId) {
    clearInterval(autoIntervalId)
    autoIntervalId = null
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) return
  await loadCarouselCards()
  await nextTick()
  if (carouselCards.value.length > 0) {
    toggleUI(0)
    center(0)
    startAutoAdvance()
    window.addEventListener('keydown', onKeydown, { passive: true })
    window.addEventListener('resize', onResize)
  }
})

onBeforeUnmount(() => {
  stopAutoAdvance()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="home">
    <template v-if="auth.isAuthenticated">
      <template v-if="loading">
        <p class="home-error">{{ error || 'Cargando cartas...' }}</p>
      </template>
      <template v-else-if="carouselCards.length > 0">
        <div class="home-app">
          <div class="carousel-zone" @mouseenter="stopAutoAdvance" @mouseleave="startAutoAdvance">
          <header class="head">
            <h2>Cartas que podrás encontrar</h2>
          </header>

          <div ref="wrapRef" class="slider">
            <div
              ref="trackRef"
              id="track"
              class="track"
              @touchstart.passive="onTouchStart"
              @touchend.passive="onTouchEnd"
            >
              <div
                v-for="(card, idx) in carouselCards"
                :key="card.id"
                :data-card-id="card.id"
                class="project-card"
                @click="activate(idx, true)"
                @mouseenter="onCardEnter(idx)"
              >
                <img
                  v-if="cardImageSrc(card.image_url)"
                  :src="cardImageSrc(card.image_url)"
                  :alt="card.name"
                  class="project-card__bg"
                  loading="lazy"
                />
                <div v-else class="project-card__bg project-card__bg--placeholder" />
                <div class="project-card__content">
                  <h3 class="project-card__title">{{ card.name }}</h3>
                  <img
                    v-if="cardImageSrc(card.image_url)"
                    :src="cardImageSrc(card.image_url)"
                    :alt="card.name"
                    class="project-card__thumb"
                    loading="lazy"
                  />
                  <p class="project-card__desc">{{ card.category || 'Carta' }} · {{ card.rarity || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div id="dots" class="dots">
            <button
              v-for="(_, i) in carouselCards"
              :key="i"
              type="button"
              class="dot"
              :class="{ active: current === i }"
              :aria-label="`Ir a carta ${i + 1}`"
              @click="activate(i, true)"
            />
          </div>
          </div>

          <section class="home-below">
            <p class="home-below-tagline">Compra y vende cartas Pokemon TCG en subasta. Explora el catálogo y oferta por las que te interesen.</p>
            <div class="home-below-actions">
              <RouterLink to="/buy" class="home-below-btn home-below-btn--buy">Comprar cartas</RouterLink>
              <RouterLink to="/sell" class="home-below-btn home-below-btn--sell">Vender cartas</RouterLink>
            </div>
            <div class="home-below-steps">
              <div class="home-below-step">
                <span class="home-below-step-num">1</span>
                <span class="home-below-step-text">Explora el catálogo y las subastas activas</span>
              </div>
              <div class="home-below-step">
                <span class="home-below-step-num">2</span>
                <span class="home-below-step-text">Oferta o publica tus cartas</span>
              </div>
              <div class="home-below-step">
                <span class="home-below-step-num">3</span>
                <span class="home-below-step-text">Gestiona ventas y envíos desde tu perfil</span>
              </div>
            </div>
          </section>
        </div>
      </template>
      <template v-else>
        <section class="home-hero">
          <h1 class="home-title">Hola, {{ displayName }}</h1>
          <p class="home-subtitle">Explora el catálogo, compra o vende cartas Pokemon TCG.</p>
          <p v-if="error" class="home-error">{{ error }}</p>
        </section>
      </template>
    </template>

    <template v-else>
      <section class="home-guest">
        <div class="home-guest-bg" />
        <h1 class="home-guest-title">Pokemon TCG Subasta</h1>
        <p class="home-guest-text">Plataforma de subastas de cartas Pokemon TCG. Inicia sesión o regístrate para comprar y vender.</p>
        <div class="home-guest-actions">
          <RouterLink to="/login" class="home-guest-btn home-guest-btn--primary">Iniciar sesión</RouterLink>
          <RouterLink to="/register" class="home-guest-btn home-guest-btn--secondary">Registrarse</RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>
