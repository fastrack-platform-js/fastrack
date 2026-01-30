import { config as dotenvConfig } from "dotenv";
import { Value } from "@sinclair/typebox/value";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { FastrackContext, CreateAppOptions } from "./types.js";

const DEFAULT_SHUTDOWN_MS = 30_000;

/**
 * Create a Fastrack app: load env (.env via dotenv), validate starter configs, register starters, set up shutdown.
 */
export async function createApp(options: CreateAppOptions = {}): Promise<FastifyInstance> {
  const {
    starters = [],
    config: configOverride = {},
    envPath = ".env",
    shutdownTimeoutMs = DEFAULT_SHUTDOWN_MS,
  } = options;

  if (envPath !== false) {
    dotenvConfig({ path: envPath });
  }

  const app = Fastify({ logger: true });

  let readiness = true;
  const shutdownHooks: Array<() => Promise<void> | void> = [];
  const healthContributors: Map<string, () => Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>> = new Map();

  const ctx: FastrackContext = {
    app,
    config: { ...configOverride },
    get logger() {
      return app.log as FastrackContext["logger"];
    },
    getReadiness: () => readiness,
    setReadiness: (ready: boolean) => {
      readiness = ready;
    },
    onShutdown: (fn) => {
      shutdownHooks.push(fn);
    },
    registerHealthContributor: (name: string, check: () => Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>) => {
      healthContributors.set(name, check);
    },
  };

  for (const starter of starters) {
    const defaults = starter.defaults ?? {};
    const raw = (ctx.config[starter.name] as Record<string, unknown>) ?? {};
    const merged = { ...defaults, ...raw };
    const errors = [...Value.Errors(starter.configSchema, merged)];
    if (errors.length > 0) {
      const msg = errors.map((e) => `${e.path}: ${e.message}`).join("; ");
      throw new Error(`Config validation failed for starter "${starter.name}": ${msg}`);
    }
    const result = Value.Decode(starter.configSchema, merged) as unknown;
    await Promise.resolve(starter.register(app, ctx, result));
  }

  const shutdown = async (signal: string) => {
    readiness = false;
    app.log?.info?.({ signal }, "Shutdown: readiness=false");
    const timeout = setTimeout(() => {
      app.log?.error?.("Shutdown timeout; exiting");
      process.exit(1);
    }, shutdownTimeoutMs);
    try {
      for (let i = shutdownHooks.length - 1; i >= 0; i--) {
        const fn = shutdownHooks[i];
        if (fn) await Promise.resolve(fn());
      }
      await app.close();
    } finally {
      clearTimeout(timeout);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  (app as unknown as { _fastrackContext: FastrackContext })._fastrackContext = ctx;
  (app as unknown as { _healthContributors: Map<string, () => Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>> })._healthContributors = healthContributors;

  return app;
}

/**
 * Get the Fastrack context from an app (for actuator / other starters).
 */
export function getFastrackContext(app: FastifyInstance): FastrackContext | undefined {
  return (app as FastifyInstance & { _fastrackContext?: FastrackContext })._fastrackContext;
}

/**
 * Get health contributors map from app (for actuator).
 */
export function getHealthContributors(
  app: FastifyInstance
): Map<string, () => Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>> | undefined {
  return (app as unknown as { _healthContributors?: Map<string, () => Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>> })._healthContributors;
}
