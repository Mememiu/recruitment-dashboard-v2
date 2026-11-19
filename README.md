# HR工作室 v2

基于 **Vue 3 + Vite + TypeScript + Pinia** 的招聘与人才管理工作台。当前为纯前端形态，数据存 localStorage。

GitHub：https://github.com/Mememiu/recruitment-dashboard-v2

## 功能模块

| 模块 | 能力 |
| --- | --- |
| 总览 | 招聘/盘点 KPI、今日待办、逾期提醒、待确认评估 |
| 招聘 | 岗位（岗位族/编制/状态流转/画像模板生成）、候选人（待定→招聘中→已入职/淘汰）、面试安排与反馈 |
| 组织与人才 | 部门与岗位 CRUD、员工名册（状态/绩效/意愿）、盘点周期、**证据式人才评估**（证据条目 + 证据不足警示 + 确认前补全校验 + 0–100 评分 + 发展潜力/准备度）、培养计划（辅导人/跟进记录/验收/逾期） |
| 研习室 | 学习资料库（分类：通用/技术知识库/招聘实战） |
| 个人成长 | 成长收藏 |
| 待办 | 今天/待进行/已完成/已逾期分组，关联对象 |
| 设置 | AI 供应商配置（openai-chat / openai-responses / gemini / deepseek，本地保存）、内置岗位画像分析助手提示词、数据导出/重置/清空 |

## 当前形态与限制

- 纯前端：无后端、无多账号（登录 admin/123456），数据存 localStorage（key: `hr_workspace_v2`）
- AI 调用未接后端：供应商配置可保存，"生成画像模板"使用本地六段结构模板代替
- 附带一套演示种子数据，便于直接体验各模块

## 开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 类型检查 + 产出 dist/
npm run preview
```

## 目录

```
src/
├── layouts/        # MainLayout：侧边导航外壳
├── pages/          # 总览/招聘/组织与人才/研习室/个人成长/待办/设置/登录
├── components/     # HrModal 通用弹窗 / EmptyState
├── stores/         # workspace：全域状态 + localStorage 持久化
├── data/           # 演示种子数据
├── types/          # hr.ts：领域模型
└── router/         # 路由 + 登录守卫
```

## 后续方向

- 接后端（Node/Express 或 CloudBase）恢复多账号、服务端持久化与真实 AI 调用
- 简历导入解析、Offer 管理、诊断（六盒）模块
