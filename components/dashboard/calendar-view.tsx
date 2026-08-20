"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/generated/client";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type CalendarBooking = {
  id: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  customerName: string;
  professionalName: string;
};

export function CalendarView({ bookings }: { bookings: CalendarBooking[] }) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const booking of bookings) {
      const key = format(new Date(booking.startAt), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list);
    }
    return map;
  }, [bookings]);

  const selectedBookings = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{format(cursor, "MMMM yyyy")}</h2>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor((d) => addMonths(d, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor((d) => addMonths(d, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const count = byDay.get(key)?.length ?? 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={cn(
                  "min-h-16 rounded-md border p-1 text-left text-sm",
                  isSameMonth(day, cursor)
                    ? "border-border bg-background"
                    : "border-transparent text-muted-foreground",
                  selected === key && "border-primary bg-accent",
                )}
              >
                <span>{format(day, "d")}</span>
                {count > 0 ? (
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium">
          {selected ? format(new Date(`${selected}T12:00:00`), "EEEE d MMM") : "Select a day"}
        </h3>
        <div className="mt-4 space-y-3">
          {selectedBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings this day.</p>
          ) : (
            selectedBookings
              .slice()
              .sort((a, b) => a.startAt.localeCompare(b.startAt))
              .map((booking) => (
                <div key={booking.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{booking.customerName}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(booking.startAt), "HH:mm")} –{" "}
                    {format(new Date(booking.endAt), "HH:mm")} · {booking.professionalName}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
