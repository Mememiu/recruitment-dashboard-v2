<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import EmptyState from '@/components/EmptyState.vue'
import HrModal from '@/components/HrModal.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type { TrainingDoc } from '@/types/hr'
import { DOC_CATEGORIES, newId } from '@/types/hr'

const store = useWorkspaceStore()
const category = ref<string>('全部')

const filtered = computed(() =>
  category.value === '全部' ? store.state.documents : store.state.documents.filter((d) => d.category === category.value),
)

const grouped = computed(() => {
  const map = new Map<string, TrainingDoc[]>()
  for (const doc of filtered.value) {
    const list = map.get(doc.category) ?? []
    list.push(doc)
    map.set(doc.category, list)
  }
  return [...map.entries()]
})

const modal = ref(false)
const form = reactive<TrainingDoc>({ id: '', title: '', url: '', summary: '', category: '通用资料' })

function edit(doc?: TrainingDoc) {
  Object.assign(form, doc ?? { id: newId(), title: '', url: '', summary: '', category: '通用资料' })
  modal.value = true
}

function save() {
  if (!form.title.trim()) return alert('请填写资料标题')
  store.saveDocument({ ...form })
  modal.value = false
}
</script>

<template>
  <div>
    <div class="page-toolbar">
      <div class="d-flex gap-1 flex-wrap">
        <button
          v-for="c in ['全部', ...DOC_CATEGORIES]"
          :key="c"
          class="btn btn-sm rounded-pill"
          :class="category === c ? 'btn-brand' : 'btn-outline-secondary'"
          @click="category = c"
        >{{ c }}</button>
      </div>
      <button class="btn btn-brand btn-sm" @click="edit()"><i class="bi bi-plus-lg me-1"></i>添加资料</button>
    </div>

    <template v-if="grouped.length">
      <div v-for="[cat, docs] in grouped" :key="cat" class="mb-4">
        <h6 class="section-title mb-2"><i class="bi bi-folder2-open text-primary me-2"></i>{{ cat }}</h6>
        <div class="row g-3">
          <div v-for="doc in docs" :key="doc.id" class="col-md-6 col-xl-4">
            <div class="card-soft p-3 h-100 doc-card">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <a v-if="doc.url" :href="doc.url" target="_blank" class="fw-semibold text-decoration-none">{{ doc.title }} <i class="bi bi-box-arrow-up-right small"></i></a>
                <span v-else class="fw-semibold">{{ doc.title }}</span>
                <div class="text-nowrap">
                  <button class="btn btn-sm btn-link p-0 me-2" title="编辑" @click="edit(doc)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-link text-danger p-0" title="删除" @click="store.removeDocument(doc.id)"><i class="bi bi-trash3"></i></button>
                </div>
              </div>
              <div class="text-muted small">{{ doc.summary || '一句话概括：未填写' }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="card-soft"><EmptyState text="研习室还没有资料，点击右上角添加" icon="bi-book" /></div>

    <HrModal v-if="modal" title="学习资料" @close="modal = false">
      <div class="row g-3">
        <div class="col-12"><label class="form-label small fw-medium">标题 *</label><input v-model="form.title" class="form-control" /></div>
        <div class="col-12"><label class="form-label small fw-medium">学习资料链接</label><input v-model="form.url" class="form-control" placeholder="https://" /></div>
        <div class="col-md-6">
          <label class="form-label small fw-medium">分类</label>
          <select v-model="form.category" class="form-select">
            <option v-for="c in DOC_CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="col-12"><label class="form-label small fw-medium">一句话概括</label><input v-model="form.summary" class="form-control" placeholder="一句话概括这份资料" /></div>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary btn-sm" @click="modal = false">取消</button>
        <button class="btn btn-brand btn-sm" @click="save">保存</button>
      </template>
    </HrModal>
  </div>
</template>
