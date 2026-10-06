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
type ConsoleTab = "output" | "errors" | "plots";

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
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("output");
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
        setConsoleTab("errors");
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
      if (kind === "stderr") setConsoleTab("errors");
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
      setConsoleTab("errors");
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
    setConsoleTab("output");
    workerRef.current.postMessage({ type: "run", runId, code });
  };

  const stopCode = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    activeRunId.current = null;
    setIsRunning(false);
    setIsReady(false);
    setRuntimeError(null);
    setConsoleTab("output");
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
  const visibleOutput = output.filter((line) => {
    if (consoleTab === "errors") return line.kind === "stderr";
    if (consoleTab === "plots") return line.kind === "plot";
    return line.kind !== "stderr" && line.kind !== "plot";
  });
  const consoleTabs: { id: ConsoleTab; label: string; count: number }[] = [
    { id: "output", label: "Output", count: output.filter((line) => line.kind !== "stderr" && line.kind !== "plot").length },
    { id: "errors", label: "Errors", count: output.filter((line) => line.kind === "stderr").length + (runtimeError ? 1 : 0) },
    { id: "plots", label: "Plots", count: output.filter((line) => line.kind === "plot").length },
  ];
  return (
    <section className="instrument-panel overflow-hidden rounded-xl border border-border bg-surface/70" aria-label="Python coding workspace">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/70 px-4 py-2.5 md:px-5">
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
          <div className="mr-1 hidden items-center gap-2 border border-border/80 bg-surface/40 px-2 py-1 font-mono text-2xs uppercase tracking-wider text-muted sm:flex" aria-live="polite">
            <span className={clsx(
              "h-1.5 w-1.5 rounded-full",
              isReady ? "bg-success" : runtimeError ? "bg-danger" : "animate-pulse bg-warning",
            )} />
            <span className="max-w-56 truncate">{runtimeLabel || (runtimeError ? "Unavailable" : "Booting")}</span>
          </div>
          <button
            type="button"
            onClick={resetCode}
              className="console-control inline-flex h-8 w-8 items-center justify-center border border-transparent text-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Reset starter code"
            aria-label="Reset starter code"
          >
            <RotateCcw size={15} />
          </button>
          {isRunning ? (
            <button
              type="button"
              onClick={stopCode}
              className="console-control inline-flex items-center gap-2 border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
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
                setConsoleTab("output");
                setWorkerGeneration((generation) => generation + 1);
              }}
              className="console-control inline-flex items-center gap-2 bg-primary px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw size={13} /> Retry runtime
            </button>
          ) : (
            <button
              type="button"
              onClick={runCode}
              disabled={!isReady}
              className={clsx(
                "console-control inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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

      <div className="grid min-h-[34rem] grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <div className="flex min-h-[25rem] flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/70 bg-code-editor px-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">
              <Braces size={13} className="text-primary" /> Source
            </div>
            <span className="font-mono text-xs text-muted/70">{lineCount} lines</span>
          </div>
          <div className="relative flex-1 overflow-hidden bg-code-editor">
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 overflow-hidden border-r border-white/[0.04] bg-black/10 pt-4 text-right font-mono text-xs leading-[1.625rem] text-slate-600">
              <div style={{ transform: `translateY(-${editorScrollTop}px)` }}>
                {Array.from({ length: lineCount }, (_, index) => (
                  <div key={index} className="pr-3">{index + 1}</div>
                ))}
              </div>
            </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-sm">
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
                    fontSize: "inherit",
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
              className="relative z-[1] h-full min-h-[25rem] w-full resize-none overflow-auto bg-transparent py-4 pl-16 pr-5 font-mono text-sm leading-[1.625rem] text-transparent caret-primary focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary/35 selection:bg-primary/25 selection:text-transparent"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              wrap="off"
            />
            <div className="pointer-events-none absolute bottom-3 right-4 hidden font-mono text-2xs text-slate-500 xl:block">
              Ctrl / ⌘ + Enter to run
            </div>
          </div>
        </div>

        <div className="flex min-h-[25rem] flex-col bg-code-console" aria-live="polite">
          <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 sm:px-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">
              <Terminal size={13} className="text-primary" /> Console
            </div>
            <div className="flex items-center gap-1" role="tablist" aria-label="Console output type">
              {consoleTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  id={`console-tab-${tab.id}`}
                  role="tab"
                  aria-selected={consoleTab === tab.id}
                  aria-controls="console-output-panel"
                  onClick={() => setConsoleTab(tab.id)}
                  className={clsx(
                    "console-control inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    consoleTab === tab.id ? "border-primary/25 bg-primary/10 text-primary" : "border-transparent text-muted hover:border-border hover:text-foreground",
                  )}
                >
                  {tab.label}<span className="text-xs opacity-65">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div id="console-output-panel" role="tabpanel" aria-labelledby={`console-tab-${consoleTab}`} className="flex-1 overflow-y-auto p-4 md:p-5">
            {runtimeError && consoleTab === "errors" && (
              <div className="flex items-start gap-3 rounded-md border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Runtime connection failed</div>
                  <div className="mt-1 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-danger/90">{runtimeError}</div>
                </div>
              </div>
            )}

            {runtimeError && consoleTab !== "errors" && (
              <div className="flex min-h-[21rem] items-center justify-center px-6 text-center">
                <div className="text-xs text-muted">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-danger">Runtime unavailable</p>
                  <p className="mt-1">Select Errors for connection details, or retry the runtime.</p>
                </div>
              </div>
            )}

            {!runtimeError && visibleOutput.length === 0 && consoleTab === "output" && !isReady && (
              <div className="flex min-h-[21rem] items-center justify-center px-5 py-8">
                <div className="w-full max-w-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center border border-primary/20 bg-primary/5 text-primary"><Loader2 size={18} className="animate-spin" /></div>
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Runtime handshake</p>
                      <p className="mt-1 text-xs text-muted">Starting Python in this browser…</p>
                    </div>
                  </div>
                  <div aria-hidden="true" className="relative h-px overflow-hidden bg-surface-light/50">
                    <div className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-primary/80" />
                  </div>
                  <p className="mt-3 font-mono text-xs leading-4 text-muted/75">First launch downloads and initializes the Python runtime. You can keep editing while it starts.</p>
                </div>
              </div>
            )}

            {!runtimeError && visibleOutput.length === 0 && consoleTab === "output" && isReady && (
              <div className="flex min-h-[21rem] items-center justify-center px-6 text-center">
                <div className="max-w-xs">
                  <div className="mx-auto grid h-10 w-10 place-items-center border border-success/20 bg-success/5 text-success"><Terminal size={17} /></div>
                  <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-foreground">Awaiting execution</p>
                  <p className="mt-1 text-xs text-muted">Output will appear here.</p>
                </div>
              </div>
            )}

            {!runtimeError && visibleOutput.length === 0 && consoleTab === "errors" && (
              <div className="flex min-h-[21rem] items-center justify-center px-6 text-center">
                <div className="text-xs text-muted">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-success">No errors reported</p>
                  <p className="mt-1">Runtime and execution errors will appear here.</p>
                </div>
              </div>
            )}

            {!runtimeError && visibleOutput.length === 0 && consoleTab === "plots" && (
              <div className="flex min-h-[21rem] items-center justify-center px-6 text-center">
                <div className="text-xs text-muted">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">No figures rendered</p>
                  <p className="mt-1">Plots created with matplotlib will appear here.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {visibleOutput.map((line) => (
                line.kind === "plot" ? (
                  <figure key={line.id} className="my-4 overflow-hidden rounded-md border border-slate-700 bg-white p-2">
                    {/* Generated figures are in-memory data URLs, so Next image optimization does not apply. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.imageDataUrl} alt={`Python plot ${line.figureNumber}`} className="mx-auto h-auto max-w-full" />
                    <figcaption className="px-2 pt-2 font-mono text-xs text-slate-500">FIGURE {line.figureNumber}</figcaption>
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
