"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";

type LoginFormProps = {
  identity: string;
  password: string;
  isPasswordVisible: boolean;
  isLoading: boolean;
  error: string;
  onIdentityChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LoginForm({
  identity,
  password,
  isPasswordVisible,
  isLoading,
  error,
  onIdentityChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: LoginFormProps) {
  return (
          <div className="mx-auto w-full max-w-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-identity" className="ml-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Student ID <span className="font-medium normal-case tracking-normal text-muted/70">or email</span>
              </label>
              <div className="group relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  id="login-identity"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={identity}
                  onChange={(e) => onIdentityChange(e.target.value)}
                  className="auth-input console-control min-h-14 w-full border border-border/90 bg-background/55 py-4 pl-12 pr-4 text-base text-foreground outline-none transition placeholder:text-muted/55 focus:border-primary/70 focus:bg-background/80 focus:ring-2 focus:ring-primary/15"
                  placeholder="e.g. 5240103"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="ml-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Password</label>
              <div className="group relative">
                <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  id="login-password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="auth-input console-control min-h-14 w-full border border-border/90 bg-background/55 py-4 pl-12 pr-12 text-base text-foreground outline-none transition placeholder:text-muted/55 focus:border-primary/70 focus:bg-background/80 focus:ring-2 focus:ring-primary/15"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  aria-pressed={isPasswordVisible}
                  title={isPasswordVisible ? "Hide password" : "Show password"}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onTogglePassword}
                  className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
                >
                  {isPasswordVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
              <div className="flex justify-end px-1">
                <Link href="/forgot-password" className="text-xs font-semibold text-primary transition hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 border border-danger/30 bg-danger/10 p-3 text-danger"
              >
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="console-control group mt-2 flex min-h-14 w-full items-center justify-center gap-2 bg-gradient-to-r from-primary-dim to-primary px-4 py-4 text-base font-black text-background shadow-lg shadow-primary/20 transition hover:brightness-110 hover:shadow-glow-primary-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isLoading ? <><Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /><span>Authenticating...</span></> : <><span>Access system</span><ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 border-t border-border/70 pt-5">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
            <p className="text-xs leading-5 text-muted">Restricted access. Unauthorized entry will be logged.</p>
          </div>
          </div>
  );
}
