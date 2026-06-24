# API Contract

## 基础约定

- 全局前缀：`/api`。
- JSON 字段使用 `camelCase`，时间使用 ISO 8601 UTC 字符串。
- 新业务接口使用统一 envelope；健康检查可保持轻量 `{ "status": "ok" }`。

成功响应：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

失败响应：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Unable to authenticate",
    "details": null,
    "requestId": "request-id"
  }
}
```

不要在错误响应中暴露堆栈、数据库错误、凭据是否存在或实名 provider 原始响应。

## 错误码

- 同时使用正确 HTTP 状态与稳定业务码。
- 业务码采用 `DOMAIN_REASON` 大写格式，例如 `VALIDATION_FAILED`、`AUTH_REQUIRED`、`FORUM_NOT_FOUND`。
- `400` 验证/请求错误；`401` 未认证；`403` 无权限；`404` 不存在；`409` 状态冲突；`429` 限流；`500` 未预期错误。
- 字段校验错误可在 `details.fields` 返回安全、结构化信息。

## 分页

内容流优先 cursor 分页：

```json
{
  "items": [],
  "nextCursor": null
}
```

查询参数使用 `cursor`、`limit`；`limit` 必须有默认值和上限。客户端通过 `nextCursor !== null` 判断是否还有下一页。管理后台需要跳页时可使用 `page`、`pageSize`，响应同时返回 `total`。

## 鉴权

- API token 使用 `Authorization: Bearer <access-token>`。
- 若后续采用 HttpOnly cookie session，必须定义 SameSite、Secure、CSRF 和跨域策略。
- 公开身份与真实身份权限分离；服务端必须执行授权，前端隐藏按钮不构成授权。

## 请求验证

- NestJS 全局 `ValidationPipe` 保持 whitelist、transform 和禁止未知字段。
- 每个写接口使用显式 DTO 与 `class-validator`。
- 限制字符串长度、分页上限、上传类型/大小和可接受枚举。
- DTO 不接受由服务端确定的 `userId`、管理员身份或审计 actor。

## 审计日志触发条件

管理员授权变更、身份查询/状态变更、账号封禁、内容隐藏/恢复、举报处置、敏感导出和安全配置变更必须写入 `AuditLog`。记录 actor、动作、目标、结果、request ID 和脱敏元数据；不记录秘密或身份证明文。

## Auth API 计划

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

上述路由已实现后端基础版本。除注册返回 `201` 外，其余写接口成功返回 `200`。`logout` 和 `me` 需要 access token Bearer 鉴权。

### Register

```json
{
  "email": "player@example.test",
  "password": "example123",
  "nickname": "旅行者"
}
```

邮箱在写入前去除首尾空格并转小写。密码长度为 8-128，且至少包含一个字母和一个数字；昵称长度为 2-24。成功响应的 `data` 包含 `accessToken`、`refreshToken` 和公开 `user`，不包含密码或 token hash。

### Login

```json
{
  "email": "player@example.test",
  "password": "example123"
}
```

账号不存在、密码错误或账号状态不可登录时统一返回 `AUTH_INVALID_CREDENTIALS`，不透露具体原因。

### Refresh

```json
{
  "refreshToken": "<refresh-token>"
}
```

刷新采用 rotation：成功后返回新的 access/refresh token pair，并使旧 refresh token 失效。数据库只保存 refresh token 的 hash。

### Auth Rate Limit

`register`、`login`、`refresh` 已接入单实例内存限流，默认配置：

- `AUTH_REGISTER_TTL_SECONDS=60`、`AUTH_REGISTER_LIMIT=5`
- `AUTH_LOGIN_TTL_SECONDS=60`、`AUTH_LOGIN_LIMIT=10`
- `AUTH_REFRESH_TTL_SECONDS=60`、`AUTH_REFRESH_LIMIT=20`

命中限流返回 HTTP `429`，错误 envelope 使用 `RATE_LIMITED`。当前限流不依赖 Redis，也不跨实例共享；生产部署前需要在网关或 Redis-backed storage 上补充分布式限流。

### Logout

请求头：`Authorization: Bearer <access-token>`。成功后清除当前用户保存的 refresh token hash。

### Me

请求头：`Authorization: Bearer <access-token>`。只返回公开 ID、昵称、头像和账号状态，不返回邮箱、内部用户 ID 或任何凭据字段。

前端当前通过 `NEXT_PUBLIC_API_BASE_URL` 或兼容的 `NEXT_PUBLIC_API_URL` 读取 API base URL。Web 端只消费统一 envelope 中的 `data`，错误时使用 `error.code` 和 `error.message` 做用户可读提示。

### 当前限制

- 当前仅支持邮箱密码认证，不支持手机号、短信验证码、OAuth 或第三方登录。
- 当前 refresh token 采用单会话槽位，后一次登录会使前一次 refresh token 失效。
- Logout 会撤销 refresh token，但已签发的 access token 仍可使用至过期（默认最长 15 分钟）。
- 当前已有单实例基础限流；分布式限流尚未实现。

### Auth Smoke Test

本地 PostgreSQL 可用时，推荐在 migration 后用测试邮箱跑最小真实数据库流程：

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/auth/me`
4. `POST /api/auth/refresh`
5. `POST /api/auth/logout`

检查响应中不得出现 `passwordHash` 或 `refreshTokenHash`，并确认数据库中的 `refreshTokenHash` 是 64 位 hex hash，而不是明文 refresh token。测试数据使用 `example.com` 邮箱，不使用真实个人信息。

