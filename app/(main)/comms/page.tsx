import React from "react";
import { Bell, Crosshair, Clock, Radio } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import PageHeader from "@/components/PageHeader";

export const revalidate = 0;

type Ping = { id: string; created_at: string; is_read: boolean; message: string | null;
  sender: { full_name: string; avatar_url: string | null; current_level: number } | null;
  adminSender: { full_name: string } | null };

export default async function CommsPage() {
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = Boolean(adminProfile);
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  const impersonateId = await getImpersonatedStudentId();
  const { data: student } = user && !isAdmin
    ? await supabase.from("Student").select("id").eq("auth_id", user.id).eq("season_id", seasonId).maybeSingle()
    : isAdmin && impersonateId
      ? await supabase.from("Student").select("id").eq("id", impersonateId).eq("season_id", seasonId).maybeSingle()
    : { data: null };
  
  // Fetch Pings directed at ME
  let pingsQuery = supabase
    .from("Ping")
    .select(`
      id, created_at, is_read, message,
      sender:Student!sender_id (full_name, avatar_url, current_level),
      adminSender:Admin!sender_admin_id (full_name)
    `)
    .eq("season_id", seasonId);
  if (!isAdmin) pingsQuery = pingsQuery.eq("receiver_id", student?.id || "");
  const { data: pings } = await pingsQuery.order("created_at", { ascending: false });

  // Mark all as read
  if (!isAdmin && seasonId === activeSeasonId && pings?.some(p => !p.is_read)) {
      await supabase
        .from("Ping")
        .update({ is_read: true })
        .eq("season_id", seasonId)
        .eq("receiver_id", student?.id || "")
        .eq("is_read", false);
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER --- */}
      <PageHeader
        title="Comms Relay"
        icon={<Radio size={28} />}
      />

      {/* --- PINGS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pings?.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <Bell size={24} />
                </div>
                <h3 className="text-white font-bold mb-1">Silence on the Wire</h3>
                <p className="text-slate-500 text-sm">No incoming transmissions detected.</p>
            </div>
        ) : (
            (pings as Ping[] | null)?.map((ping) => (
                <div 
                    key={ping.id} 
                    className={clsx(
                        "relative p-5 rounded-2xl border transition-all duration-300 group overflow-hidden",
                        !ping.is_read 
                            ? "bg-rose-950/10 border-rose-500/30 hover:border-rose-500/50" 
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    )}
                >
                    {/* Unread Indicator Dot */}
                    {!ping.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgb(var(--rose-500))] animate-pulse" />
                    )}

                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <Image unoptimized width={48} height={48}
                                src={ping.sender?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${ping.sender?.full_name || ping.adminSender?.full_name || "Command"}`}
                                className="w-12 h-12 rounded-full bg-slate-950 object-cover border-2 border-slate-700 group-hover:border-slate-500 transition-colors"
                                alt="Sender"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded border border-slate-700">
                               {ping.sender ? `L${ping.sender.current_level}` : "CMD"}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={clsx("font-bold text-sm truncate pr-4", !ping.is_read ? "text-rose-400" : "text-slate-200")}>
                                    {ping.sender?.full_name || ping.adminSender?.full_name || "Command"}
                                </h4>
                            </div>
                            
                            <div className="text-xs text-slate-400 font-medium mb-3">
                                {ping.message || "has targeted you."}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                                <span className={clsx(
                                    "text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                                    !ping.is_read ? "text-rose-500" : "text-slate-500"
                                )}>
                                    <Crosshair size={12} />
                                    Rivalry Ping
                                </span>
                                <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                                    <Clock size={10} />
                                    {new Date(ping.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
