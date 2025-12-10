"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- HELPER: AUDIT LOGGING ---
async function logAudit(action: string, details: string, target: string) {
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) return;
    
    // Find Admin ID linked to this Auth ID
    const { data: admin } = await supabaseAdmin.from("Admin").select("id").eq("auth_id", user.id).single();
    if (!admin) return;

    await supabaseAdmin.from("AuditLog").insert({
      admin_id: admin.id,
      action,
      details,
      target,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Audit Log Failed:", err);
  }
}

// --- 1. USER MANAGEMENT ---

export async function updateStudent(studentId: string, data: any) {
  try {
    const { error } = await supabaseAdmin.from("Student").update(data).eq("id", studentId);
    if (error) throw error;
    
    await logAudit("UPDATE_PROFILE", `Updated profile data`, studentId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) { return { success: false, message: err.message }; }
}

export async function resetAgentPassword(authId: string, studentId: string) {
  try {
    const tempPassword = `Agent${studentId}!`;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(authId, { password: tempPassword });
    if (error) throw error;
    
    await logAudit("RESET_PASSWORD", "Reset user password to default", studentId);
    return { success: true, message: `Password reset to: ${tempPassword}` };
  } catch (err: any) { return { success: false, message: err.message }; }
}

export async function awardStudentXP(studentId: string, amount: number, reason: string) {
  try {
    const { data: s } = await supabaseAdmin.from("Student").select("current_xp").eq("id", studentId).single();
    if (!s) throw new Error("Student not found");

    await supabaseAdmin.from("XPTransaction").insert({
      student_id: studentId, amount, action_type: "MANUAL_ENTRY", description: reason, created_at: new Date().toISOString()
    });

    const newXP = (s.current_xp || 0) + amount;
    await supabaseAdmin.from("Student").update({ current_xp: newXP }).eq("id", studentId);
    
    await logAudit("AWARD_XP", `Awarded ${amount} XP: ${reason}`, studentId);
    revalidatePath("/admin/users");
    return { success: true, newXP };
  } catch (err: any) { return { success: false, message: err.message }; }
}

// --- COMPATIBILITY WRAPPERS (For UsersTable.tsx) ---
export async function terminateAgent(studentId: string) {
  return deleteStudents([studentId]);
}

export async function updateAgentRole(studentDbId: string, role: string) {
  // This logic is complex because 'role' is in Admin table, not Student.
  // Assuming 'role' === 'admin' means insert into Admin table.
  try {
    const { data: student } = await supabaseAdmin.from("Student").select("auth_id").eq("id", studentDbId).single();
    if (!student) throw new Error("Student not found");

    if (role === 'admin') {
       await supabaseAdmin.from("Admin").insert({ auth_id: student.auth_id, role: 'admin' });
    } else {
       await supabaseAdmin.from("Admin").delete().eq("auth_id", student.auth_id);
    }
    await logAudit("UPDATE_ROLE", `Changed role to ${role}`, studentDbId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) { return { success: false, message: err.message }; }
}

// --- 2. BULK OPERATIONS ---

export async function awardBulkXP(group: string, amount: number, desc: string) {
  try {
    let q = supabaseAdmin.from("Student").select("id, current_xp");
    if (group !== "ALL") q = q.eq("group_id", group);
    const { data: students } = await q;
    
    if (!students?.length) throw new Error("No students found");

    const txs = students.map(s => ({
        student_id: s.id, amount, action_type: "MANUAL_ENTRY", description: desc, created_at: new Date().toISOString()
    }));
    await supabaseAdmin.from("XPTransaction").insert(txs);

    for (const s of students) {
        await supabaseAdmin.from("Student").update({ current_xp: (s.current_xp || 0) + amount }).eq("id", s.id);
    }
    
    await logAudit("BULK_XP", `Awarded ${amount} XP to ${group}`, group);
    revalidatePath("/dashboard"); revalidatePath("/admin/users");
    return { success: true, count: students.length };
  } catch (e: any) { return { success: false, message: e.message }; }
}

export async function deleteStudents(studentIds: string[]) {
  try {
    const { data } = await supabaseAdmin.from("Student").select("auth_id").in("id", studentIds);
    const { error } = await supabaseAdmin.from("Student").delete().in("id", studentIds);
    if (error) throw error;

    if (data) {
        for (const s of data) if (s.auth_id) await supabaseAdmin.auth.admin.deleteUser(s.auth_id);
    }
    
    await logAudit("BULK_DELETE", `Deleted ${studentIds.length} agents`, "MULTIPLE");
    revalidatePath("/admin/users");
    return { success: true, count: studentIds.length };
  } catch (err: any) { return { success: false, message: err.message }; }
}

export async function bulkImportStudents(students: any[]) {
  const res = { success: 0, failed: 0, errors: [] as string[] };
  for (const s of students) {
    try {
      const { data: auth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: s.email, password: `Agent${s.student_id}!`, email_confirm: true, user_metadata: { full_name: s.full_name }
      });
      if (authErr) throw authErr;
      
      const { error: profErr } = await supabaseAdmin.from("Student").insert({
          auth_id: auth.user!.id, full_name: s.full_name, student_id: s.student_id, group_id: s.group_id, email: s.email, current_xp: 0, current_level: 1
      });
      if (profErr) { await supabaseAdmin.auth.admin.deleteUser(auth.user!.id); throw profErr; }
      res.success++;
    } catch (e: any) { res.failed++; res.errors.push(`${s.student_id}: ${e.message}`); }
  }
  
  await logAudit("BULK_IMPORT", `Imported ${res.success} agents`, "SYSTEM");
  revalidatePath("/admin/users");
  return res;
}

export async function createSystemAdmin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  try {
    const { data: auth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName }
    });
    if (authErr) throw authErr;

    await supabaseAdmin.from('Admin').insert({ auth_id: auth.user!.id, role: 'admin' });
    await supabaseAdmin.from('Student').insert({
        auth_id: auth.user!.id, full_name: fullName, student_id: `CMD-${Math.floor(1000+Math.random()*9000)}`,
        group_id: 'COMMAND', current_level: 99, current_xp: 0
    });

    await logAudit("CREATE_ADMIN", `Promoted ${fullName} to Command`, "SYSTEM");
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) { return { error: err.message }; }
}

