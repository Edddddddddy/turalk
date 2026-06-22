# Contributing

## Branches

- `main`: stable, runnable releases only.
- `dev`: integration branch for daily development.
- `feature/init-project`: initial project setup.
- `feature/auth`: registration and authentication.
- `feature/identity`: identity verification abstraction.
- `feature/forum-core`: forums, posts, and comments.
- `feature/moderation`: reporting, review, and risk controls.
- `feature/search-notification`: search and notifications.
- `feature/game-features`: game community features.

Create feature branches from `dev`. Merge reviewed feature branches into `dev`; promote runnable versions from `dev` to `main`.

## Commits

Use Conventional Commits with one focused change per commit:

- `feat`: new functionality
- `fix`: bug fix
- `docs`: documentation
- `chore`: engineering configuration
- `refactor`: refactoring without behavior changes
- `test`: tests
- `style`: formatting only
- `build`: build system or dependencies
- `ci`: CI/CD

Never commit secrets, `.env` files, identity test data, local databases, generated dependency folders, or service data.
