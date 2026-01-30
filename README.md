# Fastrack

Opinionated Fastify platform for enterprise Node.js: opinionated bootstrapping, strong defaults, config that fails fast, first-class security and observability, health/readiness/diagnostics by default.

## Install

```bash
pnpm add @fastrack/core @fastrack/starter-web @fastrack/starter-actuator
```

## Quick start (contributors)

```bash
git clone https://github.com/fastrack-platform-js/fastrack
cd fastrack
pnpm install
pnpm build
pnpm --filter hello-fastrack-service run build && pnpm --filter hello-fastrack-service run start
```

Then open http://localhost:3000, http://localhost:3000/live, http://localhost:3000/ready.

## Docs

- [Architecture](docs/architecture.md)
- [Starters](docs/starters.md)
- [Security](docs/security.md)

## Publishing (npm)

Packages under `packages/` are published to **npm** under the **@fastrack** namespace. Each package has `"publishConfig": { "access": "public", "registry": "https://registry.npmjs.org/" }` so scoped packages are public. The repo root is `"private": true` and is not published.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
