"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Check, Clock3, Search, Users } from "lucide-react";
import { awardRewardProtocol } from "@/app/actions/admin-actions";
import type { RewardCategory, RewardProtocolData } from "@/lib/reward-protocol";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

type Student = { id: string; full_name: string; student_id: string; group_id: string | null };
type HistoryEntry = {
  id: string;
  category: string;
  reward_key: string;
  reward_label: string;
  event_label: string;
  award_date: string;
  week_number: number;
  base_amount: number;
  boost_multiplier: number;
  amount: number;
  created_at: string;
  recipient_count: number;
};

interface RewardProtocolClientProps {
  protocol: RewardProtocolData;
  students: Student[];
  weeks: { week_number: number; starts_on: string; ends_on: string; boost_multiplier: number }[];
  today: string;
  attendedSessionCounts: Record<string, number>;
  attendanceAwards: { student_id: string; reward_key: string }[];
  history: HistoryEntry[];
  readOnly: boolean;
  loadError: string | null;
}

const panelClass = "instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-lg shadow-black/20";
const categories: RewardCategory[] = ["attendance", "coursework", "participation"];

export default function RewardProtocolClient({ protocol, students, attendedSessionCounts, attendanceAwards, weeks, today, history, readOnly, loadError }: RewardProtocolClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState<RewardCategory>("attendance");
  const [rewardKey, setRewardKey] = useState<string>(protocol.attendance.rewards[0].key);
  const [eventLabel, setEventLabel] = useState("");
  const [awardDate, setAwardDate] = useState(today);
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const reward = protocol[category].rewards.find((item) => item.key === rewardKey) ?? protocol[category].rewards[0];
  const selectedWeek = weeks.find((week) => week.starts_on <= awardDate && week.ends_on >= awardDate);
  const boostMultiplier = selectedWeek ? Number(selectedWeek.boost_multiplier) : null;
  const finalXPPerStudent = boostMultiplier === null ? null : Math.round(reward.xp * boostMultiplier);
  const groups = useMemo(() => [...new Set(students.map((student) => student.group_id).filter((group): group is string => Boolean(group)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })), [students]);
  const alreadyAwarded = useMemo(() => new Set(attendanceAwards.filter((award) => award.reward_key === reward.key).map((award) => award.student_id)), [attendanceAwards, reward.key]);
  const visibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return students.filter((student) => {
      const groupMatches = selectedGroup === "ALL" || student.group_id === selectedGroup;
      const queryMatches = !normalizedQuery || `${student.full_name} ${student.student_id} ${student.group_id || ""}`.toLocaleLowerCase().includes(normalizedQuery);
      return groupMatches && queryMatches;
    });
  }, [query, selectedGroup, students]);
  const eligibleVisible = visibleStudents.filter((student) => category !== "attendance" || !alreadyAwarded.has(student.id));
  const selectedCount = selectedIds.size;
  const totalXP = selectedCount * (finalXPPerStudent ?? 0);
  const allVisibleSelected = eligibleVisible.length > 0 && eligibleVisible.every((student) => selectedIds.has(student.id));

  const changeCategory = (nextCategory: RewardCategory) => {
    setCategory(nextCategory);
    setRewardKey(protocol[nextCategory].rewards[0].key);
    setEventLabel("");
    setSelectedIds(new Set());
    setFeedback(null);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) eligibleVisible.forEach((student) => next.delete(student.id));
      else eligibleVisible.forEach((student) => next.add(student.id));
      return next;
    });
  };

  const submitAward = async () => {
    if (!selectedCount || submitting) return;
    if (category !== "attendance" && !eventLabel.trim()) {
      setFeedback({ type: "error", text: "Add an event name, such as Assignment 2 or Office hours — 6 Oct." });
      return;
    }
    const confirmation = `Award ${reward.xp} XP for ${reward.item} to ${selectedCount} student${selectedCount === 1 ? "" : "s"} (${totalXP} XP total)?`;
    if (!window.confirm(confirmation)) return;

    setSubmitting(true);
    setFeedback(null);
    const result = await awardRewardProtocol(category, reward.key, eventLabel, [...selectedIds], awardDate);
    setSubmitting(false);
    if (!result.success) {
      setFeedback({ type: "error", text: result.message || "The reward could not be issued." });
      return;
    }

    setSelectedIds(new Set());
    setEventLabel("");
    setFeedback({ type: "success", text: `${result.item} awarded to ${result.count} students: +${result.baseAmount} × ${result.boostMultiplier} = ${result.amount} XP each.` });
    router.refresh();
  };

  return (
    <section className={`${panelClass} p-5 sm:p-6`} aria-labelledby="reward-protocol-ops-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--warning)/0.08),transparent_48%)]" />
      <OperationsCardHeader id="reward-protocol-ops-title" title="Reward protocol" icon={<Award className="text-warning" size={18} />} />

      {loadError ? (
        <div role="alert" className="border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-rose-200">{loadError}</div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4" role="tablist" aria-label="Reward category">
            {categories.map((item) => (
              <button key={item} type="button" role="tab" aria-selected={category === item} disabled={readOnly} onClick={() => changeCategory(item)} className={`console-control min-h-10 border px-3 py-2  font-bold uppercase tracking-wider transition disabled:opacity-50 ${category === item ? "border-primary/45 bg-primary/10 text-primary" : "border-border bg-background/35 text-muted hover:text-foreground"}`}>
                {protocol[item].label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs">
                  <span className="mb-1.5 block font-mono font-bold uppercase tracking-wider text-muted">Protocol item</span>
                  <DropdownSelect value={reward.key} options={protocol[category].rewards.map((item) => ({ value: item.key, label: `${item.item} · +${item.xp} XP` }))} disabled={readOnly} onChange={(value) => { setRewardKey(value); setSelectedIds(new Set()); setEventLabel(""); }} ariaLabel="Protocol reward" />
                </label>
                <label className="block text-xs">
                  <span className="mb-1.5 block font-mono font-bold uppercase tracking-wider text-muted">Award date</span>
                  <input required type="date" value={awardDate} max={today} disabled={readOnly} onChange={(event) => setAwardDate(event.target.value)} className="console-control min-h-10 w-full border border-border bg-background/65 px-3 py-2 text-foreground outline-none focus:border-primary/70 disabled:opacity-50 text-sm" />
                </label>
              </div>

              <div className={`grid grid-cols-2 gap-2 border px-3 py-2.5  ${selectedWeek ? "border-primary/15 bg-primary/[.035]" : "border-amber-400/20 bg-amber-400/[.045]"}`}>
                {selectedWeek ? (
                  <>
                    <div><div className="font-mono uppercase tracking-wider text-muted">League week</div><div className="mt-1 font-mono font-bold text-foreground">Week {selectedWeek.week_number}</div></div>
                    <div className="text-right"><div className="font-mono uppercase tracking-wider text-muted">XP boost</div><div className="mt-1 font-mono font-bold text-warning">{boostMultiplier}× · {reward.xp} → {finalXPPerStudent} XP</div></div>
                  </>
                ) : (
                  <div className="col-span-2 text-amber-200">No league week covers this date. Add it in Weeks &amp; XP boosts before issuing rewards.</div>
                )}
              </div>

              {category !== "attendance" && (
                <label className="block text-xs">
                  <span className="mb-1.5 block font-mono font-bold uppercase tracking-wider text-muted">Event name <span aria-hidden="true" className="text-rose-300">*</span></span>
                  <input maxLength={100} value={eventLabel} disabled={readOnly} onChange={(event) => setEventLabel(event.target.value)} placeholder={category === "coursework" ? "Assignment 2" : "Office hours — 6 Oct"} className="console-control min-h-10 w-full border border-border bg-background/65 px-3 py-2 text-foreground outline-none placeholder:text-muted/65 focus:border-primary/70 disabled:opacity-50 text-sm" />
                </label>
              )}

              <div className="border border-border/70 bg-background/20">
                <div className="flex flex-col gap-3 border-b border-border/60 p-3 sm:flex-row sm:items-center">
                  <label className="relative min-w-0 flex-1 text-xs">
                    <span className="sr-only">Search students</span>
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="search" value={query} disabled={readOnly} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or student ID" className="console-control min-h-9 w-full border border-border bg-background/60 py-2 pl-9 pr-3 text-foreground outline-none placeholder:text-muted/70 focus:border-primary/70 disabled:opacity-50 text-sm" />
                  </label>
                  <label className="text-xs">
                    <span className="sr-only">Filter students by group</span>
                    <DropdownSelect value={selectedGroup} options={[{ value: "ALL", label: "All groups" }, ...groups.map((group) => ({ value: group, label: group }))]} disabled={readOnly} onChange={setSelectedGroup} ariaLabel="Filter students by group" />
                  </label>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">{eligibleVisible.length} available · {selectedCount} selected</span>
                  <button type="button" disabled={readOnly || eligibleVisible.length === 0} onClick={toggleVisible} className="font-semibold text-primary hover:text-foreground disabled:opacity-40">{allVisibleSelected ? "Clear visible" : "Select visible"}</button>
                </div>
                <div className="max-h-64 divide-y divide-border/50 overflow-y-auto">
                  {visibleStudents.map((student) => {
                    const alreadyReceived = category === "attendance" && alreadyAwarded.has(student.id);
                    return (
                      <label key={student.id} className={`flex items-center gap-3 px-3 py-2.5 ${alreadyReceived ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:bg-primary/[.035]"}`}>
                        <input type="checkbox" checked={selectedIds.has(student.id)} disabled={readOnly || alreadyReceived} onChange={() => toggleStudent(student.id)} className="h-4 w-4 accent-cyan-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">{student.full_name}</span>
                          <span className="block truncate font-mono text-xs text-muted">{student.student_id} · {student.group_id || "No group"}{category === "attendance" ? ` · ${attendedSessionCounts[student.id] ?? 0} sessions attended` : ""}</span>
                        </span>
                        {alreadyReceived && <span className="shrink-0 font-mono text-xs uppercase text-emerald-300">Awarded</span>}
                      </label>
                    );
                  })}
                  {!visibleStudents.length && <div className="px-3 py-8 text-center text-muted">No students match this search.</div>}
                </div>
              </div>
            </div>

            <aside className="flex flex-col border border-primary/15 bg-background/30 p-4 sm:p-5" aria-label="Reward preview">
              <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider text-primary"><Users size={14} /> Award preview</div>
              <div className="mt-4 flex items-baseline justify-between gap-3"><span className="text-muted">Recipients</span><span className="font-mono font-bold text-foreground">{selectedCount}</span></div>
              <div className="mt-2 flex items-baseline justify-between gap-3"><span className="text-muted">Base XP × boost</span><span className="font-mono font-bold text-warning">{reward.xp} × {boostMultiplier ?? "—"} = {finalXPPerStudent ?? "—"} XP</span></div>
              <div className="my-4 border-t border-border/70" />
              <div className="flex items-baseline justify-between gap-3"><span className="font-semibold text-foreground">Total XP issued</span><span className="font-mono font-black text-warning">{selectedWeek ? totalXP : "—"}</span></div>
              {feedback && <div role={feedback.type === "error" ? "alert" : "status"} className={`mt-4 border px-3 py-2.5  ${feedback.type === "success" ? "border-emerald-400/20 bg-emerald-400/[.07] text-emerald-200" : "border-rose-400/20 bg-rose-400/[.07] text-rose-200"}`}>{feedback.text}</div>}

              <button type="button" disabled={readOnly || submitting || !selectedCount || !selectedWeek || (category !== "attendance" && !eventLabel.trim())} onClick={submitAward} className="console-control mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 bg-warning px-4 py-3 font-black uppercase tracking-wider text-background shadow-lg shadow-warning/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:mt-6 text-sm">
                {submitting ? <Clock3 size={15} className="animate-pulse" /> : <Check size={15} />}{submitting ? "Issuing reward…" : "Issue protocol reward"}
              </button>
            </aside>
          </div>

          <div className="mt-6 border-t border-border/70 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-mono text-sm font-semibold uppercase tracking-[.13em] text-foreground">Recent protocol awards</h3>
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Latest {history.length}</span>
            </div>
            {history.length ? (
              <div className="divide-y divide-border/60 border-y border-border/60">
                {history.map((entry) => (
                  <div key={entry.id} className="flex flex-col justify-between gap-1.5 py-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">{entry.reward_label}<span className="font-normal text-muted"> · {entry.event_label}</span></div>
                      <div className="font-mono uppercase tracking-wider text-muted">{protocol[entry.category as RewardCategory]?.label || entry.category} · {entry.recipient_count} students · {entry.base_amount} × {entry.boost_multiplier} = {entry.amount} XP · week {entry.week_number}</div>
                    </div>
                    <time dateTime={entry.award_date} className="shrink-0 font-mono text-muted">{entry.award_date}</time>
                  </div>
                ))}
              </div>
            ) : <div className="border border-dashed border-border/70 px-4 py-6 text-center text-muted">No protocol rewards issued this season yet.</div>}
          </div>
        </>
      )}
    </section>
  );
}
