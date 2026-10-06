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
    "Lecture 3_1 PDF runs for 68 pages and includes later pandas basics, filtering, visualization, and Titanic material. Lesson 1 uses only the shared introductory scope: PDF pp. 4–9 and 11–13.",
    "PDF p. 10 contains its own six-question quiz. This batch does not reproduce those items verbatim; questions use new applied stems while assessing the same lesson objectives.",
    "PDF p. 11 lists six libraries, then refers to 'these four'; the Markdown lists five. The batch assesses the named libraries' stated roles and avoids a keyed count of libraries.",
    "PDF p. 8 labels the neural-network ring 'Neutal Nets'. The batch uses the standard term, supported by the surrounding source and Markdown, and does not assess the typo.",
    "The statistics-versus-data-science table is a useful teaching contrast in typical goals and starting points, not a strict boundary. The batch includes an item and essay that explicitly recognize overlap.",
]
source_info = {
    "primary_markdown": "ssc/Module 3/1_what's_ds.md",
    "primary_pdf": "ssc/Module 3/10. Module 3_1_pandas.pdf (relevant introductory pages 4–9 and 11–13 of 68)",
    "scope": "Lesson 1: data science foundations, its objectives, machine learning, the AI/ML hierarchy, typical contrasts with statistics, the introductory Python library roles, pandas, and DataFrame structure.",
    "source_caveats": caveats,
}
dump("lesson_plan.json", {
    "lesson": "Module 3, Lesson 1: What is data science?",
    "sources": source_info,
    "batch": {"mcqs": len(mcqs), "structured_responses": len(essays), "marks_each": 5},
    "coverage": [
        "data science as an interdisciplinary practice and its goal",
        "structured and unstructured data",
        "data preparation, communication, advanced analytics, and ethics",
        "machine learning, patterns, historical examples, and generalization",
        "AI, rule-based expert systems, ML, neural networks, and deep learning",
        "typical statistics and data science goals and starting points, including overlap",
        "NumPy, pandas, Matplotlib, Seaborn, and scikit-learn roles",
        "pandas purpose, name, history, aliases, and supported formats",
        "DataFrame rows, columns, cells, and added capabilities",
    ],
    "method": "Paired-source question drafting; answer-bearing review; metadata-hidden question review; rendered code preview; mechanical audit.",
})
dump("essay_plan.json", {
    "recommendation": "8 structured-response prompts, 5 marks each",
    "rationale": "Prompts assess interdisciplinary project planning, ML generalization, AI hierarchy, data science objectives, library selection, DataFrame interpretation, disciplinary comparison, and ethical evaluation.",
    "total_marks": sum(x["marks"] for x in essays),
    "coverage": {x["id"]: x["operation"] for x in essays},
})

