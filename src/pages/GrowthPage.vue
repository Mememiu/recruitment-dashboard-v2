<script setup lang="ts">
import { reactive, ref } from 'vue'

import EmptyState from '@/components/EmptyState.vue'
import HrModal from '@/components/HrModal.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type { GrowthFavorite } from '@/types/hr'
import { newId } from '@/types/hr'

const store = useWorkspaceStore()

const modal = ref(false)
const form = reactive<GrowthFavorite>({ id: '', title: '', url: '', note: '' })

function edit(f?: GrowthFavorite) {
  Object.assign(form, f ?? { id: newId(), title: '', url: '', note: '' })
  modal.value = true
}

function save() {
  if (!form.title.trim()) return alert('请填写标题')
  store.saveFavorite({ ...form })
  modal.value = false
}
</script>

<template>
  <div>
    <div class="page-toolbar">
      <div class="text-muted small">收藏的职业成长推荐与资料</div>
      <button class="btn btn-brand btn-sm" @click="edit()"><i class="bi bi-plus-lg me-1"></i>添加收藏</button>
    </div>

    <div v-if="store.state.favorites.length" class="row g-3">
      <div v-for="fav in store.state.favorites" :key="fav.id" class="col-md-6 col-xl-4">
        <div class="card-soft p-3 h-100 doc-card">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <a v-if="fav.url" :href="fav.url" target="_blank" class="fw-semibold text-decoration-none"><i class="bi bi-heart-fill text-danger me-1"></i>{{ fav.title }}</a>
            <span v-else class="fw-semibold"><i class="bi bi-heart-fill text-danger me-1"></i>{{ fav.title }}</span>
            <div class="text-nowrap">
              <button class="btn btn-sm btn-link p-0 me-2" @click="edit(fav)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-link text-danger p-0" @click="store.removeFavorite(fav.id)"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="text-muted small">{{ fav.note || '未填写备注' }}</div>
        </div>
      </div>
    </div>
    <div v-else class="card-soft"><EmptyState text="还没有收藏，遇到好内容点右上角添加" icon="bi-heart" /></div>

    <HrModal v-if="modal" title="成长收藏" @close="modal = false">
      <div class="row g-3">
        <div class="col-12"><label class="form-label small fw-medium">标题 *</label><input v-model="form.title" class="form-control" /></div>
        <div class="col-12"><label class="form-label small fw-medium">链接</label><input v-model="form.url" class="form-control" placeholder="https://" /></div>
        <div class="col-12"><label class="form-label small fw-medium">备注</label><textarea v-model="form.note" class="form-control" rows="2"></textarea></div>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary btn-sm" @click="modal = false">取消</button>
        <button class="btn btn-brand btn-sm" @click="save">保存</button>
      </template>
    </HrModal>
  </div>
</template>
