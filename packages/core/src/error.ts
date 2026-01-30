import { Type } from "@sinclair/typebox";
import type { FastifyReply } from "fastify";

/**
 * Problem-details error schema (design §5).
 * Stack traces are logged server-side only; never exposed in response.
 */
export const ProblemDetailsSchema = Type.Object({
  status: Type.Number({ description: "HTTP status" }),
  code: Type.String({ description: "Error code" }),
  message: Type.String({ description: "Human-readable message" }),
  correlationId: Type.Optional(Type.String({ description: "Request correlation ID" })),
});

export type ProblemDetails = typeof ProblemDetailsSchema.static;

/**
 * Reply with problem-details body. Logs stack server-side only.
 */
export function replyError(
  reply: FastifyReply,
  err: unknown,
  options?: { status?: number; correlationId?: string }
): void {
  const status = options?.status ?? (err as { statusCode?: number }).statusCode ?? 500;
  const correlationId = options?.correlationId ?? (reply.request as { correlationId?: string }).correlationId;
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string }).code ?? "INTERNAL_ERROR";

  if (err instanceof Error && err.stack) {
    reply.log?.error?.({ err, correlationId }, "Error (stack server-side only)");
  }

  reply.status(status).send({
    status,
    code,
    message,
    ...(correlationId ? { correlationId } : {}),
  });
}
