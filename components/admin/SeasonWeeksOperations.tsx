"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteSeasonWeek, saveSeasonWeek } from "@/app/actions/admin-season-weeks";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

export type SeasonWeekRecord = {
  week_number: number;
  starts_on: string;
  ends_on: string;
  boost_multiplier: number;
};

export default function SeasonWeeksOperations({ weeks, readOnly }: { weeks: SeasonWeekRecord[]; readOnly: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [weekNumber, setWeekNumber] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [boost, setBoost] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const reset = () => {
    setEditing(null);
    setWeekNumber("");
    setStartsOn("");
    setEndsOn("");
    setBoost("1");
  };

  const edit = (week: SeasonWeekRecord) => {
    setEditing(week.week_number);
    setWeekNumber(String(week.week_number));
    setStartsOn(week.starts_on);
    setEndsOn(week.ends_on);
    setBoost(String(week.boost_multiplier));
    setMessage(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await saveSeasonWeek({
      weekNumber: Number(weekNumber),
      startsOn,
      endsOn,
      boostMultiplier: Number(boost),
    });
    setLoading(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.message || "Week could not be saved." });
      return;
    }
    setMessage({ ok: true, text: `Week ${weekNumber} saved.` });
    reset();
    router.refresh();
  };

  const remove = async (week: SeasonWeekRecord) => {
    if (!window.confirm(`Delete week ${week.week_number}?`)) return;
    setLoading(true);
    setMessage(null);
    const result = await deleteSeasonWeek(week.week_number);
    setLoading(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.message || "Week could not be deleted." });
      return;
    }
    if (editing === week.week_number) reset();
    setMessage({ ok: true, text: `Week ${week.week_number} deleted.` });
    router.refresh();
  };

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6" aria-labelledby="season-weeks-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--primary)/0.08),transparent_48%)]" />
      <OperationsCardHeader id="season-weeks-title" title="Weeks & XP boosts" icon={<CalendarDays className="text-primary" size={17} />} />

      {message && <div role={message.ok ? "status" : "alert"} className={`mb-3 border px-3 py-2  ${message.ok ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-200" : "border-rose-400/20 bg-rose-400/[.06] text-rose-200"}`}>{message.text}</div>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,.95fr)]">
        <div className="space-y-2 md:hidden">
          {weeks.map((week) => (
            <article key={`mobile-${week.week_number}`} className="flex items-center justify-between gap-3 border border-border/70 bg-background/30 p-3">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">Week {week.week_number} <span className="font-mono text-warning">· {Number(week.boost_multiplier).toLocaleString()}× XP</span></div>
                <div className="mt-1 break-words font-mono text-xs text-muted">{week.starts_on} – {week.ends_on}</div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" disabled={readOnly || loading} onClick={() => edit(week)} aria-label={`Edit week ${week.week_number}`} className="console-control inline-flex h-10 w-10 items-center justify-center border border-border bg-background/50 text-muted hover:text-foreground disabled:opacity-40"><Pencil size={15} /></button>
                <button type="button" disabled={readOnly || loading} onClick={() => remove(week)} aria-label={`Delete week ${week.week_number}`} className="console-control inline-flex h-10 w-10 items-center justify-center border border-border bg-background/50 text-muted hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40"><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
          {!weeks.length && <p className="border border-border/70 px-3 py-6 text-center text-sm text-muted">No weeks configured. Add the season calendar to enable protocol awards.</p>}
        </div>
        <div className="hidden overflow-x-auto border border-border/70 md:block">
          <table className="w-full min-w-[460px] text-left text-xs">
            <thead className="bg-background/55 font-mono uppercase tracking-wider text-muted"><tr><th className="px-3 py-2.5">Week</th><th className="px-3 py-2.5">Dates</th><th className="px-3 py-2.5">Boost</th><th className="px-3 py-2.5 text-right">Edit</th></tr></thead>
            <tbody className="divide-y divide-border/60">
              {weeks.map((week) => (
                <tr key={week.week_number} className="hover:bg-primary/[.025]">
                  <td className="px-3 py-2.5 font-mono font-semibold text-foreground">{week.week_number}</td>
                  <td className="px-3 py-2.5 font-mono text-muted">{week.starts_on} – {week.ends_on}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-warning">{Number(week.boost_multiplier).toLocaleString()}×</td>
                  <td className="px-3 py-2.5"><div className="flex justify-end gap-1">
                    <button type="button" disabled={readOnly || loading} onClick={() => edit(week)} aria-label={`Edit week ${week.week_number}`} className="console-control inline-flex h-8 w-8 items-center justify-center border border-border bg-background/50 text-muted hover:text-foreground disabled:opacity-40 text-sm"><Pencil size={13} /></button>
                    <button type="button" disabled={readOnly || loading} onClick={() => remove(week)} aria-label={`Delete week ${week.week_number}`} className="console-control inline-flex h-8 w-8 items-center justify-center border border-border bg-background/50 text-muted hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40 text-sm"><Trash2 size={13} /></button>
                  </div></td>
                </tr>
              ))}
              {!weeks.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted">No weeks configured. Add the season calendar to enable protocol awards.</td></tr>}
            </tbody>
          </table>
        </div>

        <form onSubmit={submit} className="space-y-3 border border-border/70 bg-background/25 p-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">{editing === null ? "Add a week" : `Edit week ${editing}`}</h3>{editing !== null && <button type="button" onClick={reset} aria-label="Cancel week edit" className="text-muted hover:text-foreground"><X size={15} /></button>}</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-muted text-xs">Week number<input required min={1} max={60} step={1} type="number" value={weekNumber} onChange={(event) => setWeekNumber(event.target.value)} disabled={readOnly || loading || editing !== null} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="text-muted text-xs">XP multiplier<input required min={0.01} max={10} step={0.01} type="number" value={boost} onChange={(event) => setBoost(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="col-span-2 text-muted text-xs">From<input required type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="col-span-2 text-muted text-xs">Through<input required type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
          </div>
          <button type="submit" disabled={readOnly || loading} className="console-control inline-flex min-h-10 w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 font-black uppercase tracking-wider text-background transition hover:bg-primary-dim disabled:opacity-50 text-sm">{editing === null ? <Plus size={14} /> : <Save size={14} />}{loading ? "Saving…" : editing === null ? "Add week" : "Save week"}</button>
        </form>
      </div>
    </section>
  );
}
