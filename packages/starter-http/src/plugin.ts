import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";
import { createHttpClient } from "./client.js";

export const HttpStarterConfigSchema = Type.Object({
  timeoutMs: Type.Optional(Type.Number({ default: 30_000 })),
  retries: Type.Optional(Type.Number({ default: 0 })),
});

export type HttpStarterConfig = Static<typeof HttpStarterConfigSchema>;

export interface HttpClient {
  fetch(
    url: string | URL,
    init?: RequestInit,
    requestOptions?: { correlationId?: string }
  ): Promise<Response>;
}

export const httpStarter: FastrackStarter<HttpStarterConfig> = {
  name: "http",
  configSchema: HttpStarterConfigSchema,
  defaults: { timeoutMs: 30_000, retries: 0 },
  register(app: FastifyInstance, _ctx: FastrackContext, config: HttpStarterConfig) {
    const client = createHttpClient({ timeoutMs: config.timeoutMs ?? 30_000, retries: config.retries ?? 0 });
    app.decorate("httpClient", client);
  },
};
