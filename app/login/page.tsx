import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Staff sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Enzama Looks
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Staff</p>
          <h1 className="mt-2 font-serif text-3xl">Sign in</h1>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            Admin and professionals use this door. Guests book without an account.
          </p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
