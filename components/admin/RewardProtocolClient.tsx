"use client";

import { Award, Check, Clock3, Users } from "lucide-react";
import type { RewardCategory, RewardProtocolData } from "@/lib/reward-protocol";
import DropdownSelect from "@/components/ui/DropdownSelect";
import RewardStudentPicker, { type RewardStudent } from "@/components/admin/RewardStudentPicker";
import RewardProtocolHistory, { type RewardProtocolHistoryEntry } from "@/components/admin/RewardProtocolHistory";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";
import { useRewardProtocol } from "@/components/admin/useRewardProtocol";

interface RewardProtocolClientProps {
  protocol: RewardProtocolData;
  students: RewardStudent[];
  weeks: { week_number: number; starts_on: string; ends_on: string; boost_multiplier: number }[];
  today: string;
  attendedSessionCounts: Record<string, number>;
  attendanceAwards: { student_id: string; reward_key: string }[];
  history: RewardProtocolHistoryEntry[];
  readOnly: boolean;
  loadError: string | null;
}

const panelClass = "instrument-panel relative isolate min-w-0 max-w-full rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-lg shadow-black/20";
const categories: RewardCategory[] = ["attendance", "coursework", "participation"];

export default function RewardProtocolClient({ protocol, students, attendedSessionCounts, attendanceAwards, weeks, today, history, readOnly, loadError }: RewardProtocolClientProps) {
  const {
    category, reward, selectedWeek, boostMultiplier, finalXPPerStudent,
    groups, alreadyAwarded, visibleStudents, eligibleVisible, selectedCount,
    totalXP, allVisibleSelected, eventLabel, setEventLabel, awardDate, setAwardDate,
    selectedGroup, setSelectedGroup, query, setQuery, selectedIds,
    submitting, feedback, setSelectedIds, setRewardKey,
    changeCategory, toggleStudent, toggleVisible, submitAward,
  } = useRewardProtocol({ protocol, students, attendanceAwards, weeks, today });

  return (
    <section className={`${panelClass} app-panel-padding`} aria-labelledby="reward-protocol-ops-title">
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
            <div className="min-w-0 space-y-4">
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

              <div className={`grid min-w-0 grid-cols-2 gap-2 border px-3 py-2.5  ${selectedWeek ? "border-primary/15 bg-primary/[.035]" : "border-amber-400/20 bg-amber-400/[.045]"}`}>
                {selectedWeek ? (
                  <>
                    <div><div className="font-mono uppercase tracking-wider text-muted">League week</div><div className="mt-1 font-mono font-bold text-foreground">Week {selectedWeek.week_number}</div></div>
                    <div className="min-w-0 break-words text-right"><div className="font-mono uppercase tracking-wider text-muted">XP boost</div><div className="mt-1 break-words font-mono font-bold text-warning">{boostMultiplier}× · {reward.xp} → {finalXPPerStudent} XP</div></div>
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

              <RewardStudentPicker
                visibleStudents={visibleStudents}
                eligibleCount={eligibleVisible.length}
                selectedCount={selectedCount}
                groups={groups}
                selectedGroup={selectedGroup}
                query={query}
                selectedIds={selectedIds}
                category={category}
                alreadyAwarded={alreadyAwarded}
                attendedSessionCounts={attendedSessionCounts}
                readOnly={readOnly}
                allVisibleSelected={allVisibleSelected}
                onQueryChange={setQuery}
                onGroupChange={setSelectedGroup}
                onToggleVisible={toggleVisible}
                onToggleStudent={toggleStudent}
              />
            </div>

            <aside className="flex min-w-0 flex-col border border-primary/15 bg-background/30 app-panel-padding" aria-label="Reward preview">
              <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider text-primary"><Users size={14} /> Award preview</div>
              <div className="mt-4 flex items-baseline justify-between gap-3"><span className="text-muted">Recipients</span><span className="font-mono font-bold text-foreground">{selectedCount}</span></div>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><span className="text-muted">Base XP × boost</span><span className="break-words font-mono font-bold text-warning">{reward.xp} × {boostMultiplier ?? "—"} = {finalXPPerStudent ?? "—"} XP</span></div>
              <div className="my-4 border-t border-border/70" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><span className="font-semibold text-foreground">Total XP issued</span><span className="break-words font-mono font-black text-warning">{selectedWeek ? totalXP : "—"}</span></div>
              {feedback && <div role={feedback.type === "error" ? "alert" : "status"} className={`mt-4 border px-3 py-2.5  ${feedback.type === "success" ? "border-emerald-400/20 bg-emerald-400/[.07] text-emerald-200" : "border-rose-400/20 bg-rose-400/[.07] text-rose-200"}`}>{feedback.text}</div>}

              <button type="button" disabled={readOnly || submitting || !selectedCount || !selectedWeek || (category !== "attendance" && !eventLabel.trim())} onClick={submitAward} className="console-control mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 bg-warning px-4 py-3 font-black uppercase tracking-wider text-background shadow-lg shadow-warning/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:mt-6 text-sm">
                {submitting ? <Clock3 size={15} className="animate-pulse" /> : <Check size={15} />}{submitting ? "Issuing reward…" : "Issue protocol reward"}
              </button>
            </aside>
          </div>

          <RewardProtocolHistory history={history} protocol={protocol} />
        </>
      )}
    </section>
  );
}
