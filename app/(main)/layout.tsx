import React from "react";
import MainLayoutShell from "@/components/MainLayoutShell";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, impersonatedStudentId] = await Promise.all([
    supabase.auth.getUser(),
    getImpersonatedStudentId(),
  ]);
  const { data: adminProfile } = user
    ? await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = Boolean(adminProfile);
  const activeSeasonId = await getActiveSeasonId(supabase);
  const selectedSeasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  const { data: selectedSeason } = isAdmin
    ? await supabase.from("Season").select("name, status").eq("id", selectedSeasonId).maybeSingle()
    : { data: null };

  return (
    <MainLayoutShell
      isAdmin={isAdmin}
      isImpersonating={Boolean(impersonatedStudentId)}
      selectedSeasonId={selectedSeasonId}
      isArchivedSeason={selectedSeason?.status === "archived"}
      selectedSeasonName={selectedSeason?.name || "Season archive"}
    >
      {children}
    </MainLayoutShell>
  );
}
