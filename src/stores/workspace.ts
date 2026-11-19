import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'

import type {
  AiProvider,
  Candidate,
  DevPlan,
  Department,
  Employee,
  Interview,
  OrgPosition,
  RecruitmentJob,
  Review,
  ReviewCycle,
  Todo,
  TrainingDoc,
  GrowthFavorite,
  WorkspaceState,
} from '@/types/hr'
import { newId } from '@/types/hr'
import { demoWorkspace } from '@/data/demo'

const STORAGE_KEY = 'hr_workspace_v2'

function loadState(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as WorkspaceState
      // 兼容缺字段：用演示数据补全骨架
      return { ...demoWorkspace(), ...parsed }
    }
  } catch {
    console.warn('工作区数据解析失败，回退演示数据')
  }
  return demoWorkspace()
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const state = reactive<WorkspaceState>(loadState())

  watch(
    state,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  // ---------- 通用增删改 ----------

  function upsert<T extends { id: string }>(list: T[], entity: T): void {
    const idx = list.findIndex((e) => e.id === entity.id)
    if (idx === -1) list.push(entity)
    else list[idx] = entity
  }

  function removeById<T extends { id: string }>(list: T[], id: string): void {
    const i = list.findIndex((e) => e.id === id)
    if (i !== -1) list.splice(i, 1)
  }

  // ---------- 组织与人才 ----------

  const saveDepartment = (d: Department) => upsert(state.departments, d)
  const removeDepartment = (id: string) => {
    removeById(state.departments, id)
    state.positions = state.positions.filter((p) => p.departmentId !== id)
  }

  const savePosition = (p: OrgPosition) => upsert(state.positions, p)
  const removePosition = (id: string) => removeById(state.positions, id)

  const saveEmployee = (e: Employee) => upsert(state.employees, e)
  const removeEmployee = (id: string) => {
    removeById(state.employees, id)
    state.reviews = state.reviews.filter((r) => r.employeeId !== id)
  }

  const saveCycle = (c: ReviewCycle) => upsert(state.cycles, c)
  const removeCycle = (id: string) => {
    removeById(state.cycles, id)
    state.reviews = state.reviews.filter((r) => r.cycleId !== id)
  }

  const saveReview = (r: Review) => {
    r.updatedAt = new Date().toISOString().slice(0, 10)
    upsert(state.reviews, r)
  }
  const removeReview = (id: string) => removeById(state.reviews, id)

  const savePlan = (p: DevPlan) => upsert(state.plans, p)
  const removePlan = (id: string) => removeById(state.plans, id)

  // ---------- 招聘 ----------

  const saveJob = (j: RecruitmentJob) => upsert(state.jobs, j)
  const removeJob = (id: string) => {
    removeById(state.jobs, id)
    state.candidates = state.candidates.filter((c) => c.jobId !== id)
  }

  const saveCandidate = (c: Candidate) => upsert(state.candidates, c)
  const removeCandidate = (id: string) => {
    removeById(state.candidates, id)
    state.interviews = state.interviews.filter((i) => i.candidateId !== id)
  }

  const saveInterview = (i: Interview) => upsert(state.interviews, i)
  const removeInterview = (id: string) => removeById(state.interviews, id)

  // ---------- 待办 / 研习室 / 成长 ----------

  const saveTodo = (t: Todo) => upsert(state.todos, t)
  const removeTodo = (id: string) => removeById(state.todos, id)

  const saveDocument = (d: TrainingDoc) => upsert(state.documents, d)
  const removeDocument = (id: string) => removeById(state.documents, id)

  const saveFavorite = (f: GrowthFavorite) => upsert(state.favorites, f)
  const removeFavorite = (id: string) => removeById(state.favorites, id)

  // ---------- 设置 ----------

  const saveProvider = (p: AiProvider) => upsert(state.providers, p)
  const removeProvider = (id: string) => {
    removeById(state.providers, id)
    if (state.activeProviderId === id) state.activeProviderId = ''
  }

  // ---------- 数据管理 ----------

  function exportJson(): string {
    return JSON.stringify(state, null, 2)
  }

  function resetToDemo() {
    const fresh = demoWorkspace()
    Object.keys(fresh).forEach((key) => {
      ;(state as unknown as Record<string, unknown>)[key] = (fresh as unknown as Record<string, unknown>)[key]
    })
    state.activeProviderId = ''
  }

  function clearAll() {
    const empty = demoWorkspace()
    Object.keys(empty).forEach((key) => {
      const val = empty[key as keyof WorkspaceState]
      ;(state as unknown as Record<string, unknown>)[key] = Array.isArray(val) ? [] : val
    })
  }

  // ---------- 名称解析（展示用） ----------

  const departmentName = (id: string) => state.departments.find((d) => d.id === id)?.name ?? '—'
  const positionName = (id: string) => state.positions.find((p) => p.id === id)?.name ?? '—'
  const jobTitle = (id: string) => state.jobs.find((j) => j.id === id)?.title ?? '—'
  const employeeName = (id: string) => state.employees.find((e) => e.id === id)?.name ?? '—'
  const candidateName = (id: string) => state.candidates.find((c) => c.id === id)?.name ?? '—'
  const cycleName = (id: string) => state.cycles.find((c) => c.id === id)?.name ?? '—'

  return {
    state,
    newId,
    saveDepartment,
    removeDepartment,
    savePosition,
    removePosition,
    saveEmployee,
    removeEmployee,
    saveCycle,
    removeCycle,
    saveReview,
    removeReview,
    savePlan,
    removePlan,
    saveJob,
    removeJob,
    saveCandidate,
    removeCandidate,
    saveInterview,
    removeInterview,
    saveTodo,
    removeTodo,
    saveDocument,
    removeDocument,
    saveFavorite,
    removeFavorite,
    saveProvider,
    removeProvider,
    exportJson,
    resetToDemo,
    clearAll,
    departmentName,
    positionName,
    jobTitle,
    employeeName,
    candidateName,
    cycleName,
  }
})
