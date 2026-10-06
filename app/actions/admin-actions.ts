"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/require-admin";

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
    revalidatePath("/dashboard");
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
    revalidatePath("/dashboard");
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
    revalidatePath("/dashboard");
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
    revalidatePath("/dashboard");
    return { success: true, count: students.length };
  } catch (e: unknown) { return { success: false, message: errorMessage(e) }; }
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
    revalidatePath("/dashboard");
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
  revalidatePath("/dashboard");
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
    const weekNumber = await getCurrentWeekNumber(supabaseAdmin, activeSeasonId);
    const { data } = await supabaseAdmin.from("Student").select("id").eq("group_id", group).eq("season_id", activeSeasonId);
    const students = (data ?? []) as { id: string }[];
    if (!students.length) throw new Error("No students");
    
    const records = students.map(s => ({
      id: randomUUID(), season_id: activeSeasonId, student_id: s.id, date: new Date().toISOString().split('T')[0], status,
      week_number: weekNumber,
    }));
    await supabaseAdmin.from("AttendanceRecord").upsert(records, { onConflict: "student_id, date" });
    
    await logAudit(supabaseAdmin, adminId, "ATTENDANCE", `Marked ${group} as ${status}`, group, activeSeasonId);
    return { success: true, count: students.length };
  } catch (e: unknown) { return { success: false, message: errorMessage(e) }; }
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
