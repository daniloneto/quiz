import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/exams' },
      {
        path: 'exams',
        component: () => import('pages/ExamsPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  { path: '/login', component: () => import('pages/LoginPage.vue') },
  { path: '/register', component: () => import('pages/RegisterPage.vue') },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
