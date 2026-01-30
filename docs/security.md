# Fastrack security

- **JWT in-service**: Even when a gateway validates upstream, Fastrack validates JWT in-service (@fastrack/starter-security-entra). Azure Entra, single tenant, per-service audience, scope-based auth via `scp`. Use `requireAuth`, `requireScopes`, `requireAnyScope`, `optionalAuth` from the starter.
- **No PII/PHI in logs**: Structured logs must not contain PII/PHI. Design rule §19.
- **Readiness semantics**: Readiness is consistent across starters; /ready reflects core readiness and health contributors. Design rule §19.
- **Reporting vulnerabilities**: See root [SECURITY.md](../SECURITY.md) for how to report privately.

See design document §11 (starter-security-entra) and §19 (hard rules).
