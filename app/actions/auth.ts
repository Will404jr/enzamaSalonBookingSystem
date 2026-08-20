"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, isActive: true, passwordHash: true },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  redirect(user.role === "ADMIN" ? "/admin" : "/staff");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/staff");
  }
  return session;
}

export async function requireProfessional() {
  const session = await requireSession();
  if (session.user.role !== "PROFESSIONAL" || !session.user.professionalId) {
    redirect("/admin");
  }
  return session;
}
