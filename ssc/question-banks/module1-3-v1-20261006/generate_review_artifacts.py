import html
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
mcqs = [json.loads(line) for line in (ROOT / "final_items.jsonl").read_text().splitlines()]
essays = [json.loads(line) for line in (ROOT / "essay_items.jsonl").read_text().splitlines()]

def dump(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

source_map = {
    "primary_pdf": "ssc/Module 1/4. Module 1_4_Intr to programming.pdf (30 pages; newer module-branded copy)",
    "companion_markdown": "ssc/Module 1/intro.md (lesson text and integrated compound-interest program)",
    "corroborating_duplicate": "ssc/Module 1/Module 1_3_Intr to programming.pdf (near-identical 30-page copy, created earlier)",
    "duplicate_differences": [
        "The newer PDF makes x=1 explicit in the infinite-loop example; the older copy leaves the initial value implicit.",
        "The PDFs otherwise have the same lesson structure and nearly identical content, with minor heading/layout differences.",
        "The newer PDF's Print/print exercise labels capitalization as a semantic error, although Python treats the unmatched name as a runtime NameError. This faulty exercise is excluded as a source of category definitions or question keys."
    ],
    "scope_note": "The Markdown supplies the integrated compound-interest program; the PDFs supply the slide sequence and examples. The newer PDF is primary; the older PDF is used only to confirm the near-duplicate relationship."
}
objectives = Counter(x["objective"] for x in mcqs)
dump("lesson_plan.json", {
    "lesson": "Introduction to programming",
    "sources": source_map,
    "batch": {"mcq_count": len(mcqs), "structured_response_count": len(essays), "marks_per_response": 5},
    "objectives": dict(sorted(objectives.items())),
    "method": "Source-first pilot; balanced MCQ key positions; metadata-hidden content/key review; separate task-variety and Bloom review; code stimulus displayed in preview."
})
dump("essay_plan.json", {
    "recommendation": "8 structured-response prompts for this college-level introductory lesson",
    "rationale": "Eight provides focused coverage across hardware, programming process, syntax/semantics, language classification, translation models, and error diagnosis, with two applied code tasks. This is a pilot set rather than a full examination blueprint.",
    "marks_each": 5,
    "total_marks": sum(x["marks"] for x in essays),
    "coverage": {x["id"]: x["operation"] for x in essays}
})

bloom_anchors = [
    ("INTRO-002", "Remember", "retrieve and interpret the lecture's stated GHz example"),
    ("INTRO-008", "Apply", "identify a programming phase in a concrete situation"),
    ("INTRO-013", "Understand", "explain the shared meaning of two language statements"),
    ("INTRO-017", "Analyze", "infer the implication of independent classification axes"),
    ("INTRO-023", "Analyze", "coordinate four classification criteria for one language"),
    ("INTRO-034", "Apply", "trace execution up to a runtime failure"),
    ("INTRO-035", "Analyze", "explain why loop state preserves a condition"),
    ("INTRO-039", "Apply", "select an expression matching a specified grouping"),
    ("INTRO-E06", "Analyze", "distinguish concrete error causes and classifications"),
    ("INTRO-E07", "Apply", "trace a loop and repair its update"),
]
dump("bloom_review.json", {
    "note": "Provisional labels describe the operation actually required. Bloom labels are advisory, with no quota or forced distribution; same-session AI judgment is not independent validation.",
    "anchors": [{"id": i, "label": label, "reason": reason} for i, label, reason in bloom_anchors]
})
anchor_items = {x["id"]: x.get("question", x.get("prompt")) for x in mcqs + essays}
(ROOT / "blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id": i, "item": anchor_items[i]}, ensure_ascii=False) for i, _, _ in bloom_anchors) + "\n")

# Blind packets keep question content and stimuli, while hiding objectives, operations, keys and explanations.
blind_mcq = []
for x in mcqs:
    row = {"id": x["id"], "question": x["question"], "options": x["options"]}
    if x.get("stimulusCode") is not None:
        row["stimulusCode"] = x["stimulusCode"]
    blind_mcq.append(row)
