"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/app/actions/auth";
import { notifyBookingStatus } from "@/lib/mail/booking-emails";
import type { BookingStatus } from "@/generated/client";
import { prisma } from "@/lib/prisma";

export async function staffUpdateBookingStatus(
  id: string,
  status: Extract<BookingStatus, "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED">,
) {
  const session = await requireProfessional();
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  if (booking.professionalId !== session.user.professionalId) {
    throw new Error("You can only update your own bookings.");
  }
  await prisma.booking.update({ where: { id }, data: { status } });
  void notifyBookingStatus(id, booking.status, status);
  revalidatePath("/staff");
  revalidatePath("/admin");
}

export async function staffUpdateProfile(input: {
  name: string;
  phone?: string;
  title: string;
  bio: string;
}) {
  const session = await requireProfessional();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: input.name, phone: input.phone || null },
  });
  await prisma.professional.update({
    where: { id: session.user.professionalId! },
    data: { title: input.title, bio: input.bio },
  });
  revalidatePath("/staff");
  revalidatePath("/");
}
