"use client";

import {
  createGuestBooking,
  getSlotsForDate,
  getSuggestedSlots,
} from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/constants";
import { formatDateTime, formatDuration, formatUgx } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/generated/client";
import { Check, ChevronLeft } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

type ServiceOption = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMin: number;
  price: number;
};

type ProfessionalOption = {
  id: string;
  name: string;
  title: string;
  serviceIds: string[];
};

type Slot = {
  startIso: string;
  endIso: string;
  label: string;
  professionalId: string;
};

const STEPS = ["Services", "Professional", "Time", "Your details"] as const;

export function BookingWizard({
  services,
  professionals,
}: {
  services: ServiceOption[];
  professionals: ProfessionalOption[];
}) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [professionalId, setProfessionalId] = useState<"any" | string>("any");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [suggestions, setSuggestions] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [details, setDetails] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerLocation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    professionalName: string;
    startAt: string;
    services: string[];
    total: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = services.filter((s) => selectedIds.includes(s.id));
  const duration = selected.reduce((sum, s) => sum + s.durationMin, 0);
  const total = selected.reduce((sum, s) => sum + s.price, 0);

  const eligible = useMemo(
    () =>
      professionals.filter((pro) =>
        selectedIds.every((id) => pro.serviceIds.includes(id)),
      ),
    [professionals, selectedIds],
  );

  const filtered = services.filter((service) => {
    const matchesCategory = category === "ALL" || service.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      service.name.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  function toggleService(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setSelectedSlot(null);
  }

  function loadTimes(nextDate: string, proId: "any" | string) {
    startTransition(async () => {
      const [nextSlots, nextSuggestions] = await Promise.all([
        getSlotsForDate({
          serviceIds: selectedIds,
          professionalId: proId,
          date: nextDate,
        }),
        getSuggestedSlots({
          serviceIds: selectedIds,
          professionalId: proId,
        }),
      ]);
      setSlots(nextSlots);
      setSuggestions(nextSuggestions);
    });
  }

  function goNext() {
    setError(null);
    if (step === 0 && selectedIds.length === 0) {
      setError("Select at least one service.");
      return;
    }
    if (step === 1 && eligible.length === 0) {
      setError("No professional offers that combination. Remove a service.");
      return;
    }
    if (step === 1) {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Kampala",
      });
      setDate(today);
      loadTimes(today, professionalId);
    }
    if (step === 2 && !selectedSlot) {
      setError("Pick a time, or choose one of the suggestions.");
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function submit() {
    if (!selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await createGuestBooking({
        serviceIds: selectedIds,
        professionalId: selectedSlot.professionalId,
        startIso: selectedSlot.startIso,
        ...details,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(result.booking);
    });
  }

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="size-5" />
        </div>
        <h2 className="mt-4 font-serif text-3xl">Request received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We will confirm with you shortly. Your booking is pending until the
          salon accepts it.
        </p>
        <dl className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">When</dt>
            <dd>{formatDateTime(success.startAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">With</dt>
            <dd>{success.professionalName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Services</dt>
            <dd className="text-right">{success.services.join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total</dt>
            <dd>{formatUgx(success.total)}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-8 grid grid-cols-4 gap-2 text-xs uppercase tracking-wider">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "border-b-2 pb-2",
              index <= step ? "border-primary text-foreground" : "border-border text-muted-foreground",
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              placeholder="Search services"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ServiceCategory | "ALL")
              }
            >
              <option value="ALL">All categories</option>
              {CATEGORY_ORDER.map((item) => (
                <option key={item} value={item}>
                  {CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {filtered.map((service) => {
              const on = selectedIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    on
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {CATEGORY_LABELS[service.category]} · {formatDuration(service.durationMin)}
                      </p>
                    </div>
                    <p className="text-sm">{formatUgx(service.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => setProfessionalId("any")}
            className={cn(
              "rounded-lg border p-4 text-left",
              professionalId === "any"
                ? "border-primary bg-accent"
                : "border-border bg-card",
            )}
          >
            <p className="font-medium">Any available professional</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We will match the first open chair that can do your services.
            </p>
          </button>
          {eligible.map((pro) => (
            <button
              key={pro.id}
              type="button"
              onClick={() => setProfessionalId(pro.id)}
              className={cn(
                "rounded-lg border p-4 text-left",
                professionalId === pro.id
                  ? "border-primary bg-accent"
                  : "border-border bg-card",
              )}
            >
              <p className="font-medium">{pro.name}</p>
              <p className="text-sm text-muted-foreground">{pro.title}</p>
            </button>
          ))}
          {eligible.length === 0 ? (
            <p className="text-sm text-destructive">
              No one on the floor offers this exact mix. Go back and trim a service.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedSlot(null);
                loadTimes(e.target.value, professionalId);
              }}
            />
          </div>
          {suggestions.length > 0 ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((slot) => (
                  <button
                    key={`${slot.professionalId}-${slot.startIso}`}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      selectedSlot?.startIso === slot.startIso &&
                        selectedSlot.professionalId === slot.professionalId
                        ? "border-primary bg-accent"
                        : "border-border bg-card",
                    )}
                  >
                    {formatDateTime(slot.startIso)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Available times {pending ? "…" : ""}
            </p>
            {slots.length === 0 && !pending ? (
              <p className="text-sm text-muted-foreground">
                Nothing open on this day. Try another date or a suggestion.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={`${slot.professionalId}-${slot.startIso}`}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "rounded-lg border py-2 text-sm",
                      selectedSlot?.startIso === slot.startIso &&
                        selectedSlot.professionalId === slot.professionalId
                        ? "border-primary bg-accent"
                        : "border-border bg-card",
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Name</Label>
            <Input
              id="customerName"
              value={details.customerName}
              onChange={(e) =>
                setDetails((d) => ({ ...d, customerName: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerPhone">Phone number</Label>
            <Input
              id="customerPhone"
              value={details.customerPhone}
              onChange={(e) =>
                setDetails((d) => ({ ...d, customerPhone: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={details.customerEmail}
              onChange={(e) =>
                setDetails((d) => ({ ...d, customerEmail: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerLocation">Location</Label>
            <Input
              id="customerLocation"
              placeholder="Entebbe, Kitoro…"
              value={details.customerLocation}
              onChange={(e) =>
                setDetails((d) => ({ ...d, customerLocation: e.target.value }))
              }
              required
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-4">
        <div className="text-sm text-muted-foreground">
          {selected.length > 0 ? (
            <p>
              {selected.length} service{selected.length > 1 ? "s" : ""} ·{" "}
              {formatDuration(duration)} · {formatUgx(total)}
            </p>
          ) : (
            <p>Select services to begin</p>
          )}
        </div>
        <div className="flex gap-2">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext}>Continue</Button>
          ) : (
            <Button onClick={submit} disabled={pending}>
              {pending ? "Sending…" : "Request booking"}
            </Button>
          )}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
