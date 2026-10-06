import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { redirect } from "next/navigation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { createPageMetadata } from "@/lib/site-metadata";
import ProfileDashboardView from "@/components/profile/ProfileDashboardView";
import { buildProfileDashboardData, type ProfileDashboardSource } from "@/lib/profile-dashboard-data";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("Student Profile", "Review your season record, activity, achievements, and league progress.");

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);
  const impersonateId = await getImpersonatedStudentId();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="text-red-500 p-10">Access Denied.</div>;

  const { data: adminProfile } = await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle();
  if (adminProfile && !impersonateId) redirect("/admin");
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, Boolean(adminProfile));

  let targetId = user.id; 
  let lookupByAuthId = true; 

  if (impersonateId) {
      const { data: adminCheck } = await supabase.from("Admin").select("id").eq("auth_id", user.id).single();
      if (adminCheck) {
          targetId = impersonateId; 
          lookupByAuthId = false; 
      }
  }

  let studentQuery = supabase.from("Student").select("*, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(rank)");
  if (lookupByAuthId) studentQuery = studentQuery.eq("auth_id", targetId).eq("season_id", seasonId);
  else studentQuery = studentQuery.eq("id", targetId).eq("season_id", seasonId);

  const { data: student, error } = await studentQuery.single();
  if (error || !student) return <div className="p-10 text-center text-yellow-500">Dossier Not Found</div>;

  const [
    { data: season },
    { data: transactions },
    { data: quizAnswers },
    { data: rankHistory },
    { data: attendanceRecords }
  ] = await Promise.all([
    supabase.from("Season").select("name, starts_on").eq("id", seasonId).maybeSingle(),
    supabase.from("XPTransaction").select("*").eq("student_id", student.id).eq("season_id", seasonId),
    supabase.from("StudentAnswer").select("id, attempted_at, is_correct, Question(text, points, Topic(name))").eq("student_id", student.id).eq("season_id", seasonId),
    supabase.from("WeeklyRankHistory").select("rank").eq("student_id", student.id).eq("season_id", seasonId),
    supabase.from("AttendanceRecord").select("date, status").eq("student_id", student.id).eq("season_id", seasonId)
  ]);

  const profileData = buildProfileDashboardData({
    student,
    season,
    transactions: transactions as ProfileDashboardSource["transactions"],
    quizAnswers: quizAnswers as ProfileDashboardSource["quizAnswers"],
    rankHistory: rankHistory as ProfileDashboardSource["rankHistory"],
    attendanceRecords: attendanceRecords as ProfileDashboardSource["attendanceRecords"],
  });

  return <ProfileDashboardView
    student={student}
    season={season}
    impersonateId={impersonateId}
    seasonId={seasonId}
    activeSeasonId={activeSeasonId}
    {...profileData}
  />;
}
