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
  "pageInfo": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

查询参数使用 `cursor`、`limit`；`limit` 必须有默认值和上限。管理后台需要跳页时可使用 `page`、`pageSize`，响应同时返回 `total`。

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

这些路由目前仅为契约计划，尚未实现。
