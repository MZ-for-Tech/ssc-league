"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit } from "./admin-action-helpers";

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
