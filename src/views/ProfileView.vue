<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { rarityModalStyle, rarityMatchesFilter, isHoloRareV, RARITY_FILTER_OPTIONS } from '@/constants/rarityModalStyles'
import { cardImageSrc } from '@/utils/cardImage'
import { normalizeApiList } from '@/utils/apiResponse'
import { useClickOutside } from '@/composables/useClickOutside'
import HoloModalLowPolyBg from '@/components/HoloModalLowPolyBg.vue'
import '@/styles/views/ProfileView.css'

const auth = useAuthStore()
const route = useRoute()
const userCards = ref([])
const loading = ref(true)
const error = ref('')

const displayName = computed(() => auth.user?.name || auth.user?.username || 'Usuario')

const totalCardsLabel = computed(() => {
  const list = cardsWithPivot.value
  if (!list.length) return ''
  const totalCopies = list.reduce((sum, c) => sum + (c.quantity || 0), 0)
  if (totalCopies === list.length) return `${list.length} carta${list.length !== 1 ? 's' : ''}`
  return `${list.length} carta${list.length !== 1 ? 's' : ''} (${totalCopies} copias)`
})

const cardsWithPivot = computed(() => {
  const list = userCards.value
  if (!Array.isArray(list)) return []
  return list.map((c) => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    quantity: c.pivot?.quantity ?? 1,
    rarity: c.rarity,
    set_name: c.set_name,
    category: c.category,
    illustrator: c.illustrator
  }))
})

const selectedRarityFilter = ref('')
const filterDropdownOpen = ref(false)
const filterWrapRef = ref(null)
useClickOutside(filterWrapRef, () => { filterDropdownOpen.value = false })

const filteredCards = computed(() => {
  const cards = cardsWithPivot.value
  const filter = selectedRarityFilter.value
  if (!filter) return cards
  if (filter === 'holo-rare-v') return cards.filter((c) => isHoloRareV(c.rarity))
  return cards.filter((c) => rarityMatchesFilter(c.rarity, filter))
})

const selectedCard = ref(null)

const autoHoveredId = ref(null)
let autoHoverScheduleId = null
let autoHoverClearId = null

function scheduleNextAutoHover () {
  const cards = filteredCards.value
  if (cards.length === 0) return
  const delay = 2000 + Math.random() * 4000
  autoHoverScheduleId = setTimeout(() => {
    const idx = Math.floor(Math.random() * cards.length)
    autoHoveredId.value = cards[idx].id
    autoHoverClearId = setTimeout(() => {
      autoHoveredId.value = null
      scheduleNextAutoHover()
    }, 1200)
  }, delay)
}

function clearAutoHoverSchedule () {
  if (autoHoverScheduleId) {
    clearTimeout(autoHoverScheduleId)
    autoHoverScheduleId = null
  }
  if (autoHoverClearId) {
    clearTimeout(autoHoverClearId)
    autoHoverClearId = null
  }
  autoHoveredId.value = null
}

const holoHoverState = ref({ cardId: null, tx: 0, ty: 0, lp: 50, tp: 50, pxSpark: 50, pySpark: 50, opc: 0.75 })

function onHoloMove (e, card) {
  if (!isHoloRareV(card.rarity)) return
  const el = e.currentTarget
  const w = el.offsetWidth
  const h = el.offsetHeight
  const l = e.offsetX
  const t = e.offsetY
  const px = Math.abs(Math.floor((100 / w) * l) - 100)
  const py = Math.abs(Math.floor((100 / h) * t) - 100)
  const pa = (50 - px) + (50 - py)
  const lp = 50 + (px - 50) / 1.5
  const tp = 50 + (py - 50) / 1.5
  const pxSpark = 50 + (px - 50) / 7
  const pySpark = 50 + (py - 50) / 7
  const pOpc = Math.min(100, 20 + Math.abs(pa) * 1.5) / 100
  const ty = ((tp - 50) / 2) * -1
  const tx = ((lp - 50) / 1.5) * 0.5
  holoHoverState.value = { cardId: card.id, tx, ty, lp, tp, pxSpark, pySpark, opc: pOpc }
}

function onHoloLeave (card) {
  if (holoHoverState.value.cardId === card.id) {
    holoHoverState.value = { cardId: null, tx: 0, ty: 0, lp: 50, tp: 50, pxSpark: 50, pySpark: 50, opc: 0.75 }
  }
}

function holoCardStyle (card) {
  if (!isHoloRareV(card.rarity)) return undefined
  const s = holoHoverState.value
  const active = s.cardId === card.id
  if (!active) return { '--holo-tx': '0deg', '--holo-ty': '0deg' }
  return {
    '--holo-tx': `${s.tx}deg`,
    '--holo-ty': `${s.ty}deg`,
    '--holo-bg-pos': `${s.lp}% ${s.tp}%`,
    '--holo-bg-opacity': '0.88',
    '--holo-spark-pos': `${s.pxSpark}% ${s.pySpark}%`,
    '--holo-spark-opacity': String(s.opc)
  }
}

watch(
  () => filteredCards.value.length,
  (len) => {
    clearAutoHoverSchedule()
    if (len > 0) scheduleNextAutoHover()
  },
  { immediate: true }
)

