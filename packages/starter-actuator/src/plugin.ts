import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";
import { getHealthContributors } from "@fastrack/core";

export const ActuatorStarterConfigSchema = Type.Object({
  pathPrefix: Type.Optional(Type.String({ default: "" })),
  enableLive: Type.Optional(Type.Boolean({ default: true })),
  enableReady: Type.Optional(Type.Boolean({ default: true })),
  enableHealth: Type.Optional(Type.Boolean({ default: true })),
  enableInfo: Type.Optional(Type.Boolean({ default: true })),
  enableMetrics: Type.Optional(Type.Boolean({ default: true })),
});

export type ActuatorStarterConfig = Static<typeof ActuatorStarterConfigSchema>;

export const actuatorStarter: FastrackStarter<ActuatorStarterConfig> = {
  name: "actuator",
  configSchema: ActuatorStarterConfigSchema,
  defaults: {
    pathPrefix: "",
    enableLive: true,
    enableReady: true,
    enableHealth: true,
    enableInfo: true,
    enableMetrics: true,
  },
  register(app: FastifyInstance, ctx: FastrackContext, config: ActuatorStarterConfig) {
    const p = config.pathPrefix ?? "";

    if (config.enableLive !== false) {
      app.get(`${p}/live`, async (_request, reply) => {
        return reply.status(200).send({ status: "up" });
      });
    }

    if (config.enableReady !== false) {
      app.get(`${p}/ready`, async (_request, reply) => {
        const ready = ctx.getReadiness?.() ?? true;
        const contributors = getHealthContributors(app);
        const details: Record<string, unknown> = {};
        if (contributors) {
          for (const [name, check] of contributors) {
            try {
              const result = await check();
              details[name] = result.ok ? "up" : "down";
            } catch {
              details[name] = "down";
            }
          }
        }
        const allUp = ready && Object.values(details).every((v) => v === "up");
        return reply.status(allUp ? 200 : 503).send({ status: allUp ? "up" : "down", details });
      });
    }

    if (config.enableHealth !== false) {
      app.get(`${p}/health`, async (_request, reply) => {
        const contributors = getHealthContributors(app);
        const details: Record<string, unknown> = {};
        let ok = true;
        if (contributors) {
          for (const [name, check] of contributors) {
            try {
              const result = await check();
              details[name] = result.details ?? (result.ok ? "up" : "down");
              if (!result.ok) ok = false;
            } catch (e) {
              details[name] = "down";
              ok = false;
            }
          }
        }
        return reply.status(ok ? 200 : 503).send({ status: ok ? "up" : "down", details });
      });
    }

    if (config.enableInfo !== false) {
      app.get(`${p}/info`, async (_request, reply) => {
        return reply.send({
          version: process.env.npm_package_version ?? "0.0.0",
          env: process.env.NODE_ENV ?? "development",
          node: process.version,
        });
      });
    }

    if (config.enableMetrics !== false) {
      app.get(`${p}/metrics`, async (_request, reply) => {
        reply.header("Content-Type", "text/plain; charset=utf-8");
        return reply.send("# Fastrack metrics placeholder\n# Add Prometheus metrics here.\n");
      });
    }
  },
};
