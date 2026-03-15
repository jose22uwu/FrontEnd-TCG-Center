<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { RouterLink } from 'vue-router'
import { rarityModalStyle, rarityMatchesFilter, isHoloRareV, RARITY_FILTER_OPTIONS } from '@/constants/rarityModalStyles'
import { cardImageSrc } from '@/utils/cardImage'
import { normalizeApiList } from '@/utils/apiResponse'
import { useClickOutside } from '@/composables/useClickOutside'
import HoloModalLowPolyBg from '@/components/HoloModalLowPolyBg.vue'
import '@/styles/views/BuyView.css'

const auth = useAuthStore()
const listings = ref([])
const loading = ref(true)
const error = ref('')
const selectedListing = ref(null)
const acceptLoadingId = ref(null)
const bidLoadingId = ref(null)
const counterOfferListingId = ref(null)
const counterAmount = ref('')
const counterError = ref('')

const selectedRarityFilter = ref('')
const filterDropdownOpen = ref(false)
const filterWrapRef = ref(null)
useClickOutside(filterWrapRef, () => { filterDropdownOpen.value = false })

const filteredListings = computed(() => {
  const list = listings.value
  const filter = selectedRarityFilter.value
  if (!filter) return list
  return list.filter((listing) => {
    const cards = listing.cards || []
    if (cards.length === 0) return false
    if (filter === 'holo-rare-v') return cards.some((c) => isHoloRareV(c.rarity))
    return cards.some((c) => rarityMatchesFilter(c.rarity, filter))
  })
})

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

function isOwnListing (listing) {
  const uid = auth.user?.id
  if (uid == null) return false
  return Number(listing.seller_id) === Number(uid) || Number(listing.seller?.id) === Number(uid)
}

async function loadListings () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/listings', { params: { status: 'active', per_page: 30 } })
    listings.value = normalizeApiList(data)
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudieron cargar las ofertas.'
  } finally {
    loading.value = false
  }
}

async function acceptListing (listing, onSuccess) {
  acceptLoadingId.value = listing.id
  try {
    await api.post(`/listings/${listing.id}/accept`)
    await loadListings()
    onSuccess?.()
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo aceptar la oferta.'
  } finally {
    acceptLoadingId.value = null
  }
}

function openCounterOffer (listing) {
  counterOfferListingId.value = listing.id
  counterAmount.value = ''
  counterError.value = ''
}

function closeCounterOffer () {
  counterOfferListingId.value = null
  counterError.value = ''
}

function openListingModal (listing) {
  selectedListing.value = listing
}

function closeListingModal () {
  selectedListing.value = null
  closeCounterOffer()
}

async function submitCounterOffer (listing, onSuccess) {
  const amount = parseFloat(counterAmount.value)
  if (Number.isNaN(amount) || amount <= 0) {
    counterError.value = 'Indica un importe válido.'
    return
  }
  bidLoadingId.value = listing.id
  counterError.value = ''
  try {
    await api.post(`/listings/${listing.id}/bids`, { amount })
    closeCounterOffer()
    await loadListings()
    onSuccess?.()
  } catch (e) {
    counterError.value = e.response?.data?.message || 'No se pudo enviar la contraoferta.'
  } finally {
    bidLoadingId.value = null
  }
}

onMounted(loadListings)
</script>

