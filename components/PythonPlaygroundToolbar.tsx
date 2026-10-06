"use client";

import { Loader2, Play, RotateCcw, Square } from "lucide-react";
import clsx from "clsx";

type PythonPlaygroundToolbarProps = {
  isReady: boolean;
  isRunning: boolean;
  runtimeError: string | null;
  runtimeLabel: string | null;
  onReset: () => void;
  onStop: () => void;
  onRetry: () => void;
  onRun: () => void;
};

export default function PythonPlaygroundToolbar({
  isReady,
  isRunning,
  runtimeError,
  runtimeLabel,
  onReset,
  onStop,
  onRetry,
  onRun,
}: PythonPlaygroundToolbarProps) {
  return (
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
          onClick={onReset}
          className="console-control inline-flex h-8 w-8 items-center justify-center border border-transparent text-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Reset starter code"
          aria-label="Reset starter code"
        >
          <RotateCcw size={15} />
        </button>
        {isRunning ? (
          <button
            type="button"
            onClick={onStop}
            className="console-control inline-flex items-center gap-2 border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <Square size={13} fill="currentColor" /> Stop
          </button>
        ) : runtimeError ? (
          <button
            type="button"
            onClick={onRetry}
            className="console-control inline-flex items-center gap-2 bg-primary px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCcw size={13} /> Retry runtime
          </button>
        ) : (
          <button
            type="button"
            onClick={onRun}
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
  );
}
