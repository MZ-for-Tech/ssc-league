"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  AlertCircle,
  Braces,
  Loader2,
  Play,
  RotateCcw,
  Square,
  Terminal,
} from "lucide-react";
import clsx from "clsx";

type OutputKind = "stdout" | "stderr" | "result" | "system" | "plot";

interface OutputLine {
  id: number;
  kind: OutputKind;
  text?: string;
  imageDataUrl?: string;
  figureNumber?: number;
}

type WorkerResponse =
  | { type: "ready"; pythonVersion: string; pyodideVersion: string }
  | { type: "stdout" | "stderr"; runId: number; text: string }
  | { type: "result"; runId: number; text: string }
  | { type: "plot"; runId: number; index: number; dataUrl: string }
  | { type: "package-loading"; runId: number; packages: string[] }
  | { type: "complete"; runId: number }
  | { type: "load-error"; message: string };

const FALLBACK_CODE = "print('Hello Agent')";
SyntaxHighlighter.registerLanguage("python", python);

export default function PythonPlayground({ initialCode = "" }: { initialCode?: string }) {
  const startingCode = initialCode || FALLBACK_CODE;
  const [code, setCode] = useState(startingCode);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [runtimeLabel, setRuntimeLabel] = useState<string | null>(null);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [editorScrollLeft, setEditorScrollLeft] = useState(0);
  const [workerGeneration, setWorkerGeneration] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const nextOutputId = useRef(0);
  const nextRunId = useRef(0);
  const activeRunId = useRef<number | null>(null);

  useEffect(() => {
    const worker = new Worker("/python.worker.js");
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;

      if (message.type === "ready") {
        setRuntimeLabel(`Python ${message.pythonVersion} · Pyodide ${message.pyodideVersion}`);
        setIsReady(true);
        return;
      }
      if (message.type === "load-error") {
        setRuntimeError(`Could not load Python: ${message.message}`);
        setIsReady(false);
        return;
      }
      if (message.runId !== activeRunId.current) return;

      if (message.type === "package-loading") {
        setOutput((previous) => [...previous, {
          id: nextOutputId.current++,
          kind: "system",
          text: `Loading ${message.packages.join(", ")} on first import…`,
        }]);
        return;
      }

      if (message.type === "plot") {
        setOutput((previous) => [...previous, {
          id: nextOutputId.current++,
          kind: "plot",
          imageDataUrl: message.dataUrl,
          figureNumber: message.index,
        }]);
        return;
      }

      if (message.type === "complete") {
        activeRunId.current = null;
        setIsRunning(false);
        return;
      }

      const kind: OutputKind = message.type;
      setOutput((previous) => [...previous, {
        id: nextOutputId.current++,
        kind,
        text: message.text,
      }]);
    };

    worker.onerror = (event) => {
      setRuntimeError(`Python worker error: ${event.message || "The worker stopped unexpectedly."}`);
      setIsReady(false);
      setIsRunning(false);
    };

    return () => {
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, [workerGeneration]);

  const runCode = () => {
    if (!workerRef.current || !isReady || isRunning) return;

    const runId = nextRunId.current++;
    activeRunId.current = runId;
    setRuntimeError(null);
    setOutput([]);
    setIsRunning(true);
    workerRef.current.postMessage({ type: "run", runId, code });
  };

  const stopCode = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    activeRunId.current = null;
    setIsRunning(false);
    setIsReady(false);
    setRuntimeError(null);
    setOutput((previous) => [...previous, {
      id: nextOutputId.current++,
      kind: "system",
      text: "Execution stopped. Restarting the Python runtime…",
    }]);
    setWorkerGeneration((generation) => generation + 1);
  };

  const resetCode = () => {
    setCode(startingCode);
    setOutput([]);
    editorRef.current?.focus();
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runCode();
      return;
    }
    if (event.key !== "Tab") return;

    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextCode = `${code.slice(0, start)}    ${code.slice(end)}`;
    setCode(nextCode);
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + 4, start + 4);
    });
  };

  const lineCount = Math.max(1, code.split("\n").length);
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface/70" aria-label="Python coding workspace">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-4 py-2.5 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-danger/70" />
            <span className="h-2 w-2 rounded-full bg-warning/70" />
            <span className="h-2 w-2 rounded-full bg-success/70" />
          </div>
          <span className="h-4 w-px bg-border" />
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs">
            <span className="text-primary">{`</>`}</span>
            <span className="truncate text-slate-300">mission.py</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] text-muted/70 md:inline">Runs in this browser</span>
          <div className="mr-1 hidden items-center gap-2 font-mono text-[10px] text-muted sm:flex" aria-live="polite">
            <span className={clsx(
              "h-1.5 w-1.5 rounded-full",
              isReady ? "bg-success" : runtimeError ? "bg-danger" : "animate-pulse bg-warning",
            )} />
            <span className="max-w-56 truncate">{runtimeLabel || (runtimeError ? "Runtime unavailable" : "Starting Python runtime")}</span>
          </div>
          <button
            type="button"
            onClick={resetCode}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Reset starter code"
            aria-label="Reset starter code"
          >
            <RotateCcw size={15} />
          </button>
          {isRunning ? (
            <button
              type="button"
              onClick={stopCode}
              className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <Square size={13} fill="currentColor" /> Stop
            </button>
          ) : runtimeError ? (
            <button
              type="button"
              onClick={() => {
                setRuntimeError(null);
                setRuntimeLabel(null);
                setIsReady(false);
                setWorkerGeneration((generation) => generation + 1);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw size={13} /> Retry runtime
            </button>
          ) : (
            <button
              type="button"
              onClick={runCode}
              disabled={!isReady}
              className={clsx(
                "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isReady
                  ? "bg-primary text-background hover:bg-primary-dim"
                  : "cursor-wait border border-border bg-surface text-muted",
              )}
            >
              {!isReady ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
              {isReady ? "Run" : "Loading"}
            </button>
          )}
        </div>
      </div>

      <div className="grid min-h-[31rem] grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-[25rem] flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/70 bg-code-editor px-4">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              <Braces size={13} className="text-primary" /> Source
            </div>
            <span className="font-mono text-[10px] text-muted/70">Python 3 · {lineCount} lines</span>
          </div>
          <div className="relative flex-1 overflow-hidden bg-code-editor">
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 overflow-hidden border-r border-white/[0.04] bg-black/10 pt-4 text-right font-mono text-xs leading-[1.625rem] text-slate-600">
              <div style={{ transform: `translateY(-${editorScrollTop}px)` }}>
                {Array.from({ length: lineCount }, (_, index) => (
                  <div key={index} className="pr-3">{index + 1}</div>
                ))}
              </div>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div style={{ transform: `translate(${-editorScrollLeft}px, -${editorScrollTop}px)` }}>
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1rem 1.25rem 1rem 4rem",
                    width: "max-content",
                    minWidth: "100%",
                    background: "transparent",
                    overflow: "visible",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: "13px",
                    lineHeight: "1.625rem",
                    whiteSpace: "pre",
                  }}
                  codeTagProps={{ style: { fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit" } }}
                >
                  {code || " "}
                </SyntaxHighlighter>
              </div>
            </div>
            <textarea
              ref={editorRef}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              onScroll={(event) => {
                setEditorScrollTop(event.currentTarget.scrollTop);
                setEditorScrollLeft(event.currentTarget.scrollLeft);
              }}
              aria-label="Python code editor"
              className="relative z-[1] h-full min-h-[25rem] w-full resize-none overflow-auto bg-transparent py-4 pl-16 pr-5 font-mono text-[13px] leading-[1.625rem] text-transparent caret-primary focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary/35 selection:bg-primary/25 selection:text-transparent"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              wrap="off"
            />
            <div className="pointer-events-none absolute bottom-3 right-4 hidden font-mono text-[10px] text-slate-500 xl:block">
              Ctrl / ⌘ + Enter to run
            </div>
          </div>
        </div>

        <div className="flex min-h-[25rem] flex-col bg-code-console" aria-live="polite">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              <Terminal size={13} className="text-primary" /> Console
            </div>
            <span className="font-mono text-[10px] text-muted/70">STDOUT · STDERR · PLOTS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            {runtimeError && (
              <div className="flex items-start gap-3 rounded-md border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Runtime connection failed</div>
                  <div className="mt-1 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-danger/90">{runtimeError}</div>
                </div>
              </div>
            )}

            {!runtimeError && output.length === 0 && !isReady && (
              <div className="flex min-h-[21rem] items-center justify-center px-6 text-center">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <Loader2 size={15} className="animate-spin text-primary" />
                  <span>Starting Python runtime… First launch may take a moment.</span>
                </div>
              </div>
            )}

            {!runtimeError && output.length === 0 && isReady && (
              <div className="flex min-h-[21rem] items-center justify-center px-6 text-center">
                <div className="text-xs text-muted">
                  <p>Ready for execution.</p>
                  <p className="mt-2 font-mono text-[10px] text-muted/70">Run or press Ctrl / ⌘ + Enter</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {output.map((line) => (
                line.kind === "plot" ? (
                  <figure key={line.id} className="my-4 overflow-hidden rounded-md border border-slate-700 bg-white p-2">
                    {/* Generated figures are in-memory data URLs, so Next image optimization does not apply. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.imageDataUrl} alt={`Python plot ${line.figureNumber}`} className="mx-auto h-auto max-w-full" />
                    <figcaption className="px-2 pt-2 font-mono text-[10px] text-slate-500">FIGURE {line.figureNumber}</figcaption>
                  </figure>
                ) : (
                  <pre
                    key={line.id}
                    className={clsx(
                      "whitespace-pre-wrap break-words font-mono text-xs leading-6",
                      line.kind === "stderr" ? "text-danger" :
                        line.kind === "result" ? "text-primary" :
                          line.kind === "system" ? "text-warning" : "text-emerald-300",
                    )}
                  >
                    {line.text}
                  </pre>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
