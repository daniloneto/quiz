import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/auth/Login.vue'), meta: { public: true } },
  { path: '/register', component: () => import('../views/auth/Register.vue'), meta: { public: true } },
  { path: '/forgot', component: () => import('../views/auth/ForgotPassword.vue'), meta: { public: true } },
  { path: '/reset', component: () => import('../views/auth/ResetPassword.vue'), meta: { public: true } },
  { path: '/confirm', component: () => import('../views/auth/ConfirmEmail.vue'), meta: { public: true } },

  { path: '/dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/profile', component: () => import('../views/Profile.vue') },
  { path: '/results', component: () => import('../views/Results.vue') },

  { path: '/exams', component: () => import('../views/exams/ExamsList.vue') },
  { path: '/exams/:id', component: () => import('../views/exams/ExamDetail.vue') },
  { path: '/exams/:id/quiz/:index', component: () => import('../views/exams/PlayQuiz.vue') },

  { path: '/upload', component: () => import('../views/tools/Upload.vue') },
  { path: '/crawler', component: () => import('../views/tools/Crawler.vue') },
  { path: '/backup', component: () => import('../views/tools/Backup.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router

