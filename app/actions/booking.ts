"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildSlots,
  dayOfWeekInKampala,
  kampalaDateTime,
  type Slot,
} from "@/lib/availability";
import { kampalaDateString } from "@/lib/format";
import { getSalonSettings } from "@/lib/settings";
import { notifyBookingCreated } from "@/lib/mail/booking-emails";

const bookingSchema = z.object({
  serviceIds: z.array(z.string()).min(1),
  professionalId: z.string().min(1),
  startIso: z.string().min(1),
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(7),
  customerEmail: z.string().trim().email(),
  customerLocation: z.string().trim().min(2),
  notes: z.string().optional(),
});

async function settings() {
  return getSalonSettings();
}

export async function professionalsForServices(serviceIds: string[]) {
  if (serviceIds.length === 0) return [];

  const professionals = await prisma.professional.findMany({
    where: {
      isActive: true,
      user: { isActive: true },
      services: {
        some: { serviceId: { in: serviceIds } },
      },
    },
    include: {
      user: { select: { name: true } },
      services: { select: { serviceId: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return professionals.filter((pro) =>
    serviceIds.every((id) => pro.services.some((s) => s.serviceId === id)),
  );
}

export async function getSlotsForDate(input: {
  serviceIds: string[];
  professionalId: string | "any";
  date: string;
}): Promise<Slot[]> {
  if (input.serviceIds.length === 0 || !input.date) return [];

  const [salon, services, eligible] = await Promise.all([
    settings(),
    prisma.service.findMany({
      where: { id: { in: input.serviceIds }, isActive: true },
    }),
    professionalsForServices(input.serviceIds),
  ]);

  if (services.length !== input.serviceIds.length) return [];

  const durationMin = services.reduce((sum, s) => sum + s.durationMin, 0);
  const day = dayOfWeekInKampala(input.date);
  const candidates =
    input.professionalId === "any"
      ? eligible
      : eligible.filter((p) => p.id === input.professionalId);

  const slots: Slot[] = [];

  for (const pro of candidates) {
    const hours = await prisma.workingHour.findUnique({
      where: {
        professionalId_dayOfWeek: {
          professionalId: pro.id,
          dayOfWeek: day,
        },
      },
    });
    if (!hours || hours.isOff) continue;

    const dayStart = kampalaDateTime(input.date, "00:00");
    const dayEnd = kampalaDateTime(input.date, "23:59");
    const bookings = await prisma.booking.findMany({
      where: {
        professionalId: pro.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      },
      select: { startAt: true, endAt: true },
    });

    slots.push(
      ...buildSlots({
        date: input.date,
        startTime: hours.startTime,
        endTime: hours.endTime,
        intervalMin: salon.slotIntervalMin,
        durationMin,
        busy: bookings.map((b) => ({ start: b.startAt, end: b.endAt })),
        professionalId: pro.id,
      }),
    );
  }

  return slots.sort((a, b) => a.startIso.localeCompare(b.startIso));
}

export async function getSuggestedSlots(input: {
  serviceIds: string[];
  professionalId: string | "any";
}): Promise<Slot[]> {
  const today = kampalaDateString();
  const suggestions: Slot[] = [];

  for (let offset = 0; offset < 10 && suggestions.length < 3; offset += 1) {
    const date = new Date(`${today}T12:00:00+03:00`);
    date.setUTCDate(date.getUTCDate() + offset);
    const dateStr = date.toISOString().slice(0, 10);
    const slots = await getSlotsForDate({
      ...input,
      date: dateStr,
    });
    for (const slot of slots) {
      if (new Date(slot.startIso).getTime() <= Date.now()) continue;
      suggestions.push(slot);
      if (suggestions.length >= 3) break;
    }
  }

  return suggestions;
}

export async function createGuestBooking(input: unknown) {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please complete every field." };
  }

  const data = parsed.data;
  const startAt = new Date(data.startIso);
  if (Number.isNaN(startAt.getTime()) || startAt.getTime() <= Date.now()) {
    return { ok: false as const, error: "Choose a future time." };
  }

  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds }, isActive: true },
  });
  if (services.length !== data.serviceIds.length) {
    return { ok: false as const, error: "One of the services is unavailable." };
  }

  const durationMin = services.reduce((sum, s) => sum + s.durationMin, 0);
  const endAt = new Date(startAt.getTime() + durationMin * 60_000);
  const date = startAt.toLocaleDateString("en-CA", {
    timeZone: "Africa/Kampala",
  });

  const eligible = await professionalsForServices(data.serviceIds);
  if (!eligible.some((p) => p.id === data.professionalId)) {
    return {
      ok: false as const,
      error: "That professional does not offer all selected services.",
    };
  }

  const slots = await getSlotsForDate({
    serviceIds: data.serviceIds,
    professionalId: data.professionalId,
    date,
  });
  const stillOpen = slots.some(
    (slot) =>
      slot.startIso === startAt.toISOString() &&
      slot.professionalId === data.professionalId,
  );
  if (!stillOpen) {
    return { ok: false as const, error: "That time is no longer available." };
  }

  const booking = await prisma.booking.create({
    data: {
      status: "PENDING",
      startAt,
      endAt,
      professionalId: data.professionalId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerLocation: data.customerLocation,
      notes: data.notes || null,
      services: {
        create: services.map((service) => ({
          serviceId: service.id,
          priceSnapshot: service.price,
          durationSnapshot: service.durationMin,
        })),
      },
    },
    include: {
      professional: { include: { user: { select: { name: true } } } },
      services: { include: { service: true } },
    },
  });

  void notifyBookingCreated(booking.id);

  return {
    ok: true as const,
    booking: {
      id: booking.id,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      professionalName: booking.professional.user.name,
      customerName: booking.customerName,
      services: booking.services.map((item) => item.service.name),
      total: booking.services.reduce(
        (sum, item) => sum + Number(item.priceSnapshot),
        0,
      ),
    },
  };
}
