export interface StudentData {
  id: string;
  student_id: string;
  full_name: string;
  preferred_name: string;
  avatar_url: string | null;
  current_xp: number;
  current_streak: number;
  rank: number;
  prevRank: number;
  group_id: string;
  current_level: number;
  isMe?: boolean;
}
