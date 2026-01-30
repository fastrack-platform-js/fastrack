/**
 * @fastrack/starter-http — fetch/undici wrapper: timeouts, retries, correlation propagation.
 */
export { httpStarter } from "./plugin.js";
export { createHttpClient } from "./client.js";
export type { HttpStarterConfig, HttpClient } from "./plugin.js";
export type { CreateHttpClientOptions, HttpRequestOptions } from "./client.js";
