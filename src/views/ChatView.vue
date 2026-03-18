<script setup>
import { ref, nextTick, TransitionGroup } from 'vue'
import { api } from '@/services/api'
import { cardImageSrc } from '@/utils/cardImage'
import CardThumb from '@/components/CardThumb.vue'
import '@/styles/views/ChatView.css'

const inputQuestion = ref('')
const sending = ref(false)
const error = ref('')
const messages = ref([])

function addMessage (role, content, payload = null) {
  messages.value.push({
    id: Date.now() + Math.random(),
    role,
    content,
    payload: payload || null
  })
}

function scrollToBottom () {
  nextTick(() => {
    const el = document.querySelector('.chat-messages')
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function sendQuestion () {
  const question = (inputQuestion.value || '').trim()
  if (!question || sending.value) return
  inputQuestion.value = ''
  error.value = ''
  addMessage('user', question)
  scrollToBottom()
  sending.value = true
  try {
    const { data } = await api.post('/ai/chat', { question })
    const payload = data?.data ?? data
    const err = payload?.error
    if (err) {
      addMessage('assistant', err, { error: true })
    } else {
      addMessage('assistant', null, payload)
    }
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.error || 'No se pudo conectar con el asistente.'
    const detail = e.response?.data?.errors?.error
    const fullMsg = detail ? `${msg}\n\n${detail}` : msg
    addMessage('assistant', fullMsg, { error: true })
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

function cardImage (card) {
  const url = card?.image_url || card?.image || (card?.variants?.normal?.small ? card.variants.normal.small : null)
  return cardImageSrc(url)
}
</script>

<template>
  <div class="chat-page profile-page" :class="{ 'chat-page--empty': messages.length === 0 }">
    <div class="profile-header">
      <h1 class="profile-title">Asistente</h1>
      <p class="chat-help-hint">Escribe <kbd>?</kbd> o <kbd>ayuda</kbd> para averiguar qué puedes hacer con el asistente de AI.</p>
    </div>

    <div class="chat-panel">
      <div class="chat-messages" role="log" aria-live="polite">
        <TransitionGroup name="chat-bubble" tag="div" class="chat-messages-inner">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-bubble"
            :class="[
              msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant',
              { 'chat-bubble--error': msg.payload?.error }
            ]"
          >
            <template v-if="msg.role === 'user'">
              <p class="chat-bubble-text">{{ msg.content }}</p>
            </template>
            <template v-else-if="msg.content">
              <p class="chat-bubble-text">{{ msg.content }}</p>
            </template>
            <template v-else-if="msg.payload && !msg.payload.error">
              <p v-if="msg.payload.helpMessage" class="chat-block chat-block--help">{{ msg.payload.helpMessage }}</p>
              <p v-if="msg.payload.unrecognizedHint" class="chat-block chat-block--hint">{{ msg.payload.unrecognizedHint }}</p>
              <p v-if="msg.payload.conclusion" class="chat-block chat-block--conclusion">{{ msg.payload.conclusion }}</p>
              <ul v-if="msg.payload.rules?.length" class="chat-list">
                <li v-for="(r, i) in msg.payload.rules" :key="i">{{ r }}</li>
              </ul>
              <ul v-if="msg.payload.scenarioConclusions?.length" class="chat-list">
                <li v-for="(s, i) in msg.payload.scenarioConclusions" :key="'s' + i">{{ s }}</li>
              </ul>
              <ul v-if="msg.payload.recommendations?.length" class="chat-list">
                <li v-for="(rec, i) in msg.payload.recommendations" :key="'r' + i">{{ rec }}</li>
              </ul>
              <div v-if="msg.payload.relevantCards?.length" class="chat-cards">
                <p class="chat-cards-title">Cartas relevantes</p>
                <div class="chat-cards-grid">
                  <div v-for="c in msg.payload.relevantCards" :key="c.id" class="chat-card">
                    <CardThumb
                      v-if="cardImage(c)"
                      :src="cardImage(c)"
                      :alt="c.name"
                    />
                    <div class="chat-card-info">
                      <span class="chat-card-name">{{ c.name }}</span>
                      <span class="chat-card-meta">{{ c.rarity }}{{ (c.set_name || c.setIdentifier) ? ' · ' + (c.set_name || c.setIdentifier) : '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="msg.payload.similarCards?.length" class="chat-cards">
                <p class="chat-cards-title">Cartas similares</p>
                <div class="chat-cards-grid">
                  <div v-for="c in msg.payload.similarCards" :key="c.id" class="chat-card">
                    <CardThumb
                      v-if="cardImage(c)"
                      :src="cardImage(c)"
                      :alt="c.name"
                    />
                    <div class="chat-card-info">
                      <span class="chat-card-name">{{ c.name }}</span>
                      <span class="chat-card-meta">{{ c.rarity }}{{ c.setIdentifier ? ' · ' + c.setIdentifier : '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="msg.payload.recommendedCatalogCards?.length" class="chat-cards">
                <p class="chat-cards-title">Recomendadas para tu colección</p>
                <div class="chat-cards-grid">
                  <div v-for="c in msg.payload.recommendedCatalogCards" :key="c.id" class="chat-card">
                    <CardThumb
                      v-if="cardImage(c)"
                      :src="cardImage(c)"
                      :alt="c.name"
                    />
                    <div class="chat-card-info">
                      <span class="chat-card-name">{{ c.name }}</span>
                      <span class="chat-card-meta">{{ c.rarity }}{{ c.setIdentifier ? ' · ' + c.setIdentifier : '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </TransitionGroup>
      </div>
      <form class="chat-form" @submit.prevent="sendQuestion">
        <input
          v-model="inputQuestion"
          type="text"
          class="chat-input"
          placeholder="Escribe tu pregunta..."
          maxlength="2000"
          :disabled="sending"
          aria-label="Pregunta para el asistente"
        />
        <button type="submit" class="chat-send" :disabled="sending || !inputQuestion?.trim()" aria-label="Enviar">
          {{ sending ? '...' : 'Enviar' }}
        </button>
      </form>
    </div>
    <p v-if="error" class="chat-error">{{ error }}</p>
  </div>
</template>
