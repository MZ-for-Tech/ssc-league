"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Terminal } from "lucide-react";

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

export default function CourseCodeTerminal() {
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
        <span className="flex items-center gap-2 text-success"><i className="h-1.5 w-1.5 bg-success shadow-[0_0_8px_rgb(var(--success)/0.8)]" /> Ready</span>
      </div>
    </div>
  );
}
