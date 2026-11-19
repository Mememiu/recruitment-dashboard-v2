<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import EmptyState from '@/components/EmptyState.vue'
import HrModal from '@/components/HrModal.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type { Todo } from '@/types/hr'
import { newId } from '@/types/hr'

const store = useWorkspaceStore()
const today = new Date().toISOString().slice(0, 10)
const filter = ref<'today' | 'open' | 'done' | 'overdue'>('open')

const filtered = computed(() => {
  const all = store.state.todos
  switch (filter.value) {
    case 'today': return all.filter((t) => !t.done && t.due === today)
    case 'open': return all.filter((t) => !t.done)
    case 'done': return all.filter((t) => t.done)
    case 'overdue': return all.filter((t) => !t.done && t.due && t.due < today)
  }
})

const counts = computed(() => ({
  today: store.state.todos.filter((t) => !t.done && t.due === today).length,
  open: store.state.todos.filter((t) => !t.done).length,
  done: store.state.todos.filter((t) => t.done).length,
  overdue: store.state.todos.filter((t) => !t.done && t.due && t.due < today).length,
}))

const modal = ref(false)
const form = reactive<Todo>({ id: '', title: '', due: '', done: false, related: '', note: '' })

function edit(t?: Todo) {
  Object.assign(form, t ?? { id: newId(), title: '', due: today, done: false, related: '', note: '' })
  modal.value = true
}

function save() {
  if (!form.title.trim()) return alert('请填写待办标题')
  store.saveTodo({ ...form })
  modal.value = false
}

function toggle(t: Todo) {
  store.saveTodo({ ...t, done: !t.done })
}
</script>

<template>
  <div>
    <div class="module-tabs">
      <button v-for="f in ([['today', '今天'], ['open', '待进行'], ['done', '已完成'], ['overdue', '已逾期']] as const)"
        :key="f[0]" class="module-tab" :class="{ active: filter === f[0] }" @click="filter = f[0]">
        {{ f[1] }} <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ counts[f[0]] }}</span>
      </button>
    </div>

    <div class="page-toolbar">
      <div class="text-muted small">任务可关联到具体对象（候选人 / 评估 / 周期等）</div>
      <button class="btn btn-brand btn-sm" @click="edit()"><i class="bi bi-plus-lg me-1"></i>新增待办</button>
    </div>

    <div class="card-soft p-3">
      <div v-for="t in filtered" :key="t.id" class="d-flex align-items-start gap-3 py-2 border-bottom">
        <input type="checkbox" class="form-check-input mt-1" :checked="t.done" @change="toggle(t)" />
        <div class="flex-grow-1">
          <div class="fw-medium" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.title }}</div>
          <div class="text-muted small">
            <span v-if="t.due" :class="{ 'text-danger fw-semibold': !t.done && t.due < today }"><i class="bi bi-calendar3 me-1"></i>{{ t.due }}</span>
            <span v-if="t.related" class="ms-2"><i class="bi bi-link-45deg me-1"></i>{{ t.related }}</span>
          </div>
          <div v-if="t.note" class="small text-muted mt-1">{{ t.note }}</div>
        </div>
        <div class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" @click="edit(t)">编辑</button>
          <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removeTodo(t.id)"><i class="bi bi-trash3"></i></button>
        </div>
      </div>
      <EmptyState v-if="!filtered.length" text="这个分组下没有待办" icon="bi-check2-circle" />
    </div>

    <HrModal v-if="modal" title="待办" @close="modal = false">
      <div class="row g-3">
        <div class="col-12"><label class="form-label small fw-medium">标题 *</label><input v-model="form.title" class="form-control" /></div>
        <div class="col-md-4"><label class="form-label small fw-medium">截止日期</label><input v-model="form.due" type="date" class="form-control" /></div>
        <div class="col-md-8"><label class="form-label small fw-medium">关联对象</label><input v-model="form.related" class="form-control" placeholder="如：候选人 周明 / 评估 刘思远" /></div>
        <div class="col-12"><label class="form-label small fw-medium">备注</label><textarea v-model="form.note" class="form-control" rows="2"></textarea></div>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary btn-sm" @click="modal = false">取消</button>
        <button class="btn btn-brand btn-sm" @click="save">保存</button>
      </template>
    </HrModal>
  </div>
</template>
