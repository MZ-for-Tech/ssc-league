"use client";

import React, { useState } from "react";
import { Radio, Send, Users, CheckCircle } from "lucide-react";
import { sendBroadcast } from "@/app/actions/admin-actions";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

export default function BroadcastWidget() {
  const [message, setMessage] = useState(""); // Note: Requires DB schema support for message text
  const [group, setGroup] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Confirm broadcast transmission?")) return;
    
    setLoading(true);
    // Passing 'info' as default type
    const res = await sendBroadcast(message, group);
    setLoading(false);

    if (res.success) {
        setStatus(`Signal sent to ${res.count} operatives.`);
        setMessage("");
        setTimeout(() => setStatus(null), 3000);
    } else {
        alert(res.message);
    }
  };

  return (
    <section className="instrument-panel relative isolate flex h-full flex-col overflow-hidden border border-primary/20 bg-[linear-gradient(145deg,rgba(13,31,49,.94),rgba(12,22,40,.94))] p-5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--primary)/0.1),transparent_48%)]" />
        <div className="relative z-10">
            <OperationsCardHeader id="broadcast-title" title="Broadcast" headingLevel="h3" icon={<Radio className="text-primary" size={18} />} />
        </div>

        <form onSubmit={handleSend} className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
            <div>
                <label className="mb-2 block font-mono font-bold uppercase tracking-wider text-muted text-xs">Target group</label>
                    <DropdownSelect
                        leadingIcon={<Users size={14} />}
                        value={group}
                        onChange={setGroup}
                        ariaLabel="Broadcast target group"
                        options={[
                            { value: "ALL", label: "Global Channel (All)" },
                            ...["G1", "G2", "G3", "G4", "G5", "G6", "G7"].map((sector) => ({ value: sector, label: `Sector ${sector}` })),
                        ]}
                    />
            </div>

            <div className="flex-1">
                <label className="mb-2 block font-mono font-bold uppercase tracking-wider text-muted text-xs">Message</label>
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write an announcement…"
                    className="console-control min-h-28 w-full resize-y border border-border bg-background/75 p-3 text-foreground outline-none placeholder:text-muted/70 focus:border-primary/70 focus:ring-1 focus:ring-primary/30 text-sm"
                />
            </div>

            {status && (
                <div role="status" className="flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/[.07] p-2 text-emerald-300">
                    <CheckCircle size={12} /> {status}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="console-control flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-black uppercase tracking-wider text-background shadow-lg shadow-primary/15 transition hover:bg-primary-dim disabled:cursor-wait disabled:opacity-50 text-sm"
            >
                {loading ? "Sending…" : <><Send size={14} /> Send broadcast</>}
            </button>
        </form>
    </section>
  );
}
