"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit, getCurrentWeekNumber } from "./admin-action-helpers";

type StudentAdminUpdate = {
  full_name?: string;
  student_id?: string;
  group_id?: string;
  current_xp?: number;
};


export async function updateStudent(studentId: string, data: StudentAdminUpdate) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const updates: StudentAdminUpdate = {};
    if (typeof data.full_name === "string") updates.full_name = data.full_name.trim();
    if (typeof data.student_id === "string") updates.student_id = data.student_id.trim();
    if (typeof data.group_id === "string") updates.group_id = data.group_id.trim();
    if (typeof data.current_xp === "number" && Number.isInteger(data.current_xp) && data.current_xp >= 0) {
      updates.current_xp = data.current_xp;
    }
    if (!Object.keys(updates).length) throw new Error("No valid student fields were provided.");

    const { error } = await supabaseAdmin.from("Student").update(updates).eq("id", studentId).eq("season_id", activeSeasonId);
    if (error) throw error;
    
    await logAudit(supabaseAdmin, adminId, "UPDATE_PROFILE", "Updated profile data", studentId, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) { return { success: false, message: errorMessage(err) }; }
}

export async function resetAgentPassword(studentId: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const { data: student, error: studentError } = await supabaseAdmin
      .from("Student")
      .select("auth_id, student_id")
      .eq("id", studentId)
      .eq("season_id", activeSeasonId)
      .single();
    if (studentError) throw studentError;
    if (!student?.auth_id) throw new Error("Student does not have an auth account.");

    const temporaryPassword = randomBytes(24).toString("base64url");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(student.auth_id, { password: temporaryPassword });
    if (error) throw error;
    
    await logAudit(supabaseAdmin, adminId, "RESET_PASSWORD", "Reset user password", student.student_id, activeSeasonId);
    return { success: true, message: `Temporary password: ${temporaryPassword}` };
  } catch (err: unknown) { return { success: false, message: errorMessage(err) }; }
}

export async function awardStudentXP(studentId: string, amount: number, reason: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const weekNumber = await getCurrentWeekNumber(supabaseAdmin, activeSeasonId);
    const { data: s } = await supabaseAdmin.from("Student").select("current_xp").eq("id", studentId).eq("season_id", activeSeasonId).single();
    if (!s) throw new Error("Student not found");

    await supabaseAdmin.from("XPTransaction").insert({
      id: randomUUID(), season_id: activeSeasonId, student_id: studentId, amount, action_type: "MANUAL_ENTRY", description: reason,
      week_number: weekNumber, created_at: new Date().toISOString()
    });

    const newXP = (s.current_xp || 0) + amount;
    await supabaseAdmin.from("Student").update({ current_xp: newXP }).eq("id", studentId).eq("season_id", activeSeasonId);
    
    await logAudit(supabaseAdmin, adminId, "AWARD_XP", `Awarded ${amount} XP: ${reason}`, studentId, activeSeasonId);
    revalidatePath("/admin");
    return { success: true, newXP };
  } catch (err: unknown) { return { success: false, message: errorMessage(err) }; }
}
