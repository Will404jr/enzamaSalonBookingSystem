"use client";

import { saveUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import type { Role } from "@/generated/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
};

export function UsersManager({ users }: { users: UserRow[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UserRow & { password: string }>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "PROFESSIONAL",
    isActive: true,
    password: "",
  });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setForm({
              id: "",
              name: "",
              email: "",
              phone: "",
              role: "PROFESSIONAL",
              isActive: true,
              password: "",
            });
            setOpen(true);
          }}
        >
          New user
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {users.map((user) => (
            <TR key={user.id}>
              <TD className="font-medium">{user.name}</TD>
              <TD>{user.email}</TD>
              <TD>{user.role === "ADMIN" ? "Admin" : "Professional"}</TD>
              <TD>{user.isActive ? "Active" : "Disabled"}</TD>
              <TD className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm({ ...user, password: "" });
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <Dialog
        open={open}
        title={form.id ? "Edit user" : "New user"}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as Role })
              }
            >
              <option value="ADMIN">Admin</option>
              <option value="PROFESSIONAL">Professional</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Password {form.id ? "(leave blank to keep)" : ""}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <Button
            className="w-full"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await saveUser({
                  id: form.id || undefined,
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                  role: form.role,
                  isActive: form.isActive,
                  password: form.password || undefined,
                });
                setOpen(false);
                router.refresh();
              })
            }
          >
            Save
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
