<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/router'

const router = useRouter()

const username = ref('admin')
const password = ref('')
const error = ref('')

function onSubmit() {
  if (login(username.value.trim(), password.value)) {
    router.replace('/dashboard')
  } else {
    error.value = '用户名或密码错误'
  }
}
</script>

<template>
  <div class="login-hero">
    <div class="card-soft login-card">
      <div class="text-center mb-4">
        <div
          class="stat-icon mx-auto mb-3"
          style="width: 52px; height: 52px; font-size: 1.5rem; background: var(--brand-50); color: var(--brand-600)"
        >
          <i class="bi bi-bar-chart-line-fill"></i>
        </div>
        <h4 class="fw-bold mb-1">招聘看板 <span class="brand-text">v2</span></h4>
        <p class="text-muted small mb-0">Vue 3 + TypeScript 技术栈重构版</p>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label class="form-label small fw-medium">用户名</label>
          <input v-model="username" type="text" class="form-control" placeholder="用户名" autocomplete="username" />
        </div>
        <div class="mb-3">
          <label class="form-label small fw-medium">密码</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="密码"
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="alert alert-danger py-2 small mb-3" role="alert">
          <i class="bi bi-exclamation-circle me-1"></i>{{ error }}
        </div>

        <button type="submit" class="btn btn-brand w-100 py-2 fw-medium">登 录</button>
      </form>

      <div class="text-center text-muted small mt-3">演示账号：admin / 123456</div>
    </div>
  </div>
</template>