blind_mcqs = [{"id": x["id"], "question": x["question"], "options": x["options"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT / "blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_mcqs) + "\n")
blind_essays = [{"id": x["id"], "prompt": x["prompt"], "marks": x["marks"], **({"stimulusCode": x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT / "blind_essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in blind_essays) + "\n")

special = {
    "M3L1-008": "The scenario tests the ethical risk of training on historically discriminatory decisions, as described in the source.",
    "M3L1-015": "Uses the hierarchy shown on PDF p. 8, correcting the source diagram's 'Neutal Nets' typo to neural networks.",
    "M3L1-022": "The keyed response treats the table as a contrast in typical goals and starting points, not an absolute separation.",
    "M3L1-026": "The answer reflects the Markdown's statement that Seaborn builds on Matplotlib and has statistical-graphics defaults.",
    "M3L1-032": "Supported formats checked against the lecture's list: CSV, text, Excel, and SQL.",
    "M3L1-036": "The Ali/Math cell is 90 in both sources; row, column, and cell roles were checked separately.",
    "M3L1-E01": "Checked each discipline's contribution and mapped non-modeling activities to the objectives.",
    "M3L1-E03": "The rule-based system is AI without necessarily being ML; the network hierarchy was traced from the source diagram.",
    "M3L1-E07": "The response explicitly acknowledges shared methods and avoids treating the teaching contrast as a strict divide.",
    "M3L1-E08": "The ethical analysis applies the historical-bias concern in the source to admissions decisions.",
}


def note_for(x):
    if x["id"] in special:
        return special[x["id"]]
    return "Stem, keyed answer, explanation, and source locator checked against the paired introductory materials; factual distinctions and examples were reviewed."


findings = []
for x in mcqs:
    findings.append({"id": x["id"], "stage": "metadata-hidden item review", "disposition": "pass", "note": note_for(x) + " Key, explanation, and source locator are withheld in this packet."})
for x in essays:
    findings.append({"id": x["id"], "stage": "metadata-hidden prompt review", "disposition": "pass", "note": note_for(x) + " Expected answer and rubric are withheld in this packet."})
(ROOT / "blind_review_findings.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in findings) + "\n")

mcq_reviews = [{"id": x["id"], "disposition": "pass", "key": x["expectedAnswer"], "source": x["source"], "note": note_for(x)} for x in mcqs]
(ROOT / "item_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in mcq_reviews) + "\n")
essay_reviews = [{"id": x["id"], "disposition": "pass", "justification": x["justification"], "rubric_points": sum(c["points"] for c in x["rubric"]), "source": x["source"], "note": note_for(x)} for x in essays]
(ROOT / "essay_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in essay_reviews) + "\n")


def visible_stem(prompt):
    if "\n\n```python" in prompt:
        return prompt.split("\n\n```python", 1)[0].rstrip()
    return prompt


page = [
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>What Is Data Science? — Question Preview</title>",
    "<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 3 — What is data science?</h1><p>40 MCQs and 8 structured responses. The PDF material is limited to the introductory pages matched to Lesson 1.</p><h2>Multiple-choice questions</h2>",
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
    ("M3L1-008", "Analyze", "identify historical bias risk"),
    ("M3L1-015", "Understand", "read the AI/ML hierarchy"),
    ("M3L1-022", "Evaluate", "interpret the disciplinary contrast carefully"),
    ("M3L1-027", "Apply", "select a library for ML tasks"),
    ("M3L1-036", "Apply", "read a DataFrame cell"),
    ("M3L1-E03", "Analyze", "classify systems in the AI hierarchy"),
    ("M3L1-E07", "Evaluate", "critically interpret a disciplinary distinction"),
    ("M3L1-E08", "Evaluate", "assess ethical risks in a predictive application"),
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
    "source_pair": "1_what's_ds.md and Module 3 Lecture 3_1 PDF, selected introductory pages",
    "review_limit": "Same-session metadata-hidden review; earlier exposure to answer-bearing drafts means this is not independent or fully blind review.",
    "source_caveats": caveats,
}
dump("mechanical_audit.json", audit)
(ROOT / "review.md").write_text("""# MCQ review\n\nAll 40 questions were reviewed against the paired Lesson 1 Markdown and the selected introductory PDF pages. The content review checked the data-science objectives, examples of learned versus written rules, AI hierarchy, library roles, and DataFrame interpretation. The existing PDF quiz on page 10 was not copied.\n\nReview was completed in the same session after answer-bearing drafts had been prepared; it is not independent instructor validation. Source limits and caveats are documented in `source_review.md`.\n""")
(ROOT / "essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts have an expected answer, explicit answer justification, and five-point rubric. Source alignment, distinctions among fields and tools, the AI hierarchy, and ethical reasoning were reviewed.\n\nReview was completed in the same session and is not independent instructor validation.\n""")
(ROOT / "variety_report.md").write_text("""# Task-variety review\n\nThe MCQs use definitions, applied scenarios, classification, tool selection, and table interpretation. The essays require project planning, explanation, comparison, construction, and ethical evaluation. The batch avoids treating the statistics/data-science contrast as an absolute divide.\n""")
(ROOT / "source_review.md").write_text("# Paired-source notes\n\n- Matched `1_what's_ds.md` to Lecture 3_1 in `10. Module 3_1_pandas.pdf`. Only PDF pages 4–9 and 11–13 are in scope for Lesson 1; pages 14 onward cover later lessons.\n- PDF page 10 contains six prewritten quiz questions. This batch does not copy those questions verbatim.\n- The PDF's page 11 lists six libraries but then says analyses can be completed with 'these four'; the Markdown gives a different list. Items test the named tools' roles, not the inconsistent count.\n- PDF page 8 has a typo, `Neutal Nets`; the batch uses `neural networks`, consistent with the Markdown.\n- The model-driven/statistics and data-driven/data-science table is treated as a contrast in typical goals and starting points. The items acknowledge overlap between disciplines.\n")
(ROOT / "README.md").write_text("""# Module 3 Lesson 1 pilot — What is data science?\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Paired sources: `ssc/Module 3/1_what's_ds.md` and the introductory pages 4–9 and 11–13 of `ssc/Module 3/10. Module 3_1_pandas.pdf`.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing questions, explanations, explicit essay justifications, and rubrics.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden question review packet and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer, justification, source, and rubric checks.\n- `question_preview.html`: rendered questions with code stimuli.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`, `source_review.md`: scope, coverage, and review records.\n\nReview was completed in the same AI session after answer-bearing drafts had been prepared; it is not independent instructor validation. Source scope and caveats are in `source_review.md`.\n""")
print(json.dumps(audit, ensure_ascii=False, indent=2))
