import { ProfessionalsManager } from "@/components/dashboard/professionals-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminProfessionalsPage() {
  const [professionals, services] = await Promise.all([
    prisma.professional.findMany({
      include: {
        user: true,
        services: true,
        workingHours: { orderBy: { dayOfWeek: "asc" } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Professionals</h1>
        <p className="text-sm text-muted-foreground">
          Assign services and set weekly hours.
        </p>
      </div>
      <ProfessionalsManager
        services={services.map((s) => ({ id: s.id, name: s.name }))}
        professionals={professionals.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.user.name,
          email: p.user.email,
          phone: p.user.phone ?? "",
          title: p.title,
          bio: p.bio,
          isActive: p.isActive,
          serviceIds: p.services.map((s) => s.serviceId),
          hours: p.workingHours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            startTime: h.startTime,
            endTime: h.endTime,
            isOff: h.isOff,
          })),
        }))}
      />
    </div>
  );
}
