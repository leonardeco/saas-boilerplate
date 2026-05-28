import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db, users, passwordResetTokens } from "@saas/db";
import { eq, and, isNull, gt } from "drizzle-orm";
import { sendEmail } from "./email.service.js";
import { resetPasswordEmail } from "../templates/reset-password.js";
import { env } from "../env.js";

const TOKEN_EXPIRY_MINUTES = 60;

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/** Generates a reset token, stores its hash and sends the email. */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Always respond the same way — don't reveal if email exists
  if (!user) return;

  // Invalidate previous unused tokens for this user
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt),
      ),
    );

  // Generate new token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    tokenHash,
    userId: user.id,
    expiresAt,
  });

  const resetUrl = `${env.WEB_URL}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Restablecer contrasena — SaaS Boilerplate",
    html: resetPasswordEmail({
      name: user.name,
      resetUrl,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    }),
  });
}

/** Validates token and updates the password. Returns the user on success. */
export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken);

  const record = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date()),
    ),
    with: { user: true },
  });

  if (!record) throw new Error("TOKEN_INVALID");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password and mark email as verified (they proved access to the inbox)
  await db
    .update(users)
    .set({ passwordHash, emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, record.id));

  return record.user;
}
