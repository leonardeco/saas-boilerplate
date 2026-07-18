import {
  sendMail,
  bookingHoldEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
} from "./email.service.js";
import { sendBookingWhatsApp } from "./whatsapp.service.js";

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
    await sendBookingWhatsApp({
      kind: "hold",
      to: input.guestPhone,
      guestName: input.guestName,
      venueName: input.venueName,
      partySize: input.partySize,
      startsAt: input.startsAt,
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
    await sendBookingWhatsApp({
      kind: "confirmed",
      to: input.guestPhone,
      guestName: input.guestName,
      venueName: input.venueName,
      partySize: input.partySize,
      startsAt: input.startsAt,
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
    await sendBookingWhatsApp({
      kind: "cancelled",
      to: input.guestPhone,
      guestName: input.guestName,
      venueName: input.venueName,
      partySize: 0,
    });
  }
}
