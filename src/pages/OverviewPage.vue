<script setup lang="ts">
import { computed } from 'vue'

import { useWorkspaceStore } from '@/stores/workspace'

const store = useWorkspaceStore()
const today = new Date().toISOString().slice(0, 10)

const kpis = computed(() => [
  { label: '招聘中岗位', value: store.state.jobs.filter((j) => j.status === '招聘中').length, icon: 'bi-briefcase', bg: 'var(--brand-50)', color: 'var(--brand-600)' },
  { label: '进行中候选人', value: store.state.candidates.filter((c) => c.status === '招聘中' || c.status === '待定').length, icon: 'bi-people', bg: '#e0f2fe', color: '#0284c7' },
  { label: '待进行面试', value: store.state.interviews.filter((i) => i.status === '待进行').length, icon: 'bi-calendar-check', bg: '#d1fae5', color: '#059669' },
  { label: '在册员工', value: store.state.employees.filter((e) => e.status !== '已离职').length, icon: 'bi-person-badge', bg: '#fef3c7', color: '#d97706' },
])

const todayTodos = computed(() => store.state.todos.filter((t) => !t.done && t.due <= today))
const overdueTodos = computed(() => store.state.todos.filter((t) => !t.done && t.due && t.due < today))
const pendingReviews = computed(() => store.state.reviews.filter((r) => !r.confirmed))

function toggleTodo(id: string) {
  const t = store.state.todos.find((t) => t.id === id)
  if (t) store.saveTodo({ ...t, done: !t.done })
}
</script>

<template>
  <div>
    <!-- KPI -->
    <div class="row g-3 mb-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-xl-3">
        <div class="card-soft kpi-tile d-flex align-items-center gap-3 h-100">
          <div class="stat-icon" :style="{ background: kpi.bg, color: kpi.color }"><i class="bi" :class="kpi.icon"></i></div>
          <div>
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value">{{ kpi.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- 今日待办 -->
      <div class="col-lg-6">
        <div class="card-soft p-3 h-100">
          <h6 class="section-title mb-3"><i class="bi bi-check2-square text-primary me-2"></i>今天要处理（{{ todayTodos.length }}）</h6>
          <div v-for="t in todayTodos" :key="t.id" class="d-flex align-items-start gap-2 mb-2">
            <input type="checkbox" class="form-check-input mt-1" :checked="t.done" @change="toggleTodo(t.id)" />
            <div>
              <div class="small fw-medium">{{ t.title }}</div>
              <div class="text-muted" style="font-size: 0.72rem">{{ t.due }}<span v-if="t.related"> · {{ t.related }}</span></div>
            </div>
          </div>
          <div v-if="!todayTodos.length" class="text-muted small py-3">今天没有到期的待办 🎉</div>

          <template v-if="overdueTodos.length">
            <hr class="my-2" />
            <div class="text-danger small fw-semibold mb-2"><i class="bi bi-exclamation-circle me-1"></i>已逾期（{{ overdueTodos.length }}）</div>
            <div v-for="t in overdueTodos" :key="t.id" class="d-flex align-items-start gap-2 mb-1">
              <input type="checkbox" class="form-check-input mt-1" :checked="t.done" @change="toggleTodo(t.id)" />
              <div class="small">{{ t.title }} <span class="text-muted" style="font-size: 0.72rem">（{{ t.due }}）</span></div>
            </div>
          </template>
        </div>
      </div>

      <!-- 盘点提醒 + 快捷入口 -->
      <div class="col-lg-6">
        <div class="card-soft p-3 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-clipboard-check text-primary me-2"></i>待确认的人才评估（{{ pendingReviews.length }}）</h6>
          <router-link
            v-for="rev in pendingReviews"
            :key="rev.id"
            to="/organization"
            class="d-flex justify-content-between align-items-center small mb-2 text-decoration-none"
          >
            <span>{{ store.employeeName(rev.employeeId) }} <span class="text-muted">· {{ store.cycleName(rev.cycleId) }}</span></span>
            <span class="badge rounded-pill bg-warning-subtle text-warning">{{ rev.evidence.filter((e) => e.content.trim()).length }} 条证据</span>
          </router-link>
          <div v-if="!pendingReviews.length" class="text-muted small">没有待确认的评估</div>
        </div>

        <div class="card-soft p-3">
          <h6 class="section-title mb-3"><i class="bi bi-lightning text-primary me-2"></i>快捷入口</h6>
          <div class="d-flex flex-wrap gap-2">
            <router-link to="/recruitment" class="btn btn-sm btn-outline-primary"><i class="bi bi-briefcase me-1"></i>去招聘</router-link>
            <router-link to="/organization" class="btn btn-sm btn-outline-primary"><i class="bi bi-diagram-3 me-1"></i>组织与人才</router-link>
            <router-link to="/study" class="btn btn-sm btn-outline-primary"><i class="bi bi-book me-1"></i>研习室</router-link>
            <router-link to="/growth" class="btn btn-sm btn-outline-primary"><i class="bi bi-heart me-1"></i>个人成长</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
