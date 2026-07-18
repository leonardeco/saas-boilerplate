import {
  sendMail,
  bookingHoldEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
} from "./email.service.js";
import {
  sendWhatsAppText,
  bookingWhatsAppMessages,
} from "./whatsapp.service.js";

export async function notifyBookingHold(input: {
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  venueName: string;
  partySize: number;
  startsAt?: string;
  holdExpiresAt?: string;
  reservationId: string;
}) {
  const mail = bookingHoldEmail(input);
  await sendMail({ to: input.guestEmail, ...mail });

  if (input.guestPhone) {
    await sendWhatsAppText({
      to: input.guestPhone,
      body: bookingWhatsAppMessages({
        kind: "hold",
        guestName: input.guestName,
        venueName: input.venueName,
        partySize: input.partySize,
        startsAt: input.startsAt,
      }),
    });
  }
}

export async function notifyBookingConfirmed(input: {
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  venueName: string;
  partySize: number;
  startsAt?: string;
  reservationId: string;
}) {
  const mail = bookingConfirmedEmail(input);
  await sendMail({ to: input.guestEmail, ...mail });

  if (input.guestPhone) {
    await sendWhatsAppText({
      to: input.guestPhone,
      body: bookingWhatsAppMessages({
        kind: "confirmed",
        guestName: input.guestName,
        venueName: input.venueName,
        partySize: input.partySize,
        startsAt: input.startsAt,
      }),
    });
  }
}

export async function notifyBookingCancelled(input: {
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  venueName: string;
  reservationId: string;
}) {
  const mail = bookingCancelledEmail(input);
  await sendMail({ to: input.guestEmail, ...mail });

  if (input.guestPhone) {
    await sendWhatsAppText({
      to: input.guestPhone,
      body: bookingWhatsAppMessages({
        kind: "cancelled",
        guestName: input.guestName,
        venueName: input.venueName,
        partySize: 0,
      }),
    });
  }
}
