import { createRouter, createWebHashHistory } from 'vue-router'

const LOGIN_FLAG_KEY = 'isLoggedIn_v2'

export function isLoggedIn(): boolean {
  return localStorage.getItem(LOGIN_FLAG_KEY) === 'true'
}

export function login(username: string, password: string): boolean {
  if (username === 'admin' && password === '123456') {
    localStorage.setItem(LOGIN_FLAG_KEY, 'true')
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem(LOGIN_FLAG_KEY)
}

const router = createRouter({
  // hash 模式：任意静态托管无需配置重定向
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: '', redirect: '/overview' },
        { path: 'overview', name: 'overview', component: () => import('@/pages/OverviewPage.vue') },
        { path: 'recruitment', name: 'recruitment', component: () => import('@/pages/RecruitmentPage.vue') },
        { path: 'organization', name: 'organization', component: () => import('@/pages/OrganizationPage.vue') },
        { path: 'study', name: 'study', component: () => import('@/pages/StudyPage.vue') },
        { path: 'growth', name: 'growth', component: () => import('@/pages/GrowthPage.vue') },
        { path: 'todos', name: 'todos', component: () => import('@/pages/TodosPage.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/pages/SettingsPage.vue') },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/overview' },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public === true) {
    if (to.name === 'login' && isLoggedIn()) return { name: 'overview' }
    return true
  }
  if (!isLoggedIn()) return { name: 'login' }
  return true
})

export default router
