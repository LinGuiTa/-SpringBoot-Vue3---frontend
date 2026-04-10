import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  { path: '/', component: () => import('@/views/home/HomeView.vue') },
  { path: '/login', component: () => import('@/views/user/LoginView.vue') },
  { path: '/register', component: () => import('@/views/user/RegisterView.vue') },
  { path: '/profile', component: () => import('@/views/user/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/product/:id', component: () => import('@/views/product/ProductDetailView.vue') },
  { path: '/search', component: () => import('@/views/search/SearchView.vue') },
  { path: '/favorites', component: () => import('@/views/favorite/FavoriteView.vue'), meta: { requiresAuth: true } },
  { path: '/alerts', component: () => import('@/views/alert/AlertView.vue'), meta: { requiresAuth: true } },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'users', component: () => import('@/views/admin/UsersView.vue') },
      { path: 'products', component: () => import('@/views/admin/ProductsView.vue') },
      { path: 'prices', component: () => import('@/views/admin/PricesView.vue') },
      { path: 'config', component: () => import('@/views/admin/ConfigView.vue') }
    ]
  },
  { path: '/403', component: () => import('@/views/error/ForbiddenView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/403')
  } else {
    next()
  }
})

export default router
