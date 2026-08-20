export type TimeRange = { start: Date; end: Date };

export type Slot = {
  startIso: string;
  endIso: string;
  label: string;
  professionalId: string;
};

export function parseMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToLabel(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function kampalaDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+03:00`);
}

export function overlaps(a: TimeRange, b: TimeRange) {
  return a.start < b.end && a.end > b.start;
}

export function buildSlots({
  date,
  startTime,
  endTime,
  intervalMin,
  durationMin,
  busy,
  professionalId,
}: {
  date: string;
  startTime: string;
  endTime: string;
  intervalMin: number;
  durationMin: number;
  busy: TimeRange[];
  professionalId: string;
}): Slot[] {
  const startMin = parseMinutes(startTime);
  const endMin = parseMinutes(endTime);
  const slots: Slot[] = [];

  for (let cursor = startMin; cursor + durationMin <= endMin; cursor += intervalMin) {
    const label = minutesToLabel(cursor);
    const start = kampalaDateTime(date, label);
    const end = new Date(start.getTime() + durationMin * 60_000);
    const taken = busy.some((range) => overlaps({ start, end }, range));
    if (!taken) {
      slots.push({
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        label,
        professionalId,
      });
    }
  }

  return slots;
}

export function dayOfWeekInKampala(date: string) {
  return new Date(`${date}T12:00:00+03:00`).getUTCDay();
}
