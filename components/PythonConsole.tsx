"use client";

import { AlertCircle, Loader2, Terminal } from "lucide-react";
import clsx from "clsx";
import type { ConsoleTab, ConsoleTabItem, OutputLine } from "@/components/python-playground-types";

type PythonConsoleProps = {
  consoleTab: ConsoleTab;
  consoleTabs: ConsoleTabItem[];
  isReady: boolean;
  runtimeError: string | null;
  visibleOutput: OutputLine[];
  onTabChange: (tab: ConsoleTab) => void;
};

export function PythonConsole({ consoleTab, consoleTabs, isReady, runtimeError, visibleOutput, onTabChange }: PythonConsoleProps) {
  return (
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
                  onClick={() => onTabChange(tab.id)}
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
  );
}
