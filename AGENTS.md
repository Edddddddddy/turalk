# Project Overview

- Turalk 是面向二游玩家的实名论坛：后台实名，前台匿名。
- 不做机械敏感词拦截；必须保留举报、人工复核、违法内容处置和审计日志。
- 前期采用模块化单体，保持清晰模块边界，为未来拆分微服务做准备。

# Repository Layout

- `apps/web`：用户前台。
- `apps/admin`：管理后台。
- `apps/api`：NestJS 后端。
- `packages/types`：共享 TypeScript 类型。
- `packages/config`：共享配置。
- `packages/shared`：通用工具。
- `docs`：架构和流程文档。
- `infra/docker`：本地基础设施。

# Hard Rules

- 不提交 `.env`、密钥、真实身份证数据、真实手机号、真实邮箱、数据库 dump 或 `node_modules`。
- 不保存身份证号明文、身份证照片或生物识别原文。
- 实名认证只保存 provider token、hash、状态和时间；管理员默认不能查看真实身份。
- 所有敏感操作必须预留 `AuditLog`。
- 无明确需求时不引入大型依赖；一次只实现一个聚焦功能。
- 不批量修改与任务无关的文件，不擅自改变既定架构。
- 不绕过 TypeScript、ESLint 或 Prisma 校验。
- 页面组件不承载业务逻辑；使用 `features`、service、API client 或后端模块分层。

# Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Format: `pnpm format`; check: `pnpm format:check`
- Typecheck: `pnpm typecheck`
- Prisma validate: `pnpm prisma:validate`
- Prisma generate: `pnpm prisma:generate`
- API health: start API, then `curl http://localhost:3001/api/health`

# Definition of Done

- 总结新增和修改的文件。
- 明确说明是否修改数据库 schema、是否需要 migration。
- 运行与改动相关的 lint、typecheck、format、build 和 Prisma 校验。
- Docker 或环境阻止命令时，明确写出未执行项和原因。
- 输出风险说明和一个聚焦的下一步建议。
