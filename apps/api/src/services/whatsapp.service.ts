/**
 * WhatsApp via Meta Cloud API.
 *
 * Modes:
 * 1) Free-form text (within 24h session window)
 * 2) Approved templates (utility/marketing) when WHATSAPP_USE_TEMPLATES=true
 *
 * Env:
 *   WHATSAPP_ENABLED=true
 *   WHATSAPP_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_USE_TEMPLATES=true|false
 *   WHATSAPP_TEMPLATE_HOLD / CONFIRMED / CANCELLED  (names in Meta)
 *   WHATSAPP_TEMPLATE_LANG=es  (default es)
 */

export type WhatsAppResult = {
  ok: boolean;
  id?: string;
  preview?: boolean;
  skipped?: boolean;
  mode?: "text" | "template";
};

export type BookingNotifyKind = "hold" | "confirmed" | "cancelled";

function enabled() {
  return (
    process.env.WHATSAPP_ENABLED === "true" &&
    Boolean(process.env.WHATSAPP_TOKEN) &&
    Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID)
  );
}

function useTemplates() {
  return process.env.WHATSAPP_USE_TEMPLATES === "true";
}

export function normalizeWhatsAppTo(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("57") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+57${digits}`;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

/** Map kind → Meta template name from env (approved templates). */
export function templateNameFor(kind: BookingNotifyKind): string | null {
  const map: Record<BookingNotifyKind, string | undefined> = {
    hold: process.env.WHATSAPP_TEMPLATE_HOLD,
    confirmed: process.env.WHATSAPP_TEMPLATE_CONFIRMED,
    cancelled: process.env.WHATSAPP_TEMPLATE_CANCELLED,
  };
  return map[kind]?.trim() || null;
}

/**
 * Body params for common utility templates:
 * {{1}} guestName {{2}} venueName {{3}} partySize {{4}} when
 */
export function templateBodyParams(input: {
  guestName: string;
  venueName: string;
  partySize: number;
  startsAt?: string;
}): string[] {
  const when = input.startsAt
    ? new Date(input.startsAt).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      })
    : "por confirmar";
  return [
    input.guestName,
    input.venueName,
    String(input.partySize || 0),
    when,
  ];
}

export function bookingWhatsAppMessages(input: {
  kind: BookingNotifyKind;
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

async function postMessage(payload: Record<string, unknown>): Promise<WhatsAppResult> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("[whatsapp] API error", res.status, await res.text());
    return { ok: false };
  }
  const data = (await res.json()) as { messages?: Array<{ id: string }> };
  return { ok: true, id: data.messages?.[0]?.id };
}

export async function sendWhatsAppText(input: {
  to: string;
  body: string;
}): Promise<WhatsAppResult> {
  const to = normalizeWhatsAppTo(input.to);
  if (!to) return { ok: false, skipped: true };

  if (!enabled()) {
    console.log("\n[whatsapp:dev:text]", to, input.body, "\n");
    return { ok: true, preview: true, mode: "text" };
  }

  try {
    const result = await postMessage({
      messaging_product: "whatsapp",
      to: to.replace("+", ""),
      type: "text",
      text: { preview_url: false, body: input.body },
    });
    return { ...result, mode: "text" };
  } catch (err) {
    console.error("[whatsapp] network error", err);
    return { ok: false, mode: "text" };
  }
}

export async function sendWhatsAppTemplate(input: {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParams: string[];
}): Promise<WhatsAppResult> {
  const to = normalizeWhatsAppTo(input.to);
  if (!to) return { ok: false, skipped: true };

  const lang = input.languageCode ?? process.env.WHATSAPP_TEMPLATE_LANG ?? "es";

  if (!enabled()) {
    console.log("\n[whatsapp:dev:template]", {
      to,
      template: input.templateName,
      lang,
      params: input.bodyParams,
    });
    return { ok: true, preview: true, mode: "template" };
  }

  try {
    const result = await postMessage({
      messaging_product: "whatsapp",
      to: to.replace("+", ""),
      type: "template",
      template: {
        name: input.templateName,
        language: { code: lang },
        components: [
          {
            type: "body",
            parameters: input.bodyParams.map((text) => ({
              type: "text",
              text: text.slice(0, 1024),
            })),
          },
        ],
      },
    });
    return { ...result, mode: "template" };
  } catch (err) {
    console.error("[whatsapp] template error", err);
    return { ok: false, mode: "template" };
  }
}

/**
 * Prefer approved template when configured; else free-form text.
 */
export async function sendBookingWhatsApp(input: {
  kind: BookingNotifyKind;
  to: string;
  guestName: string;
  venueName: string;
  partySize: number;
  startsAt?: string;
}): Promise<WhatsAppResult> {
  if (useTemplates()) {
    const name = templateNameFor(input.kind);
    if (name) {
      return sendWhatsAppTemplate({
        to: input.to,
        templateName: name,
        bodyParams: templateBodyParams(input),
      });
    }
  }

  return sendWhatsAppText({
    to: input.to,
    body: bookingWhatsAppMessages(input),
  });
}
