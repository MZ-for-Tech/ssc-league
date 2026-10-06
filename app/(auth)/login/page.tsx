"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, ScanLine } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import SidebarLogo from "@/components/Logo"; 
import { resetLeagueSeasonSelection } from "@/app/actions/season-actions";
import CourseCodeTerminal from "@/components/auth/CourseCodeTerminal";
import LoginForm from "@/components/auth/LoginForm";


export default function LoginPage() {
  const [input, setInput] = useState(""); // Can be ID or Email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let loginEmail = input; // Default to input

      // 1. "Smart Login" Check (Is it a Student ID?)
      const isStudentId = /^\d+$/.test(input);

      if (isStudentId) {
          // Lookup email via RPC (Student flow)
          const { data: realEmail, error: lookupError } = await supabase
            .rpc('get_email_by_student_id', { lookup_id: input });

          if (lookupError || !realEmail) throw new Error("Student ID not found.");
          loginEmail = realEmail;
      }

      // 2. Perform Login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) throw authError;

      await resetLeagueSeasonSelection();

      // Ensure the first authenticated page shows its welcome overlay, even in an existing tab session.
      sessionStorage.setItem("ssc_show_welcome_after_login", "true");

      // The dashboard selects the student or admin view from the authenticated profile.
      router.refresh();
      router.push("/dashboard");

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "System Error.";
      if (message.includes("Invalid login")) {
          setError("Access Denied: Incorrect Password.");
      } else {
          setError(message);
      }
      setIsLoading(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_18%_15%,rgb(var(--primary)/0.15),transparent_34%),radial-gradient(ellipse_at_90%_85%,rgb(124_58_237/0.12),transparent_34%),linear-gradient(135deg,rgb(var(--surface-deep)),rgb(var(--background))_55%,rgb(var(--surface-deep)))]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.13] [mask-image:linear-gradient(120deg,black,transparent_90%)]" />

      <div className="grid min-h-screen w-full grid-cols-1 xl:grid-cols-[3fr_2fr]">
        <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-primary/20 bg-[linear-gradient(145deg,rgb(var(--surface-hero)/0.88),rgb(var(--surface-deep)/0.84)_62%,rgb(var(--surface-node)/0.8))] px-10 py-6 xl:flex 2xl:px-14 2xl:py-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.13] [mask-image:linear-gradient(135deg,black,transparent_75%)]" />
          <svg aria-hidden="true" viewBox="0 0 1000 900" fill="none" className="pointer-events-none absolute right-[-18%] top-[12%] z-0 h-[76%] w-[72%] opacity-55">
            <defs>
              <linearGradient id="login-triangle-gradient" x1="500" y1="50" x2="500" y2="850" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--primary))" />
                <stop offset="1" stopColor="rgb(var(--retro-pink))" />
              </linearGradient>
            </defs>
            <g stroke="url(#login-triangle-gradient)" strokeWidth="2">
              <path d="M500 70 930 820H70L500 70Z" strokeOpacity=".32" />
              <path d="m500 190 340 590H160l340-590Z" strokeOpacity=".2" />
              <path d="m500 310 250 430H250l250-430Z" strokeOpacity=".15" />
              <path d="M70 820 500 535 930 820M160 780l340-245 340 245M250 740l250-205 250 205" strokeOpacity=".12" />
            </g>
            <g stroke="rgb(var(--cyan-200))" strokeOpacity=".12" strokeWidth="1" strokeDasharray="3 14">
              <path d="M500 70v750M70 820h860M500 70 930 820M500 70 70 820" />
            </g>
          </svg>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-cyan-300/80 to-transparent" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="origin-left scale-110 2xl:scale-125"><SidebarLogo /></div>
            <span className="console-control inline-flex items-center gap-2 border border-success/25 bg-success/5 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-success">
              <Radio size={13} className="animate-pulse" /> Network online
            </span>
          </div>

          <div className="relative z-10 max-w-4xl py-6">
            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-foreground 2xl:text-7xl">
              Your next move starts <span className="text-primary drop-shadow-[0_0_24px_rgb(var(--primary)/0.4)]">here.</span>
            </h1>
            <CourseCodeTerminal />
          </div>

          <div className="relative z-10 flex items-end justify-between gap-5 border-t border-border/70 pt-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted/70">Secure connection</p>
              <p className="mt-2 text-sm font-semibold text-foreground/80">Student and instructor accounts</p>
            </div>
            <ScanLine aria-hidden="true" className="h-10 w-10 text-primary/60" />
          </div>
        </section>

        <section className="relative isolate flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[linear-gradient(155deg,rgb(var(--surface-deep)/0.97),rgb(var(--background)/0.98)_54%,rgb(var(--surface-node)/0.94))] px-5 py-8 sm:px-10 lg:px-14 xl:px-[clamp(3rem,6vw,8rem)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,rgb(var(--primary)/0.12),transparent_45%)]" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-amber-400/80 to-transparent xl:hidden" />

          <div className="mb-7 flex items-center justify-between gap-4 border-b border-border/70 pb-5 xl:hidden">
            <SidebarLogo />
            <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-success"><Radio size={12} className="animate-pulse" /> Online</span>
          </div>

          <LoginForm
            identity={input}
            password={password}
            isPasswordVisible={showPassword}
            isLoading={isLoading}
            error={error}
            onIdentityChange={setInput}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword((visible) => !visible)}
            onSubmit={handleLogin}
          />
        </section>
      </div>
    </main>
  );
}
