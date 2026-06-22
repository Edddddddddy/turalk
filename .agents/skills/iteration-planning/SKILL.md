---
name: iteration-planning
description: Plan focused, verifiable Turalk feature iterations. Use before large features, cross-module work, or any task whose scope is unclear or likely to exceed one feature branch.
---

# When to use

Use before implementation when a task spans multiple layers or business modules.

# Do

- Use one feature branch for one coherent feature.
- State scope, non-goals, likely touched files, data/API/UI impact, and validation commands before editing.
- Target roughly 10-30 changed files per iteration when practical.
- Split registration, identity, forum content, moderation, search, and notifications into separate iterations.
- Stop and report before exceeding the agreed scope or introducing an unplanned architecture change.
- End each iteration with validation results, risks, and one next-iteration recommendation.

# Don't

- Do not implement registration, identity, posting, moderation, and search together.
- Do not hide scope growth inside refactoring or dependency upgrades.
- Do not begin a broad implementation without reading the relevant files.

# Checklist

- Branch and single feature are named.
- Scope and non-goals are measurable.
- Expected files and commands are listed.
- Work size is bounded; overage triggers a stop.
- Completion and next step are defined.
