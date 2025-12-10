import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ScrollText } from "lucide-react";

export default async function AuditLog() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: logs } = await supabase
    .from("AuditLog")
    .select("*, Admin(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
            <ScrollText size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-white">Command Log</span>
        </div>
        <div className="divide-y divide-slate-800">
            {logs?.map((log: any) => (
                <div key={log.id} className="p-3 text-sm flex justify-between hover:bg-slate-800/50">
                    <div>
                        <span className="font-mono text-cyan-400 font-bold mr-2">{log.action}</span>
                        <span className="text-slate-300">{log.details}</span>
                        <span className="text-slate-500 text-xs ml-2">({log.target})</span>
                    </div>
                    <div className="text-slate-500 text-xs text-right">
                        <div>{new Date(log.created_at).toLocaleTimeString()}</div>
                        <div className="text-slate-600">{log.Admin?.full_name}</div>
                    </div>
                </div>
            ))}
            {!logs?.length && <div className="p-4 text-center text-slate-500 text-sm">No actions logged.</div>}
        </div>
    </div>
  );
}