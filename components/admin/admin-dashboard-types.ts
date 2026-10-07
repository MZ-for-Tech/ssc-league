import type { SeasonRecord } from "@/lib/seasons";

export interface AdminDashboardViewProps {
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
  welcomeUserId: string;
  welcomeAvatarUrl?: string | null;
  view?: "admin" | "operations";
}
