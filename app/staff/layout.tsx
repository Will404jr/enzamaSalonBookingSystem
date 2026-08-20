import { requireProfessional } from "@/app/actions/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireProfessional();
  return (
    <DashboardShell
      variant="staff"
      name={session.user.name ?? "Professional"}
      roleLabel="Professional"
    >
      {children}
    </DashboardShell>
  );
}
