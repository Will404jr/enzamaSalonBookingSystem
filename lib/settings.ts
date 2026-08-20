import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  id: 1,
  businessName: "Enzama Looks",
  location: "Plot 12, Kampala Road, Entebbe, Uganda",
  phone: "+256 700 000 000",
  whatsapp: "+256 700 000 000",
  email: "hello@enzamalooks.com",
  defaultOpenTime: "09:00",
  defaultCloseTime: "18:00",
  slotIntervalMin: 30,
  timezone: "Africa/Kampala",
};

export async function getSalonSettings() {
  return prisma.salonSettings.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULTS,
  });
}
