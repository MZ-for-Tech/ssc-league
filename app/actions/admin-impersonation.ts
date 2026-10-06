"use server";

import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function startImpersonation(studentId: string) {
  await requireAdmin();
  const cookieStore = await cookies();
  cookieStore.set("impersonate_id", studentId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return { success: true };
}

export async function stopImpersonation() {
  await requireAdmin();
  const cookieStore = await cookies();
  cookieStore.delete("impersonate_id");
  return { success: true };
}

export async function clearImpersonationCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonate_id");
  return { success: true };
}
