import type { Role } from "@/generated/client";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const onAdmin = nextUrl.pathname.startsWith("/admin");
      const onStaff = nextUrl.pathname.startsWith("/staff");
      const onLogin = nextUrl.pathname.startsWith("/login");

      if (onAdmin) {
        if (!isLoggedIn) return false;
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/staff", nextUrl));
        }
        return true;
      }

      if (onStaff) {
        if (!isLoggedIn) return false;
        if (role !== "PROFESSIONAL") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (onLogin && isLoggedIn) {
        const dest = role === "ADMIN" ? "/admin" : "/staff";
        return Response.redirect(new URL(dest, nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.professionalId = user.professionalId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = token.role as Role;
      session.user.professionalId = (token.professionalId as string | null) ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;
