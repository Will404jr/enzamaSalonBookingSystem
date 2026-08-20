import { CalendarView } from "@/components/dashboard/calendar-view";
import { StatCard } from "@/components/dashboard/stat-card";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/app/actions/auth";
import { kampalaDateString } from "@/lib/format";
import { startOfMonth } from "date-fns";

export default async function StaffHomePage() {
  const session = await requireProfessional();
  const professionalId = session.user.professionalId!;
  const today = kampalaDateString();
  const todayStart = new Date(`${today}T00:00:00+03:00`);
  const todayEnd = new Date(`${today}T23:59:59+03:00`);
  const monthStart = startOfMonth(new Date());

  const [professional, pending, todayCount, completedMonth, upcoming] =
    await Promise.all([
      prisma.professional.findUniqueOrThrow({
        where: { id: professionalId },
        include: {
          user: true,
          services: { include: { service: true } },
        },
      }),
      prisma.booking.count({
        where: { professionalId, status: "PENDING" },
      }),
      prisma.booking.count({
        where: {
          professionalId,
          startAt: { gte: todayStart, lte: todayEnd },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      prisma.booking.count({
        where: {
          professionalId,
          status: "COMPLETED",
          startAt: { gte: monthStart },
        },
      }),
      prisma.booking.findMany({
        where: { professionalId, startAt: { gte: todayStart } },
        include: { professional: { include: { user: true } } },
        orderBy: { startAt: "asc" },
        take: 12,
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          {professional.title}
        </p>
        <h1 className="mt-1 font-serif text-3xl">{professional.user.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {professional.bio}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={todayCount} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Completed this month" value={completedMonth} />
      </div>
      <div>
        <h2 className="mb-3 text-sm font-medium">Your services</h2>
        <p className="text-sm text-muted-foreground">
          {professional.services.map((s) => s.service.name).join(" · ")}
        </p>
      </div>
      <CalendarView
        bookings={upcoming.map((b) => ({
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
