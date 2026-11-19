<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import EmptyState from '@/components/EmptyState.vue'
import HrModal from '@/components/HrModal.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type {
  Candidate,
  CandidateSource,
  CandidateStatus,
  Interview,
  InterviewForm,
  InterviewResult,
  InterviewStatus,
  JobStatus,
  RecruitmentJob,
} from '@/types/hr'
import {
  CANDIDATE_SOURCES,
  CANDIDATE_STATUS_BADGE,
  CANDIDATE_STATUSES,
  INTERVIEW_FORMS,
  INTERVIEW_RESULTS,
  INTERVIEW_STATUSES,
  JOB_STATUSES,
  JOB_STATUS_BADGE,
  newId,
} from '@/types/hr'

const store = useWorkspaceStore()
const tab = ref<'jobs' | 'candidates' | 'interviews'>('jobs')

// ---------- 岗位 ----------

const jobModal = ref(false)
const jobForm = reactive<RecruitmentJob>({
  id: '', title: '', family: '', headcount: 1, status: '待开放', criteria: '', profile: '',
})

function editJob(job?: RecruitmentJob) {
  Object.assign(jobForm, job ?? {
    id: newId(), title: '', family: '', headcount: 1, status: '待开放' as JobStatus, criteria: '', profile: '',
  })
  jobModal.value = true
}

function saveJob() {
  if (!jobForm.title.trim()) return alert('请填写岗位名称')
  store.saveJob({ ...jobForm })
  jobModal.value = false
}

function advanceJob(job: RecruitmentJob) {
  const order: JobStatus[] = ['待开放', '招聘中', '招聘完成']
  const i = order.indexOf(job.status)
  if (i < order.length - 1) store.saveJob({ ...job, status: order[i + 1] })
}

/** 打开岗位弹窗编辑画像 */
function openProfile(job: RecruitmentJob) {
  Object.assign(jobForm, job)
  jobModal.value = true
}

/** 离线画像模板：按部署版内置 AI 角色的六段结构生成占位，人工复核后保存 */
function fillProfileTemplate() {
  const t = jobForm.title || '（岗位名称）'
  jobForm.profile = [
    `# ${t} · 岗位画像`,
    ``,
    `## 1. 岗位定位与业务价值`,
    `（该岗位解决什么业务问题、在团队中的位置）`,
    ``,
    `## 2. 主要职责模块`,
    `- `,
    ``,
    `## 3. 必备条件与加分条件`,
    `必备：`,
    `加分：`,
    ``,
    `## 4. 简历搜索关键词`,
    ``,
    `## 5. 胜任力与面试问题`,
    `- `,
    ``,
    `## 6. 需要向用人经理确认的问题`,
    `- `,
    ``,
    `> 来源：本地模板生成（部署版由 AI 生成，需配置供应商后接入）。`,
  ].join('\n')
}

const jobCandidateCount = (jobId: string) => store.state.candidates.filter((c) => c.jobId === jobId).length

function confirmRemoveJob(job: RecruitmentJob) {
  if (window.confirm('确认删除该岗位？关联候选人也会删除')) store.removeJob(job.id)
}

function confirmRemoveCandidate(c: Candidate) {
  if (window.confirm('确认删除该候选人？相关面试也会删除')) store.removeCandidate(c.id)
}

// ---------- 候选人 ----------

const candModal = ref(false)
const candForm = reactive<Candidate>({
  id: '', name: '', phone: '', jobId: '', source: 'BOSS直聘', status: '待定', salaryExpect: '', notes: '',
})

function editCandidate(c?: Candidate) {
  Object.assign(candForm, c ?? {
    id: newId(), name: '', phone: '', jobId: store.state.jobs[0]?.id ?? '', source: 'BOSS直聘' as CandidateSource,
    status: '待定' as CandidateStatus, salaryExpect: '', notes: '',
  })
  candModal.value = true
}

