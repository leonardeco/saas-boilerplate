/**
 * WhatsApp notifications via Meta Cloud API (optional).
 * Env:
 *   WHATSAPP_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_ENABLED=true
 *
 * Without config → dev log only (never throws).
 */

export type WhatsAppResult = {
  ok: boolean;
  id?: string;
  preview?: boolean;
  skipped?: boolean;
};

function enabled() {
  return (
    process.env.WHATSAPP_ENABLED === "true" &&
    Boolean(process.env.WHATSAPP_TOKEN) &&
    Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID)
  );
}

/** Normalize CO mobiles to E.164 (+57…) when possible. */
export function normalizeWhatsAppTo(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("57") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+57${digits}`;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

export async function sendWhatsAppText(input: {
  to: string;
  body: string;
}): Promise<WhatsAppResult> {
  const to = normalizeWhatsAppTo(input.to);
  if (!to) return { ok: false, skipped: true };

  if (!enabled()) {
    console.log("\n[whatsapp:dev] ─────────────────────────");
    console.log(`To: ${to}`);
    console.log(input.body);
    console.log("────────────────────────────────────────\n");
    return { ok: true, preview: true };
  }

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace("+", ""),
        type: "text",
        text: { preview_url: false, body: input.body },
      }),
    });
    if (!res.ok) {
      console.error("[whatsapp] API error", res.status, await res.text());
      return { ok: false };
    }
    const data = (await res.json()) as { messages?: Array<{ id: string }> };
    return { ok: true, id: data.messages?.[0]?.id };
  } catch (err) {
    console.error("[whatsapp] network error", err);
    return { ok: false };
  }
}

export function bookingWhatsAppMessages(input: {
  kind: "hold" | "confirmed" | "cancelled";
  guestName: string;
  venueName: string;
  partySize: number;
  startsAt?: string;
}) {
  const when = input.startsAt
    ? ` · ${new Date(input.startsAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}`
    : "";
  switch (input.kind) {
    case "hold":
      return `NightTable: Hola ${input.guestName}, HOLD de ${input.partySize} en ${input.venueName}${when}. Confirma pronto o expira.`;
    case "confirmed":
      return `NightTable: ✓ Reserva confirmada · ${input.partySize} pax en ${input.venueName}${when}. ¡Te esperamos!`;
    case "cancelled":
      return `NightTable: Reserva cancelada en ${input.venueName}. Si fue un error, vuelve a reservar en la app.`;
  }
}
