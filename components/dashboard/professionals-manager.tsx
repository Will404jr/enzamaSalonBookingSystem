"use client";

import { saveProfessional } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DAY_LABELS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Hour = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
};

type ProRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  isActive: boolean;
  serviceIds: string[];
  hours: Hour[];
};

const defaultHours: Hour[] = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "18:00",
  isOff: dayOfWeek === 1,
}));

export function ProfessionalsManager({
  professionals,
  services,
}: {
  professionals: ProRow[];
  services: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProRow & { password: string }>({
    id: "",
    userId: "",
    name: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
    isActive: true,
    serviceIds: [],
    hours: defaultHours,
    password: "",
  });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      await saveProfessional({
        professionalId: form.id || undefined,
        userId: form.userId || undefined,
        name: form.name,
        email: form.email,
        phone: form.phone,
        title: form.title,
        bio: form.bio,
        isActive: form.isActive,
        password: form.password || undefined,
        serviceIds: form.serviceIds,
        hours: form.hours,
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
            setForm({
              id: "",
              userId: "",
              name: "",
              email: "",
              phone: "",
              title: "",
              bio: "",
              isActive: true,
              serviceIds: [],
              hours: defaultHours,
              password: "",
            });
            setOpen(true);
          }}
        >
          New professional
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Title</TH>
            <TH>Services</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {professionals.map((pro) => (
            <TR key={pro.id}>
              <TD className="font-medium">{pro.name}</TD>
              <TD>{pro.title}</TD>
              <TD>{pro.serviceIds.length}</TD>
              <TD>{pro.isActive ? "Active" : "Off floor"}</TD>
              <TD className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm({ ...pro, password: "" });
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
        title={form.id ? "Edit professional" : "New professional"}
        onClose={() => setOpen(false)}
        className="max-w-2xl"
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
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
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Password {form.id ? "(leave blank to keep)" : ""}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div>
            <Label>Services they handle</Label>
            <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto text-sm">
              {services.map((service) => (
                <label key={service.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.serviceIds.includes(service.id)}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        serviceIds: e.target.checked
                          ? [...form.serviceIds, service.id]
                          : form.serviceIds.filter((id) => id !== service.id),
                      });
                    }}
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Weekly hours</Label>
            <div className="mt-2 space-y-2">
              {form.hours.map((hour) => (
                <div
                  key={hour.dayOfWeek}
                  className="grid grid-cols-[7rem_1fr_1fr_auto] items-center gap-2 text-sm"
                >
                  <span>{DAY_LABELS[hour.dayOfWeek]}</span>
                  <Input
                    type="time"
                    value={hour.startTime}
                    disabled={hour.isOff}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hours: form.hours.map((h) =>
                          h.dayOfWeek === hour.dayOfWeek
                            ? { ...h, startTime: e.target.value }
                            : h,
                        ),
                      })
                    }
                  />
                  <Input
                    type="time"
                    value={hour.endTime}
                    disabled={hour.isOff}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hours: form.hours.map((h) =>
                          h.dayOfWeek === hour.dayOfWeek
                            ? { ...h, endTime: e.target.value }
                            : h,
                        ),
                      })
                    }
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={hour.isOff}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          hours: form.hours.map((h) =>
                            h.dayOfWeek === hour.dayOfWeek
                              ? { ...h, isOff: e.target.checked }
                              : h,
                          ),
                        })
                      }
                    />
                    Off
                  </label>
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active on the floor
          </label>
          <Button onClick={submit} disabled={pending} className="w-full">
            Save
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
