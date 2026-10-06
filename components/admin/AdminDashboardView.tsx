import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardCheck, ShieldCheck, Users, FileQuestion, Activity, Target, Check, X, type LucideIcon } from "lucide-react";
import AttendanceWidget from "@/components/admin/AttendanceWidget";
import AuditLog from "@/components/admin/AuditLog";
import BroadcastWidget from "@/components/admin/BroadcastWidget";
import BulkXPWidget from "@/components/admin/BulkXPWidget";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import WelcomeScreen from "@/components/WelcomeScreen";
import PageHeader from "@/components/PageHeader";
import type { SeasonRecord } from "@/lib/seasons";

interface AdminDashboardViewProps {
  totalStudents: number;
  studentsNotStarted: number;
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
  studentsNotStarted,
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

  if (view === "operations") {
    return (
      <div className="space-y-7 pb-16">
        <PageHeader
          title="League operations"
          description="Take attendance, send an announcement, or adjust league XP."
          icon={<ClipboardCheck size={28} />}
          actions={<>
            {isImpersonating ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15">
                Return to student view <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/dashboard?view=student" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40">
                <Users size={16} /> Student view
              </Link>
            )}
            <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
          </>}
        />
        {!readOnly ? (
          <>
            <section className="grid gap-4 xl:grid-cols-3" aria-label="League tools">
              <AttendanceWidget />
              <BroadcastWidget />
              <BulkXPWidget />
            </section>
            <section aria-label="Recent admin activity" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
              <AuditLog />
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted">
            Archived seasons are read-only. Switch to the active season to use league operations.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-16">
      <WelcomeScreen name={(welcomeName || "Agent").toUpperCase()} storageKey="has_seen_admin_welcome" />

      <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-1 shadow-[0_0_30px_rgb(var(--primary-dim)/0.3)] sm:h-24 sm:w-24">
              <Image unoptimized width={96} height={96}
                src={welcomeAvatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(welcomeName || "Agent")}`}
                alt=""
                className="h-full w-full rounded-full border-4 border-slate-950 bg-slate-950 object-cover"
              />
              <span title="League administrator" aria-label="League administrator" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-cyan-400 text-slate-950 shadow-lg">
                <ShieldCheck size={16} strokeWidth={2.5} />
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Welcome back, {welcomeName || "Agent"}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {isImpersonating ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15">
                Return to student view <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/dashboard?view=student" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40">
                <Users size={16} /> Student view
              </Link>
            )}
            <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
          </div>
        </div>
      </header>

      {!dataError && (
        <section aria-label="Season totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Students" value={totalStudents} detail="In this season" icon={Users} accent="cyan" />
          <MetricCard label="Not started" value={studentsNotStarted} detail="No question attempts yet" icon={Target} accent="violet" />
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
  value: number;
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
    <article className="flex items-start justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value.toLocaleString()}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
      <div className={`rounded-xl border p-2.5 ${accents[accent]}`}><Icon size={18} /></div>
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
    <section aria-labelledby="activity-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{windowLabel}</p>
          <h2 id="activity-heading" className="mt-1 text-lg font-semibold text-white">Student activity</h2>
          <p className="mt-1 text-sm text-slate-400">Question attempts by day</p>
        </div>
        <div className="flex gap-6">
          <div><p className="text-xl font-bold text-white">{activeLearners.toLocaleString()}<span className="text-sm font-medium text-slate-500"> / {totalStudents.toLocaleString()}</span></p><p className="text-xs text-slate-500">students active</p></div>
          <div><p className="text-xl font-bold text-cyan-300">{attemptTotal.toLocaleString()}</p><p className="text-xs text-slate-500">attempts</p></div>
        </div>
      </div>

      <div role="img" aria-label={`Question attempts over the past seven days. ${attemptTotal} total attempts from ${activeLearners} active students.`} className="grid h-36 grid-cols-7 gap-2 sm:gap-4">
        {activityByDay.map((day) => {
          const height = day.count ? Math.max((day.count / maxCount) * 100, 8) : 0;
          return (
            <div key={day.date} className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="h-3 text-[10px] tabular-nums text-slate-500">{day.count || ""}</span>
              <div className="flex w-full flex-1 items-end rounded-t-md bg-slate-800/40">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-300 transition-all"
                  style={{ height: `${height}%` }}
                  title={`${day.label}: ${day.count} attempts`}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500 sm:text-xs">{day.label}</span>
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
    <section aria-labelledby="topic-reach-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">All season</p>
        <h2 id="topic-reach-heading" className="mt-1 text-lg font-semibold text-white">Module reach</h2>
        <p className="mt-1 text-sm text-slate-400">Students who have tried at least one question in each module.</p>
      </div>
      {topics.length ? (
        <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
          {topics.map((topic) => {
            const percent = totalStudents ? Math.round((topic.learners / totalStudents) * 100) : 0;
            return (
              <div key={topic.topicId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-slate-300">{topic.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">{topic.learners} / {totalStudents}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="img" aria-label={`${topic.name}: ${percent}% of students reached`}>
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
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
    <section aria-labelledby="topic-accuracy-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">All season</p>
        <h2 id="topic-accuracy-heading" className="mt-1 text-lg font-semibold text-white">Answer accuracy</h2>
        <p className="mt-1 text-sm text-slate-400">Correct answers by module, in course order.</p>
      </div>
      {points.length ? (
        <div className="overflow-hidden">
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
                  <text x="42" y={y + 4} textAnchor="end" fill="rgb(var(--slate-500))" fontSize="11">{value}%</text>
                </g>
              );
            })}
            <line x1={plotLeft} x2={plotRight} y1={targetY} y2={targetY} stroke="rgb(var(--amber-400))" strokeWidth="1.5" strokeDasharray="5 5" />
            {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgb(var(--success))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {points.map((point) => (
              <g key={point.topicId}>
                <circle cx={point.x} cy={point.y} r="5" fill="rgb(var(--background))" stroke="rgb(var(--success-light))" strokeWidth="3">
                  <title>{point.name}: {point.accuracy}% correct across {point.attempts} attempts</title>
                </circle>
                <text x={point.x} y="205" textAnchor="middle" fill="rgb(var(--muted))" fontSize="10">W{point.weekNumber}</text>
              </g>
            ))}
          </svg>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-px w-5 border-t border-dashed border-amber-400" />
            <span>70% reference</span>
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
    <section aria-labelledby="teaching-cues-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Based on season data</p>
        <h2 id="teaching-cues-heading" className="mt-1 text-lg font-semibold text-white">Worth a look</h2>
      </div>
      {topics.length ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs font-medium text-slate-500">Lowest module reach</p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <p className="truncate font-semibold text-white">{lowestReach.name}</p>
              <p className="shrink-0 text-sm tabular-nums text-cyan-300">{lowestReach.learners} / {totalStudents}</p>
            </div>
          </div>
          {lowestAccuracy ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
              <p className="text-xs font-medium text-slate-500">Lowest answer accuracy</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="truncate font-semibold text-white">{lowestAccuracy.name}</p>
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
    <section aria-labelledby="recent-activity-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">One latest attempt per student</p>
        <h2 id="recent-activity-heading" className="mt-1 text-lg font-semibold text-white">Recent student activity</h2>
      </div>
      {items.length ? (
        <ul className="divide-y divide-slate-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.isCorrect ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                {item.isCorrect ? <Check size={15} /> : <X size={15} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.studentName}</p>
                <p className="truncate text-xs text-slate-500">{item.topicName} · {item.isCorrect ? "Correct" : "Incorrect"}</p>
              </div>
              <time className="shrink-0 text-[10px] text-slate-500" dateTime={item.attemptedAt}>
                {new Date(item.attemptedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </time>
            </li>
          ))}
        </ul>
      ) : <EmptyChart message="No student activity to show yet." />}
    </section>
  );
}
