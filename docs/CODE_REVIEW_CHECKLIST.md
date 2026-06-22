# Code Review Checklist

## TypeScript

- [ ] 无不必要的 `any`、非空断言、宽泛类型转换或重复类型。
- [ ] 共享 DTO 与前后端使用方式一致，失败和空值路径明确。

## NestJS

- [ ] Controller 薄，业务规则在 service，数据访问边界清晰。
- [ ] DTO 已验证；异常、状态码和 API contract 一致。
- [ ] 身份、权限、审核或敏感操作已考虑授权与审计。

## Next.js / React

- [ ] 页面只组合 UI，业务逻辑在 `features` / `lib`。
- [ ] Server/Client Component 边界合理，无敏感数据进入客户端 bundle。
- [ ] loading、error、empty、响应式和无障碍状态已考虑。

## Prisma

- [ ] 复用了现有模型和关系；nullability、唯一性、索引与删除行为合理。
- [ ] 已运行 validate/generate，并说明 migration、兼容和回滚影响。

## Security

- [ ] 无密钥、凭据、敏感日志、XSS、恶意链接或上传绕过风险。
- [ ] 认证、授权、限流、输入限制和错误脱敏符合风险等级。

## Privacy

- [ ] 后台实名与前台匿名边界未被破坏。
- [ ] 未保存或返回身份证明文、图片、生物识别原文或 provider 原始响应。
- [ ] 实名访问采用独立权限和独立审计。

## UI

- [ ] 复用现有组件与样式，没有无需求的新 UI 库或复杂动画。
- [ ] 管理后台危险操作有确认、状态反馈和审计入口。

## Tests

- [ ] 新行为有与风险相称的测试；未覆盖项和环境限制已说明。
- [ ] lint、typecheck、format、build 及相关验证实际通过。

## Docs

- [ ] API、schema、环境变量、架构或工作流变化已更新对应文档。
- [ ] 注释解释必要原因，不重复代码。

## Git

- [ ] 分支、提交信息和改动范围符合约定。
- [ ] 无无关文件、生成物、`.env`、数据库文件或大规模格式噪声。
- [ ] PR 包含数据库、安全/隐私、验证和风险说明。
