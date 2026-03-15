<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { rarityModalStyle, rarityMatchesFilter, isHoloRareV, RARITY_FILTER_OPTIONS } from '@/constants/rarityModalStyles'
import { cardImageSrc } from '@/utils/cardImage'
import { normalizeApiList } from '@/utils/apiResponse'
import { useClickOutside } from '@/composables/useClickOutside'
import HoloModalLowPolyBg from '@/components/HoloModalLowPolyBg.vue'
import '@/styles/views/ProfileView.css'
import '@/styles/views/SellView.css'

const auth = useAuthStore()
const userCards = ref([])
const myActiveListings = ref([])
const loading = ref(true)
const error = ref('')

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

/** IDs de cartas que están en algún anuncio activo del usuario (no mostrarlas en "Vender cartas") */
const cardIdsInActiveListings = computed(() => {
  const listings = myActiveListings.value
  if (!Array.isArray(listings)) return new Set()
  const set = new Set()
  for (const listing of listings) {
    if (listing.status !== 'active') continue
    for (const card of listing.cards || []) {
      if (card && card.id != null) set.add(Number(card.id))
    }
  }
  return set
})

/** Cartas que el usuario puede vender (no están en ningún anuncio activo) */
const sellableCards = computed(() => {
  const idsInListings = cardIdsInActiveListings.value
  return cardsWithPivot.value.filter((c) => !idsInListings.has(Number(c.id)))
})

const selectedRarityFilter = ref('')
const filterDropdownOpen = ref(false)
const filterWrapRef = ref(null)
useClickOutside(filterWrapRef, () => { filterDropdownOpen.value = false })

const filteredCards = computed(() => {
  const cards = sellableCards.value
  const filter = selectedRarityFilter.value
  if (!filter) return cards
  if (filter === 'holo-rare-v') return cards.filter((c) => isHoloRareV(c.rarity))
  return cards.filter((c) => rarityMatchesFilter(c.rarity, filter))
})

const selectedCardId = ref(null)
const priceHistory = ref([])
const priceHistoryLoading = ref(false)
const priceChartHoverIndex = ref(null)
const listingPrice = ref('')
const listingQuantity = ref(1)
const submitError = ref('')
const submitLoading = ref(false)
const submitSuccess = ref(false)

const selectedCard = computed(() => {
  const id = selectedCardId.value
  if (id == null) return null
  return filteredCards.value.find((c) => c.id === id) ?? null
})

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

const priceHistoryMax = computed(() => {
  const amounts = priceHistory.value.map((p) => p.amount)
  return amounts.length ? Math.max(...amounts, 0.01) : 1
})

const chartWidth = 280
const chartHeight = 80
const chartPadding = { top: 16, right: 16, bottom: 16, left: 16 }

const priceHistoryLinePoints = computed(() => {
  const data = priceHistory.value
  const max = priceHistoryMax.value
  if (!data.length) return ''
  const w = chartWidth - chartPadding.left - chartPadding.right
  const h = chartHeight - chartPadding.top - chartPadding.bottom
  return data
    .map((p, i) => {
      const x = chartPadding.left + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w)
      const y = chartPadding.top + h - (p.amount / max) * h
      return `${x},${y}`
    })
    .join(' ')
})

function chartPointCoords (idx) {
  const data = priceHistory.value
  const max = priceHistoryMax.value
  if (!data.length || idx < 0 || idx >= data.length) return { cx: 0, cy: 0 }
  const w = chartWidth - chartPadding.left - chartPadding.right
  const h = chartHeight - chartPadding.top - chartPadding.bottom
  const cx = chartPadding.left + (data.length === 1 ? w / 2 : (idx / (data.length - 1)) * w)
  const cy = chartPadding.top + h - (data[idx].amount / max) * h
  return { cx, cy }
}

function chartPointTransform (idx) {
  const { cx, cy } = chartPointCoords(idx)
  return `translate(${cx},${cy})`
}

