import type { TSchema } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";

/**
 * Bootstrap context passed to starters.
 */
export interface FastrackContext {
  /** Fastify app instance */
  app: FastifyInstance;
  /** Root config (env + file, merged with starter defaults) */
  config: Record<string, unknown>;
  /** Logger (optional; app.log if not set) */
  logger?: { info: (o: unknown) => void; error: (o: unknown) => void; child: (bindings: Record<string, unknown>) => unknown };
  /** Readiness getter (core sets this) */
  getReadiness?: () => boolean;
  /** Set readiness (core sets this; actuator /ready uses it) */
  setReadiness?: (ready: boolean) => void;
  /** Register shutdown hook (called in reverse order on SIGTERM) */
  onShutdown?: (fn: () => Promise<void> | void) => void;
  /** Register health contributor (actuator uses this) */
  registerHealthContributor?: (name: string, check: () => Promise<HealthResult>) => void;
}

/**
 * Health contributor result (design §9).
 */
export interface HealthResult {
  ok: boolean;
  status?: "up" | "down";
  details?: Record<string, unknown>;
}

/**
 * Health contributor interface (for actuator and starters that register).
 */
export interface HealthContributor {
  name: string;
  check(): Promise<HealthResult>;
}

/**
 * Starter interface (design §4).
 * Each starter provides: TypeBox config schema, Fastify plugin registration, optional health/shutdown.
 */
export interface FastrackStarter<TConfig = unknown> {
  name: string;
  configSchema: TSchema;
  defaults?: Partial<TConfig>;
  register(app: FastifyInstance, ctx: FastrackContext, config: TConfig): Promise<void> | void;
}

/**
 * Options for createApp.
 */
export interface CreateAppOptions {
  /** Starters to load (order is deterministic) */
  starters?: FastrackStarter<unknown>[];
  /** Override config (merged with env; starters get namespaced slice by starter name) */
  config?: Record<string, unknown>;
  /** Load .env file: path string (default ".env"), or false to disable. Uses dotenv. */
  envPath?: string | false;
  /** Shutdown timeout in ms (default 30_000) */
  shutdownTimeoutMs?: number;
}