function toggleFilterDropdown () {
  filterDropdownOpen.value = !filterDropdownOpen.value
}

function selectRarity (value) {
  selectedRarityFilter.value = value
  filterDropdownOpen.value = false
}

function closeFilterDropdown () {
  filterDropdownOpen.value = false
}

function openCard (card) {
  selectedCard.value = card
}

function closeCard () {
  selectedCard.value = null
}

async function loadUserCards () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/user/cards', { params: { per_page: 'all' } })
    userCards.value = normalizeApiList(data)
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudieron cargar las cartas.'
  } finally {
    loading.value = false
  }
}

onMounted(loadUserCards)

watch(() => route.name, (name) => {
  if (name === 'profile') {
    loadUserCards()
  }
})

onBeforeUnmount(clearAutoHoverSchedule)
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1 class="profile-title">Mi perfil</h1>
      <div ref="filterWrapRef" class="profile-filter-wrap" v-if="!loading && !error && cardsWithPivot.length > 0">
        <button
          type="button"
          class="profile-filter-btn"
          :class="{ 'profile-filter-btn--open': filterDropdownOpen }"
          aria-haspopup="listbox"
          :aria-expanded="filterDropdownOpen"
          aria-label="Filtrar por rareza"
          @click="toggleFilterDropdown"
        >
          <svg class="profile-filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="filterDropdownOpen" class="profile-filter-dropdown" role="listbox">
            <button
              v-for="opt in RARITY_FILTER_OPTIONS"
              :key="opt.value || 'all'"
              type="button"
              class="profile-filter-option"
              :class="{ 'profile-filter-option--active': selectedRarityFilter === opt.value }"
              role="option"
              :aria-selected="selectedRarityFilter === opt.value"
              @click="selectRarity(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
    <p class="profile-greeting">Bienvenido, {{ displayName }}.</p>
    <p v-if="totalCardsLabel" class="profile-count">{{ totalCardsLabel }} en tu álbum</p>

    <template v-if="loading">
      <p class="profile-message">Cargando álbum...</p>
    </template>
    <template v-else-if="error">
      <p class="profile-error">{{ error }}</p>
    </template>
    <template v-else-if="cardsWithPivot.length === 0">
      <p class="profile-message">Aún no tienes cartas en tu álbum. Compra o añade cartas para verlas aquí.</p>
    </template>
    <template v-else>
      <div class="profile-album" @click.self="closeFilterDropdown">
        <p v-if="filteredCards.length === 0" class="profile-no-results">Ninguna carta con esa rareza.</p>
        <div v-else class="cards">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            class="card card-clickable"
            :class="{
              'card--auto-hover': autoHoveredId === card.id,
              'card-holo': isHoloRareV(card.rarity),
              'card--holo-active': isHoloRareV(card.rarity) && holoHoverState.cardId === card.id
            }"
            :style="[
              { '--background': cardImageSrc(card.image_url) ? `url(${cardImageSrc(card.image_url)})` : 'none' },
              isHoloRareV(card.rarity) ? holoCardStyle(card) : {}
            ]"
            @click="openCard(card)"
            @mousemove="onHoloMove($event, card)"
            @mouseleave="onHoloLeave(card)"
          >
            <template v-if="isHoloRareV(card.rarity)">
              <div class="card-holo__before" aria-hidden="true" />
              <div class="card-holo__after" aria-hidden="true" />
            </template>
            <div class="shine" />
          </div>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="selectedCard"
          class="card-modal-overlay"
          aria-modal="true"
          role="dialog"
          aria-labelledby="card-modal-title"
          @click.self="closeCard"
        >
          <div
            class="card-modal-content"
            :style="rarityModalStyle(selectedCard?.rarity)"
          >
            <HoloModalLowPolyBg v-if="isHoloRareV(selectedCard?.rarity)" />
            <button type="button" class="card-modal-close" aria-label="Cerrar" @click="closeCard" />
            <div v-if="selectedCard" class="card-modal-body">
              <div
                class="card-modal-image"
                :style="{ backgroundImage: cardImageSrc(selectedCard.image_url) ? `url(${cardImageSrc(selectedCard.image_url)})` : 'none' }"
              />
              <div class="card-modal-info">
                <h2 id="card-modal-title" class="card-modal-name">{{ selectedCard.name }}</h2>
                <dl class="card-modal-details">
                  <dt>Cantidad</dt>
                  <dd>{{ selectedCard.quantity }}</dd>
                  <template v-if="selectedCard.rarity">
                    <dt>Rareza</dt>
                    <dd>{{ selectedCard.rarity }}</dd>
                  </template>
                  <template v-if="selectedCard.set_name">
                    <dt>Set</dt>
                    <dd>{{ selectedCard.set_name }}</dd>
                  </template>
                  <template v-if="selectedCard.category">
                    <dt>Categoría</dt>
                    <dd>{{ selectedCard.category }}</dd>
                  </template>
                  <template v-if="selectedCard.illustrator">
                    <dt>Ilustrador</dt>
                    <dd>{{ selectedCard.illustrator }}</dd>
                  </template>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
