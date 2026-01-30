import type { FastifyInstance } from "fastify";
import type { FastrackStarter } from "@fastrack/core";
import { createApp } from "@fastrack/core";

export interface CreateTestAppOptions {
  starters?: FastrackStarter<unknown>[];
  config?: Record<string, unknown>;
}

/**
 * Create a Fastrack app for integration tests.
 */
export async function createTestApp(options: CreateTestAppOptions = {}): Promise<FastifyInstance> {
  return createApp({
    starters: options.starters ?? [],
    config: options.config,
  });
}
