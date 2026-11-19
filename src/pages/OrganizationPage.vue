<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import EmptyState from '@/components/EmptyState.vue'
import HrModal from '@/components/HrModal.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type {
  DevPlan,
  Department,
  Employee,
  EmployeeStatus,
  EvidenceItem,
  OrgPosition,
  Readiness,
  Review,
  ReviewCycle,
  Willingness,
} from '@/types/hr'
import {
  CYCLE_STATUSES,
  EMPLOYEE_STATUSES,
  EMPLOYEE_STATUS_BADGE,
  newId,
} from '@/types/hr'

const store = useWorkspaceStore()
const tab = ref<'org' | 'employees' | 'review' | 'plans'>('org')

// ---------- 部门 ----------

const depModal = ref(false)
const depForm = reactive<Department>({ id: '', name: '', nameEn: '', duty: '', manager: '' })

function editDepartment(d?: Department) {
  Object.assign(depForm, d ?? { id: newId(), name: '', nameEn: '', duty: '', manager: '' })
  depModal.value = true
}

function saveDepartment() {
  if (!depForm.name.trim()) return alert('请填写部门名称')
  store.saveDepartment({ ...depForm })
  depModal.value = false
}

// ---------- 岗位 ----------

const posModal = ref(false)
const posForm = reactive<OrgPosition>({ id: '', name: '', alias: '', family: '', headcount: 1, departmentId: '' })

function editPosition(p?: OrgPosition) {
  Object.assign(posForm, p ?? {
    id: newId(), name: '', alias: '', family: '', headcount: 1,
    departmentId: store.state.departments[0]?.id ?? '',
  })
  posModal.value = true
}

function savePosition() {
  if (!posForm.name.trim()) return alert('请填写岗位名称')
  if (!posForm.departmentId) return alert('请选择所属部门')
  store.savePosition({ ...posForm })
  posModal.value = false
}

const depEmployeeCount = (depId: string) => store.state.employees.filter((e) => e.departmentId === depId).length
const depPositionCount = (depId: string) => store.state.positions.filter((p) => p.departmentId === depId).length

function confirmRemoveDepartment(dep: Department) {
  if (window.confirm('确认删除部门？其下岗位也会删除')) store.removeDepartment(dep.id)
}

// ---------- 员工 ----------

const empModal = ref(false)
const empForm = reactive<Employee>({
  id: '', name: '', departmentId: '', positionId: '', status: '在岗', performance: '', willingness: '', joinDate: '', location: '',
})

function editEmployee(e?: Employee) {
  Object.assign(empForm, e ?? {
    id: newId(), name: '', departmentId: store.state.departments[0]?.id ?? '', positionId: '',
    status: '在岗' as EmployeeStatus, performance: '', willingness: '', joinDate: '', location: '',
  })
  empModal.value = true
}

function saveEmployee() {
  if (!empForm.name.trim()) return alert('请填写员工姓名')
  if (!empForm.departmentId) return alert('请选择所属部门')
  store.saveEmployee({ ...empForm })
  empModal.value = false
}

const positionsOfDept = (depId: string) => store.state.positions.filter((p) => p.departmentId === depId)

// ---------- 盘点周期 ----------

const cycModal = ref(false)
const cycForm = reactive<ReviewCycle>({ id: '', name: '', deadline: '', status: '待进行' })

function editCycle(c?: ReviewCycle) {
  Object.assign(cycForm, c ?? { id: newId(), name: '', deadline: '', status: '待进行' })
  cycModal.value = true
}

function saveCycle() {
  if (!cycForm.name.trim()) return alert('请填写计划名称')
  store.saveCycle({ ...cycForm })
  cycModal.value = false
}

// ---------- 人才评估（证据式） ----------

const revModal = ref(false)
const revForm = reactive<Review>({
  id: '', cycleId: '', employeeId: '', background: '', evidence: [], score: null,
  businessFeedback: '', direction: '', gap: '', potential: '', readiness: '', confirmed: false, updatedAt: '',
})

