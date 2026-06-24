# Development Plan

## 第 1 次迭代：项目初始化

建立 pnpm monorepo、NestJS API、Next.js Web、React Admin、Prisma schema、Docker Compose、质量工具与基础文档。验收标准是依赖可安装、项目可构建、schema 与 Compose 配置可验证。

## 第 2 次迭代：用户注册登录后端

**已完成。** Backend foundation complete：已实现邮箱注册登录、Argon2id 密码哈希、JWT access/refresh token、refresh token 轮换与 hash 存储、登出、`/auth/me`、账号状态检查和最小审计记录。

Migration/test/rate-limit hardening complete：已补充 Prisma baseline 与 auth 增量 migration、PasswordService/TokenService/AuthService 单元测试、auth 基础限流和真实 PostgreSQL auth smoke test。

本次不实现手机号、短信验证码、OAuth、第三方登录、前端表单或 Redis 分布式限流。生产前仍需补充更严格的多实例限流、持久化测试环境与 CI。

## 第 2.5 次迭代：用户注册登录前端

**已完成。** 实现 Web 端登录、注册、登出、当前用户读取、基础页面保护、导航栏认证状态和集中式 API client/token storage。

当前 token 临时存储在浏览器 `localStorage`，仅用于开发阶段 MVP。生产前需要迁移到 httpOnly secure cookie + CSRF 防护或更严格的 session 方案。

## 第 3 次迭代：实名认证接口抽象

**已完成。** 定义 identity provider 接口与模拟提供商，打通实名状态查询、mock start/complete、最小审计和前端说明页联调。只保存 hash、provider token 和核验结果，不接入生产供应商或真实证件测试数据。

## 第 4 次迭代：论坛分区与发帖

**已完成。** 实现分区查询、默认分区 seed、帖子创建与读取、内容状态、软删除可见性、cursor 分页和公开用户展示。发帖需要登录且 mock 实名状态为 `VERIFIED`，并记录最小 `THREAD_CREATED` 审计事件。

本次不实现评论、举报审核、搜索索引、复杂富文本、图片上传或管理员分区管理。

## 第 5 次迭代：评论系统

**当前迭代。** 实现帖子评论、楼中楼回复、cursor 分页、作者本人软删除、公开用户展示和最小审计事件。评论需要登录且 mock 实名状态为 `VERIFIED`。

本次不实现通知事件、举报审核、复杂折叠策略、富文本、图片上传或管理员删除。

## 第 6 次迭代：举报与审核后台

实现举报状态机、审核队列、处置动作、管理员 RBAC、审计记录和最小可用申诉扩展点。

## 第 7 次迭代：搜索与通知

通过 outbox 异步写入 OpenSearch，实现可见性复核；加入站内通知、已读状态和失败重试。

## 第 8 次迭代：二游特色功能

基于真实用户需求选择角色资料、配队讨论、攻略版本标记、抽卡记录或活动日历等功能。每项功能独立评估隐私、版权和社区治理风险。
