import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
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

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post("/register", async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const { user, organization } = await registerUser(
        body.data.name,
        body.data.email,
        body.data.password,
      );

      const accessToken = app.jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m" },
      );
      const refreshToken = await createRefreshToken(user.id);

      return reply.status(201).send({ accessToken, refreshToken, user, organization });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EMAIL_IN_USE") {
        return reply.status(409).send({ error: "Email already in use" });
      }
      throw err;
    }
  });

  // POST /auth/login
  app.post("/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const user = await loginUser(body.data.email, body.data.password);

      const accessToken = app.jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m" },
      );
      const refreshToken = await createRefreshToken(user.id);

      return reply.send({ accessToken, refreshToken, user });
    } catch {
      return reply.status(401).send({ error: "Invalid credentials" });
    }
  });

  // POST /auth/refresh
  app.post<{ Body: { refreshToken: string } }>("/refresh", async (request, reply) => {
    const { refreshToken } = request.body ?? {};
    if (!refreshToken) return reply.status(400).send({ error: "refreshToken required" });

    try {
      const { user, refreshToken: newRefreshToken } = await rotateRefreshToken(refreshToken);

      const accessToken = app.jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m" },
      );

      return reply.send({ accessToken, refreshToken: newRefreshToken });
    } catch {
      return reply.status(401).send({ error: "Invalid or expired refresh token" });
    }
  });

  // POST /auth/logout
  app.post<{ Body: { refreshToken: string } }>(
    "/logout",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { refreshToken } = request.body ?? {};
      if (refreshToken) await revokeRefreshToken(refreshToken);
      return reply.send({ message: "Logged out successfully" });
    },
  );

  // GET /auth/me
  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string; email: string };
    return reply.send({ id: payload.sub, email: payload.email });
  });
}
