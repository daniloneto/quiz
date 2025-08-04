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
      {
        path: 'exams/:id',
        component: () => import('pages/ExamDetailPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'quizzes/:examId/create',
        component: () => import('pages/QuizCreatePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'quizzes/:examId/:quizIndex',
        component: () => import('pages/QuizRunPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'questions/:examId/:quizIndex/add',
        component: () => import('pages/QuestionAddPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'quiz-results',
        component: () => import('pages/QuizResultsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'crawler',
        component: () => import('pages/CrawlerPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'upload',
        component: () => import('pages/UploadPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'backup',
        component: () => import('pages/BackupPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  { path: '/login', component: () => import('pages/LoginPage.vue') },
  { path: '/register', component: () => import('pages/RegisterPage.vue') },
  { path: '/auth/confirm-email', component: () => import('pages/ConfirmEmailPage.vue') },
  { path: '/auth/forgot-password', component: () => import('pages/ForgotPasswordPage.vue') },
  { path: '/auth/reset-password', component: () => import('pages/ResetPasswordPage.vue') },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
