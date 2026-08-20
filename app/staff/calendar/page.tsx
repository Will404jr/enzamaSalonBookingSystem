import { requireProfessional } from "@/app/actions/auth";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { prisma } from "@/lib/prisma";

export default async function StaffCalendarPage() {
  const session = await requireProfessional();
  const bookings = await prisma.booking.findMany({
    where: { professionalId: session.user.professionalId! },
    include: { professional: { include: { user: true } } },
    orderBy: { startAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Your calendar</h1>
        <p className="text-sm text-muted-foreground">Only your chair.</p>
      </div>
      <CalendarView
        bookings={bookings.map((b) => ({
          id: b.id,
          startAt: b.startAt.toISOString(),
          endAt: b.endAt.toISOString(),
          status: b.status,
          customerName: b.customerName,
          professionalName: b.professional.user.name,
        }))}
      />
    </div>
  );
}
