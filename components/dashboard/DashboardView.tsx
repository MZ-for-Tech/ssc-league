import WelcomeScreen from "@/components/WelcomeScreen";
import DashboardHero from "./DashboardHero";
import DashboardStats from "./DashboardStats";
import NextObjective from "./NextObjective";
import RecentActivity from "./RecentActivity";
import RivalsWidget from "./RivalsWidget";
import type { DashboardActivity, DashboardRival, DashboardStudent, DashboardTopic } from "./types";

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
  seasonId,
}: DashboardViewProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <WelcomeScreen name={firstName.toUpperCase()} />

      <DashboardHero
        student={student}
        currentRank={currentRank}
        totalStudents={totalStudents}
        topPercent={topPercent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardStats
            student={student}
            completedModulesCount={completedModulesCount}
            totalModules={totalModules}
            accuracy={accuracy}
          />
          <RivalsWidget rivals={rivals} myId={student.id} seasonId={seasonId} />
          <RecentActivity activity={recentActivity} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <NextObjective topic={nextMission} />
        </div>
      </div>
    </div>
  );
}
