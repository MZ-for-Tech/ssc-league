"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAttendanceDate } from "@/lib/attendance-date";
import { errorMessage, logAudit } from "./admin-action-helpers";

export async function recordSeasonRecognition(input: {
  studentId: string;
  eventDate: string;
  sessionNumber: number | null;
  recognitionType: "support" | "extra_effort";
  notes?: string;
}) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).valueOf()) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    if (!input.studentId) throw new Error("Choose a student.");
    if (!validDate(input.eventDate)) throw new Error("Choose a valid recognition date.");
    if (input.eventDate > getAttendanceDate()) throw new Error("Recognition dates cannot be in the future.");
    if (input.sessionNumber != null && (!Number.isInteger(input.sessionNumber) || input.sessionNumber < 1 || input.sessionNumber > 100)) throw new Error("Section number must be between 1 and 100.");
    if (!["support", "extra_effort"].includes(input.recognitionType)) throw new Error("Choose a valid recognition type.");
    if ((input.notes?.trim().length ?? 0) > 300) throw new Error("Notes must be 300 characters or fewer.");
    const { data: student, error: studentError } = await supabaseAdmin.from("Student").select("id, full_name").eq("id", input.studentId).eq("season_id", activeSeasonId).maybeSingle();
    if (studentError) throw studentError;
    if (!student) throw new Error("Student not found in the active season.");

    const { error } = await supabaseAdmin.from("SeasonRecognition").insert({
      season_id: activeSeasonId,
      student_id: input.studentId,
      event_date: input.eventDate,
      session_number: input.sessionNumber,
      recognition_type: input.recognitionType,
      notes: input.notes?.trim() || null,
      admin_id: adminId,
    });
    if (error?.code === "23505") throw new Error("This recognition is already recorded for that student and date.");
    if (error) throw error;
    await logAudit(supabaseAdmin, adminId, "SEASON_RECOGNITION", `Recorded ${input.recognitionType} recognition for ${student.full_name}`, input.eventDate, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

export async function deleteSeasonRecognition(id: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const { data: row, error: readError } = await supabaseAdmin.from("SeasonRecognition").select("event_date, recognition_type, student_id").eq("id", id).eq("season_id", activeSeasonId).maybeSingle();
    if (readError) throw readError;
    if (!row) throw new Error("Recognition record not found in the active season.");
    const { error } = await supabaseAdmin.from("SeasonRecognition").delete().eq("id", id).eq("season_id", activeSeasonId);
    if (error) throw error;
    await logAudit(supabaseAdmin, adminId, "SEASON_RECOGNITION", `Removed ${row.recognition_type} recognition`, row.event_date, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}
