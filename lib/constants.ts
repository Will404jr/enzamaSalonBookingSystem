import type { BookingStatus, ServiceCategory } from "@/generated/client";

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  HAIR: "Hair",
  COLOR: "Color",
  BRAIDS: "Braids & protective",
  BARBER: "Barber",
  NAILS: "Nails",
  MAKEUP: "Makeup",
  LASHES_BROWS: "Lashes & brows",
  SKIN_SPA: "Skin & spa",
  WAXING: "Waxing",
};

export const CATEGORY_ORDER: ServiceCategory[] = [
  "HAIR",
  "COLOR",
  "BRAIDS",
  "BARBER",
  "NAILS",
  "MAKEUP",
  "LASHES_BROWS",
  "SKIN_SPA",
  "WAXING",
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
