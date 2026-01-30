# Contributing to Fastrack

## Setup

1. Clone the repo: `git clone https://github.com/fastrack-platform-js/fastrack` then run `pnpm install`.
2. Build all packages: `pnpm build`.
3. Run tests: `pnpm test`.

## Adding a package

Create a directory under `packages/` with `src/`, `package.json`, and `README.md`. Add the package to the workspace (it's included via `packages/*` in `pnpm-workspace.yaml`). Use `workspace:*` for internal Fastrack dependencies.

## Versioning

We use [Changesets](https://github.com/changesets/changesets). When you change user-facing behavior, run `pnpm changeset` and add a changeset. The release workflow will version and publish.

## Hard rules (design)

- No route without a TypeBox schema.
- No ad-hoc HTTP clients; use @fastrack/starter-http.
- No ad-hoc DB pools; use starters.
- JWT validated in-service.
- No PII/PHI in logs.
- Readiness semantics consistent.
