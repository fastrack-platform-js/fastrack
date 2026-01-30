import "reflect-metadata";
import { Container, type interfaces } from "inversify";

/**
 * Create a new DI container. Inversify-style: constructor injection only, singleton default.
 * DI never auto-registers routes; Fastify plugins own HTTP boundaries.
 *
 * Usage:
 *   const container = createContainer();
 *   container.bind(MyService).toSelf().inSingletonScope();
 *   const service = container.get(MyService);
 */
export function createContainer(): Container {
  return new Container({ defaultScope: "Singleton" });
}

export { Container, type interfaces };