function saveCandidate() {
  if (!candForm.name.trim()) return alert('请填写候选人姓名')
  if (!candForm.jobId) return alert('请选择应聘岗位')
  store.saveCandidate({ ...candForm })
  candModal.value = false
}

function advanceCandidate(c: Candidate) {
  const order: CandidateStatus[] = ['待定', '招聘中', '已入职']
  const i = order.indexOf(c.status)
  if (i !== -1 && i < order.length - 1) store.saveCandidate({ ...c, status: order[i + 1] })
}

function canAdvance(c: Candidate) {
  return ['待定', '招聘中'].includes(c.status)
}

// ---------- 面试 ----------

const itvModal = ref(false)
const itvForm = reactive<Interview>({
  id: '', candidateId: '', round: '一面', time: '', interviewer: '', form: '视频',
  location: '', durationMin: 60, status: '待进行', feedback: '', result: '待定', nextStep: '',
})

function editInterview(itv?: Interview) {
  Object.assign(itvForm, itv ?? {
    id: newId(), candidateId: store.state.candidates[0]?.id ?? '', round: '一面', time: '',
    interviewer: '', form: '视频' as InterviewForm, location: '', durationMin: 60,
    status: '待进行' as InterviewStatus, feedback: '', result: '待定' as InterviewResult, nextStep: '',
  })
  itvModal.value = true
}

function saveInterview() {
  if (!itvForm.candidateId) return alert('请选择候选人')
  if (!itvForm.time.trim()) return alert('请填写面试时间')
  if (!itvForm.interviewer.trim()) return alert('请填写面试官')
  store.saveInterview({ ...itvForm })
  itvModal.value = false
}

const canSchedule = computed(() => store.state.candidates.some((c) => c.status !== '淘汰' && c.status !== '已离职'))
</script>

