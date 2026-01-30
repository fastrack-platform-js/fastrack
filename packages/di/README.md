# @fastrack/di

Inversify-style dependency injection for Fastrack: constructor injection only, singleton scope by default, explicit bindings via `ContainerModule`. DI never auto-registers routes; Fastify plugins stay responsible for HTTP boundaries.

See [docs/architecture.md](../../docs/architecture.md).

## Install

```bash
pnpm add @fastrack/di
```

## Usage

```ts
import { createContainer, bind } from "@fastrack/di";
import { MyService } from "./my-service.js";

const container = createContainer();
container.load(
  bind(MyService).toSelf().inSingletonScope()
);

const service = container.get(MyService);
```

## Rules

- Constructor injection only.
- Singleton scope default.
- Explicit bindings via ContainerModule; no auto-registration of routes.
