---
name: backend-api
description: Enforce Turalk NestJS module and API conventions. Use when adding or changing controllers, services, DTOs, repositories, endpoints, or backend domain behavior.
---

# When to use

Use for changes under `apps/api/src`, except schema-only work.

# Do

- Keep each domain in a module with controller, service, DTO, and repository or an equally clear local layering.
- Let controllers translate HTTP requests and responses; put business rules in services.
- Validate DTOs with `class-validator` or the repository's current validation mechanism.
- Keep routes under the global `/api` prefix; add API versioning only as a deliberate repository-wide decision.
- Use standard NestJS exceptions and stable error codes.
- Route Prisma access through domain repositories or dedicated data-access services.
- Consider authorization and `AuditLog` for identity, permission, moderation, and admin operations.
- Update `docs/API_CONTRACT.md` or relevant API documentation for every new endpoint.

# Don't

- Do not scatter Prisma queries through controllers or arbitrary utilities.
- Do not hardcode user IDs, admin IDs, credentials, or secrets.
- Do not return ad hoc error strings or expose internal exception details.
- Do not cross domain boundaries by importing private module internals.

# Checklist

- Controller is thin; service owns rules.
- Input DTO is validated and output shape is explicit.
- Authentication, authorization, audit, and failure paths are considered.
- API contract is documented.
- Lint, typecheck, build, and relevant tests pass.
