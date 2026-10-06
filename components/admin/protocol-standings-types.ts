export type ProtocolStudent = {
  id: string;
  full_name: string;
  student_id: string;
  group_id: string | null;
  current_xp: number | null;
};

export type ProtocolAttendance = { student_id: string; date: string; status: string };
export type ProtocolActivity = { student_id: string };
export type ProtocolAnswer = { student_id: string; is_correct: boolean };

export type ProtocolStanding = {
  id: string;
  name: string;
  studentId: string;
  group: string;
  xp: number;
  xpRank: number;
  activity: number;
  activityRank: number;
  attended: number;
  attendanceTotal: number;
  attendanceRate: number | null;
  attendanceRank: number;
  rankPoints: number;
  overallRank: number;
};

export type RecognitionStanding = {
  id: string;
  name: string;
  studentId: string;
  group: string;
  xp: number;
  streak: number;
  correct: number;
  total: number;
  accuracy: number;
};

export type HistoricalSeasonStanding = {
  id: string;
  name: string;
  average: number;
  maximum: number;
  participants: number;
};
