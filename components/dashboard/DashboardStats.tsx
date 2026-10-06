import type { ReactNode } from "react";
import { Activity, CheckCircle2, Target, Zap } from "lucide-react";
import { StatsCard } from "./StatsCard";
import type { DashboardStudent } from "./types";

interface DashboardStatsProps {
  student: DashboardStudent;
  completedModulesCount: number;
  totalModules: number;
  accuracy: number;
}

export default function DashboardStats({ student, completedModulesCount, totalModules, accuracy }: DashboardStatsProps) {
  const stats: { label: string; value: string; icon: ReactNode }[] = [
    { label: "Total XP", value: student.current_xp?.toLocaleString() || "0", icon: <Zap size={18} className="text-yellow-400" /> },
    { label: "Missions", value: `${completedModulesCount}/${totalModules}`, icon: <CheckCircle2 size={18} className="text-cyan-400" /> },
    { label: "Accuracy", value: `${accuracy}%`, icon: <Target size={18} className="text-red-400" /> },
    { label: "Attendance Streak", value: `${student.current_streak || 0} Sections`, icon: <Activity size={18} className="text-emerald-400" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => <StatsCard key={stat.label} {...stat} />)}
    </div>
  );
}
