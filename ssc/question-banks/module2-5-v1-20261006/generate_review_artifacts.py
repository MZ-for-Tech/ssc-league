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


source_caveats = [
    "The Part 1 PDF's method table gives remove(x, value); the valid list method is remove(value). No item uses the incorrect signature.",
    "The Part 1 PDF contains a malformed odd-number comprehension written with range(1:n). The batch uses valid Python syntax and does not present that typo as valid code.",
    "The PDF has extraction/quotation defects in a string example; no item depends on the defective snippet.",
    "copy() creates a shallow copy. The batch only makes claims about top-level list behavior and does not imply a deep copy.",
    "Part 2 of the collection-types lecture covers tuples and dictionaries and is reserved for Lesson 6; it is not used for this batch.",
]
source_info = {
    "primary_markdown": "ssc/Module 2/5_lists_and_strings.md",
    "primary_pdf": "ssc/Module 2/8. Module 2_4_Collection Data Types_Prat1.pdf (Part 1, 37 pages)",
    "scope": "The batch uses the Lesson 5 Markdown and the matching Part 1 PDF. Together they cover lists, slicing, aliasing and copies, list operations, sorting, medians, GDP growth, comprehensions, string operations and applied data-cleaning examples including email domains and Gini calculations.",
    "source_caveats": source_caveats,
}
dump("lesson_plan.json", {
    "lesson": "Module 2, Lesson 5: Lists and strings",
    "sources": source_info,
    "batch": {"mcqs": len(mcqs), "structured_responses": len(essays), "marks_each": 5},
    "coverage": [
        "list properties, mixed values, indexing, negative indices and nested lists",
        "slicing, omitted endpoints, negative steps, aliasing, shallow copies",
        "append, extend, concatenation, removal, count, reverse, sort and sorted",
        "key functions, medians for odd and even lengths",
        "GDP growth rates and adjacent observations",
        "list comprehensions and compound filters",
        "string case conversion, splitting, searching, joining, stripping and digit checks",
        "word density, email-provider extraction, uniqueness and case normalization",
        "Gini coefficient calculation and interpretation",
    ],
    "method": "Paired-source question drafting; answer-bearing review; metadata-hidden question review; rendered code preview; mechanical audit.",
})
dump("essay_plan.json", {
    "recommendation": "8 structured-response prompts, 5 marks each",
    "rationale": "Prompts assess slice tracing, aliasing and copying, list growth operations, median design, growth calculations, comprehensions, string analysis, and robust domain extraction.",
    "total_marks": sum(x["marks"] for x in essays),
    "coverage": {x["id"]: x["operation"] for x in essays},
})

