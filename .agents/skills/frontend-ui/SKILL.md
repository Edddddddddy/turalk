---
name: frontend-ui
description: Enforce Turalk UI structure and visual conventions. Use for pages, components, forms, lists, or styling in apps/web and apps/admin.
---

# When to use

Use for any UI work in `apps/web` or `apps/admin`.

# Do

- Read existing components, styles, routes, and directories first; reuse them.
- Split page composition, business features, API clients, and types into their existing layers.
- Keep UI simple, responsive, accessible, and easy to extend.
- Give forms explicit loading, error, empty, success, and disabled states.
- Give data views loading, error, and empty states; reserve pagination, filter, and search contracts for lists.
- Prefer tables, filters, status badges, confirmations, and audit-log entry points in Admin.
- Keep the anime-game community tone youthful but restrained and maintainable.

# Don't

- Do not put a whole feature into one `page` file.
- Do not invent a UI library or design system without a requirement.
- Do not add complex animation without a design requirement.
- Do not put data fetching or business rules directly in presentation components.

# Checklist

- Existing patterns reused.
- Mobile and desktop layouts considered.
- Loading, error, empty, and interaction states covered.
- API and types remain outside presentation components.
- UI changes are visually verified when tooling permits.
