import { format } from "date-fns";

export function formatUgx(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hours}h ${rest}m`;
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "EEE d MMM, HH:mm");
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "HH:mm");
}

export function kampalaDateString(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" });
}

export function formatKampalaDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-GB", {
    timeZone: "Africa/Kampala",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
