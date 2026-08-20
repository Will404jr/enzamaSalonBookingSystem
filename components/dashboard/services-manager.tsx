"use client";

import { deleteService, saveService } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/constants";
import { formatDuration, formatUgx } from "@/lib/format";
import type { ServiceCategory } from "@/generated/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  durationMin: number;
  price: number;
  isActive: boolean;
};

const empty = {
  id: "",
  name: "",
  slug: "",
  category: "HAIR" as ServiceCategory,
  description: "",
  durationMin: 30,
  price: 0,
  isActive: true,
};

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function edit(row: ServiceRow) {
    setForm(row);
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      await saveService({
        id: form.id || undefined,
        name: form.name,
        slug:
          form.slug ||
          form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        category: form.category,
        description: form.description,
        durationMin: Number(form.durationMin),
        price: Number(form.price),
        isActive: form.isActive,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setForm(empty);
            setOpen(true);
          }}
        >
          New service
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Category</TH>
            <TH>Duration</TH>
            <TH>Price</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {services.map((service) => (
            <TR key={service.id}>
              <TD className="font-medium">{service.name}</TD>
              <TD>{CATEGORY_LABELS[service.category]}</TD>
              <TD>{formatDuration(service.durationMin)}</TD>
              <TD>{formatUgx(service.price)}</TD>
              <TD>{service.isActive ? "Active" : "Hidden"}</TD>
              <TD className="space-x-2 text-right">
                <Button variant="outline" size="sm" onClick={() => edit(service)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      await deleteService(service.id);
                      router.refresh();
                    })
                  }
                >
                  Delete
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <Dialog
        open={open}
        title={form.id ? "Edit service" : "New service"}
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
            <Label>Category</Label>
            <Select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as ServiceCategory })
              }
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={form.durationMin}
                onChange={(e) =>
                  setForm({ ...form, durationMin: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (UGX)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          <Button onClick={submit} disabled={pending} className="w-full">
            Save
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
