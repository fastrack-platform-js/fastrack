# hello-fastrack-service

Reference Fastrack service (design §17): actuator endpoints, public route, OpenAPI/Swagger at `/docs`. Optional: add `starter-security-entra`, `starter-redis`, `starter-db-mssql`, `starter-http` for full reference.

## Run from repo root

```bash
pnpm install
pnpm build
pnpm --filter hello-fastrack-service run build
pnpm --filter hello-fastrack-service run start
```

Then open:

- http://localhost:3000 — Hello message
- http://localhost:3000/live — Liveness
- http://localhost:3000/ready — Readiness
- http://localhost:3000/health — Health
- http://localhost:3000/info — Version/env
- http://localhost:3000/docs — Swagger UI
