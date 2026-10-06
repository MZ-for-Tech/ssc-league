"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit, getCurrentWeekNumber } from "@/app/actions/admin-action-helpers";

export async function awardBulkXP(group: string, amount: number, desc: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const weekNumber = await getCurrentWeekNumber(supabaseAdmin, activeSeasonId);
    let q = supabaseAdmin.from("Student").select("id, current_xp").eq("season_id", activeSeasonId);
    if (group !== "ALL") q = q.eq("group_id", group);
    const { data } = await q;
    const students = (data ?? []) as { id: string; current_xp: number | null }[];
    
    if (!students?.length) throw new Error("No students found");

    const txs = students.map(s => ({
        id: randomUUID(), season_id: activeSeasonId, student_id: s.id, amount, action_type: "MANUAL_ENTRY", description: desc,
        week_number: weekNumber, created_at: new Date().toISOString()
    }));
    await supabaseAdmin.from("XPTransaction").insert(txs);

    for (const s of students) {
        await supabaseAdmin.from("Student").update({ current_xp: (s.current_xp || 0) + amount }).eq("id", s.id).eq("season_id", activeSeasonId);
    }
    
    await logAudit(supabaseAdmin, adminId, "BULK_XP", `Awarded ${amount} XP to ${group}`, group, activeSeasonId);
    revalidatePath("/admin");
    return { success: true, count: students.length };
  } catch (e: unknown) { return { success: false, message: errorMessage(e) }; }
}
