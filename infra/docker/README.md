# Local services

Run from the repository root after creating a local `.env`:

```bash
cp .env.example .env
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
```

The OpenSearch security plugin is disabled only for local development. Production infrastructure must enable authentication, TLS, network restrictions, backups, and secret management.
