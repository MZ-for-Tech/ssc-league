import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Bell, Check, Crosshair, Clock, ShieldAlert, Radio } from "lucide-react";
import clsx from "clsx";

export const revalidate = 0;

export default async function CommsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch Pings directed at ME
  const { data: pings } = await supabase
    .from("Ping")
    .select(`
      id, created_at, is_read,
      sender:Student!sender_id (full_name, avatar_url, current_level)
    `)
    .eq("receiver_id", user?.id)
    .order("created_at", { ascending: false });

  // Mark all as read
  if (pings?.some(p => !p.is_read)) {
      await supabase
        .from("Ping")
        .update({ is_read: true })
        .eq("receiver_id", user?.id)
        .eq("is_read", false);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Radio className="text-rose-500" size={32} />
                Comms Relay
            </h1>
            <p className="text-slate-400 text-sm mt-1">
               Secure transmission feed from field operatives.
            </p>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                CHANNEL_SECURE
             </div>
        </div>
      </div>

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
            pings?.map((ping: any) => (
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
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse" />
                    )}

                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <img 
                                src={ping.sender.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${ping.sender.full_name}`}
                                className="w-12 h-12 rounded-full bg-slate-950 object-cover border-2 border-slate-700 group-hover:border-slate-500 transition-colors"
                                alt="Sender"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                               L{ping.sender.current_level}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={clsx("font-bold text-sm truncate pr-4", !ping.is_read ? "text-rose-400" : "text-slate-200")}>
                                    {ping.sender.full_name}
                                </h4>
                            </div>
                            
                            <div className="text-xs text-slate-400 font-medium mb-3">
                                has targeted you.
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                                <span className={clsx(
                                    "text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                                    !ping.is_read ? "text-rose-500" : "text-slate-500"
                                )}>
                                    <Crosshair size={12} />
                                    Rivalry Ping
                                </span>
                                <span className="text-[10px] text-slate-600 flex items-center gap-1 font-mono">
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