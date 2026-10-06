"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Save, SlidersHorizontal } from "lucide-react";
import { saveRewardProtocolValues } from "@/app/actions/admin-rewards";
import type { RewardCategory, RewardProtocolData } from "@/lib/reward-protocol";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

export default function RewardProtocolSettings({ protocol, readOnly, loadError }: {
  protocol: RewardProtocolData;
  readOnly: boolean;
  loadError: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(() => Object.fromEntries(
    (Object.keys(protocol) as RewardCategory[]).flatMap((category) =>
      protocol[category].rewards.map((reward) => [`${category}:${reward.key}`, String(reward.xp)]),
    ),
  ));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const tasks = useMemo(() => (Object.keys(protocol) as RewardCategory[]).flatMap((category) =>
    protocol[category].rewards.map((reward) => ({ category, ...reward })),
  ), [protocol]);

  const save = () => {
    const updates = tasks.map((task) => ({
      category: task.category,
      rewardKey: task.key,
      xp: Number(values[`${task.category}:${task.key}`]),
    }));
    if (updates.some((task) => !Number.isInteger(task.xp) || task.xp < 1 || task.xp > 1000)) {
      setMessage({ ok: false, text: "Use whole XP values from 1 to 1000." });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await saveRewardProtocolValues(updates);
      if (!result.success) {
        setMessage({ ok: false, text: result.message || "Reward values could not be saved." });
        return;
      }
      setMessage({ ok: true, text: "Task XP values saved." });
      router.refresh();
    });
  };

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6" aria-labelledby="reward-protocol-settings-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--primary)/0.08),transparent_48%)]" />
      <OperationsCardHeader
        id="reward-protocol-settings-title"
        title="Protocol task values"
        icon={<SlidersHorizontal aria-hidden="true" size={16} className="text-primary" />}
        actions={<button type="button" onClick={save} disabled={readOnly || loadError || isPending} className="console-control inline-flex min-h-10 items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? <Save size={14} className="animate-pulse" /> : <Check size={14} />}
          {isPending ? "Saving…" : "Save task values"}
        </button>}
      />
      {loadError && <div role="alert" className="mb-4 border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-rose-200">Protocol values could not be loaded. Apply migration 20261006150000_configurable_reward_protocol.sql, then refresh.</div>}
      {message && <div role={message.ok ? "status" : "alert"} className={`mb-4 border px-3 py-2 ${message.ok ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-200" : "border-rose-400/20 bg-rose-400/5 text-rose-200"}`}>{message.text}</div>}
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {(Object.keys(protocol) as RewardCategory[]).map((category) => (
          <fieldset key={category} className="space-y-3 border border-border/70 bg-background/25 p-3" disabled={readOnly || loadError || isPending}>
            <legend className="px-1 text-sm font-semibold text-foreground">{protocol[category].label}</legend>
            {protocol[category].rewards.map((reward) => {
              const key = `${category}:${reward.key}`;
              return (
                <label key={key} className="flex items-center justify-between gap-3 text-muted">
                  <span className="min-w-0">{reward.item}</span>
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-foreground">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={values[key] ?? reward.xp}
                      onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                      aria-label={`${reward.item} XP value`}
                      className="console-control min-h-9 w-20 border border-border bg-background/65 px-2 text-right text-sm text-foreground outline-none focus:border-primary/70 disabled:opacity-50"
                    />
                    <span>XP</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>
    </section>
  );
}
