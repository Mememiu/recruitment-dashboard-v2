# hr.pocketbay.app 部署版分析清单

> 归档日期：2026-10-22
> 来源：https://hr.pocketbay.app/ （pocketbay 部署，冷启动约 20s，首次请求返回 204/唤醒页）
> 背景：这是 recruitment-dashboard（GitHub v1）之后的未公开新版本，用户本地源码已丢失，**此归档是该版本前端产物的唯一遗存**。

## 技术栈（从产物推断）

- **前端**：React SPA（`#root` 容器、react-dom），Vite 打包，单 chunk（792KB JS + 322KB CSS），主题色 `#f5f6f3`（米白暖色，与 v1 紫色系不同）
- **后端**：真实服务端（非纯前端），带工作台账号体系
- **AI**：多供应商接入，可配置 API Key（bundle 内含 openai-chat / openai-responses / gemini / deepseek 协议标识 + "显示密钥/隐藏密钥" UI）

## API 端点清单（前端 bundle 内提取）

| 端点 | 用途推断 |
| --- | --- |
| `/api/workbench-auth/{login,logout,password,setup,status}` | 工作台账号：首次 setup、登录、改密 |
| `/api/auth/` | 认证 |
| `/api/health` | 健康检查（未登录返回"请先登录工作台"） |
| `/api/accounts` | 账号管理 |
| `/api/jobs`、`/api/jobs/apply`、`/api/jobs/generate-profile`、`/api/jobs/preview` | 岗位管理 + AI 生成岗位画像 + 投递 |
| `/api/talent`、`/api/talent/resume-imports` | 人才库 + 简历导入 |
| `/api/organization`、`/api/organization-live`、`/api/organization/ai/assist` | 组织架构 + AI 辅助 |
| `/api/job-profile-role` | 岗位画像-角色关联 |
| `/api/todos` | 待办 |
| `/api/training-documents` | 培训/学习资料（研习室） |
| `/api/growth-favorites` | 个人成长-收藏 |
| `/api/ai/chat`、`/api/ai/providers` | AI 对话 + 供应商配置 |
| `/api/workspace` | 工作台配置 |

## 功能模块（按 bundle 内字符串频次归纳）

1. **招聘**（"招聘"58 次）：岗位（岗位族/别名/编制/画像）、候选人（投递、简历导入、下载原文件）、面试安排（地点/会议链接）、招聘数据刷新
2. **组织与人才**（39 面试/29 画像）：部门树、盘点周期、人才画像、全员/骨干/已离职状态
3. **证据式人才评估**（"证据"35 次）：评估背景、每条证据必填、"证据不足→继续取证"、"确认前补全"、业务反馈、关联材料、失配分析、评估评分（已评分/待评估）、AI"问问 AI"
4. **培养与发展**：培养任务/目标/对象、发展方向/差距/潜力/准备度、辅导人、跟进记录、验收标准、逾期跟踪
5. **个人成长**：个人总览/待办、成长合集、收藏（growth-favorites）
6. **研习室**：学习资料（图文/链接）、培训文档
7. **待办中心**：今天、个人待办
8. **设置**：AI 供应商（Key 管理、刷新状态）、账号密码

## 与 v1（GitHub 版）的关键差异

- v1 彭蕾四维评估（猎犬/老黄牛/野狗/小白兔）在新版中**已不存在**（bundle 内 0 次出现），换成了"证据式评估 + 画像 + 发展潜力"体系
- 数据从 localStorage 变为服务端持久化（多端可用）
- 新增 AI 能力（对话、生成岗位画像、评估辅助）
- 纯前端 → 全栈

## 文件清单

- `index.html`（449B，SPA 壳）
- `assets/index-IXtDwZQ_.js`（792KB，压缩产物，含全部前端逻辑）
- `assets/index-BE88BA1f.css`（322KB）
- `favicon.ico`（4KB）

## 注意

- 本归档是**压缩产物**而非源码，但包含全部 UI 文案、数据结构、API 契约，可作为逆向重建的完整蓝本
- **后端与数据只存在于 pocketbay**，此归档不含；账号体系保护下无法匿名导出，建议尽快在应用内登录并做数据导出/备份
