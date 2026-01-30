# Fastrack architecture

Fastrack is an opinionated Fastify platform for enterprise Node.js: opinionated bootstrapping, strong defaults, config that fails fast, first-class security and observability, health/readiness/diagnostics by default.

## Fastify is the runtime root

Fastify owns HTTP routing, plugin registration, lifecycle and shutdown, request/response handling. Fastrack standardizes how Fastify is used; it does not replace Fastify.

## Bootstrap

`createApp({ starters, config, shutdownTimeoutMs })` creates a Fastify instance, builds config from overrides and starter defaults, validates each starter's config slice with TypeBox, then calls each starter's `register(app, ctx, config)` in order. The context `ctx` exposes `getReadiness`, `setReadiness`, `onShutdown`, and `registerHealthContributor` for integration with actuator and other starters.

## Starter model

A **starter** encapsulates one cross-cutting concern. Each starter provides:

1. A TypeBox config schema
2. A Fastify plugin registration
3. Optional health contributors (via `ctx.registerHealthContributor`)
4. Optional shutdown hooks (via `ctx.onShutdown`)

Starters are loaded deterministically at boot. Interface: `FastrackStarter<TConfig>` with `name`, `configSchema`, `defaults?`, `register(app, ctx, config)`.

## Config and validation

Config is passed as `config` in `createApp`; each starter receives its slice via `ctx.config[starter.name]`. Merged with starter defaults and validated with TypeBox. Invalid config fails fast at startup.

## Error model

Problem-details style: `status`, `code`, `message`, `correlationId`. Use `replyError(reply, err, { correlationId })` from `@fastrack/core`. Stack traces are logged server-side only; never exposed in responses.

## Shutdown

On SIGTERM/SIGINT: readiness is set to false, no new requests accepted, shutdown hooks run in reverse order, then Fastify closes. Timeout is configurable (default 30s).

See the in-depth design document for full details.
