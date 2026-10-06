"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAttendanceDate } from "@/lib/attendance-date";
import { getRewardProtocolItem, REWARD_PROTOCOL, type RewardCategory } from "@/lib/reward-protocol";
import { SELECTED_SEASON_COOKIE } from "@/lib/seasons";

type StudentAdminUpdate = {
  full_name?: string;
  student_id?: string;
  group_id?: string;
  current_xp?: number;
};

type StudentImport = {
  email: string;
  full_name: string;
  student_id: string;
  group_id: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The operation failed.";
}

// --- HELPER: AUDIT LOGGING ---
async function logAudit(supabaseAdmin: SupabaseClient, adminId: string, action: string, details: string, target: string, seasonId: string | null = null) {
  try {
    await supabaseAdmin.from("AuditLog").insert({
      admin_id: adminId,
      action,
      details,
      target,
      season_id: seasonId,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Audit Log Failed:", err);
  }
}

async function getCurrentWeekNumber(supabaseAdmin: SupabaseClient, seasonId: string) {
  const { data, error } = await supabaseAdmin
    .from("WeeklyRankHistory")
    .select("week_number")
    .eq("season_id", seasonId)
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.week_number ?? 1;
}

async function getWeekNumberForDate(supabaseAdmin: SupabaseClient, seasonId: string, date: string) {
  const { data, error } = await supabaseAdmin
    .from("SeasonWeek")
    .select("week_number")
    .eq("season_id", seasonId)
    .lte("starts_on", date)
    .gte("ends_on", date)
    .maybeSingle();
  if (error) throw error;
  return data?.week_number ?? getCurrentWeekNumber(supabaseAdmin, seasonId);
}

// --- 1. USER MANAGEMENT ---

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

export async function awardRewardProtocol(
  category: RewardCategory,
  rewardKey: string,
  eventLabel: string,
  studentIds: string[],
  awardDate: string,
) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const defaultReward = getRewardProtocolItem(category, rewardKey);
    if (!defaultReward) throw new Error("Choose a reward from the published protocol.");
    const { data: configuredReward, error: configuredRewardError } = await supabaseAdmin
      .from("RewardProtocolTask")
      .select("reward_label, xp")
      .eq("category", category)
      .eq("reward_key", rewardKey)
      .maybeSingle();
    if (configuredRewardError) throw configuredRewardError;
    if (!configuredReward) throw new Error("The selected reward is missing from the current protocol. Refresh and try again.");
    const reward = { ...defaultReward, item: configuredReward.reward_label, xp: configuredReward.xp };

    const uniqueStudentIds = [...new Set(studentIds)];
    if (!uniqueStudentIds.length) throw new Error("Select at least one student.");
    if (uniqueStudentIds.length > 500) throw new Error("Award the protocol reward to at most 500 students at a time.");

    const normalizedEventLabel = category === "attendance" ? reward.item : eventLabel.trim();
    if (!normalizedEventLabel) throw new Error("Enter an event name for this reward.");
    if (normalizedEventLabel.length > 100) throw new Error("Event name must be 100 characters or fewer.");
    const parsedAwardDate = new Date(`${awardDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(awardDate) || Number.isNaN(parsedAwardDate.valueOf()) || parsedAwardDate.toISOString().slice(0, 10) !== awardDate) {
      throw new Error("Choose a valid award date.");
    }

    const { data: week, error: weekError } = await supabaseAdmin
      .from("SeasonWeek")
      .select("week_number, boost_multiplier")
      .eq("season_id", activeSeasonId)
      .lte("starts_on", awardDate)
      .gte("ends_on", awardDate)
      .maybeSingle();
    if (weekError) throw weekError;
    if (!week) throw new Error("Add a week covering this award date in the season schedule first.");

    const { data, error } = await supabaseAdmin.rpc("award_reward_protocol", {
      p_category: category,
      p_reward_key: reward.key,
      p_reward_label: reward.item,
      p_event_label: normalizedEventLabel,
      p_base_amount: reward.xp,
      p_student_ids: uniqueStudentIds,
      p_award_date: awardDate,
      p_admin_id: adminId,
    });
    if (error) throw new Error(error.message || "The reward could not be issued.");

    const result = Array.isArray(data) ? data[0] : data;
    const count = result?.recipient_count ?? uniqueStudentIds.length;
    const boostMultiplier = Number(week.boost_multiplier);
    const finalAmount = Math.round(reward.xp * boostMultiplier);
    revalidatePath("/admin");
    return { success: true, count, amount: finalAmount, baseAmount: reward.xp, boostMultiplier, item: reward.item, weekNumber: week.week_number };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

export async function saveRewardProtocolValues(values: { category: RewardCategory; rewardKey: string; xp: number }[]) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const selectedSeasonId = (await cookies()).get(SELECTED_SEASON_COOKIE)?.value;
    if (selectedSeasonId && selectedSeasonId !== activeSeasonId) {
      throw new Error("Switch to the active season before changing reward values.");
    }

    const tasks = (Object.keys(REWARD_PROTOCOL) as RewardCategory[]).flatMap((category) =>
      REWARD_PROTOCOL[category].rewards.map((reward) => ({ category, rewardKey: reward.key, rewardLabel: reward.item })),
    );
    if (!Array.isArray(values) || values.length !== tasks.length) {
      throw new Error("The reward task list is incomplete. Refresh the page and try again.");
    }

    const valuesByTask = new Map<string, number>();
    for (const value of values) {
      const key = `${value.category}:${value.rewardKey}`;
      if (valuesByTask.has(key) || !tasks.some((task) => `${task.category}:${task.rewardKey}` === key)) {
        throw new Error("The reward task list contains an unknown or duplicate task.");
      }
      if (!Number.isInteger(value.xp) || value.xp < 1 || value.xp > 1000) {
        throw new Error("Each reward value must be a whole number from 1 to 1000 XP.");
      }
      valuesByTask.set(key, value.xp);
    }

    const rows = tasks.map((task, index) => ({
      category: task.category,
      reward_key: task.rewardKey,
      reward_label: task.rewardLabel,
      xp: valuesByTask.get(`${task.category}:${task.rewardKey}`)!,
      sort_order: index,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin
      .from("RewardProtocolTask")
      .upsert(rows, { onConflict: "category,reward_key" });
    if (error) throw error;

    await logAudit(supabaseAdmin, adminId, "REWARD_PROTOCOL_UPDATED", `Updated XP values for ${rows.length} reward tasks`, "Reward protocol", activeSeasonId);
    revalidatePath("/admin");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

type SeasonWeekInput = {
  weekNumber: number;
  startsOn: string;
  endsOn: string;
  boostMultiplier: number;
};

export async function saveSeasonWeek(input: SeasonWeekInput) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (!Number.isInteger(input.weekNumber) || input.weekNumber < 1 || input.weekNumber > 60) {
      throw new Error("Week number must be between 1 and 60.");
    }
    if (!Number.isFinite(input.boostMultiplier) || input.boostMultiplier <= 0 || input.boostMultiplier > 10) {
      throw new Error("XP multiplier must be greater than 0 and at most 10.");
    }
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).valueOf()) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    if (!validDate(input.startsOn) || !validDate(input.endsOn) || input.startsOn > input.endsOn) {
      throw new Error("Choose a valid week date range.");
    }

    const { data: weeks, error: weeksError } = await supabaseAdmin
      .from("SeasonWeek")
      .select("week_number, starts_on, ends_on")
      .eq("season_id", activeSeasonId);
    if (weeksError) throw weeksError;
    const existingWeek = (weeks ?? []).find((week) => week.week_number === input.weekNumber);
    if (existingWeek && (existingWeek.starts_on !== input.startsOn || existingWeek.ends_on !== input.endsOn)) {
      const [{ count: rewards, error: rewardError }, { count: attendance, error: attendanceError }] = await Promise.all([
        supabaseAdmin.from("RewardProtocolBatch").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", input.weekNumber),
        supabaseAdmin.from("AttendanceRecord").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", input.weekNumber),
      ]);
      if (rewardError) throw rewardError;
      if (attendanceError) throw attendanceError;
      if ((rewards ?? 0) > 0 || (attendance ?? 0) > 0) throw new Error("Week dates cannot be changed after attendance or rewards have been recorded. The XP multiplier can still be updated.");
    }
    const overlaps = (weeks ?? []).some((week) => week.week_number !== input.weekNumber && input.startsOn <= week.ends_on && input.endsOn >= week.starts_on);
    if (overlaps) throw new Error("Week dates cannot overlap another week in this season.");

    const { error } = await supabaseAdmin.from("SeasonWeek").upsert({
      season_id: activeSeasonId,
      week_number: input.weekNumber,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      boost_multiplier: input.boostMultiplier,
    }, { onConflict: "season_id,week_number" });
    if (error) throw error;

    await logAudit(supabaseAdmin, adminId, "SEASON_WEEK", `Saved week ${input.weekNumber} (${input.boostMultiplier}× XP)`, `${input.startsOn}–${input.endsOn}`, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

export async function deleteSeasonWeek(weekNumber: number) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (!Number.isInteger(weekNumber) || weekNumber < 1) throw new Error("Choose a valid week.");

    const [{ count: rewards, error: rewardError }, { count: attendance, error: attendanceError }] = await Promise.all([
      supabaseAdmin.from("RewardProtocolBatch").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", weekNumber),
      supabaseAdmin.from("AttendanceRecord").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", weekNumber),
    ]);
    if (rewardError) throw rewardError;
    if (attendanceError) throw attendanceError;
    if ((rewards ?? 0) > 0 || (attendance ?? 0) > 0) throw new Error("This week already has attendance or reward records and cannot be deleted.");

    const { error } = await supabaseAdmin.from("SeasonWeek").delete().eq("season_id", activeSeasonId).eq("week_number", weekNumber);
    if (error) throw error;
    await logAudit(supabaseAdmin, adminId, "SEASON_WEEK", `Deleted week ${weekNumber}`, String(weekNumber), activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

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

export async function createSystemAdmin(_prevState: unknown, formData: FormData) {
  const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  let newAuthUserId: string | null = null;

  try {
    const { data: auth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName }
    });
    if (authErr) throw authErr;
    if (!auth.user) throw new Error("Supabase did not return the created account.");
    newAuthUserId = auth.user.id;

    const { error: adminError } = await supabaseAdmin.from('Admin').insert({
      auth_id: newAuthUserId,
      full_name: fullName,
      email,
    });
    if (adminError) throw adminError;

    await logAudit(supabaseAdmin, adminId, "CREATE_ADMIN", `Created administrator ${fullName}`, "SYSTEM", activeSeasonId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    if (newAuthUserId) await supabaseAdmin.auth.admin.deleteUser(newAuthUserId);
    return { error: errorMessage(err) };
  }
}

// --- 3. OTHER UTILS ---

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

export async function sendBroadcast(msg: string, group: string) {
  try {
    const { adminClient: supabaseAdmin, adminId, user, activeSeasonId } = await requireAdmin();
    const { data: sender } = await supabaseAdmin.from("Student").select("id").eq("auth_id", user.id).eq("season_id", activeSeasonId).maybeSingle();

    let q = supabaseAdmin.from("Student").select("id").eq("season_id", activeSeasonId);
    if (group !== "ALL") q = q.eq("group_id", group);
    const { data } = await q;
    const targets = (data ?? []) as { id: string }[];
    
    if (!targets?.length) throw new Error("No targets");
    
    const pings = targets.map(t => ({
        season_id: activeSeasonId, receiver_id: t.id, sender_id: sender?.id ?? null,
        sender_admin_id: sender ? null : adminId, message: msg, is_read: false, created_at: new Date().toISOString()
    }));
    await supabaseAdmin.from("Ping").insert(pings);
    
    await logAudit(supabaseAdmin, adminId, "BROADCAST", `Sent alert to ${group}: ${msg}`, group, activeSeasonId);
    return { success: true, count: targets.length };
  } catch (e: unknown) { return { success: false, message: errorMessage(e) }; }
}

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