function editReview(r?: Review) {
  Object.assign(revForm, r ?? {
    id: newId(),
    cycleId: store.state.cycles[0]?.id ?? '',
    employeeId: store.state.employees[0]?.id ?? '',
    background: '', evidence: [{ id: newId(), content: '', material: '', askWho: '' }],
    score: null, businessFeedback: '', direction: '', gap: '', potential: '' as Willingness,
    readiness: '' as Readiness, confirmed: false, updatedAt: '',
  })
  revModal.value = true
}

function addEvidence() {
  revForm.evidence.push({ id: newId(), content: '', material: '', askWho: '' })
}

function removeEvidence(id: string) {
  const i = revForm.evidence.findIndex((e) => e.id === id)
  if (i !== -1) revForm.evidence.splice(i, 1)
}

const validEvidence = computed(() => revForm.evidence.filter((e) => e.content.trim()))

/** 确认前补全：检查必填项，未满足则阻止确认 */
function saveReview(confirmMode: boolean) {
  if (!revForm.cycleId) return alert('请选择盘点周期')
  if (!revForm.employeeId) return alert('请选择评估员工')
  if (confirmMode) {
    const missing: string[] = []
    if (!revForm.background.trim()) missing.push('评估背景')
    if (validEvidence.value.length < 2) missing.push('至少 2 条证据（当前 ' + validEvidence.value.length + ' 条，证据不足需继续取证）')
    if (revForm.score === null || revForm.score === undefined) missing.push('评分（0–100）')
    if (!revForm.direction.trim()) missing.push('发展方向')
    if (missing.length) {
      alert('确认前需要补全：\n· ' + missing.join('\n· '))
      return
    }
    revForm.confirmed = true
  }
  store.saveReview({
    ...revForm,
    evidence: revForm.evidence.filter((e) => e.content.trim()) as EvidenceItem[],
  })
  revModal.value = false
}

const evidenceWarning = computed(() => validEvidence.value.length < 2)

/** 表格上的"确认"入口：载入该评估并立即走确认校验流程 */
function confirmReview(rev: Review) {
  editReview(rev)
  saveReview(true)
}

const reviewState = (r: Review) => {
  if (r.confirmed) return { text: '已确认', cls: 'bg-success-subtle text-success' }
  if (r.evidence.filter((e) => e.content.trim()).length < 2) return { text: '证据不足', cls: 'bg-warning-subtle text-warning' }
  return { text: '待确认', cls: 'bg-info-subtle text-info' }
}

// ---------- 培养计划 ----------

const planModal = ref(false)
const planForm = reactive<DevPlan>({
  id: '', name: '', employeeId: '', goal: '', coach: '', successCriteria: '', support: '', deadline: '', followUps: [], verified: false,
})

function editPlan(p?: DevPlan) {
  Object.assign(planForm, p ?? {
    id: newId(), name: '', employeeId: store.state.employees[0]?.id ?? '', goal: '', coach: '',
    successCriteria: '', support: '', deadline: '', followUps: [], verified: false,
  })
  planModal.value = true
}

function savePlan() {
  if (!planForm.name.trim()) return alert('请填写计划名称')
  if (!planForm.employeeId) return alert('请选择培养对象')
  store.savePlan({ ...planForm })
  planModal.value = false
}

const planOverdue = (p: DevPlan) => !p.verified && p.deadline && p.deadline < new Date().toISOString().slice(0, 10)
</script>

