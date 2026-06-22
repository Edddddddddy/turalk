# Turalk

Turalk is a forum project maintained as a monorepo.

## Local workspace

The canonical development checkout is in the WSL Linux filesystem:

```text
~/projects/turalk
```

Do not develop from `/mnt/c`, `/mnt/d`, `/mnt/e`, or Windows user folders.

## Planned layout

```text
apps/
  api/       Backend API
  web/       Public web application
  admin/     Moderation and administration application
packages/    Shared packages
infra/       Local and deployment infrastructure
docs/        Architecture and development documentation
```

The application scaffolds will be added in focused commits after the stack and architecture are confirmed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the Git workflow.
