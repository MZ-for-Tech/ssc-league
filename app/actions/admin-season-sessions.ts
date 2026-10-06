"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit } from "./admin-action-helpers";

type SeasonSessionInput = {
  id?: string | null;
  sessionNumber?: number | null;
  sessionDate: string;
  moduleTitle?: string;
  topicTitle: string;
  coverageStatus: "planned" | "done" | "not_covered" | "midterm" | "practical_quiz";
  notes?: string;
};

export async function saveSeasonSession(input: SeasonSessionInput) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).valueOf()) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    if (!validDate(input.sessionDate)) throw new Error("Choose a valid session date.");
    if (input.sessionNumber != null && (!Number.isInteger(input.sessionNumber) || input.sessionNumber < 1 || input.sessionNumber > 100)) {
      throw new Error("Session number must be between 1 and 100.");
    }
    if (!input.topicTitle.trim() || input.topicTitle.trim().length > 160) throw new Error("Enter a topic title up to 160 characters.");
    if ((input.moduleTitle?.length ?? 0) > 120 || (input.notes?.length ?? 0) > 500) throw new Error("Module and notes are too long.");
    if (!["planned", "done", "not_covered", "midterm", "practical_quiz"].includes(input.coverageStatus)) throw new Error("Choose a valid coverage status.");

    if (input.id) {
      const { data: existing, error: existingError } = await supabaseAdmin.from("SeasonSession").select("id, session_date").eq("id", input.id).eq("season_id", activeSeasonId).maybeSingle();
      if (existingError) throw existingError;
      if (!existing) throw new Error("Scheduled session not found in the active season.");
      if (existing.session_date !== input.sessionDate) {
        const { count: attendanceCount, error: attendanceError } = await supabaseAdmin.from("AttendanceRecord").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("date", existing.session_date);
        if (attendanceError) throw attendanceError;
        if ((attendanceCount ?? 0) > 0) throw new Error("A session date cannot be changed after attendance has been recorded for that date.");
      }
    }

    const { error } = await supabaseAdmin.from("SeasonSession").upsert({
      id: input.id || randomUUID(),
      season_id: activeSeasonId,
      session_number: input.sessionNumber ?? null,
      session_date: input.sessionDate,
      module_title: input.moduleTitle?.trim() || null,
      topic_title: input.topicTitle.trim(),
      coverage_status: input.coverageStatus,
      notes: input.notes?.trim() || null,
    });
    if (error) throw error;

    await logAudit(supabaseAdmin, adminId, "SEASON_SESSION", `${input.coverageStatus}: ${input.topicTitle.trim()}`, input.sessionDate, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

export async function deleteSeasonSession(sessionId: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const { data: session, error: readError } = await supabaseAdmin.from("SeasonSession").select("topic_title, session_date").eq("id", sessionId).eq("season_id", activeSeasonId).maybeSingle();
    if (readError) throw readError;
    if (!session) throw new Error("Scheduled session not found in the active season.");
    const { error } = await supabaseAdmin.from("SeasonSession").delete().eq("id", sessionId).eq("season_id", activeSeasonId);
    if (error) throw error;
    await logAudit(supabaseAdmin, adminId, "SEASON_SESSION", `Deleted ${session.topic_title}`, session.session_date, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}
