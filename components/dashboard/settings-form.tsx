"use client";

import { saveSettings } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SettingsForm(props: {
  businessName: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  defaultOpenTime: string;
  defaultCloseTime: string;
  slotIntervalMin: number;
}) {
  const [form, setForm] = useState(props);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await saveSettings({
            ...form,
            slotIntervalMin: Number(form.slotIntervalMin),
          });
          setSaved(true);
          router.refresh();
        });
      }}
    >
      {(
        [
          ["businessName", "Business name"],
          ["location", "Location"],
          ["phone", "Phone"],
          ["whatsapp", "WhatsApp"],
          ["email", "Email"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Open</Label>
          <Input
            type="time"
            value={form.defaultOpenTime}
            onChange={(e) =>
              setForm({ ...form, defaultOpenTime: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Close</Label>
          <Input
            type="time"
            value={form.defaultCloseTime}
            onChange={(e) =>
              setForm({ ...form, defaultCloseTime: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Slot (min)</Label>
          <Input
            type="number"
            value={form.slotIntervalMin}
            onChange={(e) =>
              setForm({ ...form, slotIntervalMin: Number(e.target.value) })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
      {saved ? (
        <p className="text-sm text-muted-foreground">Saved.</p>
      ) : null}
    </form>
  );
}