(ROOT / "blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_mcq) + "\n")
blind_essays = [{"id": x["id"], "prompt": x["prompt"], "marks": x["marks"], "responseType": x["responseType"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT / "blind_essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_essays) + "\n")

# Content/key adjudication is separate from the blind question packet.
review = []
for x in mcqs:
    note = "Pass: one defensible keyed answer; distractors and explanation align with the cited source."
    disposition = "pass"
    if x["id"] == "INTRO-023":
        note = "Revised during blind key audit: original key selected the machine-language distractor; corrected to the high-level/OOP/general-purpose/interpreted option, then rechecked."
        disposition = "revised and pass"
    if x["id"] in {"INTRO-035", "INTRO-036", "INTRO-038"}:
        note += " The examples distinguish a nonterminating loop, an impossible Boolean condition, and a legal but inappropriate formula; the lesson's broader labels may overlap."
    review.append({"id": x["id"], "disposition": disposition, "key": x["expectedAnswer"], "source": x["source"], "review_note": note})
(ROOT / "item_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in review) + "\n")

essay_review = []
for x in essays:
    total = sum(c["points"] for c in x["rubric"])
    note = "Pass: prompt is answerable from the named lesson sources; five one-point rubric criteria match the expected response."
    if x["id"] == "INTRO-E06":
        note += " The cases use concrete examples because logical and semantic errors can overlap in broad descriptions."
    if x["id"] == "INTRO-E08":
        note += " Code stimulus includes all four inputs; numerical result independently recomputed as 11255.0881 amount and 1255.0881 interest, rounded to 11255.09 and 1255.09 EGP."
    essay_review.append({"id": x["id"], "disposition": "pass", "rubric_points": total, "source": x["source"], "review_note": note})
(ROOT / "essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in essay_review) + "\n")

# Render all source code stimuli exactly once, outside the prose stem.
def prompt_without_fenced_code(prompt, code=None):
    if "\n\n```python" in prompt:
        return prompt.split("\n\n```python", 1)[0].rstrip()
    if code and "\n\n" in prompt:
        return prompt.split("\n\n", 1)[0].rstrip()
    return prompt

parts = ["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Lesson 3 question preview</title>", "<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}h1,h2{line-height:1.2}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}.meta{color:#52606d;font-size:.9rem}</style><body><h1>Introduction to programming — question preview</h1><p>Draft batch: 40 MCQs and 8 structured responses. This preview displays code stimuli as code blocks.</p><h2>Multiple-choice questions</h2>"]
for x in mcqs:
    q = prompt_without_fenced_code(x["question"], x.get("stimulusCode"))
    parts.append(f"<article><h3>{html.escape(x['id'])}</h3><p>{html.escape(q).replace(chr(10), '<br>')}</p>")
    if x.get("stimulusCode"):
        parts.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
    parts.append("<ol type='A'>" + "".join(f"<li>{html.escape(opt)}</li>" for opt in x["options"]) + "</ol></article>")
parts.append("<h2>Structured-response questions</h2>")
for x in essays:
    prompt = prompt_without_fenced_code(x["prompt"], x.get("stimulusCode"))
    parts.append(f"<article><h3>{html.escape(x['id'])} · {x['marks']} marks</h3><p>{html.escape(prompt).replace(chr(10), '<br>')}</p>")
    if x.get("stimulusCode"):
        parts.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
    parts.append("</article>")
parts.append("</body></html>")
(ROOT / "question_preview.html").write_text("\n".join(parts))

positions = Counter(x["correctIndex"] for x in mcqs)
codes_mcq = sum(bool(x.get("stimulusCode")) for x in mcqs)
codes_essay = sum(bool(x.get("stimulusCode")) for x in essays)
length_cues = []
for x in mcqs:
    lengths = [len(s) for s in x["options"]]
    keylen = lengths[x["correctIndex"]]
    if keylen == min(lengths) and lengths.count(keylen) == 1:
        length_cues.append({"id": x["id"], "cue": "key uniquely shortest"})
    if keylen == max(lengths) and lengths.count(keylen) == 1:
        length_cues.append({"id": x["id"], "cue": "key uniquely longest"})
normalized = [re.sub(r"\W+", " ", x["question"].lower()).strip() for x in mcqs]
stem_counts = Counter(normalized)
audit = {
    "mcq_count": len(mcqs), "essay_count": len(essays),
    "mcq_four_options_each": all(len(x["options"]) == 4 for x in mcqs),
    "mcq_keys_valid_and_expected_answer_matches": all(0 <= x["correctIndex"] < len(x["options"]) and x["expectedAnswer"] == x["options"][x["correctIndex"]] for x in mcqs),
    "answer_positions_A_to_D": [positions[i] for i in range(4)],
    "code_displays_mcq": codes_mcq, "code_displays_essay": codes_essay,
    "preview_code_block_count": (ROOT / "question_preview.html").read_text().count("<pre><code>"),
    "essay_rubric_totals": {x["id"]: sum(c["points"] for c in x["rubric"]) for x in essays},
    "keyed_option_unique_length_cues": length_cues,
    "duplicate_normalized_stems": [stem for stem, count in stem_counts.items() if count > 1],
    "source_caveats_logged": True,
    "reviewer_independence": "Same-session AI review; useful as a consistency and coverage audit, not independent human validation."
}
dump("mechanical_audit.json", audit)

(ROOT / "review.md").write_text("""# MCQ content and key review\n\nAll 40 items were re-read in a metadata-hidden packet, then checked against the keyed answer, explanation, and source locator. The Python classification item INTRO-023 had an incorrect key in the first draft; the blind key pass caught it, the key was corrected, and the item was rechecked.\n\nThe error questions use concrete cases. The source sometimes discusses logical and semantic errors broadly; this batch keeps the nonterminating loop, impossible Boolean condition, and wrong area formula distinct by their specific cause. The newer PDF's capitalization exercise (Print/print) was not used because its stated category conflicts with Python's runtime behavior.\n\nSee `item_review.jsonl` for per-item dispositions and source notes, and `mechanical_audit.json` for counts and structural checks. Review was performed in the same AI session, so it is not independent human review.\n""")
(ROOT / "essay_review.md").write_text("""# Structured-response content and rubric review\n\nAll 8 prompts were reviewed against their expected responses and five-point rubrics. Each rubric sums to 5. The two code tasks are rendered with complete code stimuli; E08 includes the four inputs so the prompt is self-contained. The compound-interest result was recomputed for P=10000, R=12, T=1, n=4.\n\nConcrete examples in E06 make the categories assessable even though logical and semantic errors can overlap in broad descriptions. Per-prompt dispositions are in `essay_review.jsonl`. This was same-session AI review, not independent human review.\n""")
(ROOT / "variety_report.md").write_text("""# Task-variety review\n\nThe MCQs include component-role identification, concept distinctions, classification across independent language axes, execution-method comparison, code reading, tracing, error diagnosis, and expression selection. The structured responses add scenario mapping, algorithm planning, cross-language comparison, multi-axis justification, workflow comparison, classification, trace-and-repair, and an integrated program trace.\n\nCoverage is deliberately weighted toward language categories, execution models, and error types because those occupy much of the lesson. Hardware and programming-process items provide a smaller foundation. Eight five-mark responses provide a compact college-level pilot with applied explanations, rather than a full exam bank.\n""")
(ROOT / "README.md").write_text("""# Introduction to programming pilot\n\nThis pilot contains 40 MCQs and 8 structured-response questions, each worth 5 marks. It is based primarily on `ssc/Module 1/4. Module 1_4_Intr to programming.pdf`, with `ssc/Module 1/intro.md` as the text/code companion. The older `Module 1_3` PDF is recorded as a near-duplicate.\n\n## Files\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing draft items.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`: question-only review packets with objectives, operations, and keys hidden.\n- `item_review.jsonl`, `essay_review.jsonl`: review dispositions, answer/source audit notes.\n- `lesson_plan.json`, `essay_plan.json`: source and coverage plans.\n- `question_preview.html`: human-readable preview; code stimuli appear in actual code blocks.\n- `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`: audit record.\n\nReview is same-session AI review and should be treated as a careful pilot audit, not independent instructor or human validation.\n""")
print(json.dumps(audit, ensure_ascii=False, indent=2))
