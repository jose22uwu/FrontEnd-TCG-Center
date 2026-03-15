<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import '@/styles/views/AuthCommon.css'
import '@/styles/views/RegisterView.css'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit () {
  error.value = ''
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  try {
    const { data } = await api.post('/register', {
      username: username.value,
      name: name.value,
      email: email.value || undefined,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    if (data.success && data.data?.token) {
      auth.setAuth(data.data.user, data.data.token)
      router.push('/')
    } else {
      error.value = data.message || 'Error al registrarse'
    }
  } catch (e) {
    const msg = e.response?.data?.message
    const errs = e.response?.data?.errors
    error.value = msg || (errs ? Object.values(errs).flat().join(' ') : 'Error de conexión')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page register-page">
    <h1 class="auth-site-title">Pokemon TCG Center</h1>
    <Transition name="auth" mode="out-in">
      <div key="card" class="auth-card">
        <header class="auth-header">
          <h2 class="auth-title">Registro</h2>
          <p class="auth-subtitle">Crea tu cuenta y empieza a coleccionar</p>
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
              placeholder="Nombre de usuario"
            />
          </div>
          <div class="auth-field">
            <label for="name">Nombre</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              autocomplete="name"
              placeholder="Tu nombre"
            />
          </div>
          <div class="auth-field">
            <label for="email">Email (opcional)</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div class="auth-field">
            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div class="auth-field">
            <label for="password_confirmation">Confirmar contraseña</label>
            <input
              id="password_confirmation"
              v-model="passwordConfirmation"
              type="password"
              required
              autocomplete="new-password"
              placeholder="Repite la contraseña"
            />
          </div>
          <div class="auth-error-wrap">
            <Transition name="auth-error" mode="out-in">
              <p v-if="error" key="error" class="auth-error">{{ error }}</p>
            </Transition>
          </div>
          <button type="submit" class="auth-submit" :disabled="loading">
            {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
          </button>
        </form>
        <p class="auth-footer">
          <router-link to="/login" class="auth-link">Ya tengo cuenta</router-link>
        </p>
      </div>
    </Transition>
  </div>
</template>
