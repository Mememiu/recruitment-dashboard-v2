<script setup lang="ts">
import { reactive, ref } from 'vue'

import HrModal from '@/components/HrModal.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type { AiProvider, ProviderType } from '@/types/hr'
import { JOB_PROFILE_ASSISTANT_PROMPT, PROVIDER_TYPES, newId } from '@/types/hr'

const store = useWorkspaceStore()

// ---------- AI 供应商 ----------

const modal = ref(false)
const revealed = ref<string | null>(null)
const form = reactive<AiProvider>({ id: '', name: '', type: 'openai-chat', apiKey: '', enabled: true })

function edit(p?: AiProvider) {
  Object.assign(form, p ?? { id: newId(), name: '', type: 'openai-chat' as ProviderType, apiKey: '', enabled: true })
  modal.value = true
}

function save() {
  if (!form.name.trim()) return alert('请填写供应商名称')
  if (!form.apiKey.trim()) return alert('请填写 API Key')
  store.saveProvider({ ...form })
  modal.value = false
}

function mask(key: string) {
  if (!key) return '—'
  return key.length <= 8 ? '••••••' : key.slice(0, 4) + '••••••' + key.slice(-4)
}

// ---------- 数据 ----------

function exportData() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `HR工作室数据备份_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function resetDemo() {
  if (confirm('重置为演示数据？当前所有数据将被覆盖。')) store.resetToDemo()
}

function clearAll() {
  if (confirm('⚠️ 清空全部业务数据？此操作不可恢复！（账号与登录状态不受影响）')) store.clearAll()
}
</script>

<template>
  <div class="row g-3">
    <!-- AI 供应商 -->
    <div class="col-lg-7">
      <div class="card-soft p-4 h-100">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="section-title mb-0"><i class="bi bi-cpu text-primary me-2"></i>AI 供应商</h6>
          <button class="btn btn-brand btn-sm" @click="edit()"><i class="bi bi-plus-lg me-1"></i>添加供应商</button>
        </div>

        <div v-if="store.state.providers.length">
          <div v-for="p in store.state.providers" :key="p.id" class="d-flex align-items-center gap-3 py-2 border-bottom">
            <div class="form-check form-switch">
              <input :checked="p.enabled" type="checkbox" class="form-check-input" @change="store.saveProvider({ ...p, enabled: !p.enabled })" />
            </div>
            <div class="flex-grow-1">
              <div class="fw-medium small">
                {{ p.name }}
                <span v-if="store.state.activeProviderId === p.id" class="badge bg-success-subtle text-success ms-1">当前</span>
              </div>
              <div class="text-muted" style="font-size: 0.75rem">
                {{ p.type }} · {{ revealed === p.id ? p.apiKey : mask(p.apiKey) }}
                <button class="btn btn-link btn-sm p-0 ms-1" style="font-size: 0.72rem" @click="revealed = revealed === p.id ? null : p.id">
                  {{ revealed === p.id ? '隐藏密钥' : '显示密钥' }}
                </button>
              </div>
            </div>
            <div class="text-nowrap">
              <button v-if="store.state.activeProviderId !== p.id" class="btn btn-sm btn-outline-success me-1" @click="store.state.activeProviderId = p.id">设为当前</button>
              <button class="btn btn-sm btn-outline-primary me-1" @click="edit(p)">编辑</button>
              <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removeProvider(p.id)"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
        </div>
        <div v-else class="text-muted small py-3">
          未配置供应商。部署版支持 openai-chat / openai-responses / gemini / deepseek；本重建版将配置保存在本地，
          接入真实调用需要后端服务（可在后续迭代加入）。
        </div>

        <div class="alert alert-light border small mt-3 mb-0">
          <div class="fw-semibold mb-1"><i class="bi bi-person-workspace me-1"></i>内置角色：岗位画像分析助手</div>
          <div class="text-muted" style="white-space: pre-wrap">{{ JOB_PROFILE_ASSISTANT_PROMPT }}</div>
        </div>
      </div>
    </div>

    <!-- 账号与数据 -->
    <div class="col-lg-5">
      <div class="card-soft p-4 mb-3">
        <h6 class="section-title mb-3"><i class="bi bi-person-circle text-primary me-2"></i>当前账号</h6>
        <div class="small">总管理员（演示模式）</div>
        <div class="text-muted" style="font-size: 0.78rem">登录：admin / 123456 · 多账号与角色体系待接入后端后启用</div>
      </div>

      <div class="card-soft p-4">
        <h6 class="section-title mb-3"><i class="bi bi-database text-primary me-2"></i>数据管理</h6>
        <div class="d-grid gap-2">
          <button class="btn btn-outline-primary btn-sm" @click="exportData"><i class="bi bi-download me-1"></i>导出全部数据（JSON）</button>
          <button class="btn btn-outline-secondary btn-sm" @click="resetDemo"><i class="bi bi-arrow-counterclockwise me-1"></i>重置为演示数据</button>
          <button class="btn btn-outline-danger btn-sm" @click="clearAll"><i class="bi bi-trash3 me-1"></i>清空全部业务数据</button>
        </div>
        <div class="text-muted mt-2" style="font-size: 0.75rem">
          数据存储在浏览器 localStorage（key: hr_workspace_v2）。部署版的数据在服务端，本重建版为纯前端形态。
        </div>
      </div>
    </div>

    <HrModal v-if="modal" title="AI 供应商" @close="modal = false">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label small fw-medium">名称 *</label><input v-model="form.name" class="form-control" placeholder="如：DeepSeek 生产" /></div>
        <div class="col-md-6">
          <label class="form-label small fw-medium">类型</label>
          <select v-model="form.type" class="form-select">
            <option v-for="t in PROVIDER_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="col-12"><label class="form-label small fw-medium">API Key *</label><input v-model="form.apiKey" type="password" class="form-control" placeholder="sk-..." autocomplete="off" /></div>
        <div class="col-12">
          <div class="form-check">
            <input v-model="form.enabled" type="checkbox" class="form-check-input" id="prov-enabled" />
            <label class="form-check-label small" for="prov-enabled">启用该供应商</label>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary btn-sm" @click="modal = false">取消</button>
        <button class="btn btn-brand btn-sm" @click="save">保存</button>
      </template>
    </HrModal>
  </div>
</template>
