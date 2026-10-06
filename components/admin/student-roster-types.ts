export type SortKey = "identity" | "details" | "stats" | "role";
export type SortDirection = "asc" | "desc";
export type StudentRecord = {
  id: string; auth_id: string; full_name: string; student_id: string; group_id: string;
  current_xp: number | null; current_level: number | null; avatar_url: string | null;
  preferred_name?: string | null; email?: string | null;
};
