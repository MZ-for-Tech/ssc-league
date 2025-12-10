"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Use Service Role to bypass RLS for updates just to be safe, 
// though standard client would work if policies are correct.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateStudentProfile(formData: FormData) {
  const id = formData.get("id") as string;
  const fullName = formData.get("full_name") as string;
  const preferredName = formData.get("preferred_name") as string;
  const group = formData.get("group_id") as string;
  
  // Avatar Logic: If they provided a custom URL, use it. 
  // Otherwise, generate a Dicebear URL based on their preferred name.
  let avatarUrl = formData.get("avatar_url") as string;
  if (!avatarUrl || avatarUrl.includes("dicebear")) {
    avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${preferredName || fullName}`;
  }

  try {
    const { error } = await supabase
      .from("Student")
      .update({
        full_name: fullName,
        preferred_name: preferredName,
        group_id: group,
        avatar_url: avatarUrl,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/leaderboard");
    
    return { success: true, message: "Profile updated successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}