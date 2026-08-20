"use client";

import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  Users,
  UserRound,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/professionals", label: "Professionals", icon: UserRound },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const staffNav = [
  { href: "/staff", label: "Overview", icon: LayoutDashboard },
  { href: "/staff/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/staff/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/staff/profile", label: "Profile", icon: UserRound },
];

export function DashboardShell({
  children,
  name,
  roleLabel,
  variant,
}: {
  children: React.ReactNode;
  name: string;
  roleLabel: string;
  variant: "admin" | "staff";
}) {
  const pathname = usePathname();
  const nav = variant === "admin" ? adminNav : staffNav;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="px-5 py-5">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sidebar-primary">
            Enzama Looks
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => {
            const active =
              item.href === `/${variant}`
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/70",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3 overflow-x-auto md:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">{name}</p>
          <ThemeToggle />
        </header>
        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
