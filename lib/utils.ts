import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function avatarTone(seed: string) {
  const tones = [
    "bg-accent text-accent-foreground",
    "bg-primary text-primary-foreground",
    "bg-secondary text-secondary-foreground",
    "bg-chart-4 text-foreground",
  ];
  const sum = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[sum % tones.length];
}

export function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
