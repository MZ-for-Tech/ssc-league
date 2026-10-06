"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm({ linkError }: { linkError: boolean }) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent("/reset-password")}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) throw resetError;
      setSent(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to send a reset email right now.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-md border border-border/80 bg-surface/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <div className="mt-8 flex h-11 w-11 items-center justify-center border border-primary/25 bg-primary/10 text-primary"><Mail size={20} /></div>
        <h1 className="mt-5 text-2xl font-black text-foreground">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Enter the email address linked to your account and we’ll send a reset link.</p>

        {sent ? (
          <div role="status" className="mt-6 border border-success/30 bg-success/10 p-4 text-sm leading-6 text-foreground">
            If an account exists for that email, a password reset link is on its way. Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {linkError && <div role="alert" className="border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">That reset link is invalid or expired. Request a new one below.</div>}
            <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-[0.14em] text-muted">Email address</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="auth-input console-control min-h-12 w-full border border-border bg-background/60 px-4 py-3 text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/15"
              placeholder="you@example.com"
            />
            {error && <div role="alert" className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
            <button type="submit" disabled={isSending} className="console-control flex min-h-12 w-full items-center justify-center gap-2 bg-gradient-to-r from-primary-dim to-primary px-4 py-3 font-black text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              {isSending ? <><Loader2 size={18} className="animate-spin" /> Sending link…</> : <>Email me a reset link <Mail size={17} /></>}
            </button>
          </form>
        )}

        <p className="mt-6 flex items-start gap-2 border-t border-border/70 pt-4 text-xs leading-5 text-muted">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
          For account security, this page won’t confirm whether an email is registered.
        </p>
      </section>
    </main>
  );
}
