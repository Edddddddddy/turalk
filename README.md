# Turalk

Turalk 是面向二游玩家的实名论坛：后台完成身份核验，前台仅展示社区身份。第一版采用模块化单体，优先保持开发效率和事务一致性，同时为后续服务拆分保留清晰边界。

当前仓库仅包含工程骨架和占位页面，尚未实现注册登录、发帖评论、真实身份核验或治理业务。

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

1. 用户注册登录
2. 实名认证提供商接口抽象
3. 论坛分区、帖子与评论
4. 举报、人工审核与审计闭环
5. 搜索、通知和二游特色功能

完整路线见 [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)，Git 规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。
