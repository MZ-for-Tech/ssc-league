"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, HeartHandshake, Plus, Trash2, Users } from "lucide-react";
import { deleteSeasonRecognition, recordSeasonRecognition } from "@/app/actions/admin-season-recognition";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

type RecognitionType = "support" | "extra_effort";
type StudentOption = { id: string; full_name: string; student_id: string; group_id: string | null };
export type SeasonRecognitionRecord = { id: string; student_id: string; event_date: string; session_number: number | null; recognition_type: RecognitionType; notes: string | null };

export default function SeasonRecognitionOperations({ students, records, today, readOnly, loadError = false }: {
  students: StudentOption[];
  records: SeasonRecognitionRecord[];
  today: string;
  readOnly: boolean;
  loadError?: boolean;
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [eventDate, setEventDate] = useState(today);
  const [sessionNumber, setSessionNumber] = useState("");
  const [recognitionType, setRecognitionType] = useState<RecognitionType>("extra_effort");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const names = new Map(students.map((student) => [student.id, `${student.full_name} (${student.student_id})` ]));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentId) {
      setMessage({ ok: false, text: "Choose a student before recording recognition." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await recordSeasonRecognition({ studentId, eventDate, sessionNumber: sessionNumber ? Number(sessionNumber) : null, recognitionType, notes });
    setLoading(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.message || "Recognition could not be recorded." });
      return;
    }
    setMessage({ ok: true, text: "Recognition recorded." });
    setStudentId("");
    setNotes("");
    router.refresh();
  };

  const remove = async (record: SeasonRecognitionRecord) => {
    if (!window.confirm("Remove this recognition record?")) return;
    setLoading(true);
    setMessage(null);
    const result = await deleteSeasonRecognition(record.id);
    setLoading(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.message || "Recognition could not be removed." });
      return;
    }
    setMessage({ ok: true, text: "Recognition removed." });
    router.refresh();
  };

  const exportCsv = () => {
    const header = ["Date", "Section", "Student", "Student ID", "Group", "Recognition", "Notes"];
    const rows = records.map((record) => {
      const student = students.find((candidate) => candidate.id === record.student_id);
      return [record.event_date, record.session_number ?? "", student?.full_name ?? "", student?.student_id ?? "", student?.group_id ?? "", record.recognition_type === "support" ? "Knowledge sharing and peer support" : "Extra effort", record.notes ?? ""];
    });
    const csv = [header, ...rows].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssc-recognition-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6" aria-labelledby="season-recognition-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_5%_0%,rgb(var(--primary)/0.08),transparent_45%)]" />
      <OperationsCardHeader
        id="season-recognition-title"
        title="Recognition log"
        icon={<HeartHandshake className="text-primary" size={17} />}
        actions={<button type="button" onClick={exportCsv} disabled={!records.length} className="console-control inline-flex min-h-9 items-center gap-2 border border-primary/20 bg-background/55 px-3 py-2 font-bold uppercase tracking-wider text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 text-sm"><Download size={14} /> Export log</button>}
      />
      {message && <div role={message.ok ? "status" : "alert"} className={`mb-3 border px-3 py-2  ${message.ok ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-200" : "border-rose-400/20 bg-rose-400/5 text-rose-200"}`}>{message.text}</div>}
      {loadError && <div role="alert" className="mb-3 border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-rose-200">Recognition records could not be loaded. Refresh the page to try again.</div>}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={submit} className="space-y-3 border border-border/70 bg-background/25 p-4">
          <div>
            <span className="mb-1.5 block text-xs text-muted">Student <span aria-hidden="true" className="text-rose-300">*</span></span>
            <DropdownSelect
              value={studentId}
              options={[
                { value: "", label: "Choose student" },
                ...students.map((student) => ({
                  value: student.id,
                  label: `${student.full_name} · ${student.student_id} · ${student.group_id || "—"}`,
                })),
              ]}
              onChange={(value) => { setStudentId(value); setMessage(null); }}
              disabled={readOnly || loading || !students.length}
              ariaLabel="Recognition student"
              leadingIcon={<Users size={14} />}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-muted text-xs">Date<input required type="date" max={today} value={eventDate} onChange={(event) => setEventDate(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
            <label className="text-muted text-xs">Section #<input min={1} max={100} step={1} type="number" value={sessionNumber} onChange={(event) => setSessionNumber(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 min-h-10 w-full border border-border bg-background/65 px-3 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
          </div>
          <label className="block text-muted text-xs">Recognition<DropdownSelect value={recognitionType} options={[{ value: "extra_effort", label: "Extra effort" }, { value: "support", label: "Knowledge sharing and peer support" }]} onChange={(value) => setRecognitionType(value as RecognitionType)} disabled={readOnly || loading} ariaLabel="Recognition type" /></label>
          <label className="block text-muted text-xs">Notes<textarea maxLength={300} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={readOnly || loading} className="console-control mt-1.5 w-full border border-border bg-background/65 px-3 py-2 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" /></label>
          <button type="submit" disabled={readOnly || loadError || loading || !studentId} className="console-control inline-flex min-h-10 w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 font-black uppercase tracking-wider text-background transition hover:bg-primary-dim disabled:opacity-50 text-sm"><Plus size={14} />{loading ? "Saving…" : "Record recognition"}</button>
        </form>
        <div className="space-y-2 md:hidden">
          {records.map((record) => (
            <article key={`mobile-${record.id}`} className="flex items-start justify-between gap-3 border border-border/70 bg-background/30 p-3">
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted">{record.event_date}{record.session_number ? ` · Section #${record.session_number}` : ""}</div>
                <div className="mt-1 break-words font-semibold text-foreground">{names.get(record.student_id) || "Former student"}</div>
                <div className="text-xs text-primary">{record.recognition_type === "support" ? "Peer support" : "Extra effort"}</div>
                {record.notes && <div className="mt-1 break-words text-xs text-muted">{record.notes}</div>}
              </div>
              <button type="button" onClick={() => remove(record)} disabled={readOnly || loading} aria-label={`Remove recognition for ${names.get(record.student_id) || "former student"}`} className="console-control inline-flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background/50 text-muted hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40"><Trash2 size={15} /></button>
            </article>
          ))}
          {!records.length && <p className="border border-border/70 px-3 py-6 text-center text-sm text-muted">No recognition entries recorded for this season.</p>}
        </div>
        <div className="hidden max-h-[430px] overflow-auto border border-border/70 md:block">
          <table className="w-full min-w-[560px] text-left text-xs"><thead className="sticky top-0 bg-background/90 font-mono uppercase tracking-wider text-muted"><tr><th className="px-3 py-2.5">Date / section</th><th className="px-3 py-2.5">Student</th><th className="px-3 py-2.5">Recognition</th><th className="px-3 py-2.5 text-right">Remove</th></tr></thead><tbody className="divide-y divide-border/60">
            {records.map((record) => <tr key={record.id}><td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{record.event_date}{record.session_number ? ` · #${record.session_number}` : ""}</td><td className="px-3 py-2.5"><div className="text-sm font-medium text-foreground">{names.get(record.student_id) || "Former student"}</div>{record.notes && <div className="max-w-48 truncate text-xs text-muted" title={record.notes}>{record.notes}</div>}</td><td className="px-3 py-2.5 text-muted">{record.recognition_type === "support" ? "Peer support" : "Extra effort"}</td><td className="px-3 py-2.5 text-right"><button type="button" onClick={() => remove(record)} disabled={readOnly || loading} aria-label="Remove recognition" className="console-control inline-flex h-8 w-8 items-center justify-center border border-border bg-background/50 text-muted hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40 text-sm"><Trash2 size={13} /></button></td></tr>)}
            {!records.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted">No recognition entries recorded for this season.</td></tr>}
          </tbody></table>
        </div>
      </div>
    </section>
  );
}
