import { ServicesManager } from "@/components/dashboard/services-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Services</h1>
        <p className="text-sm text-muted-foreground">
          The public menu. Hide a service without deleting history.
        </p>
      </div>
      <ServicesManager
        services={services.map((s) => ({
          ...s,
          price: Number(s.price),
        }))}
      />
    </div>
  );
}
