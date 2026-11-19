/**
 * HR工作室领域模型
 * 字段语义来自 hr.pocketbay.app 部署版逆向（见 legacy-backup/hr.pocketbay.app/DATA-MODELS.md）
 */

// ---------- 组织与人才 ----------

export type EmployeeStatus = '在岗' | '骨干' | '已离职'
export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D'
export type Willingness = '高' | '中' | '低'

export interface Department {
  id: string
  name: string
  nameEn: string
  duty: string
  manager: string
}

export interface OrgPosition {
  id: string
  name: string
  alias: string
  family: string
  headcount: number
  departmentId: string
}

export interface Employee {
  id: string
  name: string
  departmentId: string
  positionId: string
  status: EmployeeStatus
  performance: PerformanceGrade | ''
  willingness: Willingness | ''
  joinDate: string
  location: string
}

export type CycleStatus = '待进行' | '进行中' | '已完成'

export interface ReviewCycle {
  id: string
  name: string
  deadline: string
  status: CycleStatus
}

/** 证据条目：内容必填；不足两条时评估标记为"证据不足" */
export interface EvidenceItem {
  id: string
  content: string
  material: string
  askWho: string
}

export type Readiness = '现在' | '1-2年' | '3年以上'

/** 人才评估（证据式） */
export interface Review {
  id: string
  cycleId: string
  employeeId: string
  background: string
  evidence: EvidenceItem[]
  score: number | null
  businessFeedback: string
  direction: string
  gap: string
  potential: Willingness | ''
  readiness: Readiness | ''
  confirmed: boolean
  updatedAt: string
}

/** 培养计划 */
export interface DevPlan {
  id: string
  name: string
  employeeId: string
  goal: string
  coach: string
  successCriteria: string
  support: string
  deadline: string
  followUps: string[]
  verified: boolean
}

// ---------- 招聘 ----------

export type JobStatus = '待开放' | '招聘中' | '招聘完成'
export type CandidateStatus = '待定' | '招聘中' | '已入职' | '已离职' | '淘汰'
export type CandidateSource = 'BOSS直聘' | '拉勾' | '猎聘' | '内推' | '其他'

export interface RecruitmentJob {
  id: string
  title: string
  family: string
  headcount: number
  status: JobStatus
  criteria: string
  profile: string
}

export interface Candidate {
  id: string
  name: string
  phone: string
  jobId: string
  source: CandidateSource
  status: CandidateStatus
  salaryExpect: string
  notes: string
}

export type InterviewForm = '现场' | '视频' | '电话'
export type InterviewStatus = '待进行' | '已完成' | '已取消'
export type InterviewResult = '待定' | '通过' | '不通过'

export interface Interview {
  id: string
  candidateId: string
  round: string
  time: string
  interviewer: string
  form: InterviewForm
  location: string
  durationMin: number
  status: InterviewStatus
  feedback: string
  result: InterviewResult
  nextStep: string
}

// ---------- 待办 ----------

export interface Todo {
  id: string
  title: string
  due: string
  done: boolean
  related: string
  note: string
}

// ---------- 研习室 ----------

export interface TrainingDoc {
  id: string
  title: string
  url: string
  summary: string
  category: string
}

export const DOC_CATEGORIES = ['通用资料', '技术部门知识库', '招聘实战', '其他'] as const

// ---------- 个人成长 ----------

export interface GrowthFavorite {
  id: string
  title: string
  url: string
  note: string
}

// ---------- 设置：AI 供应商 ----------

export type ProviderType = 'openai-chat' | 'openai-responses' | 'gemini' | 'deepseek'

export interface AiProvider {
  id: string
  name: string
  type: ProviderType
  apiKey: string
  enabled: boolean
}

/** 内置 AI 角色：岗位画像分析助手（原文提取自部署版） */
export const JOB_PROFILE_ASSISTANT_PROMPT = `你是一名招聘岗位分析助手。请仅依据用户提供的职位描述（JD）生成结构化岗位画像，不要虚构公司、团队或候选人信息。

输出应包含：
1. 岗位定位与业务价值；
2. 主要职责模块；
3. 必备条件与加分条件；
4. 简历搜索关键词；
5. 胜任力与面试问题；
6. 需要向用人经理确认的问题。

请明确区分 JD 原文事实、合理推断和仍需确认的信息。结果将由用户人工复核后再保存。`

// ---------- 工作区聚合 ----------

export interface WorkspaceState {
  departments: Department[]
  positions: OrgPosition[]
  employees: Employee[]
  cycles: ReviewCycle[]
  reviews: Review[]
  plans: DevPlan[]
  jobs: RecruitmentJob[]
  candidates: Candidate[]
  interviews: Interview[]
  todos: Todo[]
  documents: TrainingDoc[]
  favorites: GrowthFavorite[]
  providers: AiProvider[]
  activeProviderId: string
}

// ---------- 通用选项 ----------

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ['在岗', '骨干', '已离职']
export const JOB_STATUSES: JobStatus[] = ['待开放', '招聘中', '招聘完成']
export const CANDIDATE_STATUSES: CandidateStatus[] = ['待定', '招聘中', '已入职', '已离职', '淘汰']
export const CANDIDATE_SOURCES: CandidateSource[] = ['BOSS直聘', '拉勾', '猎聘', '内推', '其他']
export const INTERVIEW_FORMS: InterviewForm[] = ['现场', '视频', '电话']
export const INTERVIEW_STATUSES: InterviewStatus[] = ['待进行', '已完成', '已取消']
export const INTERVIEW_RESULTS: InterviewResult[] = ['待定', '通过', '不通过']
export const CYCLE_STATUSES: CycleStatus[] = ['待进行', '进行中', '已完成']
export const PROVIDER_TYPES: ProviderType[] = ['openai-chat', 'openai-responses', 'gemini', 'deepseek']

export function newId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ---------- 展示辅助 ----------

export const JOB_STATUS_BADGE: Record<JobStatus, string> = {
  待开放: 'bg-secondary-subtle text-secondary',
  招聘中: 'bg-primary-subtle text-primary',
  招聘完成: 'bg-success-subtle text-success',
}

export const CANDIDATE_STATUS_BADGE: Record<CandidateStatus, string> = {
  待定: 'bg-secondary-subtle text-secondary',
  招聘中: 'bg-primary-subtle text-primary',
  已入职: 'bg-success-subtle text-success',
  已离职: 'bg-dark-subtle text-dark',
  淘汰: 'bg-danger-subtle text-danger',
}

export const EMPLOYEE_STATUS_BADGE: Record<EmployeeStatus, string> = {
  在岗: 'bg-success-subtle text-success',
  骨干: 'bg-primary-subtle text-primary',
  已离职: 'bg-dark-subtle text-dark',
}
