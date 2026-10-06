export interface DashboardTopic {
  id: string | number;
  name: string;
  week_number: number;
  description: string;
  module_id: string | null;
  lesson_number: number | null;
  Question: { id: string }[];
}

export interface DashboardCurriculumModule {
  id: string;
  module_number: number;
  name: string;
  description: string;
  recentAttempts: number;
  lessons: Array<Pick<DashboardTopic, "id" | "name" | "lesson_number"> & {
    questionCount: number;
    exploredCount: number;
  }>;
}

export interface DashboardRival {
  id: string;
  rank: number;
  name: string;
  xp: number;
  avatar_url: string | null;
  trend: number;
  isMe: boolean;
}

export interface DashboardActivity {
  is_correct: boolean;
  attempted_at: string;
  Question: {
    points: number;
    Topic: { name: string } | null;
  } | null;
}

export interface DashboardStudent {
  id: string;
  full_name: string;
  preferred_name: string | null;
  student_id: string;
  avatar_url: string | null;
  current_xp: number;
  current_level: number | null;
  current_streak: number | null;
  WeeklyRankHistory?: DashboardRankHistory[];
}

export interface DashboardRankHistory {
  week_number: number;
  rank: number;
}
