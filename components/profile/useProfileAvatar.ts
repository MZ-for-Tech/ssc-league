"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileAvatarStudent = {
  avatar_url: string | null;
  preferred_name: string;
  full_name: string;
};

export function useProfileAvatar(student: ProfileAvatarStudent, onError: (message: string) => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${student.preferred_name || student.full_name}`,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onError("");
    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onError("Your session expired. Refresh the page and try again.");
      setIsUploading(false);
      return;
    }

    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    try {
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      setAvatarUrl(supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl);
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      onError(error instanceof Error ? error.message : "Photo upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`);
  };

  return { avatarUrl, setAvatarUrl, isUploading, fileInputRef, handleFileChange, handleRandomizeAvatar };
}