## Identity API

当前仅实现 mock provider 抽象，用于打通后端实名状态机和前端联调。不接入真实供应商，不采集身份证号、身份证照片或生物识别原文。

所有 identity 路由都需要 `Authorization: Bearer <access-token>`。

### Get Status

`GET /api/identity/status`

返回：

```json
{
  "success": true,
  "data": {
    "provider": "mock",
    "status": "PENDING",
    "verifiedAt": null,
    "expiresAt": null,
    "rejectionReasonCode": null,
    "updatedAt": "2026-06-23T00:00:00.000Z"
  },
  "error": null
}
```

未开始时 `provider`、时间字段为 `null`，`status` 为 `NOT_STARTED`。响应不得包含 `providerSubjectToken`、`identityHash` 或任何实名原文。

### Start Mock Verification

`POST /api/identity/mock/start`

```json
{
  "provider": "mock",
  "consentAccepted": true
}
```

服务端生成 mock provider token 和非 PII hash，并保存 `PENDING` 状态。该 token/hash 只进入数据库，不返回前端。

### Complete Mock Verification

`POST /api/identity/mock/complete`

```json
{
  "outcome": "verified"
}
```

`outcome` 可为 `verified` 或 `rejected`。该接口仅用于本地/开发阶段模拟 provider 回调；真实 provider 接入时必须加入回调验签、幂等键、供应商响应脱敏和独立审计。

## Forum Core API

当前实现论坛分区读取、帖子列表、帖子详情和基础发帖。评论拆到 Comments API；仍不实现举报审核、搜索索引、图片上传或富文本。

### List Forums

`GET /api/forums`

公开接口。只返回启用中的分区，并按 `position` 排序。

```json
{
  "success": true,
  "data": [
    {
      "id": "forum-id",
      "slug": "general",
      "name": "综合讨论",
      "description": "闲聊与综合话题",
      "position": 0,
      "threadCount": 12
    }
  ],
  "error": null
}
```

### List Threads

`GET /api/threads?forumSlug=general&limit=20&cursor=thread-id`

公开接口。只返回 `PUBLISHED` 且未软删除的帖子，按创建时间倒序。响应中的作者只包含公开昵称、公开用户 ID 和头像。

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "thread-id",
        "title": "活动剧情讨论",
        "contentPreview": "正文摘要",
        "status": "PUBLISHED",
        "forum": {
          "slug": "general",
          "name": "综合讨论"
        },
        "author": {
          "id": "public-user-id",
          "displayName": "旅行者",
          "avatarUrl": null
        },
        "commentCount": 0,
        "createdAt": "2026-06-23T00:00:00.000Z",
        "updatedAt": "2026-06-23T00:00:00.000Z"
      }
    ],
    "nextCursor": null
  },
  "error": null
}
```

### Get Thread

`GET /api/threads/:threadId`

公开接口。不可见或不存在的帖子返回 `THREAD_NOT_FOUND`。

### Create Thread

`POST /api/threads`

需要 `Authorization: Bearer <access-token>`，且用户实名状态必须为 `VERIFIED`。

```json
{
  "forumSlug": "general",
  "title": "活动剧情讨论",
  "content": "帖子正文"
}
```

成功返回 `201` 和帖子详情，并写入 `THREAD_CREATED` 审计事件。未登录返回 `AUTH_REQUIRED`，未实名返回 `THREAD_REQUIRES_VERIFIED_IDENTITY`，分区不存在或停用返回 `FORUM_NOT_FOUND`。

## Comments API

当前实现帖子评论、楼中楼回复、cursor 分页和作者本人软删除。评论内容按普通文本处理；前端使用 React 默认转义渲染，不接富文本或图片上传。

### List Comments

`GET /api/comments?threadId=thread-id&limit=50&cursor=comment-id`

公开接口。只返回 `PUBLISHED` 且未软删除的评论，按创建时间升序。响应中的作者只包含公开昵称、公开用户 ID 和头像。

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "comment-id",
        "threadId": "thread-id",
        "parentId": null,
        "content": "评论正文",
        "status": "PUBLISHED",
        "author": {
          "id": "public-user-id",
          "displayName": "旅行者",
          "avatarUrl": null
        },
        "createdAt": "2026-06-24T00:00:00.000Z",
        "updatedAt": "2026-06-24T00:00:00.000Z"
      }
    ],
    "nextCursor": null
  },
  "error": null
}
```

帖子不存在或不可见返回 `THREAD_NOT_FOUND`。

### Create Comment

`POST /api/comments`

需要 `Authorization: Bearer <access-token>`，且用户实名状态必须为 `VERIFIED`。

```json
{
  "threadId": "thread-id",
  "parentId": "parent-comment-id",
  "content": "评论正文"
}
```

`parentId` 可省略；提供时必须是同一帖子下仍可见的评论。成功返回 `201` 和评论详情，并写入 `COMMENT_CREATED` 审计事件。未实名返回 `COMMENT_REQUIRES_VERIFIED_IDENTITY`，父评论不可见或跨帖返回 `COMMENT_PARENT_NOT_FOUND`。

### Delete Comment

`DELETE /api/comments/:commentId`

需要 `Authorization: Bearer <access-token>`。当前只允许作者本人软删除自己的可见评论，成功返回：

```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "error": null
}
```

删除操作会将评论标记为 `DELETED` 并设置 `deletedAt`，同时写入 `COMMENT_DELETED` 审计事件。评论不存在、不可见或不是当前用户发布时统一返回 `COMMENT_NOT_FOUND`。
