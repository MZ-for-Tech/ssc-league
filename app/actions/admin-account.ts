"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit } from "./admin-action-helpers";

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
