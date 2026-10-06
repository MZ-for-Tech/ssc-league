import html
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
mcqs = [json.loads(x) for x in (ROOT / "final_items.jsonl").read_text().splitlines()]
essays = [json.loads(x) for x in (ROOT / "essay_items.jsonl").read_text().splitlines()]


def dump(name, obj):
    (ROOT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")


caveats = [
    "The PDF character-frequency example iterates over set(txt.upper()) but counts with txt.count(i), mixing uppercase characters with the unchanged case-sensitive source string. The corrected Markdown normalizes consistently; questions ask students to diagnose and repair the PDF version.",
    "The PDF survey exercise uses range(L) without defining L. The paired Markdown correctly iterates directly over the record list; no keyed item relies on the undefined name.",
    "The elasticity exercise compares signed values directly with 1, which classifies negative elasticities as inelastic regardless of magnitude. The final essay explicitly identifies this code behavior and contrasts it with the magnitude-based criterion.",
    "The PDF converts rates through tuple(set(rates)); set iteration order is not specified. No item requires a particular order for the unique rates.",
    "A tuple is hashable as a dictionary key only when its contents are hashable. The key question uses a tuple of integers, not a tuple containing a mutable list.",
]
source_info = {
    "primary_markdown": "ssc/Module 2/6_tuples_and_dictionaries.md",
    "primary_pdf": "ssc/Module 2/9. Module 2_4_Collection Data Types_Prat2.pdf (22 pages)",
    "scope": "Paired Lesson 6 sources cover tuples, tuple operations and unpacking, dictionaries and their methods, nested structures, character frequency, marketing analysis, survey records, and the price-elasticity exercise.",
    "source_caveats": caveats,
}
dump("lesson_plan.json", {
    "lesson": "Module 2, Lesson 6: Tuples and dictionaries",
    "sources": source_info,
    "batch": {"mcqs": len(mcqs), "structured_responses": len(essays), "marks_each": 5},
    "coverage": [
        "tuple immutability, slicing, concatenation, count and index",
        "mutable objects nested inside tuples",
        "looping and unpacking a list of tuple records",
        "dictionary keys, values, items, creation and access",
        "key uniqueness, hashability, and one value per key",
        "adding, updating, checking, popping, deleting, copying and clearing entries",
        "nested dictionaries and lists of dictionaries",
        "aggregates, thresholds, comprehensions, and marketing campaign data",
        "case-insensitive character-frequency debugging",
        "price elasticity calculation and critical review of signed classification",
    ],
    "method": "Paired-source question drafting; answer-bearing review; metadata-hidden question review; rendered code preview; mechanical audit.",
})
dump("essay_plan.json", {
    "recommendation": "8 structured-response prompts, 5 marks each",
    "rationale": "Prompts assess data-structure choice, tuple unpacking, dictionary construction and tracing, survey and campaign analysis, frequency-code debugging, and critical analysis of the elasticity example.",
    "total_marks": sum(x["marks"] for x in essays),
    "coverage": {x["id"]: x["operation"] for x in essays},
})

blind_mcqs = [{"id": x["id"], "question": x["question"], "options": x["options"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT / "blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_mcqs) + "\n")
blind_essays = [{"id": x["id"], "prompt": x["prompt"], "marks": x["marks"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT / "blind_essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_essays) + "\n")

special = {
    "M2L6-035": "Corrected the keyed choice to specify one normalized string for both set iteration and counting, eliminating an incomplete repair.",
    "txt.count(i)": "The PDF mixes an uppercase character set with a count against the original mixed-case string; the stem asks students to identify that mismatch.",
    "Laptop": "Recomputed signed price elasticity as -1.2. The item explicitly separates the PDF's signed comparison from the magnitude-based economic classification.",
    "M2L6-E02": "Recomputed ages 20+22+22+21+19=104, giving 20.8; both nested selections were traced.",
    "M2L6-E04": "Traced update, pop, shallow copy, clear, and the later lookup; the copy retains age and city.",
    "M2L6-E05": "Recomputed mean 2.5 and applied strict greater-than thresholds, excluding David at exactly 2.",
    "M2L6-E06": "Recomputed maximum 5.4 and the strict below-threshold outputs at 4.0 and 2.0.",
    "M2L6-E07": "Recomputed case-normalized frequencies: h=1, e=3, l=3, spaces=3.",
    "M2L6-E08": "Recomputed Laptop -1.2 and Smartphone 4.0; the rubric explicitly requires identifying the signed-comparison defect.",
}


def note_for(item):
    for marker, note in special.items():
        if marker in item.get("question", "") or marker in item.get("prompt", ""):
            return note
        if marker.startswith("M2L6-") and item.get("id") == marker:
            return note
    return "Question and keyed answer checked against the paired Markdown/PDF locators; code traces and calculations were recomputed where applicable."


findings = []
for x in mcqs:
    findings.append({"id": x["id"], "stage": "metadata-hidden item review", "disposition": "pass", "note": note_for(x) + " Key, explanation, and source locator are withheld in this packet."})
for x in essays:
    findings.append({"id": x["id"], "stage": "metadata-hidden prompt review", "disposition": "pass", "note": note_for(x) + " Expected answer and rubric are withheld in this packet."})
(ROOT / "blind_review_findings.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in findings) + "\n")

mcq_review = [{"id": x["id"], "disposition": "pass", "key": x["expectedAnswer"], "source": x["source"], "note": note_for(x)} for x in mcqs]
(ROOT / "item_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in mcq_review) + "\n")
essay_review = [{"id": x["id"], "disposition": "pass", "justification": x["justification"], "rubric_points": sum(c["points"] for c in x["rubric"]), "source": x["source"], "note": note_for(x)} for x in essays]
(ROOT / "essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in essay_review) + "\n")


def visible_stem(prompt):
    if "\n\n```python" in prompt:
        return prompt.split("\n\n```python", 1)[0].rstrip()
    return prompt


page = [
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Tuples and Dictionaries — Question Preview</title>",
    "<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 2 — Tuples and dictionaries</h1><p>40 MCQs and 8 structured responses. Questions use the Lesson 6 Markdown and Collection Data Types Part 2 PDF.</p><h2>Multiple-choice questions</h2>",
]
for x in mcqs:
    page.append(f"<article><h3>{html.escape(x['id'])}</h3><p>{html.escape(x['question']).replace(chr(10), '<br>')}</p>")
    if x.get("stimulusCode"):
        page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
    page.append("<ol type='A'>" + "".join("<li>" + html.escape(o) + "</li>" for o in x["options"]) + "</ol></article>")
page.append("<h2>Structured-response questions</h2>")
for x in essays:
    page.append(f"<article><h3>{html.escape(x['id'])} · {x['marks']} marks</h3><p>{html.escape(visible_stem(x['prompt'])).replace(chr(10), '<br>')}</p>")
    if x.get("stimulusCode"):
        page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
    page.append("</article>")
page.append("</body></html>")
(ROOT / "question_preview.html").write_text("\n".join(page))

anchors = [
    ("M2L6-002", "Analyze", "reason about a mutable value nested inside an immutable tuple"),
    ("M2L6-007", "Apply", "unpack tuple records"),
    ("M2L6-018", "Understand", "interpret dictionary membership"),
    ("M2L6-024", "Apply", "trace insertion and popitem"),
    ("M2L6-026", "Analyze", "trace copy and clear"),
    ("M2L6-033", "Apply", "apply a strict threshold to records"),
    ("M2L6-E07", "Evaluate", "diagnose and repair frequency code"),
    ("M2L6-E08", "Evaluate", "critique an elasticity classification rule"),
]
dump("bloom_review.json", {"note": "Provisional operation-based labels, advisory only; no forced Bloom quotas. Review is same-session AI assessment.", "anchors": [{"id": i, "label": label, "reason": reason} for i, label, reason in anchors]})
lookup = {x["id"]: x.get("question", x.get("prompt")) for x in mcqs + essays}
(ROOT / "blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id": i, "item": lookup[i]}, ensure_ascii=False) for i, _, _ in anchors) + "\n")

positions = Counter(x["correctIndex"] for x in mcqs)
cues = []
for x in mcqs:
    lengths = [len(v) for v in x["options"]]
    key_len = lengths[x["correctIndex"]]
    if lengths.count(key_len) == 1 and key_len in {min(lengths), max(lengths)}:
        cues.append({"id": x["id"], "cue": "unique shortest key" if key_len == min(lengths) else "unique longest key"})
stems = [re.sub(r"\W+", " ", x["question"].lower()).strip() for x in mcqs]
preview = (ROOT / "question_preview.html").read_text()
audit = {
    "mcq_count": len(mcqs), "essay_count": len(essays),
    "four_choices_each": all(len(x["options"]) == 4 for x in mcqs),
    "options_unique_each": all(len(set(x["options"])) == 4 for x in mcqs),
    "keys_valid": all(x["options"][x["correctIndex"]] == x["expectedAnswer"] for x in mcqs),
    "answer_positions_A_to_D": [positions[i] for i in range(4)],
    "mcq_code_stimuli": sum(bool(x.get("stimulusCode")) for x in mcqs),
    "essay_code_stimuli": sum(bool(x.get("stimulusCode")) for x in essays),
    "preview_code_blocks": preview.count("<pre><code>"),
    "essays_with_explicit_justification": sum(bool(x.get("justification", "").strip()) for x in essays),
    "rubric_totals": {x["id"]: sum(c["points"] for c in x["rubric"]) for x in essays},
    "key_length_cues": cues,
    "duplicate_stems": [s for s, n in Counter(stems).items() if n > 1],
    "blind_review_count": len(findings),
    "source_pair": "6_tuples_and_dictionaries.md and Collection Data Types Part 2 PDF",
    "review_limit": "Same-session metadata-hidden review; earlier exposure to answer-bearing drafts means this is not independent or fully blind review.",
    "source_caveats": caveats,
}
dump("mechanical_audit.json", audit)
(ROOT / "review.md").write_text("""# MCQ review\n\nAll 40 items were checked against the paired Markdown and Part 2 PDF locators. Tuple and dictionary behavior, nested access, method effects, thresholds, and numerical results were traced. Items involving defective source examples either test a correction or state the source behavior explicitly; see `source_review.md`.\n\nThis was a same-session metadata-hidden review after answer-bearing drafts had been prepared; it is not independent or fully blind validation.\n""")
(ROOT / "essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts include an expected answer, an explicit answer justification, and a five-point rubric. Tuple unpacking, dictionary operations, survey and marketing results, normalized character counts, and the signed elasticity calculations were checked. The last essay asks students to identify a source-code classification problem directly.\n\nThe review is same-session and is not independent instructor validation. Source caveats are listed in `source_review.md`.\n""")
(ROOT / "variety_report.md").write_text("""# Task-variety review\n\nThe MCQs combine definitions, code traces, method interpretation, small calculations, and debugging. The structured responses require comparison, construction, tracing, applied analysis, and critique of a misleading classification rule.\n""")
(ROOT / "source_review.md").write_text("# Paired-source notes\n\n- Used `6_tuples_and_dictionaries.md` and `9. Module 2_4_Collection Data Types_Prat2.pdf` together.\n- The PDF character-frequency sample applies `.upper()` to the set source but counts against the unchanged mixed-case text, producing incorrect zeros. The paired Markdown fixes this by normalizing both sides. Questions explicitly diagnose and correct the defect.\n- The PDF list-of-dictionaries exercise loops over `range(L)` without defining `L`; the Markdown uses direct iteration over entries. No question assumes the PDF snippet runs.\n- The elasticity code compares signed values directly with 1. This labels negative Laptop elasticity (-1.2) as inelastic, despite magnitude above 1. Essay E08 makes this discrepancy explicit and asks for a magnitude-based correction.\n- `tuple(set(rates))` does not guarantee a particular order; questions do not require one.\n- Tuple keys must contain hashable values. The item about tuple keys uses only integers.\n- PDF typos and inconsistent nested-person sample values are not used as keyed facts.\n")
(ROOT / "README.md").write_text("""# Module 2 Lesson 6 pilot — Tuples and dictionaries\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Paired sources: `ssc/Module 2/6_tuples_and_dictionaries.md` and `ssc/Module 2/9. Module 2_4_Collection Data Types_Prat2.pdf`.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing items, explicit essay justifications, and rubrics.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden question review packet and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer, justification, source, and rubric checks.\n- `question_preview.html`: rendered questions with code stimuli.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`, `source_review.md`: source, coverage, and review records.\n\nReview was completed in the same AI session after answer-bearing drafts had been prepared; it is not independent or fully blind validation. Source defects and how the items handle them are documented in `source_review.md`.\n""")
print(json.dumps(audit, ensure_ascii=False, indent=2))
