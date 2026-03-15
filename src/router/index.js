import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Iniciar sesión', guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: 'Registro', guest: true }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { title: 'Inicio' },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'Inicio', auth: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: 'Mi perfil', auth: true }
        },
        {
          path: 'buy',
          name: 'buy',
          component: () => import('@/views/BuyView.vue'),
          meta: { title: 'Comprar cartas', auth: true }
        },
        {
          path: 'sell',
          name: 'sell',
          component: () => import('@/views/SellView.vue'),
          meta: { title: 'Vender cartas', auth: true }
        },
        {
          path: 'listings',
          name: 'listings',
          component: () => import('@/views/MyListingsView.vue'),
          meta: { title: 'Anuncios de venta', auth: true }
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} | Pokemon TCG Center`
  }
  const auth = useAuthStore()
  if (to.meta?.auth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  if (to.meta?.guest && auth.isAuthenticated) {
    next({ name: 'home' })
    return
  }
  next()
})

export default router
