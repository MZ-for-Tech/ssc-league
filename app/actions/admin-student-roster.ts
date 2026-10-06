"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit } from "./admin-action-helpers";

// --- COMPATIBILITY WRAPPERS (For UsersTable.tsx) ---

export async function terminateAgent(studentId: string) {
  return deleteStudents([studentId]);
}

export async function updateAgentRole(studentDbId: string, role: string) {
  // This logic is complex because 'role' is in Admin table, not Student.
  // Assuming 'role' === 'admin' means insert into Admin table.
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (role !== "admin" && role !== "student") throw new Error("Invalid role.");
    const { data: student, error: studentError } = await supabaseAdmin
      .from("Student")
      .select("auth_id, full_name, email")
      .eq("id", studentDbId)
      .eq("season_id", activeSeasonId)
      .single();
    if (studentError) throw studentError;
    if (!student) throw new Error("Student not found");

    if (role === 'admin') {
       if (!student.auth_id) throw new Error("Student does not have an auth account.");
       const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(student.auth_id);
       if (authError) throw authError;
       const email = student.email || authData.user.email;
       if (!email) throw new Error("Administrator email is missing.");
       const { error } = await supabaseAdmin.from("Admin").insert({
         auth_id: student.auth_id,
         full_name: student.full_name,
         email,
       });
       if (error) throw error;
    } else {
       const { error } = await supabaseAdmin.from("Admin").delete().eq("auth_id", student.auth_id);
       if (error) throw error;
    }
    await logAudit(supabaseAdmin, adminId, "UPDATE_ROLE", `Changed role to ${role}`, studentDbId, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) { return { success: false, message: errorMessage(err) }; }
}

// --- 2. BULK OPERATIONS ---

export async function deleteStudents(studentIds: string[]) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const { data } = await supabaseAdmin.from("Student").select("auth_id").in("id", studentIds).eq("season_id", activeSeasonId);
    const { error } = await supabaseAdmin.from("Student").delete().in("id", studentIds).eq("season_id", activeSeasonId);
    if (error) throw error;

    if (data) {
        for (const s of data) if (s.auth_id) await supabaseAdmin.auth.admin.deleteUser(s.auth_id);
    }
    
    await logAudit(supabaseAdmin, adminId, "BULK_DELETE", `Deleted ${studentIds.length} agents`, "MULTIPLE", activeSeasonId);
    revalidatePath("/admin");
    return { success: true, count: studentIds.length };
  } catch (err: unknown) { return { success: false, message: errorMessage(err) }; }
}
