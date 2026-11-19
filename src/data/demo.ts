import type { WorkspaceState } from '@/types/hr'

/** 演示种子数据：部署版实例为空，这里补一套小而全的样例便于演示各模块 */
export function demoWorkspace(): WorkspaceState {
  return {
    departments: [
      { id: 'dep-1', name: '研发中心', nameEn: 'R&D Center', duty: '产品与技术研发', manager: '王建国' },
      { id: 'dep-2', name: '产品部', nameEn: 'Product', duty: '产品规划与设计', manager: '林晓' },
      { id: 'dep-3', name: '人力资源部', nameEn: 'HR', duty: '招聘、盘点与组织发展', manager: '陈静' },
    ],
    positions: [
      { id: 'pos-1', name: '前端开发工程师', alias: 'FE', family: '软件开发', headcount: 3, departmentId: 'dep-1' },
      { id: 'pos-2', name: '后端开发工程师', alias: 'BE', family: '软件开发', headcount: 2, departmentId: 'dep-1' },
      { id: 'pos-3', name: '产品经理', alias: 'PM', family: '产品设计', headcount: 1, departmentId: 'dep-2' },
      { id: 'pos-4', name: '招聘专员', alias: 'HR Recruit', family: '人力资源', headcount: 1, departmentId: 'dep-3' },
    ],
    employees: [
      { id: 'emp-1', name: '王建国', departmentId: 'dep-1', positionId: 'pos-2', status: '骨干', performance: 'A', willingness: '高', joinDate: '2021-03-15', location: '科技园' },
      { id: 'emp-2', name: '刘思远', departmentId: 'dep-1', positionId: 'pos-1', status: '在岗', performance: 'B', willingness: '中', joinDate: '2023-07-01', location: '科技园' },
      { id: 'emp-3', name: '林晓', departmentId: 'dep-2', positionId: 'pos-3', status: '骨干', performance: 'A', willingness: '高', joinDate: '2022-01-10', location: '职场区' },
      { id: 'emp-4', name: '陈静', departmentId: 'dep-3', positionId: 'pos-4', status: '在岗', performance: 'B', willingness: '高', joinDate: '2024-05-06', location: '职场区' },
    ],
    cycles: [
      { id: 'cyc-1', name: '2026 H2 人才盘点', deadline: '2026-12-15', status: '进行中' },
    ],
    reviews: [
      {
        id: 'rev-1',
        cycleId: 'cyc-1',
        employeeId: 'emp-2',
        background: '候选晋升高级工程师，需评估技术深度与协作影响。',
        evidence: [
          { id: 'ev-1', content: '主导重构构建流水线，发布耗时从 18 分钟降到 6 分钟', material: 'CI 仪表盘截图', askWho: '王建国' },
          { id: 'ev-2', content: '连续两个季度绩效 B 以上，无线上事故', material: '绩效系统记录', askWho: '直接主管' },
        ],
        score: 78,
        businessFeedback: '业务方认可其交付稳定性，跨团队推动力仍需观察。',
        direction: '技术深耕 + 项目推动',
        gap: '跨团队影响力、方案评审表达',
        potential: '中',
        readiness: '1-2年',
        confirmed: false,
        updatedAt: '2026-10-20',
      },
    ],
    plans: [
      {
        id: 'plan-1',
        name: '刘思远：技术影响力提升',
        employeeId: 'emp-2',
        goal: '独立主导一次跨团队技术方案评审',
        coach: '王建国',
        successCriteria: '方案被采纳并在两个团队落地',
        support: '每月一次评审陪练 + 预算参加技术大会',
        deadline: '2027-03-31',
        followUps: ['10 月：完成方案初稿', '11 月：内部宣讲一次'],
        verified: false,
      },
    ],
    jobs: [
      { id: 'job-1', title: '高级前端工程师', family: '软件开发', headcount: 1, status: '招聘中', criteria: '5 年以上经验，有大型 SPA 架构经验', profile: '' },
      { id: 'job-2', title: '数据分析师', family: '数据', headcount: 1, status: '待开放', criteria: '', profile: '' },
    ],
    candidates: [
      { id: 'can-1', name: '周明', phone: '13900001111', jobId: 'job-1', source: 'BOSS直聘', status: '招聘中', salaryExpect: '30-35K', notes: '有跨端经验' },
      { id: 'can-2', name: '吴悦', phone: '13900002222', jobId: 'job-1', source: '内推', status: '待定', salaryExpect: '28-32K', notes: '' },
      { id: 'can-3', name: '郑凯', phone: '13900003333', jobId: 'job-2', source: '猎聘', status: '淘汰', salaryExpect: '25K', notes: 'SQL 强，业务理解弱' },
    ],
    interviews: [
      {
        id: 'itv-1',
        candidateId: 'can-1',
        round: '一面',
        time: '2026-10-25 14:00',
        interviewer: '王建国',
        form: '视频',
        location: 'https://meeting.example.com/abc',
        durationMin: 60,
        status: '待进行',
        feedback: '',
        result: '待定',
        nextStep: '',
      },
    ],
    todos: [
      { id: 'todo-1', title: '安排周明一面', due: '2026-10-23', done: false, related: '候选人 周明', note: '' },
      { id: 'todo-2', title: '完成刘思远盘点证据补充', due: '2026-10-22', done: false, related: '评估 刘思远', note: '还缺一条业务侧证据' },
      { id: 'todo-3', title: '发布 H2 盘点启动通知', due: '2026-10-18', done: true, related: '盘点周期', note: '' },
    ],
    documents: [
      { id: 'doc-1', title: '面试评估表模板', url: 'https://example.com/docs/interview-template', summary: '结构化面试打分与反馈模板', category: '招聘实战' },
      { id: 'doc-2', title: '前端面试题库（进阶）', url: 'https://example.com/docs/fe-questions', summary: '覆盖工程化、性能与架构', category: '技术部门知识库' },
      { id: 'doc-3', title: '新员工入职清单', url: 'https://example.com/docs/onboarding', summary: '入职首周必办事项', category: '通用资料' },
    ],
    favorites: [
      { id: 'fav-1', title: '如何做证据式人才评估', url: 'https://example.com/article/evidence-review', note: '盘点方法参考' },
    ],
    providers: [],
    activeProviderId: '',
  }
}
