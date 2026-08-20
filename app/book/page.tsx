import type { Metadata } from "next";
import Link from "next/link";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { SiteHeader } from "@/components/marketing/site-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Book",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [services, professionals] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.professional.findMany({
      where: { isActive: true, user: { isActive: true } },
      include: {
        user: { select: { name: true } },
        services: { select: { serviceId: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.28em] text-primary">Booking</p>
        <h1 className="mt-2 font-serif text-4xl">Reserve a chair</h1>
        <p className="mt-2 mb-8 max-w-xl text-sm text-muted-foreground">
          Choose what you want, who you want, and a time that is free. We will
          confirm shortly.{" "}
          <Link href="/" className="text-foreground underline">
            Back to the salon
          </Link>
        </p>
        <BookingWizard
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
            durationMin: s.durationMin,
            price: Number(s.price),
          }))}
          professionals={professionals.map((p) => ({
            id: p.id,
            name: p.user.name,
            title: p.title,
            serviceIds: p.services.map((s) => s.serviceId),
          }))}
        />
      </main>
    </div>
  );
}
