import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/staff", request.url));
    }
  }

  if (pathname.startsWith("/staff")) {
    if (!isLoggedIn) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (pathname.startsWith("/login") && isLoggedIn) {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin" : "/staff", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/login"],
};
