import { requireAdmin } from "@/app/actions/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <DashboardShell
      variant="admin"
      name={session.user.name ?? "Admin"}
      roleLabel="Management"
    >
      {children}
    </DashboardShell>
  );
}
