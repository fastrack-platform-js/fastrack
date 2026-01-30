import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";

export const OpenapiStarterConfigSchema = Type.Object({
  path: Type.Optional(Type.String({ default: "/docs" })),
  enabled: Type.Optional(Type.Boolean({ default: true })),
});

export type OpenapiStarterConfig = Static<typeof OpenapiStarterConfigSchema>;

export const openapiStarter: FastrackStarter<OpenapiStarterConfig> = {
  name: "openapi",
  configSchema: OpenapiStarterConfigSchema,
  defaults: { path: "/docs", enabled: true },
  register(app: FastifyInstance, _ctx: FastrackContext, config: OpenapiStarterConfig) {
    if (config.enabled === false) return;
    const path = config.path ?? "/docs";
    app.get(`${path}/openapi.json`, async (_request, reply) => {
      return reply.send({
        openapi: "3.0.0",
        info: { title: "Fastrack API", version: "0.1.0" },
        paths: {},
      });
    });
    app.get(path, async (_request, reply) => {
      return reply.type("text/html").send(
        `<!DOCTYPE html><html><head><title>Swagger UI</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({ url: '${path}/openapi.json', dom_id: '#swagger-ui' });</script></body></html>`
      );
    });
  },
};
