"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAttendanceDate } from "@/lib/attendance-date";
import { errorMessage, logAudit, getWeekNumberForDate } from "./admin-action-helpers";

export async function markGroupAttendance(group: string, status: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (!["PRESENT", "TARDY", "EXCUSED", "ABSENT", "VACATION"].includes(status)) throw new Error("Choose a valid attendance status.");
    const date = getAttendanceDate();
    const weekNumber = await getWeekNumberForDate(supabaseAdmin, activeSeasonId, date);
    const { data } = await supabaseAdmin.from("Student").select("id").eq("group_id", group).eq("season_id", activeSeasonId);
    const students = (data ?? []) as { id: string }[];
    if (!students.length) throw new Error("No students");
    
    const records = students.map(s => ({
      id: randomUUID(), season_id: activeSeasonId, student_id: s.id, date, status,
      week_number: weekNumber,
    }));
    await supabaseAdmin.from("AttendanceRecord").upsert(records, { onConflict: "student_id, date" });
    
    await logAudit(supabaseAdmin, adminId, "ATTENDANCE", `Marked ${group} as ${status}`, group, activeSeasonId);
    return { success: true, count: students.length };
  } catch (e: unknown) { return { success: false, message: errorMessage(e) }; }
}

export async function setStudentAttendance(studentId: string, status: "PRESENT" | "TARDY" | "EXCUSED" | "ABSENT" | "VACATION" | null, date: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (!studentId || !["PRESENT", "TARDY", "EXCUSED", "ABSENT", "VACATION", null].includes(status)) {
      throw new Error("Choose a valid attendance status.");
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date || date > getAttendanceDate()) {
      throw new Error("Choose a valid attendance date that is not in the future.");
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("Student")
      .select("id")
      .eq("id", studentId)
      .eq("season_id", activeSeasonId)
      .maybeSingle();
    if (studentError) throw studentError;
    if (!student) throw new Error("Student not found in the active season.");

    if (status === null) {
      const { error } = await supabaseAdmin
        .from("AttendanceRecord")
        .delete()
        .eq("student_id", studentId)
        .eq("season_id", activeSeasonId)
        .eq("date", date);
      if (error) throw error;
    } else {
      const weekNumber = await getWeekNumberForDate(supabaseAdmin, activeSeasonId, date);
      const { error } = await supabaseAdmin.from("AttendanceRecord").upsert({
        id: randomUUID(),
        season_id: activeSeasonId,
        student_id: studentId,
        date,
        status,
        week_number: weekNumber,
      }, { onConflict: "student_id, date" });
      if (error) throw error;
    }

    await logAudit(
      supabaseAdmin,
      adminId,
      "ATTENDANCE",
      status ? `Marked student ${status.toLowerCase()}` : "Cleared student attendance",
      studentId,
      activeSeasonId,
    );
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}
