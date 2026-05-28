import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/auth.service.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../services/password-reset.service.js";

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

  // POST /auth/forgot-password
  app.post("/forgot-password", async (request, reply) => {
    const schema = z.object({ email: z.string().email() });
    const body = schema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    // Always 200 — don't reveal if email exists
    await requestPasswordReset(body.data.email).catch((err) => {
      request.log.error(err, "Error sending password reset email");
    });

    return reply.send({
      message: "Si existe una cuenta con ese email, recibiras un enlace para restablecer tu contrasena.",
    });
  });

  // POST /auth/reset-password
  app.post("/reset-password", async (request, reply) => {
    const schema = z.object({
      token: z.string().min(1),
      password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
    });
    const body = schema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const user = await resetPassword(body.data.token, body.data.password);
      const accessToken = app.jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m" },
      );
      const refreshToken = await createRefreshToken(user.id);
      return reply.send({ message: "Contrasena restablecida correctamente.", accessToken, refreshToken });
    } catch {
      return reply.status(400).send({ error: "El enlace es invalido o ya expiro. Solicita uno nuevo." });
    }
  });

  // GET /auth/verify-reset-token — check if token is still valid before showing the form
  app.get<{ Querystring: { token: string } }>("/verify-reset-token", async (request, reply) => {
    const { token } = request.query;
    if (!token) return reply.status(400).send({ valid: false });

    const crypto = await import("node:crypto");
    const { db, passwordResetTokens } = await import("@saas/db");
    const { eq, and, isNull, gt } = await import("drizzle-orm");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    });

    return reply.send({ valid: !!record });
  });
}
