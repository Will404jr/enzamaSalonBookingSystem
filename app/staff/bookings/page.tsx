import { requireProfessional } from "@/app/actions/auth";
import { BookingsManager } from "@/components/dashboard/bookings-manager";
import { prisma } from "@/lib/prisma";

export default async function StaffBookingsPage() {
  const session = await requireProfessional();
  const bookings = await prisma.booking.findMany({
    where: { professionalId: session.user.professionalId! },
    include: {
      professional: { include: { user: true } },
      services: { include: { service: true } },
    },
    orderBy: { startAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Your bookings</h1>
        <p className="text-sm text-muted-foreground">
          Accept or reject requests assigned to you.
        </p>
      </div>
      <BookingsManager
        variant="staff"
        professionals={[]}
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
