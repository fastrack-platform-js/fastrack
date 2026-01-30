import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";
import { replyError } from "@fastrack/core";

export const WebStarterConfigSchema = Type.Object({
  port: Type.Optional(Type.Number({ default: 3000 })),
  host: Type.Optional(Type.String({ default: "0.0.0.0" })),
  correlationHeader: Type.Optional(Type.String({ default: "x-correlation-id" })),
});

export type WebStarterConfig = Static<typeof WebStarterConfigSchema>;

declare module "fastify" {
  interface FastifyRequest {
    correlationId?: string;
    fastrack?: { correlationId?: string };
  }
}

export const webStarter: FastrackStarter<WebStarterConfig> = {
  name: "web",
  configSchema: WebStarterConfigSchema,
  defaults: { port: 3000, host: "0.0.0.0", correlationHeader: "x-correlation-id" },
  register(app: FastifyInstance, _ctx: FastrackContext, config: WebStarterConfig) {
    const correlationHeader = config.correlationHeader ?? "x-correlation-id";

    app.addHook("onRequest", async (request: FastifyRequest) => {
      const id = (request.headers[correlationHeader.toLowerCase()] as string) ?? crypto.randomUUID();
      request.correlationId = id;
      (request as FastifyRequest & { fastrack: { correlationId: string } }).fastrack = { correlationId: id };
    });

    app.setErrorHandler((err: Error, request: FastifyRequest, reply: FastifyReply) => {
      const correlationId = (request as FastifyRequest & { correlationId?: string }).correlationId;
      replyError(reply, err, { correlationId });
    });
  },
};
