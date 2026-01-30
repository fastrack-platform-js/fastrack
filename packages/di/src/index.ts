import "reflect-metadata";

/**
 * @fastrack/di — Inversify-style DI: constructor injection, singleton default, explicit bindings.
 * DI never auto-registers routes; Fastify plugins own HTTP boundaries.
 * @see https://github.com/fastrack-platform-js/fastrack
 */
export { createContainer, Container, type interfaces } from "./container.js";
export { injectable, inject } from "inversify";
