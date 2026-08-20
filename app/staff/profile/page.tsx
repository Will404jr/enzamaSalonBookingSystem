import { requireProfessional } from "@/app/actions/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { prisma } from "@/lib/prisma";

export default async function StaffProfilePage() {
  const session = await requireProfessional();
  const professional = await prisma.professional.findUniqueOrThrow({
    where: { id: session.user.professionalId! },
    include: { user: true, services: { include: { service: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Your details</h1>
        <p className="text-sm text-muted-foreground">
          This is what guests see on the marketing page.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Services: {professional.services.map((s) => s.service.name).join(" · ")}
      </p>
      <ProfileForm
        name={professional.user.name}
        phone={professional.user.phone ?? ""}
        title={professional.title}
        bio={professional.bio}
      />
    </div>
  );
}