function formatPriceDate (isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function fetchPriceHistory (cardId) {
  priceHistory.value = []
  priceHistoryLoading.value = true
  priceChartHoverIndex.value = null
  try {
    const { data } = await api.get(`/cards/${cardId}/price-history`)
    const list = data?.data ?? data
    priceHistory.value = Array.isArray(list) ? list : []
  } catch (_) {
    priceHistory.value = []
  } finally {
    priceHistoryLoading.value = false
  }
}

function openCard (card) {
  selectedCardId.value = card.id
  listingPrice.value = ''
  listingQuantity.value = Math.min(1, card.quantity)
  submitError.value = ''
  submitSuccess.value = false
  fetchPriceHistory(card.id)
}

function closeCard () {
  selectedCardId.value = null
  priceChartHoverIndex.value = null
  submitError.value = ''
  submitSuccess.value = false
}

const maxQuantity = computed(() => selectedCard.value?.quantity ?? 1)

async function submitListing () {
  if (!selectedCard.value) return
  const price = parseFloat(listingPrice.value)
  const qty = Math.floor(Number(listingQuantity.value)) || 1
  if (Number.isNaN(price) || price < 0) {
    submitError.value = 'Indica un precio inicial válido (≥ 0).'
    return
  }
  if (qty < 1 || qty > selectedCard.value.quantity) {
    submitError.value = `La cantidad debe estar entre 1 y ${selectedCard.value.quantity}.`
    return
  }
  submitError.value = ''
  submitLoading.value = true
  try {
    await api.post('/listings', {
      starting_price: price,
      cards: [{ card_id: selectedCard.value.id, quantity: qty }]
    })
    submitSuccess.value = true
    await loadMyActiveListings()
    setTimeout(() => closeCard(), 1500)
  } catch (e) {
    submitError.value = e.response?.data?.message ?? e.response?.data?.errors?.starting_price?.[0] ?? 'No se pudo crear la oferta.'
  } finally {
    submitLoading.value = false
  }
}

async function loadMyActiveListings () {
  try {
    const { data } = await api.get('/user/listings', { params: { per_page: 100 } })
    myActiveListings.value = normalizeApiList(data)
  } catch (_) {
    myActiveListings.value = []
  }
}

onMounted(async () => {
  try {
    const [cardsRes, listingsRes] = await Promise.all([
      api.get('/user/cards', { params: { per_page: 100 } }),
      api.get('/user/listings', { params: { per_page: 100 } })
    ])
    userCards.value = normalizeApiList(cardsRes.data)
    myActiveListings.value = normalizeApiList(listingsRes.data)
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudieron cargar las cartas.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="profile-page sell-page">
    <div class="profile-header">
      <h1 class="profile-title">Vender cartas</h1>
      <div ref="filterWrapRef" class="profile-filter-wrap" v-if="!loading && !error && sellableCards.length > 0">
        <button
          type="button"
          class="profile-filter-btn"
          :class="{ 'profile-filter-btn--open': filterDropdownOpen }"
          aria-haspopup="listbox"
          :aria-expanded="filterDropdownOpen"
          aria-label="Filtrar por rareza"
          @click="filterDropdownOpen = !filterDropdownOpen"
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
              @click="selectedRarityFilter = opt.value; filterDropdownOpen = false"
            >
              {{ opt.label }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
    <p class="profile-greeting">Elige una carta para publicar una oferta.</p>

    <template v-if="loading">
      <p class="profile-message">Cargando tus cartas...</p>
    </template>
    <template v-else-if="error">
      <p class="profile-error">{{ error }}</p>
    </template>
    <template v-else-if="cardsWithPivot.length === 0">
      <p class="profile-message">No tienes cartas para vender. Añade cartas a tu álbum desde Comprar cartas.</p>
    </template>
    <template v-else-if="sellableCards.length === 0">
      <p class="profile-message">Todas tus cartas están en venta. Cancela un anuncio en <RouterLink to="/listings" class="sell-listings-link">Anuncios de venta</RouterLink> para volver a ponerlas aquí.</p>
    </template>
    <template v-else>
      <div class="profile-album" @click.self="filterDropdownOpen = false">
        <p v-if="filteredCards.length === 0" class="profile-no-results">Ninguna carta con esa rareza.</p>
        <div v-else class="cards">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            class="card card-clickable"
            :class="{
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
          aria-labelledby="sell-modal-title"
          @click.self="closeCard"
        >
          <div
            class="card-modal-content sell-modal-content"
            :style="rarityModalStyle(selectedCard?.rarity)"
          >
            <HoloModalLowPolyBg v-if="isHoloRareV(selectedCard?.rarity)" />
            <button type="button" class="card-modal-close" aria-label="Cerrar" @click="closeCard" />
            <div v-if="selectedCard" class="card-modal-body sell-modal-body">
              <div
                class="card-modal-image"
                :style="{ backgroundImage: cardImageSrc(selectedCard.image_url) ? `url(${cardImageSrc(selectedCard.image_url)})` : 'none' }"
              />
              <div class="card-modal-info sell-modal-info">
                <h2 id="sell-modal-title" class="card-modal-name">{{ selectedCard.name }}</h2>
                <p class="sell-modal-owned">Tienes {{ selectedCard.quantity }} en tu álbum.</p>
                <p v-if="!priceHistoryLoading && priceHistory.length > 0" class="sell-modal-current-price">
                  Precio actual (última venta): <strong>{{ priceHistory[0].amount.toFixed(2) }} €</strong>
                </p>

                <div class="sell-price-chart-wrap">
                  <p class="sell-price-chart-title">Historial de ventas (últimas 10)</p>
                  <div v-if="priceHistoryLoading" class="sell-price-chart-loading">Cargando...</div>
                  <template v-else-if="priceHistory.length === 0">
                    <p class="sell-price-chart-empty">Sin ventas recientes de esta carta.</p>
                  </template>
                  <div v-else class="sell-price-chart sell-price-chart--line" role="img" :aria-label="`Gráfico de precios de venta: ${priceHistory.length} ventas`">
                    <svg
                      class="sell-price-chart-svg"
                      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                      preserveAspectRatio="none"
                      @mouseleave="priceChartHoverIndex = null"
                    >
                      <defs>
                        <linearGradient id="sell-chart-line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stop-color="var(--ui-accent)" stop-opacity="0.4" />
                          <stop offset="100%" stop-color="var(--ui-accent)" stop-opacity="0.05" />
                        </linearGradient>
                      </defs>
                      <polyline
                        v-if="priceHistoryLinePoints"
                        class="sell-price-chart-area"
                        :points="`${priceHistoryLinePoints} ${chartWidth - chartPadding.right},${chartHeight - chartPadding.bottom} ${chartPadding.left},${chartHeight - chartPadding.bottom}`"
                        fill="url(#sell-chart-line-gradient)"
                      />
                      <polyline
                        v-if="priceHistoryLinePoints"
                        class="sell-price-chart-line"
                        :points="priceHistoryLinePoints"
                        fill="none"
                      />
                      <g
                        v-for="(point, idx) in priceHistory"
                        :key="idx"
                        class="sell-price-chart-point"
                        :transform="chartPointTransform(idx)"
                        @mouseenter="priceChartHoverIndex = idx"
                      >
                        <circle class="sell-price-chart-hit" cx="0" cy="0" r="12" />
                        <circle
                          class="sell-price-chart-dot"
                          :class="{ 'sell-price-chart-dot--hover': priceChartHoverIndex === idx }"
                          cx="0"
                          cy="0"
                          r="4"
                        />
                      </g>
                    </svg>
                  </div>
                  <div v-if="priceChartHoverIndex != null && priceHistory[priceChartHoverIndex]" class="sell-price-chart-tooltip">
                    {{ priceHistory[priceChartHoverIndex].amount.toFixed(2) }} € · {{ formatPriceDate(priceHistory[priceChartHoverIndex].sold_at) }}
                  </div>
                </div>

                <form class="sell-modal-form" @submit.prevent="submitListing">
                  <div class="sell-form-field">
                    <label for="sell-price">Precio inicial (€)</label>
                    <input
                      id="sell-price"
                      v-model.number="listingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div class="sell-form-field" v-if="selectedCard.quantity > 1">
                    <label for="sell-qty">Cantidad a vender</label>
                    <input
                      id="sell-qty"
                      v-model.number="listingQuantity"
                      type="number"
                      min="1"
                      :max="selectedCard.quantity"
                      required
                    />
                  </div>
                  <p v-if="submitError" class="sell-form-error">{{ submitError }}</p>
                  <p v-if="submitSuccess" class="sell-form-success">Oferta publicada correctamente.</p>
                  <button type="submit" class="sell-form-submit" :disabled="submitLoading">
                    {{ submitLoading ? 'Publicando...' : 'Publicar oferta' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
