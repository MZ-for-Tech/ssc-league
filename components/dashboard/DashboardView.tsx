import WelcomeScreen from "@/components/WelcomeScreen";
import Link from "next/link";
import DashboardHero from "./DashboardHero";
import DashboardStats from "./DashboardStats";
import NextObjective from "./NextObjective";
import ModuleFocusChart from "./ModuleFocusChart";
import RecentActivity from "./RecentActivity";
import RivalsWidget from "./RivalsWidget";
import type { DashboardActivity, DashboardCurriculumModule, DashboardRival, DashboardStudent, DashboardTopic } from "./types";

interface DashboardViewProps {
  student: DashboardStudent;
  firstName: string;
  currentRank: number;
  totalStudents: number;
  topPercent: number;
  completedModulesCount: number;
  totalModules: number;
  accuracy: number;
  rivals: DashboardRival[];
  nextMission: DashboardTopic | null;
  recentActivity: DashboardActivity[];
  curriculumModules: DashboardCurriculumModule[];
  seasonId: string;
}

export default function DashboardView({
  student,
  firstName,
  currentRank,
  totalStudents,
  topPercent,
  completedModulesCount,
  totalModules,
  accuracy,
  rivals,
  nextMission,
  recentActivity,
  curriculumModules,
  seasonId,
}: DashboardViewProps) {
  return (
    <div className="app-page-stack w-full animate-in fade-in slide-in-from-bottom-4">
      <WelcomeScreen name={firstName.toUpperCase()} />

      <DashboardHero
        student={student}
        currentRank={currentRank}
        totalStudents={totalStudents}
        topPercent={topPercent}
      />

      <DashboardStats
        student={student}
        completedModulesCount={completedModulesCount}
        totalModules={totalModules}
        accuracy={accuracy}
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)]">
        <div className="app-page-stack">
          <NextObjective topic={nextMission} completedModulesCount={completedModulesCount} totalModules={totalModules} />
          <ModuleFocusChart modules={curriculumModules} />
        </div>

        <div className="app-page-stack">
          <RecentActivity activity={recentActivity} />
          <RivalsWidget rivals={rivals} myId={student.id} seasonId={seasonId} />

          <Link href="/modules" className="instrument-panel group flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/35 px-4 py-3 text-sm transition hover:border-primary/35 hover:bg-primary/5">
            <span className="text-muted">Want to explore another topic?</span>
            <span className="shrink-0 font-semibold text-primary transition group-hover:translate-x-0.5">View modules <span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