blind = [{"id": x["id"], "question": x["question"], "options": x["options"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT / "blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind) + "\n")
blind_essays = [{"id": x["id"], "prompt": x["prompt"], "marks": x["marks"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT / "blind_essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_essays) + "\n")

special = {
    "M2L5-026": "Replaced a near-duplicate distractor; the three incorrect options now express distinct misunderstandings of split().",
    "M2L5-033": "Replaced a near-duplicate distractor and balanced the options so the answer is not cued by a conspicuously shorter phrase.",
    "M2L5-034": "Replaced a semantically equivalent distractor with distinct misconceptions about sorted() and mutation.",
    "M2L5-040": "Replaced a near-duplicate distractor; only the keyed option describes normalizing both sides of the comparison.",
    "M2L5-010": "Assignment aliases the same list; the append is visible through y.",
    "M2L5-012": "append adds one nested object while extend iterates over the three supplied elements.",
    "M2L5-019": "reverse flips the existing order; sort(reverse=True) compares values in descending order.",
    "M2L5-020": "sorted returns a new list, leaving the original list's order unchanged.",
    "M2L5-024": "Recomputed: (2.3-2.1)/2.1×100 is approximately 9.52%.",
    "M2L5-025": "The sorted values are [2500, 2800, 3200, 4000, 5000], whose center is 3200.",
    "M2L5-032": "The headline has 11 whitespace-separated words; 1/11×100 rounds to 9.09%.",
    "M2L5-040": "Both the source values and the comparison labels need the same case normalization for case-insensitive matching.",
    "M2L5-E01": "All three slices were traced: [20,30,40], [50,60,70], and the seven values in reverse order.",
    "M2L5-E04": "Recomputed both cases: sorted odd sample has center 3200; the even sample's center pair is 4 and 8, giving 6.",
    "M2L5-E05": "Recomputed each adjacent percentage using the previous observation as denominator: 9.52%, 13.04%, 11.54%.",
    "M2L5-E07": "Checked string length 54, split count 11, absent find result -1, and density 1/11×100=9.09%.",
    "M2L5-E08": "The algorithm skips missing @ entries, extracts the suffix after @, de-duplicates, and sorts the two resulting domains.",
}
findings = []
for x in mcqs:
    findings.append({"id": x["id"], "stage": "metadata-hidden item review", "disposition": "pass", "note": special.get(x["id"], "The stem and options are clear and answerable from the paired Lesson 5 sources; key, explanation, and source locator are withheld in this packet.")})
for x in essays:
    findings.append({"id": x["id"], "stage": "metadata-hidden prompt review", "disposition": "pass", "note": special.get(x["id"], "The prompt is clear and answerable from the paired Lesson 5 sources; expected answer and rubric are withheld in this packet.")})
(ROOT / "blind_review_findings.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in findings) + "\n")

item_reviews = []
for x in mcqs:
    item_reviews.append({"id": x["id"], "disposition": "pass", "key": x["expectedAnswer"], "source": x["source"], "note": special.get(x["id"], "Answer and explanation checked against the cited Markdown/PDF section; code traces and calculations recomputed where applicable.")})
(ROOT / "item_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in item_reviews) + "\n")
essay_reviews = []
for x in essays:
    essay_reviews.append({"id": x["id"], "disposition": "pass", "justification": x["justification"], "rubric_points": sum(c["points"] for c in x["rubric"]), "source": x["source"], "note": special.get(x["id"], "Expected response, explicit answer justification, source alignment, and five-point rubric checked; calculations or code traces recomputed where applicable.")})
(ROOT / "essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in essay_reviews) + "\n")


def visible_stem(prompt):
    if "\n\n```python" in prompt:
        return prompt.split("\n\n```python", 1)[0].rstrip()
    return prompt


page = [
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Lists and Strings — Question Preview</title>",
    "<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 2 — Lists and strings</h1><p>40 MCQs and 8 structured responses. Questions use the Lesson 5 Markdown and Collection Data Types Part 1 PDF.</p><h2>Multiple-choice questions</h2>",
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
    ("M2L5-005", "Apply", "index a nested list"),
    ("M2L5-010", "Analyze", "trace aliasing and mutation"),
    ("M2L5-012", "Analyze", "compare list growth operations"),
    ("M2L5-024", "Apply", "calculate a percentage change"),
    ("M2L5-027", "Understand", "interpret a filtered comprehension"),
    ("M2L5-040", "Analyze", "explain case normalization"),
    ("M2L5-E04", "Apply", "design and apply an odd/even median function"),
    ("M2L5-E08", "Create", "design a provider-extraction function"),
]
dump("bloom_review.json", {"note": "Provisional operation-based labels, advisory only; no forced Bloom quotas. Review is same-session AI assessment.", "anchors": [{"id": i, "label": label, "reason": reason} for i, label, reason in anchors]})
lookup = {x["id"]: x.get("question", x.get("prompt")) for x in mcqs + essays}
(ROOT / "blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id": i, "item": lookup[i]}, ensure_ascii=False) for i, _, _ in anchors) + "\n")

positions = Counter(x["correctIndex"] for x in mcqs)
cues = []
for x in mcqs:
    lengths = [len(v) for v in x["options"]]
    key_length = lengths[x["correctIndex"]]
    if lengths.count(key_length) == 1 and key_length in {min(lengths), max(lengths)}:
        cues.append({"id": x["id"], "cue": "unique shortest key" if key_length == min(lengths) else "unique longest key"})
stems = [re.sub(r"\W+", " ", x["question"].lower()).strip() for x in mcqs]
preview = (ROOT / "question_preview.html").read_text()
audit = {
    "mcq_count": len(mcqs),
    "essay_count": len(essays),
    "four_choices_each": all(len(x["options"]) == 4 for x in mcqs),
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
    "source_pair": "5_lists_and_strings.md and Collection Data Types Part 1 PDF",
    "review_limit": "Same-session metadata-hidden review; earlier exposure to answer-bearing drafts means this is not independent or fully blind review.",
    "source_caveats": source_caveats,
}
dump("mechanical_audit.json", audit)
(ROOT / "review.md").write_text("""# MCQ review\n\nAll 40 items were checked against their Markdown and Part 1 PDF locators. List behavior, slice boundaries, mutation and copying, string operations, and the numerical examples were traced or recalculated where applicable. The metadata-hidden packet withholds keys, explanations, and locators.\n\nThis was a same-session metadata-hidden review after answer-bearing drafts had been prepared; it is not independent or fully blind validation. Source caveats and scope exclusions are recorded in `source_review.md`.\n""")
(ROOT / "essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts include an expected answer, an explicit justification for that answer, and a five-point rubric. Code traces and the median, GDP growth, and string-density calculations were checked against the paired sources.\n\nThe review is same-session and is not independent instructor validation. Source caveats are listed in `source_review.md`.\n""")
(ROOT / "variety_report.md").write_text("""# Task-variety review\n\nThe MCQs span conceptual checks, code traces, boundary interpretation, calculations, and applied data processing. The structured responses require tracing, explaining, designing functions or comprehensions, and calculating results.\n""")
(ROOT / "source_review.md").write_text("# Paired-source notes\n\n- Used `5_lists_and_strings.md` and `8. Module 2_4_Collection Data Types_Prat1.pdf` (Part 1) together.\n- Part 1 covers lists and strings, with worked examples and exercises for median, GDP growth, word density, email domains, and Gini calculations.\n- The PDF list-method table has a malformed `remove(x, value)` signature. The valid method takes the value to remove; no question adopts the typo.\n- The PDF odd-number comprehension has malformed `range(1:n)` syntax. Questions use valid Python and do not treat this snippet as runnable.\n- A PDF string example has extraction/quotation defects and was excluded from keyed questions.\n- `copy()` is shallow; questions only assess top-level list mutation.\n- Collection Data Types Part 2 covers tuples and dictionaries and belongs to Lesson 6; it is outside this batch.\n")
(ROOT / "README.md").write_text("""# Module 2 Lesson 5 pilot — Lists and strings\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Paired sources: `ssc/Module 2/5_lists_and_strings.md` and `ssc/Module 2/8. Module 2_4_Collection Data Types_Prat1.pdf` (Part 1).\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing items, explicit essay justifications, and rubrics.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden question review packet and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer, justification, source, and rubric checks.\n- `question_preview.html`: rendered questions with code stimuli.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`, `source_review.md`: source, coverage, and review records.\n\nReview was completed in the same AI session after answer-bearing drafts had been prepared; it is not independent or fully blind validation. Part 2 on tuples and dictionaries is reserved for Lesson 6.\n""")
print(json.dumps(audit, ensure_ascii=False, indent=2))
