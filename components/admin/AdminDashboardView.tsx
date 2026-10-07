import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardCheck, ShieldCheck, Users, FileQuestion, Activity, Target } from "lucide-react";
import RewardProtocolOperations from "@/components/admin/RewardProtocolOperations";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import WelcomeScreen from "@/components/WelcomeScreen";
import PageHeader from "@/components/PageHeader";
import type { AdminDashboardViewProps } from "@/components/admin/admin-dashboard-types";
import ActivityChart from "@/components/admin/ActivityChart";
import MetricCard from "@/components/admin/MetricCard";
import RecentActivity from "@/components/admin/RecentActivity";
import TeachingCues from "@/components/admin/TeachingCues";
import TopicReachChart from "@/components/admin/TopicReachChart";
import { TopicAccuracyChart } from "@/components/admin/TopicAccuracyChart";

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
      <div className="app-page-stack min-w-0 max-w-full pb-16 text-sm">
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
    <div className="app-page-stack pb-16">
      <WelcomeScreen name={(welcomeName || "Agent").toUpperCase()} storageKey="has_seen_admin_welcome" />

      <header className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-xl shadow-black/30">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_0%,rgb(var(--primary)/0.14),transparent_45%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-dot-grid opacity-[0.08]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="relative z-10 flex flex-col gap-6 app-panel-padding md:flex-row md:items-center md:justify-between">
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
          <MetricCard label="Questions" value={totalQuestions} detail="Multiple-choice and essay prompts" icon={FileQuestion} accent="amber" />
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
