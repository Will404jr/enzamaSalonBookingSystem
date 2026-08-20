import { BookingsManager } from "@/components/dashboard/bookings-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminBookingsPage() {
  const [bookings, professionals] = await Promise.all([
    prisma.booking.findMany({
      include: {
        professional: { include: { user: true } },
        services: { include: { service: true } },
      },
      orderBy: { startAt: "desc" },
    }),
    prisma.professional.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Accept, reject, reassign, or edit a visit.
        </p>
      </div>
      <BookingsManager
        variant="admin"
        professionals={professionals.map((p) => ({
          id: p.id,
          name: p.user.name,
        }))}
        bookings={bookings.map((b) => ({
          id: b.id,
          status: b.status,
          startAt: b.startAt.toISOString(),
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          customerEmail: b.customerEmail,
          customerLocation: b.customerLocation,
          notes: b.notes ?? "",
          professionalId: b.professionalId,
          professionalName: b.professional.user.name,
          services: b.services.map((s) => s.service.name).join(", "),
          total: b.services.reduce((sum, s) => sum + Number(s.priceSnapshot), 0),
        }))}
      />
    </div>
  );
}
