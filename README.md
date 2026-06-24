# Turalk

Turalk 是面向二游玩家的实名论坛：后台完成身份核验，前台仅展示社区身份。第一版采用模块化单体，优先保持开发效率和事务一致性，同时为后续服务拆分保留清晰边界。

当前仓库已经具备工程骨架、邮箱注册登录、mock 实名认证 provider、论坛分区读取、基础发帖/帖子详情、评论流程、举报提交和只读审核队列基础能力。真实身份核验供应商、审核处置动作、搜索和通知仍未实现。

## 技术栈

- pnpm monorepo、TypeScript、ESLint、Prettier
- Next.js 16 + React 19 公共 Web
- Vite + React 19 管理后台
- NestJS 11 + Prisma 6 API
- PostgreSQL、Redis、OpenSearch
- Docker Compose 本地基础服务

## 目录结构

```text
apps/
  api/        NestJS 模块化单体 API
  web/        Next.js 公共社区
  admin/      Vite 管理后台
packages/
  config/     共享配置
  shared/     通用工具
  types/      前后端共享 DTO 类型
infra/docker/ 本地基础服务
docs/         架构、安全与开发文档
```

## 环境要求

- 在 WSL Linux 文件系统中开发，推荐路径 `~/projects/turalk`
- Node.js 24 LTS（最低 `22.12`）
- pnpm 11（通过 Corepack 管理）
- Docker Desktop，并为当前 WSL 发行版启用集成

不要从 `/mnt/c`、`/mnt/d`、`/mnt/e` 或 Windows 用户目录运行项目。

## 本地启动

```bash
cd ~/projects/turalk
corepack enable
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm dev
```

启动前请为 `.env` 中的 `JWT_ACCESS_SECRET`、`JWT_REFRESH_SECRET` 和 `PASSWORD_HASH_PEPPER` 分别生成至少 32 字符的独立随机值。不要复用或提交这些值。

默认地址：

- Web: <http://localhost:3000>
- API health: <http://localhost:3001/api/health>
- Admin: <http://localhost:3002>

也可以单独启动应用：

```bash
pnpm --filter @turalk/web dev
pnpm --filter @turalk/api dev
pnpm --filter @turalk/admin dev
```

Web 端 API 地址集中配置为：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

仓库仍兼容早期的 `NEXT_PUBLIC_API_URL`，但新配置优先使用 `NEXT_PUBLIC_API_BASE_URL`。

## Docker 启动

先确认 `.env` 中的本地数据库密码已经修改，然后运行：

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
docker compose --env-file .env -f infra/docker/docker-compose.yml ps
```

停止服务但保留数据：

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml down
```

## 数据库迁移

首次启动 PostgreSQL 后执行：

```bash
DATABASE_URL="postgresql://turalk:change-me-for-local-development@localhost:5432/turalk?schema=public" \
  pnpm --filter @turalk/api exec prisma migrate deploy
pnpm prisma:generate
pnpm prisma:seed
```

本地开发生成新 migration 时使用 `pnpm --filter @turalk/api prisma:migrate:dev --name <migration_name>`。不要执行会清空数据的 reset 命令，除非这是明确的本地一次性测试库。

## Auth 本地验证

API 启动后可用 `example.com` 测试邮箱验证基础流程：

1. `POST http://localhost:3001/api/auth/register`
2. `POST http://localhost:3001/api/auth/login`
3. `GET http://localhost:3001/api/auth/me`
4. `POST http://localhost:3001/api/auth/refresh`
5. `POST http://localhost:3001/api/auth/logout`

响应不得包含 `passwordHash` 或 `refreshTokenHash`。当前 auth 限流是单实例内存限流，生产部署前需要 Redis 或网关级限流。

Web + API 手动验证：

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d postgres redis
DATABASE_URL="postgresql://turalk:change-me-for-local-development@localhost:5432/turalk?schema=public" \
  pnpm --filter @turalk/api exec prisma migrate deploy
pnpm --filter @turalk/api dev
pnpm --filter @turalk/web dev
```

打开 <http://localhost:3000/auth/register>，使用 `auth-ui-test@example.com` 和测试昵称注册，随后验证登录、刷新页面保持登录、访问 <http://localhost:3000/profile>、退出登录。不要使用真实邮箱、手机号或身份证数据。

实名认证 mock 验证：

1. 登录 Web。
2. 打开 <http://localhost:3000/identity>。
3. 点击“开始模拟核验”。
4. 点击“模拟通过”或“模拟拒绝”。

当前流程只使用 mock provider，不接真实供应商，不采集身份证号或身份证照片。真实 provider 接入前需要完成回调验签、幂等、防重放、供应商响应脱敏和合规评审。

论坛核心验证：

1. 执行 `pnpm prisma:seed` 初始化默认分区。
2. 登录 Web 并在 <http://localhost:3000/identity> 完成 mock 通过。
3. 打开 <http://localhost:3000/forums>。
4. 选择分区、填写标题和正文并发布。
5. 点击帖子进入详情页。

发帖接口会在服务端校验登录态和实名状态。前台只展示公开昵称，不返回内部用户 ID 或实名字段。

评论系统验证：

1. 按论坛核心验证步骤创建或打开一个帖子详情页。
2. 在帖子详情页评论区发布顶层评论。
3. 点击“回复”发布一条楼中楼回复。
4. 删除自己发布的评论，确认评论从列表中消失。

评论接口同样会在服务端校验登录态和实名状态。当前只允许作者本人软删除自己的可见评论。

举报基础流验证：

1. 登录 Web。
2. 打开任意帖子详情页。
3. 点击帖子或评论旁边的“举报”。
4. 选择原因并提交。
5. 再次举报同一目标时，应提示已有未处理举报。

举报同样要求登录并完成 mock 实名。当前仅支持举报帖子和评论；用户举报、审核后台和处置动作将在权限模型梳理后实现。举报补充说明中不要填写身份证号、手机号、真实邮箱或 token。

审核队列本地验证：

1. 通过注册/登录创建一个测试管理员账号。
2. 在本地数据库中为该用户插入 active `AdminRoleAssignment`，角色使用 `MODERATOR` 或 `ADMIN`。
3. 使用该账号 access token 请求 `GET http://localhost:3001/api/admin/reports?status=OPEN`。
4. 确认响应只包含公开用户 ID、昵称和头像，不包含邮箱、实名 hash、provider token、密码 hash 或 refresh token hash。

当前没有公开的管理员授予接口，不要把管理员 ID 或密钥硬编码进代码。审核队列仅为只读；隐藏内容、处罚、封禁和申诉将在后续迭代设计后实现。

## 质量检查

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm prisma:validate
```

## 后续计划

1. 审核动作状态机、管理后台 UI 与处置动作
2. 搜索、通知和二游特色功能

完整路线见 [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)，Git 规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。
