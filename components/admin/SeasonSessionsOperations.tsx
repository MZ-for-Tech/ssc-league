"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteSeasonSession, saveSeasonSession } from "@/app/actions/admin-season-sessions";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

export type SeasonSessionRecord = {
  id: string;
  session_number: number | null;
  session_date: string;
  module_title: string | null;
  topic_title: string;
  coverage_status: "planned" | "done" | "not_covered" | "midterm" | "practical_quiz";
  notes: string | null;
};

const statusLabels: Record<SeasonSessionRecord["coverage_status"], string> = {
  planned: "Planned",
  done: "Done",
  not_covered: "Will not be covered",
  midterm: "Midterm",
  practical_quiz: "Practical quiz",
};

export default function SeasonSessionsOperations({ sessions, readOnly, loadError = false }: { sessions: SeasonSessionRecord[]; readOnly: boolean; loadError?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SeasonSessionRecord | null>(null);
  const [sessionNumber, setSessionNumber] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [coverageStatus, setCoverageStatus] = useState<SeasonSessionRecord["coverage_status"]>("planned");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const reset = () => {
    setEditing(null);
    setSessionNumber("");
    setSessionDate("");
    setModuleTitle("");
    setTopicTitle("");
    setCoverageStatus("planned");
    setNotes("");
  };

  const edit = (session: SeasonSessionRecord) => {
    setEditing(session);
    setSessionNumber(session.session_number ? String(session.session_number) : "");
    setSessionDate(session.session_date);
    setModuleTitle(session.module_title || "");
    setTopicTitle(session.topic_title);
    setCoverageStatus(session.coverage_status);
    setNotes(session.notes || "");
    setMessage(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await saveSeasonSession({
      id: editing?.id,
      sessionNumber: sessionNumber ? Number(sessionNumber) : null,
      sessionDate,
      moduleTitle,
      topicTitle,
      coverageStatus,
      notes,
    });
    setLoading(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.message || "Session could not be saved." });
      return;
    }
    setMessage({ ok: true, text: `${topicTitle} saved to the season outline.` });
    reset();
    router.refresh();
  };

  const remove = async (session: SeasonSessionRecord) => {
    if (!window.confirm(`Delete “${session.topic_title}” from the season outline? Attendance records will be kept.`)) return;
    setLoading(true);
    setMessage(null);
    const result = await deleteSeasonSession(session.id);
    setLoading(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.message || "Session could not be deleted." });
      return;
    }
    if (editing?.id === session.id) reset();
    setMessage({ ok: true, text: `${session.topic_title} removed from the outline.` });
    router.refresh();
  };

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6" aria-labelledby="season-sessions-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_5%_0%,rgb(var(--primary)/0.08),transparent_45%)]" />
      <OperationsCardHeader id="season-sessions-title" title="Section outline" icon={<CalendarDays className="text-primary" size={17} />} />

      {message && <div role={message.ok ? "status" : "alert"} className={`mb-3 border px-3 py-2  ${message.ok ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-200" : "border-rose-400/20 bg-rose-400/[.06] text-rose-200"}`}>{message.text}</div>}
      {loadError && <div role="alert" className="mb-3 border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-rose-200">Section schedule could not be loaded. Check database access and refresh.</div>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)]">
        <div className="space-y-2 md:hidden">
          {sessions.map((session) => (
            <article key={`mobile-${session.id}`} className="border border-border/70 bg-background/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted">{session.session_date}{session.session_number ? ` · Section #${session.session_number}` : ""}</div>
                  <div className="mt-1 break-words font-semibold text-foreground">{session.topic_title}</div>
                  {session.module_title && <div className="break-words text-xs text-muted">{session.module_title}</div>}
                  <div className="mt-2 text-xs text-primary">{statusLabels[session.coverage_status]}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" disabled={readOnly || loading} onClick={() => edit(session)} aria-label={`Edit ${session.topic_title}`} className="console-control inline-flex h-10 w-10 items-center justify-center border border-border bg-background/50 text-muted hover:text-foreground disabled:opacity-40"><Pencil size={15} /></button>
                  <button type="button" disabled={readOnly || loading} onClick={() => remove(session)} aria-label={`Delete ${session.topic_title}`} className="console-control inline-flex h-10 w-10 items-center justify-center border border-border bg-background/50 text-muted hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40"><Trash2 size={15} /></button>
                </div>
              </div>
            </article>
          ))}
          {!sessions.length && <p className="border border-border/70 px-3 py-6 text-center text-sm text-muted">{loadError ? "No session records are available." : "No section outline yet. Add the season schedule."}</p>}
        </div>
        <div className="hidden max-h-[440px] overflow-auto border border-border/70 md:block">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="sticky top-0 bg-background/90 font-mono uppercase tracking-wider text-muted"><tr><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Section</th><th className="px-3 py-2.5">Topic / module</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 text-right">Edit</th></tr></thead>
            <tbody className="divide-y divide-border/60">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-primary/[.025]">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{session.session_date}</td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{session.session_number ? `#${session.session_number}` : "—"}</td>
                  <td className="px-3 py-2.5"><div className="text-sm font-medium text-foreground">{session.topic_title}</div><div className="text-xs text-muted">{session.module_title || ""}</div></td>
                  <td className="px-3 py-2.5 text-muted">{statusLabels[session.coverage_status]}</td>
                  <td className="px-3 py-2.5"><div className="flex justify-end gap-1">
                    <button type="button" disabled={readOnly || loading} onClick={() => edit(session)} aria-label={`Edit ${session.topic_title}`} className="console-control inline-flex h-8 w-8 items-center justify-center border border-border bg-background/50 text-muted hover:text-foreground disabled:opacity-40 text-sm"><Pencil size={13} /></button>
                    <button type="button" disabled={readOnly || loading} onClick={() => remove(session)} aria-label={`Delete ${session.topic_title}`} className="console-control inline-flex h-8 w-8 items-center justify-center border border-border bg-background/50 text-muted hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40 text-sm"><Trash2 size={13} /></button>
                  </div></td>
                </tr>
              ))}
              {!sessions.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted">{loadError ? "No session records are available." : "No section outline yet. Add the season schedule."}</td></tr>}
            </tbody>
          </table>
        </div>

        <form onSubmit={submit} className="space-y-3 border border-border/70 bg-background/25 p-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">{editing ? "Edit session" : "Add session"}</h3>{editing && <button type="button" onClick={reset} aria-label="Cancel session edit" className="text-muted hover:text-foreground"><X size={15} /></button>}</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-muted text-xs">Session / section #<input min={1} max={100} step={1} type="number" value={sessionNumber} onChange={(event) => setSessionNumber(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="text-muted text-xs">Date<input required type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="col-span-2 text-muted text-xs">Module<input maxLength={120} value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Module 2: Python Fundamentals" disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="col-span-2 text-muted text-xs">What will be covered<input required maxLength={160} value={topicTitle} onChange={(event) => setTopicTitle(event.target.value)} placeholder="Loops" disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="col-span-2 text-muted text-xs">Coverage status<DropdownSelect value={coverageStatus} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} onChange={(value) => setCoverageStatus(value as SeasonSessionRecord["coverage_status"])} disabled={readOnly || loading} ariaLabel="Coverage status" /></label>
            <label className="col-span-2 text-muted text-xs">Notes<textarea maxLength={500} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 w-full border border-border bg-background/65 px-3 py-2 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
          </div>
          <button type="submit" disabled={readOnly || loading} className="console-control inline-flex min-h-10 w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 font-black uppercase tracking-wider text-background transition hover:bg-primary-dim disabled:opacity-50 text-sm">{editing ? <Save size={14} /> : <Plus size={14} />}{loading ? "Saving…" : editing ? "Save session" : "Add session"}</button>
        </form>
      </div>
    </section>
  );
}
