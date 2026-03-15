<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { cardImageSrc } from '@/utils/cardImage'
import { normalizeApiList } from '@/utils/apiResponse'
import '@/styles/views/MyListingsView.css'

const LISTING_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'closed', label: 'Cerradas' },
  { value: 'counteroffers', label: 'Con contraofertas' }
]

const listings = ref([])
const loading = ref(true)
const error = ref('')
const actionLoading = ref({ bidId: null, action: null })
const cancelLoadingId = ref(null)
const listingFilter = ref('')

function pendingBids (listing) {
  return (listing.bids || []).filter((b) => b.status === 'pending')
}

function buildListingsParams () {
  const params = { per_page: 50 }
  if (listingFilter.value === 'counteroffers') {
    params.has_pending_bids = 1
  } else if (listingFilter.value === 'active' || listingFilter.value === 'closed') {
    params.status = listingFilter.value === 'closed' ? 'closed,cancelled' : 'active'
  }
  return params
}

async function loadListings () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/user/listings', { params: buildListingsParams() })
    listings.value = normalizeApiList(data)
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudieron cargar tus anuncios.'
  } finally {
    loading.value = false
  }
}

function setFilter (value) {
  listingFilter.value = value
  loadListings()
}

async function respondBid (listing, bid, accept) {
  actionLoading.value = { bidId: bid.id, action: accept ? 'accept' : 'decline' }
  try {
    await api.patch(`/listings/${listing.id}/bids/${bid.id}`, { action: accept ? 'accept' : 'decline' })
    await loadListings()
  } catch (e) {
    error.value = e.response?.data?.message || (accept ? 'No se pudo aceptar.' : 'No se pudo declinar.')
  } finally {
    actionLoading.value = { bidId: null, action: null }
  }
}

async function cancelListing (listing) {
  cancelLoadingId.value = listing.id
  try {
    await api.delete(`/listings/${listing.id}`)
    await loadListings()
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo cancelar el anuncio.'
  } finally {
    cancelLoadingId.value = null
  }
}

onMounted(loadListings)
</script>

<template>
  <div class="my-listings-page">
    <h1 class="my-listings-title">Anuncios de venta</h1>
    <p class="my-listings-intro">Tus ofertas y las contraofertas que has recibido. Acepta o declina para que el comprador pueda ofertar de nuevo.</p>

    <div class="my-listings-filters">
      <button
        v-for="opt in LISTING_FILTERS"
        :key="opt.value || 'all'"
        type="button"
        class="my-listings-filter-btn"
        :class="{ 'my-listings-filter-btn--active': listingFilter === opt.value }"
        @click="setFilter(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <template v-if="loading">
      <p class="my-listings-message">Cargando anuncios...</p>
    </template>
    <template v-else-if="error">
      <p class="my-listings-error">{{ error }}</p>
    </template>
    <template v-else-if="listings.length === 0">
      <p class="my-listings-message">Aún no tienes anuncios. Publica una oferta desde Vender cartas.</p>
    </template>
    <template v-else>
      <ul class="my-listings-list">
        <li v-for="listing in listings" :key="listing.id" class="my-listings-card">
          <div class="my-listings-card-cards">
            <div
              v-for="card in (listing.cards || [])"
              :key="card.id"
              class="my-listings-thumb"
              :style="{ backgroundImage: cardImageSrc(card.image_url) ? `url(${cardImageSrc(card.image_url)})` : 'none' }"
            />
          </div>
          <div class="my-listings-card-info">
            <p class="my-listings-price">{{ Number(listing.starting_price).toFixed(2) }} €</p>
            <p class="my-listings-status" :class="{ 'my-listings-status--closed': listing.status !== 'active' }">
              {{ listing.status === 'active' ? 'Activa' : 'Cerrada' }}
            </p>

            <div v-if="listing.status === 'active'" class="my-listings-cancel-wrap">
              <button
                type="button"
                class="my-listings-btn my-listings-btn--cancel"
                :disabled="cancelLoadingId === listing.id"
                @click="cancelListing(listing)"
              >
                {{ cancelLoadingId === listing.id ? 'Cancelando...' : 'Cancelar venta' }}
              </button>
            </div>

            <template v-if="listing.status === 'active' && pendingBids(listing).length > 0">
              <p class="my-listings-counter-title">Contraofertas pendientes</p>
              <ul class="my-listings-bids">
                <li v-for="bid in pendingBids(listing)" :key="bid.id" class="my-listings-bid">
                  <span class="my-listings-bid-user">{{ bid.user?.username || bid.user?.name || 'Usuario' }}</span>
                  <span class="my-listings-bid-amount">{{ Number(bid.amount).toFixed(2) }} €</span>
                  <div class="my-listings-bid-actions">
                    <button
                      type="button"
                      class="my-listings-btn my-listings-btn--accept"
                      :disabled="actionLoading.bidId === bid.id"
                      @click="respondBid(listing, bid, true)"
                    >
                      {{ actionLoading.bidId === bid.id && actionLoading.action === 'accept' ? '...' : 'Aceptar' }}
                    </button>
                    <button
                      type="button"
                      class="my-listings-btn my-listings-btn--decline"
                      :disabled="actionLoading.bidId === bid.id"
                      @click="respondBid(listing, bid, false)"
                    >
                      {{ actionLoading.bidId === bid.id && actionLoading.action === 'decline' ? '...' : 'Declinar' }}
                    </button>
                  </div>
                </li>
              </ul>
            </template>
            <p v-else-if="listing.status === 'active'" class="my-listings-no-bids">Sin contraofertas por ahora.</p>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>
