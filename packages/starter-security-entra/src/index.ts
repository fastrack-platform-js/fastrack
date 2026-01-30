/**
 * @fastrack/starter-security-entra — Azure Entra JWT, JWKS, requireAuth, requireScopes.
 */
export { securityEntraStarter } from "./plugin.js";
export { requireAuth, requireScopes, requireAnyScope, optionalAuth } from "./policies.js";
export type { SecurityEntraStarterConfig } from "./plugin.js";
