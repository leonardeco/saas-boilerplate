export type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Email sender:
 * - RESEND_API_KEY → Resend API
 * - else log to console (dev) and return { preview: true }
 */
export async function sendMail(payload: MailPayload): Promise<{
  ok: boolean;
  id?: string;
  preview?: boolean;
}> {
  const from = process.env.EMAIL_FROM ?? "no-reply@nighttable.co";
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend failed", res.status, body);
      return { ok: false };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  }

  console.log("\n[email:dev] ─────────────────────────────");
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(payload.text ?? payload.html.replace(/<[^>]+>/g, " ").slice(0, 400));
  console.log("────────────────────────────────────────\n");
  return { ok: true, preview: true };
}

export function bookingHoldEmail(input: {
  guestName: string;
  venueName: string;
  partySize: number;
  startsAt?: string;
  holdExpiresAt?: string;
  reservationId: string;
}) {
  const web = process.env.WEB_URL ?? "http://localhost:3000";
  const confirmUrl = `${web}/mis-reservas`;
  return {
    subject: `HOLD · ${input.venueName} — confirma tu reserva`,
    text: `Hola ${input.guestName}, tienes un HOLD de ${input.partySize} personas en ${input.venueName}. Expira: ${input.holdExpiresAt ?? "pronto"}. Confirma en ${confirmUrl}. Ref: ${input.reservationId}`,
    html: `
      <h2>Reserva en espera (HOLD)</h2>
      <p>Hola <strong>${escapeHtml(input.guestName)}</strong>,</p>
      <p>Reservamos temporalmente <strong>${input.partySize}</strong> cupos en
      <strong>${escapeHtml(input.venueName)}</strong>.</p>
      ${input.startsAt ? `<p>Horario: ${escapeHtml(input.startsAt)}</p>` : ""}
      <p>Expira: <strong>${escapeHtml(input.holdExpiresAt ?? "8 min")}</strong></p>
      <p><a href="${confirmUrl}">Confirma o revisa en NightTable</a></p>
      <p style="color:#666;font-size:12px">Ref: ${escapeHtml(input.reservationId)}</p>
    `,
  };
}

export function bookingConfirmedEmail(input: {
  guestName: string;
  venueName: string;
  partySize: number;
  startsAt?: string;
  reservationId: string;
}) {
  return {
    subject: `Confirmada · ${input.venueName}`,
    text: `Hola ${input.guestName}, tu reserva de ${input.partySize} en ${input.venueName} está CONFIRMADA. Ref: ${input.reservationId}`,
    html: `
      <h2>Reserva confirmada ✓</h2>
      <p>Hola <strong>${escapeHtml(input.guestName)}</strong>,</p>
      <p>Tu mesa en <strong>${escapeHtml(input.venueName)}</strong> para
      <strong>${input.partySize}</strong> personas está <strong>confirmada</strong>.</p>
      ${input.startsAt ? `<p>Horario: ${escapeHtml(input.startsAt)}</p>` : ""}
      <p style="color:#666;font-size:12px">Ref: ${escapeHtml(input.reservationId)}</p>
      <p>— NightTable CO</p>
    `,
  };
}

export function bookingCancelledEmail(input: {
  guestName: string;
  venueName: string;
  reservationId: string;
}) {
  return {
    subject: `Cancelada · ${input.venueName}`,
    text: `Hola ${input.guestName}, tu reserva en ${input.venueName} fue cancelada. Ref: ${input.reservationId}`,
    html: `
      <h2>Reserva cancelada</h2>
      <p>Hola <strong>${escapeHtml(input.guestName)}</strong>,</p>
      <p>Tu reserva en <strong>${escapeHtml(input.venueName)}</strong> fue cancelada.</p>
      <p style="color:#666;font-size:12px">Ref: ${escapeHtml(input.reservationId)}</p>
    `,
  };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
