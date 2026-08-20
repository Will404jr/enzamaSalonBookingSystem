"use client";

import { updateBooking, updateBookingStatus } from "@/app/actions/admin";
import { staffUpdateBookingStatus } from "@/app/actions/staff";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { BookingStatus } from "@/generated/client";
import { formatDateTime, formatUgx } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export type BookingRow = {
  id: string;
  status: BookingStatus;
  startAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerLocation: string;
  notes: string;
  professionalId: string;
  professionalName: string;
  services: string;
  total: number;
};

export function BookingsManager({
  bookings,
  professionals,
  variant,
}: {
  bookings: BookingRow[];
  professionals: { id: string; name: string }[];
  variant: "admin" | "staff";
}) {
  const [status, setStatus] = useState<string>("ALL");
  const [editing, setEditing] = useState<BookingRow | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(
    () =>
      bookings.filter((b) => (status === "ALL" ? true : b.status === status)),
    [bookings, status],
  );

  function setStatusFor(id: string, next: BookingStatus) {
    startTransition(async () => {
      if (variant === "admin") {
        await updateBookingStatus(id, next);
      } else if (next === "CONFIRMED" || next === "REJECTED" || next === "COMPLETED" || next === "CANCELLED") {
        await staffUpdateBookingStatus(id, next);
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
        <option value="ALL">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="COMPLETED">Completed</option>
        <option value="REJECTED">Rejected</option>
        <option value="CANCELLED">Cancelled</option>
      </Select>
      <Table>
        <THead>
          <TR>
            <TH>When</TH>
            <TH>Client</TH>
            <TH>With</TH>
            <TH>Services</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {filtered.map((booking) => (
            <TR key={booking.id}>
              <TD>{formatDateTime(booking.startAt)}</TD>
              <TD>
                <div className="font-medium">{booking.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {booking.customerPhone}
                </div>
              </TD>
              <TD>{booking.professionalName}</TD>
              <TD>
                <div>{booking.services}</div>
                <div className="text-xs text-muted-foreground">
                  {formatUgx(booking.total)}
                </div>
              </TD>
              <TD>
                <StatusBadge status={booking.status} />
              </TD>
              <TD className="space-x-1 text-right">
                {booking.status === "PENDING" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setStatusFor(booking.id, "CONFIRMED")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatusFor(booking.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                {booking.status === "CONFIRMED" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setStatusFor(booking.id, "COMPLETED")}
                  >
                    Done
                  </Button>
                ) : null}
                {variant === "admin" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(booking)}
                  >
                    Edit
                  </Button>
                ) : null}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {variant === "admin" && editing ? (
        <Dialog
          open
          title="Edit booking"
          onClose={() => setEditing(null)}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {editing.customerName} · {editing.customerEmail} ·{" "}
              {editing.customerLocation}
            </p>
            <div className="space-y-1.5">
              <Label>Professional</Label>
              <Select
                value={editing.professionalId}
                onChange={(e) =>
                  setEditing({ ...editing, professionalId: e.target.value })
                }
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={editing.startAt.slice(0, 16)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    startAt: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={editing.status}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as BookingStatus,
                  })
                }
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={editing.notes}
                onChange={(e) =>
                  setEditing({ ...editing, notes: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await updateBooking({
                    id: editing.id,
                    professionalId: editing.professionalId,
                    startIso: editing.startAt,
                    status: editing.status,
                    notes: editing.notes,
                  });
                  setEditing(null);
                  router.refresh();
                })
              }
            >
              Save booking
            </Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
