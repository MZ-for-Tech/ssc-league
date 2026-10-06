import PythonCodeBlock from "@/components/PythonCodeBlock";

export default function PromptContent({ prompt }: { prompt: string }) {
  const parts = prompt.split(/```([\w+-]*)\s*\n([\s\S]*?)```/g);

  return (
    <div className="space-y-3 text-sm leading-7 text-foreground">
      {parts.map((part, index) => {
        if (index % 3 === 2) {
          const language = parts[index - 1]?.toLowerCase();
          return language === "python" || language === "py"
            ? <PythonCodeBlock key={index} code={part.trimEnd()} />
            : <pre key={index} className="my-5 overflow-x-auto rounded-xl border border-border bg-code-editor p-4 font-mono text-sm leading-6 text-foreground"><code>{part.trimEnd()}</code></pre>;
        }
        if (index % 3 === 1) return null;

        const paragraphs = part.trim().split(/\n{2,}/).filter(Boolean);
        return paragraphs.map((paragraph, paragraphIndex) => (
          <p key={`${index}-${paragraphIndex}`} className="whitespace-pre-wrap">
            {paragraph.split(/(`[^`]+`)/g).map((segment, segmentIndex) => segment.startsWith("`") && segment.endsWith("`")
              ? <code key={segmentIndex} className="rounded bg-background px-1.5 py-0.5 font-mono text-cyan-200">{segment.slice(1, -1)}</code>
              : segment)}
          </p>
        ));
      })}
    </div>
  );
}