// --- 3. OTHER UTILS ---

export async function markGroupAttendance(group: string, status: string) {
  try {
    const { data: students } = await supabaseAdmin.from("Student").select("id").eq("group_id", group);
    if (!students?.length) throw new Error("No students");
    
    const records = students.map(s => ({ student_id: s.id, date: new Date().toISOString().split('T')[0], status }));
    await supabaseAdmin.from("AttendanceRecord").upsert(records, { onConflict: "student_id, date" });
    
    await logAudit("ATTENDANCE", `Marked ${group} as ${status}`, group);
    return { success: true, count: students.length };
  } catch (e: any) { return { success: false, message: e.message }; }
}

export async function sendBroadcast(msg: string, group: string, type: string) {
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    const { data: sender } = await supabaseAdmin.from("Student").select("id").eq("auth_id", user?.id).single();
    if (!sender) throw new Error("Sender not found");

    let q = supabaseAdmin.from("Student").select("id");
    if (group !== "ALL") q = q.eq("group_id", group);
    const { data: targets } = await q;
    
    if (!targets?.length) throw new Error("No targets");
    
    const pings = targets.map(t => ({
        receiver_id: t.id, sender_id: sender.id, is_read: false, created_at: new Date().toISOString()
    }));
    await supabaseAdmin.from("Ping").insert(pings);
    
    await logAudit("BROADCAST", `Sent alert to ${group}`, group);
    return { success: true, count: targets.length };
  } catch (e: any) { return { success: false, message: e.message }; }
}

export async function startImpersonation(studentId: string) {
  const cookieStore = await cookies();
  cookieStore.set('impersonate_id', studentId, { path: '/' });
  return { success: true };
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonate_id");
  return { success: true };
}