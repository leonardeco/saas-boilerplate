import { env } from "../env.js";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using Resend (if RESEND_API_KEY is set)
 * or Nodemailer with Ethereal for local development.
 *
 * In development without Resend, logs a preview URL to the console.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (env.RESEND_API_KEY) {
    await sendWithResend(options);
  } else {
    await sendWithEthereal(options);
  }
}

// ─── Resend ──────────────────────────────────────────────────────────────────

async function sendWithResend({ to, subject, html }: SendEmailOptions) {
  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ─── Nodemailer + Ethereal (dev fallback) ────────────────────────────────────

async function sendWithEthereal({ to, subject, html }: SendEmailOptions) {
  const nodemailer = await import("nodemailer");

  let transporter: ReturnType<typeof nodemailer.createTransport>;

  if (env.SMTP_HOST) {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
  } else {
    // Auto-create a free Ethereal test account — no config needed
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  // In dev, print the Ethereal preview URL so you can see the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("\n📧 Email preview (Ethereal):");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Preview: ${previewUrl}\n`);
  }
}
