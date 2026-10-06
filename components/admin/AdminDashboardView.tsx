import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardCheck, ShieldCheck, Users, FileQuestion, Activity, Target, Check, X, type LucideIcon } from "lucide-react";
import RewardProtocolOperations from "@/components/admin/RewardProtocolOperations";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import WelcomeScreen from "@/components/WelcomeScreen";
import PageHeader from "@/components/PageHeader";
import type { SeasonRecord } from "@/lib/seasons";

const adminPanelClass = "instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-lg shadow-black/20";

interface AdminDashboardViewProps {
  totalStudents: number;
  studentsAttempted: number;
  totalQuestions: number;
  totalAttempts: number;
  activityByDay: { date: string; label: string; count: number }[];
  activeLearners: number;
  topicStats: { topicId: string; name: string; weekNumber: number; learners: number; attempts: number; correct: number }[];
  activityWindowLabel: string;
  dataError?: boolean;
  recentActivity: { id: string; studentName: string; topicName: string; isCorrect: boolean; attemptedAt: string }[];
  isImpersonating: boolean;
  seasonId: string;
  activeSeasonId: string;
  seasons: SeasonRecord[];
  welcomeName?: string;
  welcomeAvatarUrl?: string | null;
  view?: "admin" | "operations";
}

export default function AdminDashboardView({
  totalStudents,
  studentsAttempted,
  totalQuestions,
  totalAttempts,
  activityByDay,
  activeLearners,
  topicStats,
  activityWindowLabel,
  dataError = false,
  recentActivity,
  isImpersonating,
  seasonId,
  activeSeasonId,
  seasons,
  welcomeName,
  welcomeAvatarUrl,
  view = "admin",
}: AdminDashboardViewProps) {
  const readOnly = seasonId !== activeSeasonId;
  const adoptionRate = totalStudents > 0 ? Math.round((studentsAttempted / totalStudents) * 100) : null;

  if (view === "operations") {
    return (
      <div className="space-y-5 pb-16 text-sm">
        <PageHeader
          title="League operations"
          icon={<ClipboardCheck size={28} />}
          actions={<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {isImpersonating ? (
              <Link href="/dashboard" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 font-semibold text-amber-300 transition hover:bg-amber-500/15 sm:w-auto">
                Return to student view <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/dashboard?view=student" className="console-control inline-flex min-h-11 w-full items-center justify-center gap-2 border border-primary/20 bg-background/55 px-4 py-2.5 font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/5 sm:w-auto">
                <Users size={16} /> Student view
              </Link>
            )}
            <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
          </div>}
        />
        <RewardProtocolOperations seasonId={seasonId} readOnly={readOnly} />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-16">
      <WelcomeScreen name={(welcomeName || "Agent").toUpperCase()} storageKey="has_seen_admin_welcome" />

      <header className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-xl shadow-black/30">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_0%,rgb(var(--primary)/0.14),transparent_45%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-dot-grid opacity-[0.08]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="relative h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-1 shadow-[0_0_30px_rgb(var(--primary-dim)/0.3)] sm:h-24 sm:w-24">
              <Image unoptimized width={96} height={96}
                src={welcomeAvatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(welcomeName || "Agent")}`}
                alt=""
                className="h-full w-full rounded-full border-4 border-background bg-background object-cover"
              />
              <span title="League administrator" aria-label="League administrator" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-background shadow-glow-primary-subtle">
                <ShieldCheck size={16} strokeWidth={2.5} />
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-xl font-black tracking-tight text-foreground sm:text-3xl">Welcome back, {welcomeName || "Agent"}</h1>
            </div>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 md:w-auto md:justify-end">
            {isImpersonating ? (
              <Link href="/dashboard" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15 sm:w-auto">
                Return to student view <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/dashboard?view=student" className="console-control inline-flex min-h-11 w-full items-center justify-center gap-2 border border-primary/20 bg-background/55 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/5 sm:w-auto">
                <Users size={16} /> Student view
              </Link>
            )}
            <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
          </div>
        </div>
      </header>

      {!dataError && (
        <section aria-label="Season totals" className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          <MetricCard label="Students" value={totalStudents} detail="In this season" icon={Users} accent="cyan" />
          <MetricCard label="Student adoption" value={adoptionRate === null ? "—" : `${adoptionRate}%`} detail={totalStudents ? `${studentsAttempted} of ${totalStudents} students attempted a question` : "No students enrolled"} icon={Target} accent="violet" />
          <MetricCard label="Questions" value={totalQuestions} detail="In the question bank" icon={FileQuestion} accent="amber" />
          <MetricCard label="Attempts" value={totalAttempts} detail="Across the season" icon={Activity} accent="rose" />
        </section>
      )}

      {dataError ? (
        <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200">
          Season analytics could not be loaded. Refresh the page to try again.
        </div>
      ) : (
        <>
          <ActivityChart activityByDay={activityByDay} activeLearners={activeLearners} totalStudents={totalStudents} windowLabel={activityWindowLabel} />
          <div className="grid gap-4 xl:grid-cols-2">
            <TopicReachChart topics={topicStats} totalStudents={totalStudents} />
            <TopicAccuracyChart topics={topicStats} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <TeachingCues topics={topicStats} totalStudents={totalStudents} />
            <RecentActivity items={recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, accent }: {
  label: string;
  value: number | string;
  detail: string;
  icon: LucideIcon;
  accent: "cyan" | "violet" | "amber" | "rose";
}) {
  const accents = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };
  return (
    <article className={`${adminPanelClass} flex min-w-0 items-start justify-between gap-2 p-3 transition-colors hover:border-primary/30 sm:gap-3 sm:p-5`}>
      <div className="min-w-0">
        <p className="break-words text-xs font-medium text-muted sm:text-sm">{label}</p>
        <p className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="mt-1 line-clamp-2 break-words text-[11px] text-muted/75 sm:text-xs">{detail}</p>
      </div>
      <div className={`shrink-0 rounded-lg border p-2 shadow-[0_0_24px_rgb(var(--primary)/0.06)] sm:rounded-xl sm:p-2.5 ${accents[accent]}`}><Icon size={16} className="sm:h-[18px] sm:w-[18px]" /></div>
    </article>
  );
}

function ActivityChart({
  activityByDay,
  activeLearners,
  totalStudents,
  windowLabel,
}: {
  activityByDay: { date: string; label: string; count: number }[];
  activeLearners: number;
  totalStudents: number;
  windowLabel: string;
}) {
  const maxCount = Math.max(...activityByDay.map((day) => day.count), 1);
  const attemptTotal = activityByDay.reduce((sum, day) => sum + day.count, 0);

  return (
    <section aria-labelledby="activity-heading" className={`${adminPanelClass} p-5 sm:p-6`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">{windowLabel}</p>
          <h2 id="activity-heading" className="mt-1 text-lg font-semibold text-foreground">Student activity</h2>
          <p className="mt-1 text-sm text-muted">Question attempts by day</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
          <div><p className="font-mono text-xl font-bold text-foreground">{activeLearners.toLocaleString()}<span className="text-sm font-medium text-muted"> / {totalStudents.toLocaleString()}</span></p><p className="text-xs text-muted">students active</p></div>
          <div><p className="font-mono text-xl font-bold text-primary">{attemptTotal.toLocaleString()}</p><p className="text-xs text-muted">attempts</p></div>
        </div>
      </div>

      <div role="img" aria-label={`Question attempts over the past seven days. ${attemptTotal} total attempts from ${activeLearners} active students.`} className="grid h-36 grid-cols-7 gap-2 sm:gap-4">
        {activityByDay.map((day) => {
          const height = day.count ? Math.max((day.count / maxCount) * 100, 8) : 0;
          return (
            <div key={day.date} className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="h-3 text-xs tabular-nums text-slate-500">{day.count || ""}</span>
              <div className="flex w-full flex-1 items-end rounded-t-md bg-surface/70">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_18px_rgb(var(--primary)/0.2)] transition-all"
                  style={{ height: `${height}%` }}
                  title={`${day.label}: ${day.count} attempts`}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{day.label}</span>
            </div>
          );
        })}
      </div>
      {attemptTotal === 0 && <p className="mt-4 text-center text-xs text-slate-500">No question attempts recorded this week.</p>}
    </section>
  );
}

function TopicReachChart({
  topics,
  totalStudents,
}: {
  topics: AdminDashboardViewProps["topicStats"];
  totalStudents: number;
}) {
  return (
    <section aria-labelledby="topic-reach-heading" className={`${adminPanelClass} p-5 sm:p-6`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">All season</p>
        <h2 id="topic-reach-heading" className="mt-1 text-lg font-semibold text-foreground">Module reach</h2>
        <p className="mt-1 text-sm text-muted">Students who have tried at least one question in each module.</p>
      </div>
      {topics.length ? (
        <div className="space-y-4 pr-1 sm:max-h-80 sm:overflow-y-auto">
          {topics.map((topic) => {
            const percent = totalStudents ? Math.round((topic.learners / totalStudents) * 100) : 0;
            return (
              <div key={topic.topicId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-slate-300">{topic.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">{topic.learners} / {totalStudents}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-light/50" role="img" aria-label={`${topic.name}: ${percent}% of students reached`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-300 shadow-glow-primary-subtle" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : <EmptyChart message="No modules are available in this season yet." />}
    </section>
  );
}

function TopicAccuracyChart({ topics }: { topics: AdminDashboardViewProps["topicStats"] }) {
  const topicsWithAttempts = topics.filter((topic) => topic.attempts > 0);
  const plotLeft = 54;
  const plotRight = 620;
  const plotTop = 22;
  const plotBottom = 176;
  const points = topicsWithAttempts.map((topic, index) => {
    const accuracy = Math.round((topic.correct / topic.attempts) * 100);
    const x = topicsWithAttempts.length === 1
      ? (plotLeft + plotRight) / 2
      : plotLeft + (index / (topicsWithAttempts.length - 1)) * (plotRight - plotLeft);
    const y = plotBottom - (accuracy / 100) * (plotBottom - plotTop);
    return { ...topic, accuracy, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const targetY = plotBottom - (70 / 100) * (plotBottom - plotTop);

  return (
    <section aria-labelledby="topic-accuracy-heading" className={`${adminPanelClass} p-5 sm:p-6`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">All season</p>
        <h2 id="topic-accuracy-heading" className="mt-1 text-lg font-semibold text-foreground">Answer accuracy</h2>
        <p className="mt-1 text-sm text-muted">Correct answers by module, in course order.</p>
      </div>
      {points.length ? (
        <div className="overflow-x-auto">
          <div className="min-w-[440px] sm:min-w-0">
          <p className="mb-2 text-xs text-muted sm:hidden">Swipe to inspect the chart.</p>
          <svg
            viewBox="0 0 640 226"
            className="h-auto w-full"
            role="img"
            aria-label={`Answer accuracy by module: ${points.map((point) => `${point.name} ${point.accuracy}%`).join(", ")}. Dashed line marks 70%.`}
          >
            {[100, 50, 0].map((value) => {
              const y = plotBottom - (value / 100) * (plotBottom - plotTop);
              return (
                <g key={value}>
                  <line x1={plotLeft} x2={plotRight} y1={y} y2={y} stroke="rgb(var(--surface-light))" strokeWidth="1" />
                  <text x="42" y={y + 4} textAnchor="end" fill="rgb(var(--slate-500))" fontSize="12">{value}%</text>
                </g>
              );
            })}
            <line x1={plotLeft} x2={plotRight} y1={targetY} y2={targetY} stroke="rgb(var(--amber-400))" strokeWidth="1.5" strokeDasharray="5 5" />
            {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgb(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {points.map((point) => (
              <g key={point.topicId}>
                <circle cx={point.x} cy={point.y} r="5" fill="rgb(var(--background))" stroke="rgb(var(--cyan-200))" strokeWidth="3">
                  <title>{point.name}: {point.accuracy}% correct across {point.attempts} attempts</title>
                </circle>
                <text x={point.x} y="205" textAnchor="middle" fill="rgb(var(--muted))" fontSize="12">W{point.weekNumber}</text>
              </g>
            ))}
          </svg>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-px w-5 border-t border-dashed border-amber-400" />
            <span>70% reference</span>
          </div>
          </div>
        </div>
      ) : <EmptyChart message="No question attempts to compare yet." />}
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-800 px-5 text-center text-sm text-slate-500">{message}</div>;
}

function TeachingCues({
  topics,
  totalStudents,
}: {
  topics: AdminDashboardViewProps["topicStats"];
  totalStudents: number;
}) {
  const lowestReach = [...topics].sort((a, b) => a.learners - b.learners)[0];
  const accuracyTopics = topics.filter((topic) => topic.attempts > 0);
  const lowestAccuracy = accuracyTopics.sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)[0];
  return (
    <section aria-labelledby="teaching-cues-heading" className={`${adminPanelClass} p-5 sm:p-6`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Based on season data</p>
        <h2 id="teaching-cues-heading" className="mt-1 text-lg font-semibold text-foreground">Worth a look</h2>
      </div>
      {topics.length ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-background/45 p-4">
            <p className="text-xs font-medium text-slate-500">Lowest module reach</p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <p className="truncate font-semibold text-foreground">{lowestReach.name}</p>
              <p className="shrink-0 text-sm tabular-nums text-cyan-300">{lowestReach.learners} / {totalStudents}</p>
            </div>
          </div>
          {lowestAccuracy ? (
            <div className="rounded-xl border border-border/70 bg-background/45 p-4">
              <p className="text-xs font-medium text-slate-500">Lowest answer accuracy</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="truncate font-semibold text-foreground">{lowestAccuracy.name}</p>
                <p className="shrink-0 text-sm tabular-nums text-amber-300">{Math.round((lowestAccuracy.correct / lowestAccuracy.attempts) * 100)}%</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">Across {lowestAccuracy.attempts.toLocaleString()} attempts</p>
            </div>
          ) : <EmptyChart message="No attempts yet to identify a topic for review." />}
        </div>
      ) : <EmptyChart message="Module insights will appear once the course is set up." />}
    </section>
  );
}

function RecentActivity({ items }: { items: AdminDashboardViewProps["recentActivity"] }) {
  return (
    <section aria-labelledby="recent-activity-heading" className={`${adminPanelClass} p-5 sm:p-6`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">One latest attempt per student</p>
        <h2 id="recent-activity-heading" className="mt-1 text-lg font-semibold text-foreground">Recent student activity</h2>
      </div>
      {items.length ? (
        <ul className="divide-y divide-slate-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.isCorrect ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                {item.isCorrect ? <Check size={15} /> : <X size={15} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.studentName}</p>
                <p className="truncate text-xs text-muted">{item.topicName} · {item.isCorrect ? "Correct" : "Incorrect"}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-500" dateTime={item.attemptedAt}>
                {new Date(item.attemptedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </time>
            </li>
          ))}
        </ul>
      ) : <EmptyChart message="No student activity to show yet." />}
    </section>
  );
}
