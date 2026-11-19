# hr.pocketbay.app 数据模型逆向记录

> 2026-10-22 通过 demo 账号（owner_demo，凭证由 /api/workbench-auth/status 公开返回）登录后逐个探测 API 获得。
> 注意：演示实例数据为空（datasetMode: "live"，所有数组为空），以下为 API 返回的**结构骨架** + bundle 内 UI 文案还原的**字段语义**。

## API 返回结构（实测）

```jsonc
// /api/organization 与 /api/organization-live 相同
{ "data": {
    "version": 1, "revision": 0, "datasetMode": "live",
    "departments": [], "positions": [], "employees": [], "plans": [],
    "recruitmentJobs": [], "cycles": [], "reviews": [],
    "diagnostics": [], "diagnosticProjects": []
  }, "demo": false }

// /api/talent
{ "talent": { "version": 1, "revision": 0, "candidates": [], "interviews": [] }, "warning": "" }

// /api/jobs            → { "jobs": [] }
// /api/todos           →（GET 返回 SPA 壳，疑为 POST/其他方法）
// /api/training-documents → { "documents": [] }
// /api/ai/providers    → { "ai": { "activeProviderId": "", "providers": [], "deletedBuiltInProviders": [] } }
// /api/workspace       → { "workspace": { "schemaVersion": "1.0", "purchases": [], "policies": [], "todos": [], "growthFavorites": [] }, "summary": {...} }
// /api/accounts        → [{ id, username, displayName, role(superadmin/admin/user), enabled, createdAt }]
```

## 字段语义（bundle UI 标签还原）

| 实体 | 字段 |
| --- | --- |
| Department | 部门名称、英文名称、部门职责、负责人（管理领导） |
| Position | 岗位名称、岗位别名、岗位族、岗位编制、所属部门 |
| Employee | 员工姓名、所属部门、所属岗位、员工状态（全员/骨干/已离职）、绩效等级、员工意愿、入职日期、工作地点 |
| Cycle（盘点周期） | 计划名称、资料截止日期、状态（待进行/进行中/已完成） |
| Review（人才评估） | 评估员工、评估背景、证据条目、评分（0–100）、业务反馈、发展方向、发展差距、发展潜力、发展准备度 |
| Evidence | 证据内容（每条必填）、关联材料、还要问谁、核对什么；状态：证据不足→继续取证、确认前补全 |
| Plan（培养计划） | 计告名称、培养对象、培养目标、辅导人、成功标准、支持机制、截止日期、跟进记录、验收标准（具体行动与验收结果） |
| RecruitmentJob | 岗位名称、岗位族、状态（待开放/招聘中/招聘完成）、筛选标准、岗位画像（AI 生成） |
| Candidate | 姓名*、联系电话、应聘岗位*、来源、状态（待定/招聘中/已入职/已离职/淘汰）、期望月薪（税前/月）、简历（导入/下载原文件/放大缩小预览） |
| Interview | 候选人*、面试轮次、面试时间*、面试官*、面试形式（现场/视频/电话）、地点/会议链接、时长（分钟）、面试状态、面试反馈、面试结果、下一步安排 |
| Todo | 标题、截止日期、状态（待进行/已完成/已逾期/今天）、关联对象、备注 |
| TrainingDocument（研习室） | 标题、学习资料链接、一句话概括、分类（通用资料/技术部门知识库/招聘实战…）、资料库根目录 |
| GrowthFavorite | 收藏推荐：标题、链接、备注 |
| AiProvider | providerId、providerName、类型（openai-chat / openai-responses / gemini / deepseek）、API Key（显示/隐藏密钥）、启用状态；activeProviderId 选中 |
| Diagnostic | 本次诊断对象、诊断部门、诊断层级、调查维度、调查问题、调查局限与待补材料、相互影响的维度（至少2个） |

## 内置 AI 角色：岗位画像分析助手（原文提取）

```
你是一名招聘岗位分析助手。请仅依据用户提供的职位描述（JD）生成结构化岗位画像，不要虚构公司、团队或候选人信息。

输出应包含：
1. 岗位定位与业务价值；
2. 主要职责模块；
3. 必备条件与加分条件；
4. 简历搜索关键词；
5. 胜任力与面试问题；
6. 需要向用人经理确认的问题。

请明确区分 JD 原文事实、合理推断和仍需确认的信息。结果将由用户人工复核后再保存。
```

## 其他发现

- 旧截图中的 demo_recruiter / demo_researcher 已失效；当前公开 demo 账号由 status 接口返回：owner_demo / admin_demo / user_demo（随机密码，会轮换）
- 评估体系确认为"证据式"：确认前必填补全、证据不足时要求"继续取证"，与 v1 彭蕾四维完全不同
- 有多账号体系（multiAccount: true）与角色（superadmin/admin/user）
