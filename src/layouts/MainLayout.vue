<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/overview', label: '总览', icon: 'bi-grid-1x2-fill' },
  { path: '/recruitment', label: '招聘', icon: 'bi-briefcase-fill' },
  { path: '/organization', label: '组织与人才', icon: 'bi-diagram-3-fill' },
  { path: '/study', label: '研习室', icon: 'bi-book-fill' },
  { path: '/growth', label: '个人成长', icon: 'bi-heart-fill' },
  { path: '/todos', label: '待办', icon: 'bi-check2-square' },
  { path: '/settings', label: '设置', icon: 'bi-gear-fill' },
]

const currentTitle = computed(() => navItems.find((n) => route.path.startsWith(n.path))?.label ?? '工作台')

function onLogout() {
  logout()
  router.replace('/login')
}
</script>

<template>
  <div class="app-shell">
    <!-- 侧边导航 -->
    <aside class="app-sidebar">
      <div class="sidebar-brand px-3 py-3 mb-2">
        <i class="bi bi-building-check me-2 brand-text"></i>
        <span class="fw-bold fs-5 brand-text">HR工作室</span>
        <div class="text-muted small ms-4 mt-1" style="font-size: 0.7rem">v2 · Vue 重建版</div>
      </div>

      <nav class="nav flex-column px-2">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="sidebar-link">
          <i class="bi me-2" :class="item.icon"></i>{{ item.label }}
        </router-link>
      </nav>

      <div class="sidebar-footer px-3 py-3">
        <div class="text-muted small mb-2"><i class="bi bi-person-circle me-1"></i>总管理员</div>
        <button class="btn btn-sm btn-outline-secondary w-100" @click="onLogout">
          <i class="bi bi-box-arrow-right me-1"></i>退出登录
        </button>
      </div>
    </aside>

    <!-- 主内容 -->
    <div class="app-main">
      <header class="app-topbar d-flex align-items-center justify-content-between px-4">
        <h6 class="mb-0 fw-semibold">{{ currentTitle }}</h6>
        <span class="badge rounded-pill bg-warning-subtle text-warning">
          <i class="bi bi-person-badge me-1"></i>演示模式（数据存本地）
        </span>
      </header>
      <main class="app-content px-4 py-4">
        <router-view />
      </main>
    </div>
  </div>
</template>
