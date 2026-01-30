import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";

export const ObservabilityDdStarterConfigSchema = Type.Object({
  service: Type.Optional(Type.String()),
  env: Type.Optional(Type.String()),
  version: Type.Optional(Type.String()),
});

export type ObservabilityDdStarterConfig = Static<typeof ObservabilityDdStarterConfigSchema>;

export const observabilityDdStarter: FastrackStarter<ObservabilityDdStarterConfig> = {
  name: "observability-dd",
  configSchema: ObservabilityDdStarterConfigSchema,
  defaults: {},
  async register(app: FastifyInstance, _ctx: FastrackContext, config: ObservabilityDdStarterConfig) {
    let tracer: { init: (opts: Record<string, unknown>) => void };
    try {
      const mod = await import("dd-trace");
      tracer = mod.default;
    } catch {
      app.log?.warn?.("dd-trace not found; skipping tracer init");
      return;
    }
    tracer.init({
      service: config.service ?? "fastrack",
      env: config.env ?? process.env.NODE_ENV ?? "development",
      version: config.version ?? process.env.npm_package_version,
    });
  },
};
