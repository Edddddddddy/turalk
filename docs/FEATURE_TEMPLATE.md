# Feature Template

## Feature name

`<short feature name>`

## Branch

`feature/<name>`，从最新 `dev` 创建。

## Goal

描述本迭代唯一、可验证的结果和验收标准。

## Non-goals

- 明确排除的相邻功能。
- 不在本次处理的重构、迁移或 UI 优化。

## Files likely touched

- `path/or/directory`：修改原因。
- 目标约为 10-30 个文件；超出前先汇报。

## Data model changes

- Schema models/fields/enums/indexes：`none` 或具体列表。
- Migration required：`yes/no`，说明兼容、回填和回滚。

## API changes

- Method/path、request DTO、response、errors、auth/audit：`none` 或具体列表。

## UI changes

- Routes、components、states、responsive/accessibility：`none` 或具体列表。

## Validation commands

只列仓库真实存在且与改动相关的命令，例如：

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm prisma:validate
```

## Rollback notes

说明如何回退代码、feature flag、schema 和 migration；无特殊要求时写 `code-only revert`。

## Final summary format

1. 当前分支与 commit/push 状态。
2. 新增/修改文件及行为摘要。
3. Schema 与 migration 影响。
4. 实际验证命令及结果。
5. 安全、隐私、测试和环境 risk notes。
6. 一个聚焦的下一步建议。
