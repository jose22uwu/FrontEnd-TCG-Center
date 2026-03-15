<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import '@/styles/views/AuthCommon.css'
import '@/styles/views/LoginView.css'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit () {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/login', { username: username.value, password: password.value })
    if (data.success && data.data?.token) {
      auth.setAuth(data.data.user, data.data.token)
      router.push('/')
    } else {
      error.value = data.message || 'Error al iniciar sesión'
    }
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page login-page">
    <h1 class="auth-site-title">Pokemon TCG Center</h1>
    <Transition name="auth" mode="out-in">
      <div key="card" class="auth-card">
        <header class="auth-header">
          <h2 class="auth-title">Iniciar sesión</h2>
          <p class="auth-subtitle">Accede a tu álbum de cartas</p>
        </header>
        <form class="auth-form" @submit.prevent="onSubmit">
          <div class="auth-field">
            <label for="username">Usuario</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              autocomplete="username"
              placeholder="Tu nombre de usuario"
            />
          </div>
          <div class="auth-field">
            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="Tu contraseña"
            />
          </div>
          <div class="auth-error-wrap">
            <Transition name="auth-error" mode="out-in">
              <p v-if="error" key="error" class="auth-error">{{ error }}</p>
            </Transition>
          </div>
          <button type="submit" class="auth-submit" :disabled="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <p class="auth-footer">
          <router-link to="/register" class="auth-link">Crear cuenta</router-link>
        </p>
      </div>
    </Transition>
  </div>
</template>
