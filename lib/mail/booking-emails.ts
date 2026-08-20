import type { BookingStatus } from "@/generated/client";
import { prisma } from "@/lib/prisma";
import { getSalonSettings } from "@/lib/settings";
import { getMailer, mailFrom } from "@/lib/mail/mailer";
import {
  bookingEmail,
  type EmailKind,
} from "@/lib/mail/templates";

const bookingInclude = {
  professional: { include: { user: { select: { name: true } } } },
  services: { include: { service: { select: { name: true } } } },
} as const;

async function loadBooking(id: string) {
  return prisma.booking.findUniqueOrThrow({
    where: { id },
    include: bookingInclude,
  });
}

type BookingForEmail = Awaited<ReturnType<typeof loadBooking>>;

function kindForStatus(status: BookingStatus): EmailKind | null {
  if (status === "CONFIRMED") return "confirmed";
  if (status === "REJECTED") return "rejected";
  if (status === "COMPLETED") return "completed";
  return null;
}

async function payloadFromBooking(
  booking: BookingForEmail,
  note?: string,
) {
  const settings = await getSalonSettings();
  return {
    customerName: booking.customerName,
    startAt: booking.startAt,
    professionalName: booking.professional.user.name,
    services: booking.services.map((item) => item.service.name),
    total: booking.services.reduce(
      (sum, item) => sum + Number(item.priceSnapshot),
      0,
    ),
    location: settings.location,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    note,
  };
}

export async function sendBookingEmail(
  booking: BookingForEmail,
  kind: EmailKind,
  note?: string,
) {
  if (!booking.customerEmail) return;

  const { subject, html, text } = bookingEmail(
    kind,
    await payloadFromBooking(booking, note),
  );
  const settings = await getSalonSettings();

  await getMailer().sendMail({
    from: mailFrom(),
    to: booking.customerEmail,
    replyTo: settings.email,
    subject,
    text,
    html,
  });
}

export async function notifyBookingCreated(bookingId: string) {
  try {
    const booking = await loadBooking(bookingId);
    await sendBookingEmail(booking, "received");
  } catch (error) {
    console.error("[mail] received", error);
  }
}

export async function notifyBookingStatus(
  bookingId: string,
  previous: BookingStatus,
  next: BookingStatus,
) {
  if (previous === next) return;
  const kind = kindForStatus(next);
  if (!kind) return;

  try {
    const booking = await loadBooking(bookingId);
    await sendBookingEmail(booking, kind);
  } catch (error) {
    console.error("[mail] status", next, error);
  }
}

export async function notifyBookingDetailsChanged(input: {
  bookingId: string;
  previous: {
    startAt: Date;
    professionalId: string;
    notes: string | null;
    status: BookingStatus;
    professionalName?: string;
  };
  next: {
    startAt: Date;
    professionalId: string;
    notes: string | null;
    status: BookingStatus;
  };
}) {
  const statusChanged = input.previous.status !== input.next.status;
  if (statusChanged) {
    await notifyBookingStatus(
      input.bookingId,
      input.previous.status,
      input.next.status,
    );
    return;
  }

  const timeChanged =
    input.previous.startAt.getTime() !== input.next.startAt.getTime();
  const stylistChanged =
    input.previous.professionalId !== input.next.professionalId;
  const notesChanged = (input.previous.notes ?? "") !== (input.next.notes ?? "");

  if (!timeChanged && !stylistChanged && !notesChanged) return;

  const changes: string[] = [];
  if (timeChanged) changes.push("the date or time");
  if (stylistChanged) changes.push("the professional");
  if (notesChanged) changes.push("the notes");
  const note = `What changed: ${changes.join(", ")}.`;

  try {
    const booking = await loadBooking(input.bookingId);
    await sendBookingEmail(booking, "updated", note);
  } catch (error) {
    console.error("[mail] updated", error);
  }
}

export async function sendTodayReminders() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Kampala",
  });
  const dayStart = new Date(`${today}T00:00:00+03:00`);
  const dayEnd = new Date(`${today}T23:59:59+03:00`);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSentAt: null,
      startAt: { gte: dayStart, lte: dayEnd },
      createdAt: { lt: dayStart },
    },
    include: bookingInclude,
  });

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendBookingEmail(booking, "reminder");
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: new Date() },
      });
      sent += 1;
    } catch (error) {
      console.error("[mail] reminder", booking.id, error);
    }
  }

  return { scanned: bookings.length, sent };
}
