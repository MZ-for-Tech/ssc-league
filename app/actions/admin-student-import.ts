"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit } from "./admin-action-helpers";

type StudentImport = {
  email: string;
  full_name: string;
  student_id: string;
  group_id: string;
};

export async function bulkImportStudents(students: StudentImport[]) {
  const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
  const res = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    credentials: [] as { student_id: string; password: string }[],
  };
  for (const s of students) {
    try {
      if (!s.email || !s.full_name || !s.student_id || !s.group_id) {
        throw new Error("Email, full name, student ID, and group are required.");
      }

      const temporaryPassword = randomBytes(24).toString("base64url");
      const { data: auth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: s.email, password: temporaryPassword, email_confirm: true, user_metadata: { full_name: s.full_name }
      });
      if (authErr) throw authErr;
      if (!auth.user) throw new Error("Supabase did not return the created account.");
      
      const { error: profErr } = await supabaseAdmin.from("Student").insert({
          id: randomUUID(), season_id: activeSeasonId, auth_id: auth.user.id, full_name: s.full_name, student_id: s.student_id, group_id: s.group_id, email: s.email, current_xp: 0, current_level: 1, updatedAt: new Date().toISOString()
      });
      if (profErr) { await supabaseAdmin.auth.admin.deleteUser(auth.user.id); throw profErr; }
      res.success++;
      res.credentials.push({ student_id: s.student_id, password: temporaryPassword });
    } catch (e: unknown) { res.failed++; res.errors.push(`${s.student_id}: ${errorMessage(e)}`); }
  }
  
  await logAudit(supabaseAdmin, adminId, "BULK_IMPORT", `Imported ${res.success} agents`, "SYSTEM", activeSeasonId);
  revalidatePath("/admin");
  return res;
}
