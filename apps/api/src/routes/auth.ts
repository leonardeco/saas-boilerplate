import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { env } from "../env.js";
import {
  registerUser,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  getUserById,
} from "../services/auth.service.js";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    try {
      const { user, organization } = await registerUser(
        body.data.name,
        body.data.email,
        body.data.password,
      );

      const accessToken = app.jwt.sign(
        {
          sub: user.id,
          email: user.email,
          platformRole: user.platformRole,
        },
        { expiresIn: env.JWT_ACCESS_EXPIRES },
      );
      const refreshToken = await createRefreshToken(user.id);

      return reply.status(201).send({
        accessToken,
        refreshToken,
        user,
        organization,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EMAIL_IN_USE") {
        return reply.status(409).send({ error: "Email already in use", code: "EMAIL_IN_USE" });
      }
      throw err;
    }
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    try {
      const user = await loginUser(body.data.email, body.data.password);
      const accessToken = app.jwt.sign(
        {
          sub: user.id,
          email: user.email,
          platformRole: user.platformRole,
        },
        { expiresIn: env.JWT_ACCESS_EXPIRES },
      );
      const refreshToken = await createRefreshToken(user.id);
      return reply.send({ accessToken, refreshToken, user });
    } catch {
      return reply.status(401).send({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }
  });

  app.post<{ Body: { refreshToken?: string } }>("/refresh", async (request, reply) => {
    const refreshToken = request.body?.refreshToken;
    if (!refreshToken) {
      return reply.status(400).send({ error: "refreshToken required" });
    }

    try {
      const { user, refreshToken: newRefreshToken } =
        await rotateRefreshToken(refreshToken);
      const accessToken = app.jwt.sign(
        {
          sub: user.id,
          email: user.email,
          platformRole: user.platformRole,
        },
        { expiresIn: env.JWT_ACCESS_EXPIRES },
      );
      return reply.send({ accessToken, refreshToken: newRefreshToken });
    } catch {
      return reply
        .status(401)
        .send({ error: "Invalid or expired refresh token", code: "INVALID_TOKEN" });
    }
  });

  app.post<{ Body: { refreshToken?: string } }>(
    "/logout",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const refreshToken = request.body?.refreshToken;
      if (refreshToken) await revokeRefreshToken(refreshToken);
      return reply.send({ message: "Logged out successfully" });
    },
  );

  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user;
    const user = await getUserById(payload.sub);
    if (!user) return reply.status(404).send({ error: "User not found" });
    return reply.send({ user });
  });
};
