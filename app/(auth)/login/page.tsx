"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, Radio, ScanLine, Terminal, Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import SidebarLogo from "@/components/Logo"; 
import { resetLeagueSeasonSelection } from "@/app/actions/season-actions";

const initialCourseScript = `# MODULE 01 · ALGORITHMS
scores = [82, 95, 74, 88]
scores.sort()
print("Scores in order:", scores)

# MODULE 02 · CONDITIONALS AND LOOPS
for score in scores:
    if score >= 50:
        print(score, "pass")
    else:
        print(score, "retry")

# MODULE 02 · FUNCTIONS AND LISTS
def passing_scores(values):
    return [value for value in values if value >= 50]

passing = passing_scores(scores)
print("Passing:", passing)

# MODULE 03 · DATA SCIENCE WITH PANDAS
import pandas as pd
league = pd.DataFrame({"score": scores})
league["passed"] = league["score"] >= 50
print(league.groupby("passed")["score"].mean())

cycle = 1
`;

const makeCourseContinuation = (cycle: number) => `
# MODULE 02 · LIST TRANSFORMATION / CYCLE ${cycle}
adjusted_scores = [score + cycle for score in scores]
passing = passing_scores(adjusted_scores)
print("Adjusted passing scores:", passing)

# MODULE 03 · GROUPED ANALYSIS / CYCLE ${cycle}
league = pd.DataFrame({"score": adjusted_scores})
league["passed"] = league["score"] >= 50
print(league.groupby("passed")["score"].mean())
cycle += 1
`;

const MAX_TERMINAL_SCROLLBACK = 4000;

const pythonHighlightPattern = /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|return|if|elif|else|for|while|in|import|from|as|class|try|except|with|True|False|None|and|or|not|lambda)\b|\b(?:print|len|range|sum|sorted|enumerate|int|float|str|list|dict|open|DataFrame|groupby|mean|sort|append|size)\b|\b\d+(?:\.\d+)?\b/g;
const pythonKeywords = new Set(["def", "return", "if", "elif", "else", "for", "while", "in", "import", "from", "as", "class", "try", "except", "with", "True", "False", "None", "and", "or", "not", "lambda"]);
const pythonBuiltins = new Set(["print", "len", "range", "sum", "sorted", "enumerate", "int", "float", "str", "list", "dict", "open", "DataFrame", "groupby", "mean"]);

function highlightPython(source: string) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  for (const match of source.matchAll(pythonHighlightPattern)) {
    const start = match.index ?? 0;
    const token = match[0];
    if (start > cursor) parts.push(source.slice(cursor, start));

    const tokenClass = token.startsWith("#")
      ? "text-slate-500 italic"
      : token.startsWith('"') || token.startsWith("'")
        ? "text-amber-300"
        : /^\d/.test(token)
          ? "text-fuchsia-300"
          : pythonKeywords.has(token)
            ? "text-violet-300"
            : pythonBuiltins.has(token)
              ? "text-cyan-300"
              : "text-foreground";

    parts.push(<span key={`token-${tokenIndex++}`} className={tokenClass}>{token}</span>);
    cursor = start + token.length;
  }

  if (cursor < source.length) parts.push(source.slice(cursor));
  return parts;
}

function CourseCodeTerminal() {
  const [script, setScript] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const scriptRef = useRef(initialCourseScript);
  const scriptIndexRef = useRef(0);
  const cycleRef = useRef(1);
  const viewportRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let timer = 0;
    const typeNextCharacter = () => {
      if (scriptIndexRef.current >= scriptRef.current.length) {
        scriptRef.current = makeCourseContinuation(cycleRef.current++);
        scriptIndexRef.current = 0;
      }

      const nextCharacter = scriptRef.current[scriptIndexRef.current++];
      setScript((current) => {
        const next = current + nextCharacter;
        if (next.length <= MAX_TERMINAL_SCROLLBACK) return next;
        const firstNewLine = next.indexOf("\n", next.length - MAX_TERMINAL_SCROLLBACK);
        return next.slice(firstNewLine >= 0 ? firstNewLine + 1 : next.length - MAX_TERMINAL_SCROLLBACK);
      });
      timer = window.setTimeout(typeNextCharacter, nextCharacter === "\n" ? 110 : 24);
    };

    timer = window.setTimeout(typeNextCharacter, 180);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [script]);

  const visibleCode = prefersReducedMotion ? initialCourseScript : script || initialCourseScript.slice(0, 1);
  const visibleLines = visibleCode.split("\n");

  return (
    <div aria-hidden="true" className="instrument-panel relative isolate mt-5 max-w-3xl overflow-hidden border border-primary/20 bg-[linear-gradient(115deg,rgb(var(--surface-deep)/0.88),rgb(var(--surface)/0.72)_58%,rgb(var(--surface-node)/0.82))] shadow-2xl shadow-black/25">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/80 via-cyan-300/30 to-transparent" />
      <div className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary"><Terminal size={16} /></span>
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs">PYTHON / COURSE SEQUENCE</span>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-muted/70">league_analysis.py</span>
      </div>
      <pre ref={viewportRef} className="h-44 overflow-y-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-6 text-slate-200 sm:h-48 sm:px-5 sm:py-4 sm:text-sm sm:leading-7"><code>{visibleLines.map((line, index) => <span key={index} className="block"><span className="mr-4 inline-block w-5 select-none text-right text-muted/45">{index + 1}</span>{highlightPython(line) || " "}{index === visibleLines.length - 1 && <span aria-hidden="true" className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary align-middle" />}</span>)}</code></pre>
      <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-muted/65 sm:px-5 sm:text-[10px]">
        <span>One script · live scrollback</span>
        <span className="flex items-center gap-2 text-success"><i className="h-1.5 w-1.5 bg-success shadow-[0_0_8px_rgb(var(--success)/0.8)]" /> Ready</span>
      </div>
    </div>
  );
}

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

          <div className="mx-auto w-full max-w-xl">
          <form onSubmit={handleLogin} className="space-y-5">
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input console-control min-h-14 w-full border border-border/90 bg-background/55 py-4 pl-12 pr-12 text-base text-foreground outline-none transition placeholder:text-muted/55 focus:border-primary/70 focus:bg-background/80 focus:ring-2 focus:ring-primary/15"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
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
        </section>
      </div>
    </main>
  );
}
