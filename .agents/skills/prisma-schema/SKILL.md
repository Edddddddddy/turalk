---
name: prisma-schema
description: Safely evolve Turalk's Prisma data model. Use for models, fields, enums, relations, indexes, migrations, or generated Prisma client changes.
---

# When to use

Use before editing `apps/api/prisma/schema.prisma` or planning a migration.

# Do

- Read the complete existing schema and related service code first.
- Extend existing models when they own the concept; avoid duplicate tables.
- Prefer `id`, `createdAt`, and `updatedAt` on persistent entities.
- Add soft-delete semantics to user-generated content where recovery or audit matters.
- Isolate sensitive data models and preserve least-privilege relations.
- Store only identity hashes, provider tokens, statuses, and timestamps; never plaintext identity numbers.
- Run `pnpm prisma:validate` and, when possible, `pnpm prisma:generate`.
- State whether a migration is needed and describe compatibility or backfill concerns.

# Don't

- Do not casually remove or rename fields, enums, or enum values.
- Do not break existing relations, uniqueness, delete behavior, or indexes.
- Do not generate a migration against an unreviewed schema.
- Do not place public profile data and restricted identity data in the same model.

# Checklist

- Existing models and relations reviewed.
- Nullability, uniqueness, indexes, deletion, and timestamps considered.
- Sensitive data boundary preserved.
- Validate/generate results reported.
- Migration and rollback impact stated.
