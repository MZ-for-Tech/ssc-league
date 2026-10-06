"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId } from "@/lib/seasons";

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required.");
  }

  const fullName = formData.get("full_name");
  const preferredName = formData.get("preferred_name");
  const submittedAvatarUrl = formData.get("avatar_url");

  if (
    typeof fullName !== "string" ||
    typeof preferredName !== "string" ||
    typeof submittedAvatarUrl !== "string" ||
    !fullName.trim() ||
    !preferredName.trim()
  ) {
    throw new Error("Invalid profile details.");
  }

  const avatarUrl = !submittedAvatarUrl || submittedAvatarUrl.includes("dicebear")
    ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(preferredName || fullName)}`
    : submittedAvatarUrl;

  const activeSeasonId = await getActiveSeasonId(supabase);
  const { data, error } = await supabase
    .from("Student")
    .update({
      full_name: fullName.trim(),
      preferred_name: preferredName.trim(),
      avatar_url: avatarUrl,
      updatedAt: new Date().toISOString(),
    })
    .eq("auth_id", user.id)
    .eq("season_id", activeSeasonId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Student profile not found.");

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return { success: true, message: "Profile updated successfully." };
}
