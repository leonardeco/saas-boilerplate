import fp from "fastify-plugin";
import fjwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string; platformRole?: string };
    user: { sub: string; email: string; platformRole?: string };
  }
}

export const jwtPlugin = fp(async (app) => {
  await app.register(fjwt, {
    secret: env.JWT_ACCESS_SECRET,
  });

  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });
});
