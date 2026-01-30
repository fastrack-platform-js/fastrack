# @fastrack/core

Application bootstrap, starter loading, config aggregation and validation, standard error model, request context and correlation IDs, graceful shutdown and readiness toggle.

See [docs/architecture.md](../../docs/architecture.md) and the design document for the full platform vision.

## Install

```bash
pnpm add @fastrack/core
```

## Usage

```ts
import { createApp } from "@fastrack/core";
import { webStarter } from "@fastrack/starter-web";
import { actuatorStarter } from "@fastrack/starter-actuator";

const app = await createApp({
  starters: [webStarter, actuatorStarter],
});

await app.listen({ port: 3000 });
```

## Env config (dotenv)

By default, `createApp` loads a `.env` file from the current working directory (via [dotenv](https://www.npmjs.com/package/dotenv)), so `process.env` is populated before config is built. You can then pass config from env or use it in starters:

```ts
const app = await createApp({
  envPath: ".env",        // default; set to false to disable
  config: {
    web: { port: Number(process.env.PORT) ?? 3000 },
  },
});
```

Set `envPath: false` to disable loading a .env file.

## API

- `createApp(options)` — Bootstrap Fastify with starters and config.
- `FastrackStarter<TConfig>` — Starter interface (name, configSchema, register).
- `FastrackContext` — Bootstrap context passed to starters.
- Problem-details error schema and `replyError` helper.
- Readiness getter/setter for actuator integration.
