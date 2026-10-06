"use client";

import type { KeyboardEvent, RefObject } from "react";
import { Braces } from "lucide-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("python", python);

type PythonCodeEditorProps = {
  code: string;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  lineCount: number;
  editorScrollTop: number;
  editorScrollLeft: number;
  onCodeChange: (code: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onScroll: (scrollTop: number, scrollLeft: number) => void;
};

export function PythonCodeEditor({
  code, editorRef, lineCount, editorScrollTop, editorScrollLeft, onCodeChange, onKeyDown, onScroll,
}: PythonCodeEditorProps) {
  return (
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
              onChange={(event) => onCodeChange(event.target.value)}
              onKeyDown={onKeyDown}
              onScroll={(event) => onScroll(event.currentTarget.scrollTop, event.currentTarget.scrollLeft)}
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
  );
}
