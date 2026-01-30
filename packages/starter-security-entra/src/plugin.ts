import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";

export const SecurityEntraStarterConfigSchema = Type.Object({
  issuer: Type.Optional(Type.String()),
  audience: Type.Optional(Type.String()),
  jwksUri: Type.Optional(Type.String()),
});

export type SecurityEntraStarterConfig = Static<typeof SecurityEntraStarterConfigSchema>;

export const securityEntraStarter: FastrackStarter<SecurityEntraStarterConfig> = {
  name: "security-entra",
  configSchema: SecurityEntraStarterConfigSchema,
  defaults: {},
  register(app: FastifyInstance, _ctx: FastrackContext, _config: SecurityEntraStarterConfig) {
    app.decorateRequest("principal", null);
    app.addHook("preHandler", async (request) => {
      const auth = request.headers.authorization;
      if (auth?.startsWith("Bearer ")) {
        const token = auth.slice(7);
        try {
          const payload = JSON.parse(
            Buffer.from(token.split(".")[1] ?? "", "base64url").toString()
          );
          (request as { principal: unknown }).principal = payload;
        } catch {
          (request as { principal: null }).principal = null;
        }
      }
    });
  },
};
