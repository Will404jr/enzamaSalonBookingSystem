import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSalonSettings } from "@/lib/settings";
import { CATEGORY_LABELS, CATEGORY_ORDER, DAY_LABELS } from "@/lib/constants";
import { formatDuration, formatUgx } from "@/lib/format";
import { avatarTone, initials, whatsappLink } from "@/lib/utils";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, services, professionals] = await Promise.all([
    getSalonSettings(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.professional.findMany({
      where: { isActive: true, user: { isActive: true } },
      include: {
        user: true,
        services: { include: { service: true } },
        workingHours: { orderBy: { dayOfWeek: "asc" } },
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    services: services.filter((s) => s.category === category),
  })).filter((group) => group.services.length > 0);

  const openDays = professionals[0]?.workingHours.filter((h) => !h.isOff) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-border" />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-28">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary">
                Entebbe salon
              </p>
              <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.05] md:text-7xl">
                Quiet luxury.
                <span className="block text-primary">Sharp results.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
                Enzama Looks is a full-service house for hair, color, braids,
                barbering, nails, makeup, and skin. Book a chair in Entebbe —
                we keep the room calm and the finish precise.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/book"
                  className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
                >
                  Book an appointment
                </Link>
                <a
                  href={whatsappLink(settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-secondary"
                >
                  WhatsApp us
                </a>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  The house
                </p>
                <p className="mt-3 font-serif text-2xl">{settings.location}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {settings.phone}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {openDays
                    .map((d) => `${DAY_LABELS[d.dayOfWeek].slice(0, 3)} ${d.startTime}–${d.endTime}`)
                    .join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">
                Menu
              </p>
              <h2 className="mt-3 font-serif text-4xl">Every chair, every craft</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                From a lineup to a bridal set. Prices in Ugandan shillings.
              </p>
            </div>
            <div className="mt-12 space-y-14">
              {grouped.map((group) => (
                <div key={group.category}>
                  <h3 className="mb-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {group.label}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.services.map((service) => (
                      <article
                        key={service.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-4"
                      >
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {service.description}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {formatDuration(service.durationMin)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-medium">
                          {formatUgx(Number(service.price))}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/book"
                className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Choose a service
              </Link>
            </div>
          </div>
        </section>

        <section id="team" className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Team</p>
            <h2 className="mt-3 font-serif text-4xl">Who handles what</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro) => {
                const specialties = [
                  ...new Set(pro.services.map((s) => CATEGORY_LABELS[s.service.category])),
                ];
                return (
                  <article
                    key={pro.id}
                    className="rounded-lg border border-border bg-background p-5"
                  >
                    <div
                      className={`flex size-12 items-center justify-center rounded-full text-sm font-semibold ${avatarTone(pro.user.name)}`}
                    >
                      {initials(pro.user.name)}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{pro.user.name}</h3>
                    <p className="text-sm text-primary">{pro.title}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {pro.bio}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                      {specialties.join(" · ")}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="visit" className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary">
                Visit
              </p>
              <h2 className="mt-3 font-serif text-4xl">Find us in Entebbe</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                Walk-ins are welcome when a chair is free. Appointments keep the
                day honest — book ahead for color, braids, and bridal.
              </p>
              <dl className="mt-8 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="mt-1 font-medium">{settings.location}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="mt-1 font-medium">
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                      {settings.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd className="mt-1 font-medium">
                    <a
                      href={whatsappLink(settings.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {settings.whatsapp}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1 font-medium">{settings.email}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Hours
              </p>
              <ul className="mt-4 divide-y divide-border">
                {(professionals[0]?.workingHours ?? []).map((hour) => (
                  <li
                    key={hour.dayOfWeek}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span>{DAY_LABELS[hour.dayOfWeek]}</span>
                    <span className="text-muted-foreground">
                      {hour.isOff ? "Closed" : `${hour.startTime} – ${hour.endTime}`}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/book"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
              >
                Reserve a time
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        phone={settings.phone}
        whatsapp={settings.whatsapp}
        location={settings.location}
      />
    </div>
  );
}
