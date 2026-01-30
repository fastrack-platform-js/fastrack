import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    principal?: { sub?: string; scp?: string } | null;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.principal) {
    reply.status(401).send({ status: 401, code: "UNAUTHORIZED", message: "Authentication required" });
  }
}

export function requireScopes(...scopes: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.principal) {
      reply.status(401).send({ status: 401, code: "UNAUTHORIZED", message: "Authentication required" });
      return;
    }
    const tokenScopes = (request.principal.scp ?? "").split(" ");
    const hasAll = scopes.every((s) => tokenScopes.includes(s));
    if (!hasAll) {
      reply.status(403).send({ status: 403, code: "FORBIDDEN", message: "Insufficient scope" });
    }
  };
}

export function requireAnyScope(...scopes: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.principal) {
      reply.status(401).send({ status: 401, code: "UNAUTHORIZED", message: "Authentication required" });
      return;
    }
    const tokenScopes = (request.principal.scp ?? "").split(" ");
    const hasAny = scopes.some((s) => tokenScopes.includes(s));
    if (!hasAny) {
      reply.status(403).send({ status: 403, code: "FORBIDDEN", message: "Insufficient scope" });
    }
  };
}

export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!request.principal) {
    (request as FastifyRequest & { principal: null }).principal = null;
  }
}