<template>
  <div>
    <div class="module-tabs">
      <button class="module-tab" :class="{ active: tab === 'jobs' }" @click="tab = 'jobs'">
        岗位 <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ store.state.jobs.length }}</span>
      </button>
      <button class="module-tab" :class="{ active: tab === 'candidates' }" @click="tab = 'candidates'">
        候选人 <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ store.state.candidates.length }}</span>
      </button>
      <button class="module-tab" :class="{ active: tab === 'interviews' }" @click="tab = 'interviews'">
        面试 <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ store.state.interviews.length }}</span>
      </button>
    </div>

    <!-- 岗位 -->
    <template v-if="tab === 'jobs'">
      <div class="page-toolbar">
        <div class="text-muted small">岗位族、编制与画像管理；状态流转：待开放 → 招聘中 → 招聘完成</div>
        <button class="btn btn-brand btn-sm" @click="editJob()"><i class="bi bi-plus-lg me-1"></i>新增岗位</button>
      </div>
      <div class="card-soft">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead>
              <tr><th>岗位名称</th><th>岗位族</th><th>编制</th><th>状态</th><th>候选人数</th><th class="text-end">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="job in store.state.jobs" :key="job.id">
                <td class="fw-medium">{{ job.title }}</td>
                <td>{{ job.family || '—' }}</td>
                <td>{{ job.headcount }}</td>
                <td><span class="badge rounded-pill" :class="JOB_STATUS_BADGE[job.status]">{{ job.status }}</span></td>
                <td>{{ jobCandidateCount(job.id) }}</td>
                <td class="text-end text-nowrap">
                  <div class="btn-group btn-group-sm me-1">
                    <button class="btn btn-outline-primary" @click="editJob(job)">编辑</button>
                    <button v-if="job.status !== '招聘完成'" class="btn btn-outline-success" @click="advanceJob(job)">推进</button>
                    <button class="btn btn-outline-secondary" @click="openProfile(job)">画像</button>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="confirmRemoveJob(job)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!store.state.jobs.length"><td colspan="6"><EmptyState text="还没有岗位，点击右上角新增" icon="bi-briefcase" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="jobModal" title="岗位详情" wide @close="jobModal = false">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-medium">岗位名称 *</label>
            <input v-model="jobForm.title" class="form-control" placeholder="如：高级前端工程师" />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">岗位族</label>
            <input v-model="jobForm.family" class="form-control" placeholder="如：软件开发" />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">岗位编制</label>
            <input v-model.number="jobForm.headcount" type="number" min="1" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-medium">状态</label>
            <select v-model="jobForm.status" class="form-select">
              <option v-for="s in JOB_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-medium">筛选标准</label>
            <textarea v-model="jobForm.criteria" class="form-control" rows="2" placeholder="简历初筛的硬性条件"></textarea>
          </div>
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label small fw-medium mb-0">岗位画像</label>
              <button class="btn btn-sm btn-outline-primary" @click="fillProfileTemplate">
                <i class="bi bi-magic me-1"></i>生成画像模板
              </button>
            </div>
            <textarea v-model="jobForm.profile" class="form-control font-monospace" rows="10" placeholder="点击「生成画像模板」按标准六段结构生成，人工复核后保存"></textarea>
          </div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="jobModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="saveJob">保存</button>
        </template>
      </HrModal>
    </template>

    <!-- 候选人 -->
    <template v-else-if="tab === 'candidates'">
      <div class="page-toolbar">
        <div class="text-muted small">流程：待定 → 招聘中 → 已入职；随时可淘汰</div>
        <button class="btn btn-brand btn-sm" @click="editCandidate()"><i class="bi bi-plus-lg me-1"></i>新增候选人</button>
      </div>
      <div class="card-soft">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead>
              <tr><th>姓名</th><th>应聘岗位</th><th>来源</th><th>状态</th><th>期望月薪</th><th class="text-end">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in store.state.candidates" :key="c.id">
                <td>
                  <div class="fw-medium">{{ c.name }}</div>
                  <small class="text-muted">{{ c.phone || '未填写电话' }}</small>
                </td>
                <td>{{ store.jobTitle(c.jobId) }}</td>
                <td>{{ c.source }}</td>
                <td><span class="badge rounded-pill" :class="CANDIDATE_STATUS_BADGE[c.status]">{{ c.status }}</span></td>
                <td>{{ c.salaryExpect || '—' }}</td>
                <td class="text-end text-nowrap">
                  <div class="btn-group btn-group-sm me-1">
                    <button class="btn btn-outline-primary" @click="editCandidate(c)">编辑</button>
                    <button v-if="canAdvance(c)" class="btn btn-outline-success" @click="advanceCandidate(c)">进入下一阶段</button>
                    <button v-if="c.status !== '淘汰' && c.status !== '已入职'" class="btn btn-outline-danger" @click="store.saveCandidate({ ...c, status: '淘汰' })">淘汰</button>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="confirmRemoveCandidate(c)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!store.state.candidates.length"><td colspan="6"><EmptyState text="暂无候选人" icon="bi-person-plus" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="candModal" title="候选人资料" @close="candModal = false">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-medium">姓名 *</label>
            <input v-model="candForm.name" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-medium">联系电话</label>
            <input v-model="candForm.phone" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-medium">应聘岗位 *</label>
            <select v-model="candForm.jobId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="job in store.state.jobs" :key="job.id" :value="job.id">{{ job.title }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">来源</label>
            <select v-model="candForm.source" class="form-select">
              <option v-for="s in CANDIDATE_SOURCES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">状态</label>
            <select v-model="candForm.status" class="form-select">
              <option v-for="s in CANDIDATE_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-medium">期望月薪（税前）</label>
            <input v-model="candForm.salaryExpect" class="form-control" placeholder="如：30-35K" />
          </div>
          <div class="col-12">
            <label class="form-label small fw-medium">备注</label>
            <textarea v-model="candForm.notes" class="form-control" rows="2"></textarea>
          </div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="candModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="saveCandidate">保存</button>
        </template>
      </HrModal>
    </template>

    <!-- 面试 -->
    <template v-else>
      <div class="page-toolbar">
        <div class="text-muted small">面试安排与反馈回收</div>
        <button class="btn btn-brand btn-sm" :disabled="!canSchedule" @click="editInterview()">
          <i class="bi bi-calendar-plus me-1"></i>安排面试
        </button>
      </div>
      <div class="card-soft">
        <div class="table-responsive">
          <table class="table table-soft align-middle">
            <thead>
              <tr><th>候选人</th><th>轮次</th><th>时间</th><th>面试官</th><th>形式</th><th>状态</th><th>结果</th><th class="text-end">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="itv in store.state.interviews" :key="itv.id">
                <td class="fw-medium">{{ store.candidateName(itv.candidateId) }}</td>
                <td>{{ itv.round }}</td>
                <td class="small">{{ itv.time }}</td>
                <td>{{ itv.interviewer }}</td>
                <td>{{ itv.form }}</td>
                <td><span class="badge rounded-pill" :class="itv.status === '待进行' ? 'bg-info-subtle text-info' : itv.status === '已完成' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">{{ itv.status }}</span></td>
                <td>
                  <span class="badge rounded-pill" :class="itv.result === '通过' ? 'bg-success-subtle text-success' : itv.result === '不通过' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary'">{{ itv.result }}</span>
                </td>
                <td class="text-end text-nowrap">
                  <div class="btn-group btn-group-sm me-1">
                    <button class="btn btn-outline-primary" @click="editInterview(itv)">编辑反馈</button>
                    <button v-if="itv.status === '待进行'" class="btn btn-outline-secondary" @click="store.saveInterview({ ...itv, status: '已完成' })">完成</button>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" title="删除" @click="store.removeInterview(itv.id)"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>
              <tr v-if="!store.state.interviews.length"><td colspan="8"><EmptyState text="暂无面试安排" icon="bi-calendar-x" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <HrModal v-if="itvModal" title="面试安排与反馈" wide @close="itvModal = false">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label small fw-medium">候选人 *</label>
            <select v-model="itvForm.candidateId" class="form-select">
              <option value="" disabled>请选择</option>
              <option v-for="c in store.state.candidates.filter((c) => c.status !== '淘汰')" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-medium">面试轮次</label>
            <select v-model="itvForm.round" class="form-select">
              <option>一面</option><option>二面</option><option>终面</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">面试时间 *</label>
            <input v-model="itvForm.time" class="form-control" placeholder="2026-10-25 14:00" />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">面试官 *</label>
            <input v-model="itvForm.interviewer" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">面试形式</label>
            <select v-model="itvForm.form" class="form-select">
              <option v-for="f in INTERVIEW_FORMS" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-medium">地点 / 会议链接</label>
            <input v-model="itvForm.location" class="form-control" />
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-medium">时长（分钟）</label>
            <input v-model.number="itvForm.durationMin" type="number" min="15" step="15" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium">面试状态</label>
            <select v-model="itvForm.status" class="form-select">
              <option v-for="s in INTERVIEW_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-medium">面试结果</label>
            <select v-model="itvForm.result" class="form-select">
              <option v-for="r in INTERVIEW_RESULTS" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-medium">面试反馈</label>
            <textarea v-model="itvForm.feedback" class="form-control" rows="3" placeholder="面试官观察、亮点与风险"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label small fw-medium">下一步安排</label>
            <input v-model="itvForm.nextStep" class="form-control" placeholder="如：安排二面 / 发 offer / 感谢信" />
          </div>
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary btn-sm" @click="itvModal = false">取消</button>
          <button class="btn btn-brand btn-sm" @click="saveInterview">保存</button>
        </template>
      </HrModal>
    </template>
  </div>
</template>
