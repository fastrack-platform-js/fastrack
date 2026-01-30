import type { FastifyInstance } from "fastify";
import { getFastrackContext } from "@fastrack/core";

export interface HealthContributor {
  name: string;
  check(): Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>;
}

/**
 * Register a health contributor with the app (call from starters that have dependencies).
 * The app must have been created with createApp so that _fastrackContext and _healthContributors exist.
 */
export function registerHealthContributor(
  app: FastifyInstance,
  name: string,
  check: () => Promise<{ ok: boolean; status?: "up" | "down"; details?: Record<string, unknown> }>
): void {
  const ctx = getFastrackContext(app);
  if (ctx?.registerHealthContributor) {
    ctx.registerHealthContributor(name, check);
  }
}
