# Fastrack starters

| Starter | Responsibility | Config knobs |
|--------|----------------|--------------|
| @fastrack/starter-web | Baseline Fastify, request context (correlation ID), error handler, TypeBox | port, host, correlationHeader |
| @fastrack/starter-actuator | /live, /ready, /health, /info, /metrics; health contributor registry | pathPrefix, enableLive/Ready/Health/Info/Metrics |
| @fastrack/starter-openapi | OpenAPI JSON + Swagger UI at /docs | path, enabled |
| @fastrack/starter-observability-dd | dd-trace init, standard tags | service, env, version |
| @fastrack/starter-security-entra | JWT (Bearer), principal on request; requireAuth, requireScopes, etc. | issuer, audience, jwksUri |
| @fastrack/starter-http | HTTP client with timeout, retries (idempotent), correlation | timeoutMs, retries |
| @fastrack/starter-redis | ioredis client, health PING, onShutdown quit | url |
| @fastrack/starter-db-mssql | MSSQL pool, query/transaction, health SELECT 1 | connectionString, poolMax |
| @fastrack/starter-db-oracle | Oracle pool, query/transaction, health | connectionString, user, password, poolMin, poolMax |

Config is namespaced: pass `config.web`, `config.actuator`, etc. in `createApp({ config })`. Design reference: design document §§7–14.
