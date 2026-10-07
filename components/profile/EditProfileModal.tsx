"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Save, Loader2, RefreshCw, Upload, Camera, Check, Pencil, UserRound } from "lucide-react";
import { updateStudentProfile } from "@/app/actions/profile-actions";
import { useRouter } from "next/navigation";
import { useProfileAvatar } from "@/components/profile/useProfileAvatar";

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { avatarUrl, isUploading, fileInputRef, handleFileChange, handleRandomizeAvatar } = useProfileAvatar(student, (message) => setErrorMessage(message || null));

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving && !isUploading) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSaving, isUploading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("avatar_url", avatarUrl);
      await updateStudentProfile(formData);
      setIsSuccess(true);
      router.refresh();
      window.setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 900);
    } catch {
      setErrorMessage("Your changes couldn’t be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const editor = isOpen ? createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving && !isUploading) setIsOpen(false); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-cyan-200/15 bg-[rgb(var(--surface-deep))] shadow-[0_24px_100px_rgb(0_0_0/.55)]">
        <header className="flex items-center justify-between border-b border-border bg-surface/60 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><UserRound size={19} /></div>
            <h2 id="edit-profile-title" className="text-lg font-bold text-foreground">Edit profile</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={() => setIsOpen(false)} disabled={isSaving || isUploading} aria-label="Close profile editor" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition hover:border-primary/30 hover:text-foreground disabled:opacity-50">
            <X size={17} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <input type="hidden" name="id" value={student.id} />
          <input type="hidden" name="group_id" value={student.group_id} />
          <div className="min-h-0 space-y-6 overflow-y-auto app-panel-padding">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-background/30 p-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/35 bg-background shadow-[0_0_28px_rgb(var(--primary)/0.12)]">
                {isUploading ? (
                  <div className="grid h-full place-items-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                ) : (
                  <>
                    <Image unoptimized width={160} height={160} src={avatarUrl} className="h-full w-full object-cover" alt="Profile photo preview" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Upload a profile photo" className="absolute inset-0 grid place-items-center bg-slate-950/55 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"><Camera size={20} /></button>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold text-background transition hover:bg-primary-dim disabled:opacity-50"><Upload size={14} /> Upload photo</button>
                <button type="button" onClick={handleRandomizeAvatar} disabled={isUploading} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3.5 py-2.5 text-xs font-semibold text-muted transition hover:border-primary/30 hover:text-foreground disabled:opacity-50"><RefreshCw size={14} /> Randomize</button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-xs font-semibold text-muted">
                Full name
                <input name="full_name" defaultValue={student.full_name} autoComplete="name" className="w-full rounded-xl border border-border bg-background/70 px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" required />
              </label>
              <label className="block space-y-2 text-xs font-semibold text-muted">
                Preferred name
                <input name="preferred_name" defaultValue={student.preferred_name} autoComplete="nickname" className="w-full rounded-xl border border-border bg-background/70 px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" required />
              </label>
            </div>
            {errorMessage && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm text-rose-200">{errorMessage}</p>}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-border bg-surface/40 px-5 py-4 sm:px-6">
            <button type="button" onClick={() => setIsOpen(false)} disabled={isSaving || isUploading} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-foreground disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSaving || isUploading || isSuccess} className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${isSuccess ? "bg-emerald-400 text-slate-950" : "bg-primary text-background hover:bg-primary-dim"}`}>
              {isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving</> : isSuccess ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save changes</>}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-bold text-primary transition hover:border-primary/40 hover:bg-primary/10">
        <Pencil size={13} /> Edit profile
      </button>
      {editor}
    </>
  );
}
