import { UsersManager } from "@/components/dashboard/users-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground">
          Staff accounts. Creating a professional also opens their floor profile.
        </p>
      </div>
      <UsersManager
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone ?? "",
          role: u.role,
          isActive: u.isActive,
        }))}
      />
    </div>
  );
}
