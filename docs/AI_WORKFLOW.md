# AI Workflow

## 推荐迭代顺序

1. `feature/ai-workflow`：AI 协作规范。
2. `feature/auth`：注册登录、密码哈希、JWT/Session、基础限流。
3. `feature/identity`：实名认证 provider 抽象，不接真实供应商。
4. `feature/forum-core`：分区、发帖、帖子详情。
5. `feature/comments`：评论、楼中楼、软删除。
6. `feature/moderation`：举报、审核、处罚、`AuditLog`。
7. `feature/search-notification`：搜索索引、通知。
8. `feature/game-features`：二游特色功能。

每个迭代只使用一个 feature 分支。评审通过后合并到 `dev`，可运行版本再进入 `main`。

## 标准提示结构

```text
当前状态：分支、已完成功能、已知环境限制。
本次目标：一个可验证结果。
明确不做：列出相邻但排除的功能。
允许修改：限定目录或文件。
必须校验：列出真实存在的命令。
完成输出：文件列表、schema/migration 影响、验证结果、风险、下一步。
```

先要求 Codex 阅读根目录 `AGENTS.md` 和相关 repo skill。大功能先填 `docs/FEATURE_TEMPLATE.md` 或给出同等计划，再允许修改代码。

## Token 节省原则

- 不重复粘贴完整项目背景，直接引用 `AGENTS.md` 和相关 `docs`。
- 只提供相关错误日志和最小复现，不粘贴无关终端输出。
- 让 Codex 先读取相关文件，再基于现有模式修改。
- 大功能先输出 plan，确认边界后再实现。
- 每次任务限制模块、目录和非目标。
- 要求文件列表与 diff 摘要，不要求重复输出完整代码。

## 防幻觉原则

- 先检查现有文件和 Git 状态。
- 不确定命令时读取根目录及 workspace `package.json`。
- 不确定数据模型时读取完整 `schema.prisma`。
- 不确定 API 时读取已有 controller、service、DTO 和 `docs/API_CONTRACT.md`。
- 不凭空编造依赖、字段、接口、脚本或完成结果。
- 所有“完成”必须由实际命令、测试或可复现检查支持。
