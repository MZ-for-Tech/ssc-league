"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, Save } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import PromptContent from "@/components/questions/PromptContent";

type EssayItem = {
  id: string;
  bank_item_id: string;
  prompt: string;
  response_type: string | null;
  stimulus_code: string | null;
  stimulus_asset_url: string | null;
  stimulus_asset_alt: string | null;
  display_order: number;
};

type SavedResponse = { essay_question_id: string; response_text: string };

export default function EssayResponsesView({
  essays,
  existingResponses,
  studentId,
  seasonId,
  readOnly,
}: {
  essays: EssayItem[];
  existingResponses: SavedResponse[];
  studentId: string | null;
  seasonId: string;
  readOnly: boolean;
}) {
  const supabase = createSupabaseBrowserClient();
  const [responses, setResponses] = useState<Record<string, string>>(() => Object.fromEntries(
    existingResponses.map((response) => [response.essay_question_id, response.response_text]),
  ));
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(existingResponses.map((response) => response.essay_question_id)));
  const [error, setError] = useState<string | null>(null);

  async function saveResponse(essayId: string) {
    if (!studentId || readOnly) return;
    const responseText = responses[essayId]?.trim();
    if (!responseText) {
      setError("Write a response before saving it.");
      return;
    }

    setSavingId(essayId);
    setError(null);
    const { error: saveError } = await supabase.from("StudentEssayResponse").upsert({
      season_id: seasonId,
      student_id: studentId,
      essay_question_id: essayId,
      response_text: responseText,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "season_id,student_id,essay_question_id" });
    setSavingId(null);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSavedIds((current) => new Set(current).add(essayId));
  }

  if (essays.length === 0) {
    return <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">No written responses have been added to this lesson yet.</div>;
  }

  return (
    <div className="space-y-5">
      {readOnly && <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">Archived lesson · prompts are view only.</div>}
      {!studentId && !readOnly && <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">Sign in with an enrolled student account to save responses.</div>}
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      {essays.map((essay, index) => (
        <article key={essay.id} className="rounded-2xl border border-border bg-surface/70 p-5 md:p-7">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-primary">Written response {index + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{essay.response_type || "Structured response"}</h2>
            </div>
            {savedIds.has(essay.id) && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success"><Check size={15} /> Saved</span>}
          </header>

          <PromptContent prompt={essay.prompt} />
          {essay.stimulus_code && <div className="mt-5"><PromptContent prompt={`\`\`\`python\n${essay.stimulus_code}\n\`\`\``} /></div>}
          {essay.stimulus_asset_url && <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background p-3"><Image unoptimized width={1200} height={900} src={essay.stimulus_asset_url} alt={essay.stimulus_asset_alt || essay.prompt} className="mx-auto h-auto max-h-[34rem] w-full object-contain" /><figcaption className="mt-2 text-center text-xs text-muted">Lesson visual</figcaption></figure>}

          {!readOnly && studentId && <div className="mt-6 border-t border-border pt-5">
            <label htmlFor={`essay-${essay.id}`} className="mb-2 block text-sm font-semibold text-foreground">Your response</label>
            <textarea
              id={`essay-${essay.id}`}
              value={responses[essay.id] || ""}
              onChange={(event) => {
                setResponses((current) => ({ ...current, [essay.id]: event.target.value }));
                setSavedIds((current) => { const next = new Set(current); next.delete(essay.id); return next; });
              }}
              rows={7}
              className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground outline-none focus:border-primary"
              placeholder="Write your response here. It is saved without a score."
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">Responses are saved without automated marking or a score.</p>
              <button type="button" onClick={() => saveResponse(essay.id)} disabled={savingId === essay.id || !responses[essay.id]?.trim()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50">
                {savingId === essay.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingId === essay.id ? "Saving…" : "Save response"}
              </button>
            </div>
          </div>}
        </article>
      ))}
    </div>
  );
}
