import { startOfMonth } from "date-fns";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, formatUgx, kampalaDateString } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const now = new Date();
  const today = kampalaDateString();
  const todayStart = new Date(`${today}T00:00:00+03:00`);
  const todayEnd = new Date(`${today}T23:59:59+03:00`);
  const monthStart = startOfMonth(now);

  const [
    pending,
    todayCount,
    monthBookings,
    revenueAgg,
    popular,
    upcoming,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.booking.count({
      where: { startAt: { gte: monthStart } },
    }),
    prisma.bookingService.aggregate({
      _sum: { priceSnapshot: true },
      where: {
        booking: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          startAt: { gte: monthStart },
        },
      },
    }),
    prisma.bookingService.groupBy({
      by: ["serviceId"],
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { startAt: { gte: todayStart } },
      include: {
        professional: { include: { user: true } },
        services: { include: { service: true } },
      },
      orderBy: { startAt: "asc" },
      take: 8,
    }),
  ]);

  const popularServices = await prisma.service.findMany({
    where: { id: { in: popular.map((p) => p.serviceId) } },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="mt-1 font-serif text-3xl">Overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={pending} hint="Need a decision" />
        <StatCard label="Today" value={todayCount} hint="Pending + confirmed" />
        <StatCard label="This month" value={monthBookings} />
        <StatCard
          label="Revenue"
          value={formatUgx(Number(revenueAgg._sum.priceSnapshot ?? 0))}
          hint="Confirmed + completed"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium">Upcoming</h2>
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Client</TH>
                <TH>With</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {upcoming.map((booking) => (
                <TR key={booking.id}>
                  <TD>{formatDateTime(booking.startAt)}</TD>
                  <TD>{booking.customerName}</TD>
                  <TD>{booking.professional.user.name}</TD>
                  <TD>
                    <StatusBadge status={booking.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-medium">Popular services</h2>
          <ul className="space-y-3 text-sm">
            {popular.map((row) => {
              const service = popularServices.find((s) => s.id === row.serviceId);
              return (
                <li key={row.serviceId} className="flex justify-between gap-3">
                  <span>{service?.name ?? "Service"}</span>
                  <span className="text-muted-foreground">{row._count.serviceId}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