<template>
  <div class="buy-page">
    <h1 class="buy-title">Comprar cartas</h1>
    <p class="buy-intro">Ofertas activas. Acepta el precio o envía una contraoferta; el vendedor podrá aceptarla o declinarla.</p>

    <template v-if="loading">
      <p class="buy-message">Cargando ofertas...</p>
    </template>
    <template v-else-if="error">
      <div class="buy-error-wrap">
        <p class="buy-error">{{ error }}</p>
        <button type="button" class="buy-btn buy-btn--back" @click="loadListings">Volver</button>
      </div>
    </template>
    <template v-else-if="listings.length === 0">
      <p class="buy-message">No hay ofertas activas en este momento.</p>
    </template>
    <template v-else>
      <div class="buy-header">
        <div ref="filterWrapRef" class="buy-filter-wrap">
          <button
            type="button"
            class="buy-filter-btn"
            :class="{ 'buy-filter-btn--open': filterDropdownOpen }"
            aria-haspopup="listbox"
            :aria-expanded="filterDropdownOpen"
            aria-label="Filtrar por rareza"
            @click="toggleFilterDropdown"
          >
            <svg class="buy-filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="filterDropdownOpen" class="buy-filter-dropdown" role="listbox">
              <button
                v-for="opt in RARITY_FILTER_OPTIONS"
                :key="opt.value || 'all'"
                type="button"
                class="buy-filter-option"
                :class="{ 'buy-filter-option--active': selectedRarityFilter === opt.value }"
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
      <p v-if="filteredListings.length === 0" class="buy-message">Ninguna oferta con esa rareza.</p>
      <ul v-else class="buy-list" @click.self="closeFilterDropdown">
        <li
          v-for="listing in filteredListings"
          :key="listing.id"
          class="buy-card"
          :class="{ 'buy-card--own': isOwnListing(listing) }"
          @click="openListingModal(listing)"
        >
          <span v-if="isOwnListing(listing)" class="buy-card-badge">Tu oferta</span>
          <div class="buy-card-cards">
            <div
              v-for="card in (listing.cards || [])"
              :key="card.id"
              class="buy-card-thumb"
              :style="{ backgroundImage: cardImageSrc(card.image_url) ? `url(${cardImageSrc(card.image_url)})` : 'none' }"
            />
          </div>
          <div class="buy-card-info">
            <template v-if="listing.cards?.length">
              <p class="buy-card-name">{{ listing.cards[0].name || 'Carta' }}</p>
              <p v-if="listing.cards[0].rarity" class="buy-card-rarity">{{ listing.cards[0].rarity }}</p>
              <p v-if="listing.cards.length > 1" class="buy-card-more">y {{ listing.cards.length - 1 }} más</p>
            </template>
            <p class="buy-card-price">{{ Number(listing.starting_price).toFixed(2) }} €</p>
            <p class="buy-card-seller" v-if="listing.seller && !isOwnListing(listing)">Vendedor: {{ listing.seller.username || listing.seller.name }}</p>
            <p v-else-if="isOwnListing(listing)" class="buy-card-own-hint">Gestiona contraofertas en <RouterLink to="/listings" class="buy-card-own-link" @click.stop>Anuncios de venta</RouterLink>.</p>
            <div v-if="!isOwnListing(listing)" class="buy-card-actions" @click.stop>
              <button
                type="button"
                class="buy-btn buy-btn--accept"
                :disabled="acceptLoadingId === listing.id"
                @click.stop="acceptListing(listing)"
              >
                {{ acceptLoadingId === listing.id ? 'Procesando...' : 'Aceptar oferta' }}
              </button>
              <button
                type="button"
                class="buy-btn buy-btn--counter"
                @click.stop="openCounterOffer(listing)"
              >
                Hacer contraoferta
              </button>
            </div>
            <div v-if="!isOwnListing(listing) && counterOfferListingId === listing.id" class="buy-counter-form" @click.stop>
              <label for="counter-amount">Tu oferta (€)</label>
              <input
                id="counter-amount"
                v-model="counterAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
              <p v-if="counterError" class="buy-counter-error">{{ counterError }}</p>
              <div class="buy-counter-btns">
                <button type="button" class="buy-btn buy-btn--secondary" @click.stop="closeCounterOffer">Cancelar</button>
                <button
                  type="button"
                  class="buy-btn buy-btn--counter"
                  :disabled="bidLoadingId === listing.id"
                  @click.stop="submitCounterOffer(listing)"
                >
                  {{ bidLoadingId === listing.id ? 'Enviando...' : 'Enviar contraoferta' }}
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="selectedListing"
          class="buy-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-modal-title"
          @click.self="closeListingModal"
        >
          <div
            class="buy-modal-content card-modal-content"
            :style="selectedListing.cards?.length ? rarityModalStyle(selectedListing.cards[0].rarity) : {}"
          >
            <HoloModalLowPolyBg v-if="selectedListing.cards?.length && isHoloRareV(selectedListing.cards[0].rarity)" />
            <button type="button" class="card-modal-close" aria-label="Cerrar" @click="closeListingModal" />
            <div class="buy-modal-body card-modal-body">
              <div
                v-if="selectedListing.cards?.length"
                class="buy-modal-image card-modal-image"
                :style="{ backgroundImage: cardImageSrc(selectedListing.cards[0].image_url) ? `url(${cardImageSrc(selectedListing.cards[0].image_url)})` : 'none' }"
              />
              <div class="buy-modal-info">
                <h2 id="buy-modal-title" class="card-modal-name">
                  {{ selectedListing.cards?.length ? selectedListing.cards[0].name : 'Carta' }}
                </h2>
                <template v-if="selectedListing.cards?.length">
                  <dl class="card-modal-details">
                    <template v-if="selectedListing.cards[0].rarity">
                      <dt>Rareza</dt>
                      <dd>{{ selectedListing.cards[0].rarity }}</dd>
                    </template>
                    <template v-if="selectedListing.cards[0].set_name">
                      <dt>Set</dt>
                      <dd>{{ selectedListing.cards[0].set_name }}</dd>
                    </template>
                    <template v-if="selectedListing.cards[0].category">
                      <dt>Categoría</dt>
                      <dd>{{ selectedListing.cards[0].category }}</dd>
                    </template>
                    <template v-if="selectedListing.cards[0].illustrator">
                      <dt>Ilustrador</dt>
                      <dd>{{ selectedListing.cards[0].illustrator }}</dd>
                    </template>
                    <dt>Precio</dt>
                    <dd>{{ Number(selectedListing.starting_price).toFixed(2) }} €</dd>
                    <template v-if="selectedListing.seller && !isOwnListing(selectedListing)">
                      <dt>Vendedor</dt>
                      <dd>{{ selectedListing.seller.username || selectedListing.seller.name }}</dd>
                    </template>
                  </dl>
                </template>
                <p v-else class="buy-modal-price">{{ Number(selectedListing.starting_price).toFixed(2) }} €</p>
                <p v-if="selectedListing.cards?.length > 1" class="buy-modal-extra">+ {{ selectedListing.cards.length - 1 }} carta(s) más en esta oferta</p>
                <template v-if="!isOwnListing(selectedListing)">
                  <div class="buy-modal-actions">
                    <button
                      type="button"
                      class="buy-btn buy-btn--accept"
                      :disabled="acceptLoadingId === selectedListing.id"
                      @click="acceptListing(selectedListing, closeListingModal)"
                    >
                      {{ acceptLoadingId === selectedListing.id ? 'Procesando...' : 'Aceptar oferta' }}
                    </button>
                    <button
                      type="button"
                      class="buy-btn buy-btn--counter"
                      @click="openCounterOffer(selectedListing)"
                    >
                      Hacer contraoferta
                    </button>
                  </div>
                  <div v-if="counterOfferListingId === selectedListing.id" class="buy-counter-form buy-modal-counter">
                    <label for="buy-modal-counter-amount">Tu oferta (€)</label>
                    <input
                      id="buy-modal-counter-amount"
                      v-model="counterAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                    />
                    <p v-if="counterError" class="buy-counter-error">{{ counterError }}</p>
                    <div class="buy-counter-btns">
                      <button type="button" class="buy-btn buy-btn--secondary" @click="closeCounterOffer">Cancelar</button>
                      <button
                        type="button"
                        class="buy-btn buy-btn--counter"
                        :disabled="bidLoadingId === selectedListing.id"
                        @click="submitCounterOffer(selectedListing, closeListingModal)"
                      >
                        {{ bidLoadingId === selectedListing.id ? 'Enviando...' : 'Enviar contraoferta' }}
                      </button>
                    </div>
                  </div>
                </template>
                <p v-else class="buy-card-own-hint">Gestiona contraofertas en <RouterLink to="/listings" @click="closeListingModal">Anuncios de venta</RouterLink>.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
