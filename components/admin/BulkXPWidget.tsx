"use client";

import React, { useState } from "react";
import { Zap, Send, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { awardBulkXP } from "@/app/actions/admin-bulk-xp";
import clsx from "clsx";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

export default function BulkXPWidget() {
  const [amount, setAmount] = useState(10);
  const [group, setGroup] = useState("ALL");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (!confirm(`CONFIRM: Award ${amount} XP to ${group}?`)) return;
    
    setIsSubmitting(true);
    setStatus(null);

    // FIX: Only pass 3 arguments. The server action handles auth internally.
    const result = await awardBulkXP(group, amount, reason);

    if (result.success) {
      setStatus({ type: 'success', msg: `Awarded ${amount} XP to ${result.count} agents.` });
      setReason("");
    } else {
      setStatus({ type: 'error', msg: result.message || "Operation failed." });
    }
    setIsSubmitting(false);
  };

  return (
    <section className="instrument-panel relative isolate flex h-full flex-col overflow-hidden border border-primary/20 bg-[linear-gradient(145deg,rgba(13,31,49,.94),rgba(12,22,40,.94))] p-5 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--warning)/0.08),transparent_48%)]" />
      <div className="relative z-10">
        <OperationsCardHeader id="additional-xp-title" title="Additional XP" headingLevel="h3" icon={<Zap size={16} className="text-warning" />} />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="mb-2 block font-mono font-bold uppercase tracking-wider text-muted text-xs">Target group</label>
              <DropdownSelect
                leadingIcon={<Users size={14} />}
                value={group}
                onChange={setGroup}
                ariaLabel="XP award target group"
                options={[
                  { value: "ALL", label: "All Agents" },
                  ...["G1", "G2", "G3", "G4", "G5", "G6", "G7"].map((sector) => ({ value: sector, label: `Sector ${sector}` })),
                ]}
              />
          </div>

          <div className="space-y-2">
            <label className="mb-2 block font-mono font-bold uppercase tracking-wider text-muted text-xs">XP amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-warning">+</span>
              <input 
                type="number" 
                className="console-control w-full border border-border bg-background/75 py-2.5 pl-7 pr-3 font-mono text-foreground outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/30 text-sm"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
            <label className="mb-2 block font-mono font-bold uppercase tracking-wider text-muted text-xs">Reason</label>
            <input 
              type="text" 
              placeholder="e.g. Class participation"
              className="console-control w-full border border-border bg-background/75 px-3 py-2.5 text-foreground outline-none placeholder:text-muted/70 focus:border-primary/70 focus:ring-1 focus:ring-primary/30 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
        </div>

        {status && (
          <div role="status" className={clsx("flex items-center gap-2 border p-3 ",
            status.type === 'success' ? "border-emerald-400/20 bg-emerald-400/[.07] text-emerald-300" : "border-rose-400/20 bg-rose-400/[.07] text-rose-300"
          )}>
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {status.msg}
          </div>
        )}

        <div className="mt-auto border-t border-border/70 pt-4">
            <button 
            type="submit"
            disabled={isSubmitting}
            className="console-control flex min-h-12 w-full items-center justify-center gap-2 bg-warning px-4 py-3 font-black uppercase tracking-wider text-background shadow-lg shadow-warning/15 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50 text-sm"
            >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Award XP</>}
            </button>
        </div>

      </form>
    </section>
  );
}
