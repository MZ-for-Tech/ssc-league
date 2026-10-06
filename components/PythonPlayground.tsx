"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { PythonCodeEditor } from "@/components/PythonCodeEditor";
import { PythonConsole } from "@/components/PythonConsole";
import type { ConsoleTabItem } from "@/components/python-playground-types";
import { usePythonRuntime } from "@/components/usePythonRuntime";
import PythonPlaygroundToolbar from "@/components/PythonPlaygroundToolbar";

const FALLBACK_CODE = "print('Hello Agent')";

export default function PythonPlayground({ initialCode = "" }: { initialCode?: string }) {
  const startingCode = initialCode || FALLBACK_CODE;
  const [code, setCode] = useState(startingCode);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [editorScrollLeft, setEditorScrollLeft] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const {
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
  } = usePythonRuntime(code);

  const resetCode = () => {
    setCode(startingCode);
    clearOutput();
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
  const consoleTabs: ConsoleTabItem[] = [
    { id: "output", label: "Output", count: output.filter((line) => line.kind !== "stderr" && line.kind !== "plot").length },
    { id: "errors", label: "Errors", count: output.filter((line) => line.kind === "stderr").length + (runtimeError ? 1 : 0) },
    { id: "plots", label: "Plots", count: output.filter((line) => line.kind === "plot").length },
  ];
  return (
    <section className="instrument-panel overflow-hidden rounded-xl border border-border bg-surface/70" aria-label="Python coding workspace">
      <PythonPlaygroundToolbar
        isReady={isReady}
        isRunning={isRunning}
        runtimeError={runtimeError}
        runtimeLabel={runtimeLabel}
        onReset={resetCode}
        onStop={stopCode}
        onRetry={retryRuntime}
        onRun={runCode}
      />

      <div className="grid min-h-[34rem] grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <PythonCodeEditor
          code={code}
          editorRef={editorRef}
          lineCount={lineCount}
          editorScrollTop={editorScrollTop}
          editorScrollLeft={editorScrollLeft}
          onCodeChange={setCode}
          onKeyDown={handleEditorKeyDown}
          onScroll={(scrollTop, scrollLeft) => {
            setEditorScrollTop(scrollTop);
            setEditorScrollLeft(scrollLeft);
          }}
        />

        <PythonConsole
          consoleTab={consoleTab}
          consoleTabs={consoleTabs}
          isReady={isReady}
          runtimeError={runtimeError}
          visibleOutput={visibleOutput}
          onTabChange={setConsoleTab}
        />
      </div>

    </section>
  );
}
