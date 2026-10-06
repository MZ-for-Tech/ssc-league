import React from "react";
import { ScrollText } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuditEntry = { id: string; action: string; details: string; target: string; created_at: string; Admin: { full_name: string } | null };

export default async function AuditLog() {
  const supabase = await createSupabaseServerClient();

  const { data: logs } = await supabase
    .from("AuditLog")
    .select("*, Admin(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="instrument-panel relative isolate overflow-hidden border border-primary/15 bg-background/35">
        <div className="flex items-center gap-3 border-b border-border/70 bg-background/45 px-4 py-3">
            <ScrollText size={16} className="text-primary" />
            <span className="font-mono text-base font-bold uppercase tracking-[.15em] text-foreground">Activity log</span>
            <span className="ml-auto font-mono text-xs text-muted">LATEST 10</span>
        </div>
        <div className="divide-y divide-border/60">
            {(logs as AuditEntry[] | null)?.map((log) => (
                <div key={log.id} className="flex flex-col justify-between gap-2 px-4 py-3 transition-colors hover:bg-primary/[.035] sm:flex-row sm:items-center">
                    <div className="min-w-0">
                        <span className="mr-2 font-mono font-bold uppercase tracking-wider text-primary">{log.action}</span>
                        <span className="text-foreground/85">{log.details}</span>
                        <span className="ml-2 font-mono text-muted">{log.target}</span>
                    </div>
                    <div className="flex shrink-0 gap-3 font-mono text-xs text-muted sm:flex-col sm:gap-0 sm:text-right">
                        <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleTimeString()}</time>
                        <span>{log.Admin?.full_name || "Admin"}</span>
                    </div>
                </div>
            ))}
            {!logs?.length && <div className="px-4 py-8 text-center font-mono uppercase tracking-wider text-muted">No activity recorded yet</div>}
        </div>
    </div>
  );
}
