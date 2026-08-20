import { CalendarView } from "@/components/dashboard/calendar-view";
import { prisma } from "@/lib/prisma";

export default async function AdminCalendarPage() {
  const bookings = await prisma.booking.findMany({
    include: { professional: { include: { user: true } } },
    orderBy: { startAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          The floor at a glance.
        </p>
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
