import Link from "next/link";
import { whatsappLink } from "@/lib/utils";

export function SiteFooter({
  phone,
  whatsapp,
  location,
}: {
  phone: string;
  whatsapp: string;
  location: string;
}) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] uppercase">
            Enzama Looks
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{location}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary">
            {phone}
          </a>
          <a
            href={whatsappLink(whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            WhatsApp
          </a>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
