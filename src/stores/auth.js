import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? null)
  const user = ref(JSON.parse(localStorage.getItem('user') ?? 'null'))

  const isAuthenticated = computed(() => !!token.value)

  function setAuth (userData, tokenValue) {
    user.value = userData
    token.value = tokenValue
    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  function logout () {
    setAuth(null, null)
  }

  /**
   * Valida la sesión con el backend. Si el token es inválido (401), el interceptor
   * de la API limpia credenciales y redirige a /login.
   * Actualiza el usuario en el store si la respuesta es correcta.
   */
  async function validateSession () {
    if (!token.value) return
    try {
      const { data } = await api.get('/user')
      const userData = data?.data ?? data
      if (userData) {
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (_) {
      /* 401: el interceptor ya limpia token/user y redirige a login */
    }
  }

  return { token, user, isAuthenticated, setAuth, logout, validateSession }
})