<template>
  <div>
    <div class="module-tabs">
      <button class="module-tab" :class="{ active: tab === 'org' }" @click="tab = 'org'">部门与岗位</button>
      <button class="module-tab" :class="{ active: tab === 'employees' }" @click="tab = 'employees'">
        员工名册 <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ store.state.employees.length }}</span>
      </button>
      <button class="module-tab" :class="{ active: tab === 'review' }" @click="tab = 'review'">
        盘点与评估 <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ store.state.reviews.length }}</span>
      </button>
      <button class="module-tab" :class="{ active: tab === 'plans' }" @click="tab = 'plans'">
        培养计划 <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ store.state.plans.length }}</span>
      </button>
    </div>

    <!-- 部门与岗位 -->
    <template v-if="tab === 'org'">
      <div class="page-toolbar">
        <div class="text-muted small">组织架构：部门树与岗位编制</div>
        <button class="btn btn-brand btn-sm" @click="editDepartment()"><i class="bi bi-plus-lg me-1"></i>新增部门</button>
      </div>

      <div class="card-soft mb-3">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead><tr><th>部门名称</th><th>英文名称</th><th>负责人</th><th>职责</th><th>员工</th><th>岗位</th><th class="text-end">操作</th></tr></thead>
            <tbody>
              <tr v-for="dep in store.state.departments" :key="dep.id">
                <td class="fw-medium">{{ dep.name }}</td>
                <td class="text-muted">{{ dep.nameEn || '—' }}</td>
                <td>{{ dep.manager || '—' }}</td>
                <td class="small">{{ dep.duty || '—' }}</td>
                <td>{{ depEmployeeCount(dep.id) }}</td>
                <td>{{ depPositionCount(dep.id) }}</td>
                <td class="text-end text-nowrap">
                  <div class="btn-group btn-group-sm me-1">
                    <button class="btn btn-outline-primary" @click="editDepartment(dep)">编辑</button>
                    <button class="btn btn-outline-secondary" @click="editPosition()">加岗位</button>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="confirmRemoveDepartment(dep)">
                      <i class="bi bi-trash3"></i>
                    </button>
                </td>
              </tr>
              <tr v-if="!store.state.departments.length"><td colspan="7"><EmptyState text="暂无部门" icon="bi-diagram-3" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="page-toolbar">
        <h6 class="section-title mb-0">岗位</h6>
        <button class="btn btn-outline-primary btn-sm" @click="editPosition()"><i class="bi bi-plus-lg me-1"></i>新增岗位</button>
      </div>
      <div class="card-soft">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead><tr><th>岗位名称</th><th>别名</th><th>岗位族</th><th>编制</th><th>所属部门</th><th class="text-end">操作</th></tr></thead>
            <tbody>
              <tr v-for="pos in store.state.positions" :key="pos.id">
                <td class="fw-medium">{{ pos.name }}</td>
                <td class="text-muted small">{{ pos.alias || '—' }}</td>
                <td>{{ pos.family || '—' }}</td>
                <td>{{ pos.headcount }}</td>
                <td>{{ store.departmentName(pos.departmentId) }}</td>
                <td class="text-end text-nowrap">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editPosition(pos)">编辑</button>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removePosition(pos.id)"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>
              <tr v-if="!store.state.positions.length"><td colspan="6"><EmptyState text="暂无岗位" icon="bi-person-vcard" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="depModal" title="部门" @close="depModal = false">
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small fw-medium">部门名称 *</label><input v-model="depForm.name" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small fw-medium">英文名称</label><input v-model="depForm.nameEn" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small fw-medium">负责人（管理领导）</label><input v-model="depForm.manager" class="form-control" /></div>
          <div class="col-12"><label class="form-label small fw-medium">部门职责</label><textarea v-model="depForm.duty" class="form-control" rows="2"></textarea></div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="depModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="saveDepartment">保存</button>
        </template>
      </HrModal>

      <HrModal v-if="posModal" title="岗位" @close="posModal = false">
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small fw-medium">岗位名称 *</label><input v-model="posForm.name" class="form-control" /></div>
          <div class="col-md-3"><label class="form-label small fw-medium">别名</label><input v-model="posForm.alias" class="form-control" /></div>
          <div class="col-md-3"><label class="form-label small fw-medium">岗位编制</label><input v-model.number="posForm.headcount" type="number" min="0" class="form-control" /></div>
          <div class="col-md-6">
            <label class="form-label small fw-medium">所属部门 *</label>
            <select v-model="posForm.departmentId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="dep in store.state.departments" :key="dep.id" :value="dep.id">{{ dep.name }}</option>
            </select>
          </div>
          <div class="col-md-6"><label class="form-label small fw-medium">岗位族</label><input v-model="posForm.family" class="form-control" placeholder="如：软件开发" /></div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="posModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="savePosition">保存</button>
        </template>
      </HrModal>
    </template>

    <!-- 员工名册 -->
    <template v-else-if="tab === 'employees'">
      <div class="page-toolbar">
        <div class="text-muted small">员工状态与绩效、意愿记录</div>
        <button class="btn btn-brand btn-sm" @click="editEmployee()"><i class="bi bi-plus-lg me-1"></i>新增员工</button>
      </div>
      <div class="card-soft">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead><tr><th>姓名</th><th>部门</th><th>岗位</th><th>状态</th><th>绩效</th><th>意愿</th><th>入职日期</th><th class="text-end">操作</th></tr></thead>
            <tbody>
              <tr v-for="emp in store.state.employees" :key="emp.id">
                <td class="fw-medium">{{ emp.name }}<div class="text-muted small fw-normal">{{ emp.location || '' }}</div></td>
                <td>{{ store.departmentName(emp.departmentId) }}</td>
                <td>{{ store.positionName(emp.positionId) }}</td>
                <td><span class="badge rounded-pill" :class="EMPLOYEE_STATUS_BADGE[emp.status]">{{ emp.status }}</span></td>
                <td>{{ emp.performance || '—' }}</td>
                <td>{{ emp.willingness || '—' }}</td>
                <td class="small text-muted">{{ emp.joinDate || '—' }}</td>
                <td class="text-end text-nowrap">
                  <div class="btn-group btn-group-sm me-1">
                    <button class="btn btn-outline-primary" @click="editEmployee(emp)">编辑</button>
                    <button class="btn btn-outline-secondary" @click="editReview(store.state.reviews.find((r) => r.employeeId === emp.id) ?? undefined); revForm.employeeId = emp.id">评估</button>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removeEmployee(emp.id)"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>
              <tr v-if="!store.state.employees.length"><td colspan="8"><EmptyState text="暂无员工" icon="bi-people" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="empModal" title="员工档案" wide @close="empModal = false">
        <div class="row g-3">
          <div class="col-md-4"><label class="form-label small fw-medium">姓名 *</label><input v-model="empForm.name" class="form-control" /></div>
          <div class="col-md-4">
            <label class="form-label small fw-medium">所属部门 *</label>
            <select v-model="empForm.departmentId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="dep in store.state.departments" :key="dep.id" :value="dep.id">{{ dep.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-medium">所属岗位</label>
            <select v-model="empForm.positionId" class="form-select">
              <option value="">未指定</option>
              <option v-for="pos in positionsOfDept(empForm.departmentId)" :key="pos.id" :value="pos.id">{{ pos.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">员工状态</label>
            <select v-model="empForm.status" class="form-select">
              <option v-for="s in EMPLOYEE_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">绩效等级</label>
            <select v-model="empForm.performance" class="form-select">
              <option value="">未填写</option>
              <option v-for="g in ['S', 'A', 'B', 'C', 'D']" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">员工意愿</label>
            <select v-model="empForm.willingness" class="form-select">
              <option value="">未填写</option>
              <option>高</option><option>中</option><option>低</option>
            </select>
          </div>
          <div class="col-md-3"><label class="form-label small fw-medium">工作地点</label><input v-model="empForm.location" class="form-control" placeholder="如：科技园" /></div>
          <div class="col-md-4"><label class="form-label small fw-medium">入职日期</label><input v-model="empForm.joinDate" type="date" class="form-control" /></div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="empModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="saveEmployee">保存</button>
        </template>
      </HrModal>
    </template>

    <!-- 盘点与评估 -->
    <template v-else-if="tab === 'review'">
      <div class="page-toolbar">
        <h6 class="section-title mb-0">盘点周期</h6>
        <button class="btn btn-outline-primary btn-sm" @click="editCycle()"><i class="bi bi-plus-lg me-1"></i>新增盘点周期</button>
      </div>
      <div class="card-soft mb-3">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead><tr><th>计划名称</th><th>资料截止日期</th><th>状态</th><th>评估数</th><th class="text-end">操作</th></tr></thead>
            <tbody>
              <tr v-for="cyc in store.state.cycles" :key="cyc.id">
                <td class="fw-medium">{{ cyc.name }}</td>
                <td>{{ cyc.deadline || '—' }}</td>
                <td>
                  <select :value="cyc.status" class="form-select form-select-sm" style="width: 110px" @change="store.saveCycle({ ...cyc, status: ($event.target as HTMLSelectElement).value as typeof cyc.status })">
                    <option v-for="s in CYCLE_STATUSES" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
                <td>{{ store.state.reviews.filter((r) => r.cycleId === cyc.id).length }}</td>
                <td class="text-end text-nowrap">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editCycle(cyc)">编辑</button>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removeCycle(cyc.id)"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>
              <tr v-if="!store.state.cycles.length"><td colspan="5"><EmptyState text="暂无盘点周期" icon="bi-arrow-repeat" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="cycModal" title="盘点周期" @close="cycModal = false">
        <div class="row g-3">
          <div class="col-12"><label class="form-label small fw-medium">计划名称 *</label><input v-model="cycForm.name" class="form-control" placeholder="如：2026 H2 人才盘点" /></div>
          <div class="col-md-6"><label class="form-label small fw-medium">资料截止日期</label><input v-model="cycForm.deadline" type="date" class="form-control" /></div>
          <div class="col-md-6">
            <label class="form-label small fw-medium">状态</label>
            <select v-model="cycForm.status" class="form-select">
              <option v-for="s in CYCLE_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="cycModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="saveCycle">保存</button>
        </template>
      </HrModal>

      <div class="page-toolbar">
        <h6 class="section-title mb-0">人才评估<span class="text-muted small fw-normal ms-2">证据式：确认前必填补全，证据不足需继续取证</span></h6>
        <button class="btn btn-brand btn-sm" :disabled="!store.state.employees.length" @click="editReview()">
          <i class="bi bi-plus-lg me-1"></i>新增评估
        </button>
      </div>
      <div class="card-soft">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead><tr><th>员工</th><th>周期</th><th>评分</th><th>证据</th><th>状态</th><th>更新时间</th><th class="text-end">操作</th></tr></thead>
            <tbody>
              <tr v-for="rev in store.state.reviews" :key="rev.id">
                <td class="fw-medium">{{ store.employeeName(rev.employeeId) }}</td>
                <td class="small">{{ store.cycleName(rev.cycleId) }}</td>
                <td><span class="mono-num" :style="{ color: rev.score !== null && rev.score >= 80 ? '#10b981' : rev.score !== null && rev.score >= 60 ? '#6366f1' : '#f59e0b' }">{{ rev.score ?? '—' }}</span></td>
                <td>{{ rev.evidence.filter((e) => e.content.trim()).length }} 条</td>
                <td><span class="badge rounded-pill" :class="reviewState(rev).cls">{{ reviewState(rev).text }}</span></td>
                <td class="small text-muted">{{ rev.updatedAt }}</td>
                <td class="text-end text-nowrap">
                  <div class="btn-group btn-group-sm me-1">
                    <button class="btn btn-outline-primary" @click="editReview(rev)">{{ rev.confirmed ? '查看' : '编辑' }}</button>
                    <button v-if="!rev.confirmed" class="btn btn-outline-secondary" @click="confirmReview(rev)">确认</button>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removeReview(rev.id)"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>
              <tr v-if="!store.state.reviews.length"><td colspan="7"><EmptyState text="暂无评估记录" icon="bi-clipboard-check" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="revModal" title="人才评估（证据式）" wide @close="revModal = false">
        <div class="row g-3 mb-3">
          <div class="col-md-5">
            <label class="form-label small fw-medium">评估员工 *</label>
            <select v-model="revForm.employeeId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="emp in store.state.employees" :key="emp.id" :value="emp.id">{{ emp.name }}（{{ store.departmentName(emp.departmentId) }}）</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-medium">盘点周期 *</label>
            <select v-model="revForm.cycleId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="cyc in store.state.cycles" :key="cyc.id" :value="cyc.id">{{ cyc.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-medium">评分（0–100）</label>
            <input v-model.number="revForm.score" type="number" min="0" max="100" class="form-control" placeholder="—" />
          </div>
          <div class="col-12">
            <label class="form-label small fw-medium">评估背景</label>
            <textarea v-model="revForm.background" class="form-control" rows="2" placeholder="为什么做这次评估、评估的场景与目的"></textarea>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label small fw-medium mb-0">证据条目 <span class="text-muted fw-normal">（每条必填内容；建议至少 2 条）</span></label>
          <button class="btn btn-sm btn-outline-primary" @click="addEvidence"><i class="bi bi-plus-lg me-1"></i>添加证据</button>
        </div>
        <div v-for="(ev, i) in revForm.evidence" :key="ev.id" class="evidence-card mb-2">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-semibold text-muted">证据 {{ i + 1 }}</span>
            <button class="btn btn-sm btn-link text-danger p-0" @click="removeEvidence(ev.id)">移除</button>
          </div>
          <textarea v-model="ev.content" class="form-control form-control-sm mb-2" rows="2" placeholder="证据内容 *：具体行为、数据或结果"></textarea>
          <div class="row g-2">
            <div class="col-6"><input v-model="ev.material" class="form-control form-control-sm" placeholder="关联材料（如：绩效记录/作品链接）" /></div>
            <div class="col-6"><input v-model="ev.askWho" class="form-control form-control-sm" placeholder="还要问谁、核对什么" /></div>
          </div>
        </div>
        <div v-if="evidenceWarning" class="alert alert-warning py-2 small mb-3">
          <i class="bi bi-exclamation-triangle me-1"></i>证据不足（当前 {{ validEvidence.length }} 条有效），确认前建议继续取证。
        </div>

        <div class="row g-3 mt-1">
          <div class="col-md-4"><label class="form-label small fw-medium">业务反馈</label><input v-model="revForm.businessFeedback" class="form-control" /></div>
          <div class="col-md-4"><label class="form-label small fw-medium">发展方向</label><input v-model="revForm.direction" class="form-control" placeholder="如：技术深耕 + 项目推动" /></div>
          <div class="col-md-4"><label class="form-label small fw-medium">发展差距</label><input v-model="revForm.gap" class="form-control" /></div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">发展潜力</label>
            <select v-model="revForm.potential" class="form-select">
              <option value="">未填写</option><option>高</option><option>中</option><option>低</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">发展准备度</label>
            <select v-model="revForm.readiness" class="form-select">
              <option value="">未填写</option><option>现在</option><option>1-2年</option><option>3年以上</option>
            </select>
          </div>
        </div>

        <template #footer>
          <span v-if="revForm.confirmed" class="badge bg-success-subtle text-success align-self-center me-auto"><i class="bi bi-check-circle me-1"></i>已确认</span>
          <button class="btn btn-outline-secondary btn-sm" @click="revModal = false">取消</button>
          <button class="btn btn-outline-primary btn-sm" @click="saveReview(false)">保存草稿</button>
          <button class="btn btn-brand btn-sm" @click="saveReview(true)"><i class="bi bi-patch-check me-1"></i>确认评估</button>
        </template>
      </HrModal>
    </template>

    <!-- 培养计划 -->
    <template v-else>
      <div class="page-toolbar">
        <div class="text-muted small">培养目标、辅导跟进与验收</div>
        <button class="btn btn-brand btn-sm" :disabled="!store.state.employees.length" @click="editPlan()">
          <i class="bi bi-plus-lg me-1"></i>新增培养计划
        </button>
      </div>
      <div class="row g-3">
        <div v-for="plan in store.state.plans" :key="plan.id" class="col-lg-6">
          <div class="card-soft p-3 h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div class="fw-semibold">{{ plan.name }}</div>
                <div class="text-muted small">{{ store.employeeName(plan.employeeId) }} · 辅导人：{{ plan.coach || '—' }}</div>
              </div>
              <div class="text-nowrap">
                <span v-if="plan.verified" class="badge rounded-pill bg-success-subtle text-success me-1">已验收</span>
                <span v-else-if="planOverdue(plan)" class="badge rounded-pill bg-danger-subtle text-danger me-1">已逾期</span>
                <button class="btn btn-sm btn-outline-primary me-1" @click="editPlan(plan)">编辑</button>
                <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removePlan(plan.id)"><i class="bi bi-trash3"></i></button>
              </div>
            </div>
            <div class="small mb-1"><span class="text-muted">培养目标：</span>{{ plan.goal || '—' }}</div>
            <div class="small mb-1"><span class="text-muted">成功标准：</span>{{ plan.successCriteria || '—' }}</div>
            <div class="small mb-1"><span class="text-muted">支持机制：</span>{{ plan.support || '—' }}</div>
            <div class="small mb-2"><span class="text-muted">截止日期：</span>{{ plan.deadline || '—' }}</div>
            <div v-if="plan.followUps.length" class="border-top pt-2">
              <div class="small text-muted mb-1">跟进记录</div>
              <ul class="small mb-0 ps-3">
                <li v-for="(f, i) in plan.followUps" :key="i">{{ f }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="!store.state.plans.length" class="col-12"><div class="card-soft"><EmptyState text="暂无培养计划" icon="bi-mortarboard" /></div></div>
      </div>

      <HrModal v-if="planModal" title="培养计划" wide @close="planModal = false">
        <div class="row g-3">
          <div class="col-md-5"><label class="form-label small fw-medium">计划名称 *</label><input v-model="planForm.name" class="form-control" /></div>
          <div class="col-md-4">
            <label class="form-label small fw-medium">培养对象 *</label>
            <select v-model="planForm.employeeId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="emp in store.state.employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="col-md-3"><label class="form-label small fw-medium">辅导人</label><input v-model="planForm.coach" class="form-control" /></div>
          <div class="col-12"><label class="form-label small fw-medium">培养目标</label><textarea v-model="planForm.goal" class="form-control" rows="2"></textarea></div>
          <div class="col-md-6"><label class="form-label small fw-medium">成功标准</label><textarea v-model="planForm.successCriteria" class="form-control" rows="2"></textarea></div>
          <div class="col-md-6"><label class="form-label small fw-medium">支持机制</label><textarea v-model="planForm.support" class="form-control" rows="2" placeholder="资源、培训、陪练等"></textarea></div>
          <div class="col-md-4"><label class="form-label small fw-medium">截止日期</label><input v-model="planForm.deadline" type="date" class="form-control" /></div>
          <div class="col-md-2 d-flex align-items-end">
            <div class="form-check">
              <input v-model="planForm.verified" type="checkbox" class="form-check-input" id="plan-verified" />
              <label class="form-check-label small" for="plan-verified">已验收</label>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label small fw-medium">跟进记录</label>
            <div v-for="(_f, i) in planForm.followUps" :key="i" class="input-group mb-2">
              <input v-model="planForm.followUps[i]" class="form-control form-control-sm" placeholder="具体行动与验收结果" />
              <button class="btn btn-outline-danger btn-sm" @click="planForm.followUps.splice(i, 1)"><i class="bi bi-dash"></i></button>
            </div>
            <button class="btn btn-sm btn-outline-primary" @click="planForm.followUps.push('')"><i class="bi bi-plus-lg me-1"></i>添加跟进</button>
          </div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="planModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="savePlan">保存</button>
        </template>
      </HrModal>
    </template>
  </div>
</template>
