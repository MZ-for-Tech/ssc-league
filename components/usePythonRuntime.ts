"use client";

import { useEffect, useRef, useState } from "react";
import type { ConsoleTab, OutputKind, OutputLine } from "@/components/python-playground-types";

type WorkerResponse =
  | { type: "ready"; pythonVersion: string; pyodideVersion: string }
  | { type: "stdout" | "stderr"; runId: number; text: string }
  | { type: "result"; runId: number; text: string }
  | { type: "plot"; runId: number; index: number; dataUrl: string }
  | { type: "package-loading"; runId: number; packages: string[] }
  | { type: "complete"; runId: number }
  | { type: "load-error"; message: string };

export function usePythonRuntime(code: string) {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [runtimeLabel, setRuntimeLabel] = useState<string | null>(null);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("output");
  const [workerGeneration, setWorkerGeneration] = useState(0);
  const workerRef = useRef<Worker | null>(null);
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

  const retryRuntime = () => {
    setRuntimeError(null);
    setRuntimeLabel(null);
    setIsReady(false);
    setConsoleTab("output");
    setWorkerGeneration((generation) => generation + 1);
  };

  const clearOutput = () => setOutput([]);

  return {
    output,
    isRunning,
    isReady,
    runtimeError,
    runtimeLabel,
    consoleTab,
    setConsoleTab,
    runCode,
    stopCode,
    retryRuntime,
    clearOutput,
  };
}
