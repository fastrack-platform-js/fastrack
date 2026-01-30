import { Type, type Static } from "@sinclair/typebox";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Redis = require("ioredis") as new (url: string) => { ping: () => Promise<string>; quit: () => Promise<void> };
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";
import { registerHealthContributor } from "@fastrack/starter-actuator";

export const RedisStarterConfigSchema = Type.Object({
  url: Type.Optional(Type.String({ default: "redis://localhost:6379" })),
});

export type RedisStarterConfig = Static<typeof RedisStarterConfigSchema>;

export const redisStarter: FastrackStarter<RedisStarterConfig> = {
  name: "redis",
  configSchema: RedisStarterConfigSchema,
  defaults: { url: "redis://localhost:6379" },
  register(app: FastifyInstance, ctx: FastrackContext, config: RedisStarterConfig) {
    const url = config.url ?? "redis://localhost:6379";
    const client = new Redis(url);
    app.decorate("redis", client);
    registerHealthContributor(app, "redis", async () => {
      try {
        await client.ping();
        return { ok: true, status: "up" };
      } catch (e) {
        return { ok: false, status: "down", details: { error: String(e) } };
      }
    });
    ctx.onShutdown?.(async () => {
      await client.quit();
    });
  },
};
