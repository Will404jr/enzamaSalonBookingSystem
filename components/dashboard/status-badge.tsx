import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import type { BookingStatus } from "@/generated/client";

const tones: Record<BookingStatus, "warning" | "success" | "muted" | "primary" | "default"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "primary",
  REJECTED: "muted",
  CANCELLED: "muted",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={tones[status]}>{STATUS_LABELS[status]}</Badge>;
}
