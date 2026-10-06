"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords don’t match.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setUpdated(true);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update your password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-md border border-border/80 bg-surface/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <div className="mt-8 flex h-11 w-11 items-center justify-center border border-primary/25 bg-primary/10 text-primary">{updated ? <CheckCircle2 size={20} /> : <KeyRound size={20} />}</div>
        <h1 className="mt-5 text-2xl font-black text-foreground">{updated ? "Password updated" : "Choose a new password"}</h1>
        {updated ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-muted">Your password has been changed. Sign in with your new password to continue.</p>
            <Link href="/login" className="console-control flex min-h-12 w-full items-center justify-center bg-gradient-to-r from-primary-dim to-primary px-4 py-3 font-black text-background transition hover:brightness-110">Go to sign in</Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-muted">Choose a strong password you haven’t used for this account before.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-[0.14em] text-muted">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input console-control min-h-12 w-full border border-border bg-background/60 px-4 py-3 text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/15" />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-[0.14em] text-muted">Confirm password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="auth-input console-control min-h-12 w-full border border-border bg-background/60 px-4 py-3 text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/15" />
              </div>
              {error && <div role="alert" className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error} If your reset link has expired, request another one.</div>}
              <button type="submit" disabled={isSaving} className="console-control flex min-h-12 w-full items-center justify-center gap-2 bg-gradient-to-r from-primary-dim to-primary px-4 py-3 font-black text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? <><Loader2 size={18} className="animate-spin" /> Updating…</> : <>Save new password <KeyRound size={17} /></>}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
