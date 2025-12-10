"use client";

import React, { useState, useRef } from "react";
import { X, Save, Loader2, RefreshCw, User, Users, Upload, Camera, Check, Pencil } from "lucide-react";
import { updateStudentProfile } from "@/app/actions/profile-actions";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface Student {
  id: string;
  full_name: string;
  preferred_name: string;
  student_id: string;
  email: string;
  group_id: string;
  avatar_url: string | null;
}

export default function EditProfileModal({ student }: { student: Student }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarUrl, setAvatarUrl] = useState(
    student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${student.preferred_name}`
  );

  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Handle File Upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setIsUploading(true);

    // Get the actual Auth User ID for RLS policies
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert("Security Error: User session not found.");
        setIsUploading(false);
        return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    // Construct path: "auth_user_id/filename.jpg"
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Error uploading image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Handle Randomize
  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`);
  };

  // 3. Handle Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("avatar_url", avatarUrl);

      await updateStudentProfile(formData);
      
      setIsSaving(false);
      setIsSuccess(true);
      router.refresh();
      
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 1500);

    } catch (error) {
      alert("Something went wrong saving your profile.");
      setIsSaving(false);
    }
  };

  // --- RENDER LOGIC: Button vs Modal ---

  // If closed, show the trigger button
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-6 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
      >
        <Pencil size={14} /> Edit Identity
      </button>
    );
  }

  // If open, show the modal overlay
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface/50">
            <h3 className="text-foreground font-bold flex items-center gap-2">
                <User size={18} className="text-primary" /> Update Personnel Record
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground">
                <X size={20} />
            </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <input type="hidden" name="id" value={student.id} />

            {/* --- AVATAR SECTION --- */}
            <div className="flex flex-col items-center gap-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-32 h-32 rounded-full border-2 border-dashed border-surface-light flex items-center justify-center bg-background group cursor-pointer hover:border-primary transition-colors overflow-hidden"
                >
                    {isUploading ? (
                         <Loader2 className="animate-spin text-primary w-8 h-8" />
                    ) : (
                        <>
                            <img 
                                src={avatarUrl} 
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                alt="Avatar Preview"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white w-8 h-8 drop-shadow-md" />
                            </div>
                        </>
                    )}
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                />

                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-primary hover:text-primary-dim flex items-center gap-1"
                    >
                        <Upload size={12} /> Upload Photo
                    </button>
                    <span className="text-border">|</span>
                    <button 
                        type="button"
                        onClick={handleRandomizeAvatar}
                        className="text-xs font-bold text-muted hover:text-foreground flex items-center gap-1"
                    >
                        <RefreshCw size={12} /> Randomize
                    </button>
                </div>
            </div>

            {/* --- EDITABLE FIELDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Full Name</label>
                    <input name="full_name" defaultValue={student.full_name} className="w-full bg-background border border-border rounded-lg p-3 text-foreground text-sm focus:border-primary outline-none" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Callsign / Preferred</label>
                    <input name="preferred_name" defaultValue={student.preferred_name} className="w-full bg-background border border-border rounded-lg p-3 text-foreground text-sm focus:border-primary outline-none" required />
                </div>
            </div>

            {/* --- READ ONLY FIELDS --- */}
            <div className="grid grid-cols-2 gap-4 pt-2">
                
                {/* Group (Locked) */}
                <div className="p-3 bg-surface-light/20 rounded-lg border border-border/50 opacity-75">
                    <label className="text-[10px] font-bold text-muted uppercase block mb-1">Group (Locked)</label>
                    <div className="text-muted font-mono text-sm flex items-center gap-2">
                        <Users size={14} /> {student.group_id}
                    </div>
                    <input type="hidden" name="group_id" value={student.group_id} />
                </div>

                {/* Student ID (Locked) */}
                <div className="p-3 bg-surface-light/20 rounded-lg border border-border/50 opacity-75">
                    <label className="text-[10px] font-bold text-muted uppercase block mb-1">Student ID (Locked)</label>
                    <div className="text-muted font-mono text-sm">{student.student_id}</div>
                </div>

                {/* Email (Locked) */}
                <div className="p-3 bg-surface-light/20 rounded-lg border border-border/50 opacity-75 col-span-2">
                    <label className="text-[10px] font-bold text-muted uppercase block mb-1">Email (Locked)</label>
                    <div className="text-muted font-mono text-sm truncate">{student.email}</div>
                </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-muted hover:text-foreground text-sm font-bold">Cancel</button>
                <button 
                    type="submit" 
                    disabled={isSaving || isUploading || isSuccess} 
                    className={`
                        px-6 py-2 font-bold rounded-lg flex items-center gap-2 transition-all duration-300
                        ${isSuccess 
                            ? "bg-green-500 text-white"   // Success State
                            : "bg-primary hover:bg-primary-dim text-background" // Normal State
                        }
                    `}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="animate-spin" size={16} /> Saving...
                        </>
                    ) : isSuccess ? (
                        <>
                            <Check size={16} /> Saved!
                        </>
                    ) : (
                        <>
                            <Save size={16} /> Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}