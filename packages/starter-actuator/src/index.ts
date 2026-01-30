/**
 * @fastrack/starter-actuator — /live, /ready, /health, /info, /metrics.
 */
export { actuatorStarter } from "./plugin.js";
export { registerHealthContributor, type HealthContributor } from "./health.js";
export type { ActuatorStarterConfig } from "./plugin.js";
