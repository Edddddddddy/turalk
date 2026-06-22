---
name: code-review
description: Review Turalk changes for defects, regressions, scope creep, privacy issues, and missing validation. Use before completion, commit, merge, or when reviewing a pull request.
---

# When to use

Use after implementation and before declaring work complete.

# Do

- Review the diff and list findings by severity with file references.
- Check unrelated file changes, unnecessary dependencies, and broken monorepo scripts.
- Check for secrets, sensitive fixtures, `any`, accumulated `TODO`, and noisy `console.log`.
- Check whether behavior needs tests and whether docs or API contracts need updates.
- Compare frontend types, backend DTOs, and API response shapes.
- For Prisma changes, require validate/generate results and a migration decision.
- Finish with explicit risk notes, including residual test or environment gaps.

# Don't

- Do not replace findings with a general summary.
- Do not approve merely because code compiles.
- Do not ignore authorization, error, empty, loading, rollback, or migration paths.

# Checklist

- Scope and dependencies are justified.
- TypeScript, NestJS, Next.js, Prisma, security, privacy, UI, tests, docs, and Git are reviewed as applicable.
- Required commands ran successfully or blockers are named.
- Risk notes are present.
