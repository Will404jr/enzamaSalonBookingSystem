"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/app/actions/auth";
import { notifyBookingDetailsChanged } from "@/lib/mail/booking-emails";
import type { BookingStatus, Role, ServiceCategory } from "@/generated/client";
import { prisma } from "@/lib/prisma";

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/staff");
  revalidatePath("/");
  revalidatePath("/book");
}

export async function saveService(input: {
  id?: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  durationMin: number;
  price: number;
  isActive: boolean;
}) {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.string().optional(),
      name: z.string().trim().min(2),
      slug: z.string().trim().min(2),
      category: z.enum([
        "HAIR",
        "COLOR",
        "BRAIDS",
        "BARBER",
        "NAILS",
        "MAKEUP",
        "LASHES_BROWS",
        "SKIN_SPA",
        "WAXING",
      ]),
      description: z.string().trim().min(4),
      durationMin: z.number().int().positive(),
      price: z.number().nonnegative(),
      isActive: z.boolean(),
    })
    .parse(input);

  if (parsed.id) {
    await prisma.service.update({
      where: { id: parsed.id },
      data: parsed,
    });
  } else {
    await prisma.service.create({ data: parsed });
  }
  refresh();
}

export async function deleteService(id: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id } });
  refresh();
}

export async function saveProfessional(input: {
  professionalId?: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  bio: string;
  isActive: boolean;
  password?: string;
  serviceIds: string[];
  hours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isOff: boolean;
  }[];
}) {
  await requireAdmin();
  const email = input.email.trim().toLowerCase();

  let userId = input.userId;
  if (!userId) {
    if (!input.password) {
      throw new Error("Password is required for a new professional.");
    }
    const user = await prisma.user.create({
      data: {
        email,
        name: input.name,
        phone: input.phone || null,
        passwordHash: await hash(input.password, 10),
        role: "PROFESSIONAL",
        isActive: input.isActive,
      },
    });
    userId = user.id;
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name: input.name,
        phone: input.phone || null,
        isActive: input.isActive,
        ...(input.password
          ? { passwordHash: await hash(input.password, 10) }
          : {}),
      },
    });
  }

  const professional = input.professionalId
    ? await prisma.professional.update({
        where: { id: input.professionalId },
        data: {
          title: input.title,
          bio: input.bio,
          isActive: input.isActive,
        },
      })
    : await prisma.professional.create({
        data: {
          userId,
          title: input.title,
          bio: input.bio,
          isActive: input.isActive,
        },
      });

  await prisma.professionalService.deleteMany({
    where: { professionalId: professional.id },
  });
  if (input.serviceIds.length > 0) {
    await prisma.professionalService.createMany({
      data: input.serviceIds.map((serviceId) => ({
        professionalId: professional.id,
        serviceId,
      })),
    });
  }

  await prisma.workingHour.deleteMany({
    where: { professionalId: professional.id },
  });
  await prisma.workingHour.createMany({
    data: input.hours.map((hour) => ({
      professionalId: professional.id,
      ...hour,
    })),
  });

  refresh();
}

export async function saveUser(input: {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  password?: string;
}) {
  await requireAdmin();
  const email = input.email.trim().toLowerCase();

  if (input.id) {
    await prisma.user.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email,
        phone: input.phone || null,
        role: input.role,
        isActive: input.isActive,
        ...(input.password
          ? { passwordHash: await hash(input.password, 10) }
          : {}),
      },
    });
  } else {
    if (!input.password) throw new Error("Password is required.");
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        phone: input.phone || null,
        role: input.role,
        isActive: input.isActive,
        passwordHash: await hash(input.password, 10),
      },
    });
    if (input.role === "PROFESSIONAL") {
      await prisma.professional.create({
        data: {
          userId: user.id,
          title: "Stylist",
          bio: "New team member.",
        },
      });
    }
  }
  refresh();
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await requireAdmin();
  const existing = await prisma.booking.findUniqueOrThrow({ where: { id } });
  await prisma.booking.update({ where: { id }, data: { status } });
  void notifyBookingDetailsChanged({
    bookingId: id,
    previous: {
      startAt: existing.startAt,
      professionalId: existing.professionalId,
      notes: existing.notes,
      status: existing.status,
    },
    next: {
      startAt: existing.startAt,
      professionalId: existing.professionalId,
      notes: existing.notes,
      status,
    },
  });
  refresh();
}

export async function updateBooking(input: {
  id: string;
  professionalId: string;
  startIso: string;
  status: BookingStatus;
  notes?: string;
}) {
  const session = await requireAdmin();
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: input.id },
    include: { services: true },
  });
  const duration = booking.services.reduce(
    (sum, item) => sum + item.durationSnapshot,
    0,
  );
  const startAt = new Date(input.startIso);
  const endAt = new Date(startAt.getTime() + duration * 60_000);

  const dateChanged =
    booking.startAt.toLocaleDateString("en-CA", {
      timeZone: "Africa/Kampala",
    }) !==
    startAt.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" });

  await prisma.booking.update({
    where: { id: input.id },
    data: {
      professionalId: input.professionalId,
      startAt,
      endAt,
      status: input.status,
      notes: input.notes || null,
      assignedById: session.user.id,
      ...(dateChanged ? { reminderSentAt: null } : {}),
    },
  });
  void notifyBookingDetailsChanged({
    bookingId: input.id,
    previous: {
      startAt: booking.startAt,
      professionalId: booking.professionalId,
      notes: booking.notes,
      status: booking.status,
    },
    next: {
      startAt,
      professionalId: input.professionalId,
      notes: input.notes || null,
      status: input.status,
    },
  });
  refresh();
}

export async function saveSettings(input: {
  businessName: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  defaultOpenTime: string;
  defaultCloseTime: string;
  slotIntervalMin: number;
}) {
  await requireAdmin();
  await prisma.salonSettings.upsert({
    where: { id: 1 },
    update: input,
    create: {
      id: 1,
      timezone: "Africa/Kampala",
      ...input,
    },
  });
  refresh();
}
