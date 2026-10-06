import "server-only";

import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function getImpersonatedStudentId() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("impersonate_id")?.value;

  if (!studentId) return null;

  try {
    await requireAdmin();
    return studentId;
  } catch {
    return null;
  }
}
