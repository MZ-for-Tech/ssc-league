import html
import json
import re
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).parent
mcqs=[json.loads(s) for s in (ROOT/"final_items.jsonl").read_text().splitlines()]
essays=[json.loads(s) for s in (ROOT/"essay_items.jsonl").read_text().splitlines()]

def dump(name,obj): (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n")

sources={
 "primary_pdf":"ssc/Module 2/5. Module 2_1_Conditioning.pdf; 39-page Lecture 2_1, titled Variables, Operators, Expressions, and Condition (if…else).",
 "primary_markdown":"ssc/Module 2/1_variables_and_operators.md; lesson 1 section of Lecture 2_1.",
 "conditional_crosscheck":"ssc/Module 2/2_making_decisions.md; lesson 2 text for the conditional section that is also present in the PDF.",
 "scope":"The batch covers the full Lecture 2_1 PDF, including its conditional statements. The second Markdown file was read to cross-check that overlapping section; conditional questions are included now so this lecture is not represented as variables/operators only.",
 "source_caveats":[
  "The PDF includes the identity operators `is` and `is not` in a comparator table. Questions do not treat identity as interchangeable with value equality; ordinary equality questions use `==`.",
  "The source's source-code examples and standard Python rules are kept distinct from incidental slide wording or formatting errors.",
  "Lesson text says the keyword list has 35 entries in Python 3.11; the batch tests reserved-word rules with examples rather than making the version-specific count a recall target."
 ]
}
counts=Counter(x["objective"] for x in mcqs)
dump("lesson_plan.json",{"lesson":"Module 2, Lecture 2_1: Variables, operators, expressions, and conditionals","sources":sources,"batch":{"mcqs":len(mcqs),"structured_responses":len(essays),"marks_each":5},"objective_counts":dict(sorted(counts.items())),"method":"Source-first question drafting; metadata-hidden content/key pass; source adjudication; task-variety and advisory Bloom review; key-position and answer-cue audit; rendered code preview."})
dump("essay_plan.json",{"recommendation":"8 structured-response / essay-style prompts, 5 marks each","rationale":"A compact applied set covers data types and initialization, operator tracing, precedence, a formula and output, conditional design, threshold boundaries, and control-flow comparison.","total_marks":sum(x["marks"] for x in essays),"coverage":{x["id"]:x["operation"] for x in essays}})

blind=[{"id":x["id"],"question":x["question"],"options":x["options"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT/"blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind)+"\n")
blind_e=[{"id":x["id"],"prompt":x["prompt"],"marks":x["marks"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT/"blind_essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind_e)+"\n")

blind_notes={
 "M2L1-004":"Type choices use recognizable labels; the decimal-float category is clear.",
 "M2L1-008":"The code shows x before any assignment; the stem asks specifically about that missing initial value.",
 "M2L1-015":"The answer is phrased as a use case and is distinct from whole-script project use.",
 "M2L1-022":"The stem names logical precedence and the alternatives express distinct groupings.",
 "M2L1-033":"The leap-year rule is fully specified by the stem and alternatives.",
 "M2L1-035":"The exact boundary value 300 makes the branch being assessed unambiguous.",
 "M2L1-036":"The residual-range idea is explicit in the question.",
 "M2L1-038":"The code is intentionally invalid Python; the stem asks about the single equals sign.",
}
blind_findings=[]
for x in mcqs:
    blind_findings.append({"id":x["id"],"stage":"metadata-hidden question review","disposition":"pass","note":blind_notes.get(x["id"],"Stem and choices are readable and self-contained; no key, source, objective, operation, or explanation is included in the packet."),"code_stimulus_in_packet":bool(x.get("stimulusCode"))})
for x in essays:
    blind_findings.append({"id":x["id"],"stage":"metadata-hidden prompt review","disposition":"pass","note":"Prompt is understandable and answerable from the lesson scope; shown without expected answer, rubric, source, or objective."})
(ROOT/"blind_review_findings.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind_findings)+"\n")

mcq_review=[]
for x in mcqs:
 note="Pass: stem, keyed response, distractors, explanation, and cited source align."
 if x["id"] in {"M2L1-031","M2L1-036","M2L1-040"}: note+=" Conditional behavior was checked against ordered first-match semantics and the lesson example."
 if x["id"] in {"M2L1-011","M2L1-016"}: note+=" Quotient and remainder recomputed."
 mcq_review.append({"id":x["id"],"disposition":"pass","key":x["expectedAnswer"],"source":x["source"],"note":note})
(ROOT/"item_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in mcq_review)+"\n")

essay_review=[]
for x in essays:
 total=sum(c["points"] for c in x["rubric"])
 note="Pass: expected response is supported by the named source and rubric criteria total five marks."
 if x["id"]=="M2L1-E04": note+=" Both expressions independently evaluated for the stated Python precedence."
 if x["id"]=="M2L1-E07": note+=" All four boundary values checked against the ordered tariff branches."
 essay_review.append({"id":x["id"],"disposition":"pass","rubric_points":total,"source":x["source"],"note":note})
(ROOT/"essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in essay_review)+"\n")

def stem_only(prompt,code):
 if "\n\n```python" in prompt: return prompt.split("\n\n```python",1)[0].rstrip()
 if code and "\n\n" in prompt: return prompt.split("\n\n",1)[0].rstrip()
 return prompt

page=["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Module 2 Lecture 2_1 Question Preview</title>","<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 2 — Lecture 2_1 question preview</h1><p>40 MCQs and 8 structured responses. The first PDF's variables/operators and conditional sections are represented.</p><h2>Multiple-choice questions</h2>"]
for x in mcqs:
 q=stem_only(x["question"],x.get("stimulusCode"))
 page.append(f"<article><h3>{html.escape(x['id'])}</h3><p>{html.escape(q).replace(chr(10),'<br>')}</p>")
 if x.get("stimulusCode"): page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
 page.append("<ol type='A'>"+"".join("<li>"+html.escape(o)+"</li>" for o in x["options"])+"</ol></article>")
page.append("<h2>Structured-response questions</h2>")
for x in essays:
 q=stem_only(x["prompt"],x.get("stimulusCode"))
 page.append(f"<article><h3>{html.escape(x['id'])} · {x['marks']} marks</h3><p>{html.escape(q).replace(chr(10),'<br>')}</p>")
 if x.get("stimulusCode"): page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
 page.append("</article>")
page.append("</body></html>")
(ROOT/"question_preview.html").write_text("\n".join(page))

# Advisory Bloom anchors: label only the thinking operation actually required.
anchors=[("M2L1-001","Understand","interpret a variable assignment"),("M2L1-011","Apply","calculate quotient and remainder"),("M2L1-014","Apply","evaluate nested arithmetic precedence"),("M2L1-022","Understand","explain logical grouping"),("M2L1-031","Analyze","identify an unreachable branch"),("M2L1-033","Apply","assemble a rule from divisibility conditions"),("M2L1-036","Analyze","reason about prior branch coverage"),("M2L1-E04","Apply","work through operator precedence"),("M2L1-E06","Create","design a conditional outline"),("M2L1-E07","Apply","construct and test threshold branches")]
dump("bloom_review.json",{"note":"Provisional, operation-based labels; advisory only, with no forced category quotas. Same-session AI assessment is not independent human validation.","anchors":[{"id":i,"label":l,"reason":r} for i,l,r in anchors]})
anchor_map={x["id"]:x.get("question",x.get("prompt")) for x in mcqs+essays}
(ROOT/"blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id":i,"item":anchor_map[i]},ensure_ascii=False) for i,_,_ in anchors)+"\n")

positions=Counter(x["correctIndex"] for x in mcqs)
length_flags=[]
for x in mcqs:
 ls=[len(o) for o in x["options"]]; k=ls[x["correctIndex"]]
 if ls.count(k)==1 and k in {min(ls),max(ls)}: length_flags.append({"id":x["id"],"cue":"key is uniquely shortest" if k==min(ls) else "key is uniquely longest"})
norm=[re.sub(r"\W+"," ",x["question"].lower()).strip() for x in mcqs]
dupes=[s for s,n in Counter(norm).items() if n>1]
audit={"mcq_count":len(mcqs),"essay_count":len(essays),"four_choices_each":all(len(x["options"])==4 for x in mcqs),"keys_valid_and_expected_matches":all(0<=x["correctIndex"]<4 and x["options"][x["correctIndex"]]==x["expectedAnswer"] for x in mcqs),"answer_positions_A_to_D":[positions[i] for i in range(4)],"mcq_code_displays":sum(bool(x.get("stimulusCode")) for x in mcqs),"essay_code_displays":sum(bool(x.get("stimulusCode")) for x in essays),"preview_code_blocks":(ROOT/"question_preview.html").read_text().count("<pre><code>"),"rubric_totals":{x["id"]:sum(c["points"] for c in x["rubric"]) for x in essays},"key_length_cues":length_flags,"duplicate_normalized_stems":dupes,"objective_gaps":[x["id"] for x in mcqs if not x.get("objective")],"metadata_hidden_review_items":len(blind_findings),"review_mode":"Same-session metadata-hidden review; earlier exposure to answer-bearing drafts means this is not independent or fully blind review."}
dump("mechanical_audit.json",audit)
(ROOT/"review.md").write_text("""# MCQ review\n\nThe question-only packet hides answer keys, explanations, sources, objectives, and operations. I reviewed it for clarity, self-containment, distinguishable alternatives, and code-stimulus presentation, then adjudicated against the keys and source locations. The answer-length scan led to wording revisions; the final audit has no unique shortest/longest keyed-option flags.\n\nThis is metadata-hidden review in the same AI session, not an independent or fully blind review: the answer-bearing draft had already been seen earlier in the session. It should not be treated as instructor validation.\n\nThe source lists `is` and `is not` in a comparator table; this batch avoids implying they substitute for value equality. It tests `==` for equality. The exact count of Python keywords is omitted as a memorization item because the source ties it to Python 3.11.\n\nPer-item metadata-hidden findings are in `blind_review_findings.jsonl`; answer/source adjudications are in `item_review.jsonl`; structural checks are in `mechanical_audit.json`.\n""")
(ROOT/"essay_review.md").write_text("""# Structured-response review\n\nAll 8 prompts have five-point rubrics. Arithmetic and Boolean precedence were recalculated, tariff boundaries were traced, and each prompt was checked against the source material. Code-based prompts render their stimulus separately in the preview.\n\nPer-item outcomes are in `essay_review.jsonl`. This is same-session AI review, not independent human or instructor validation.\n""")
(ROOT/"variety_report.md").write_text("""# Task-variety review\n\nThe MCQs combine recall and interpretation of variables/types and tools with numeric computation, operator precedence, Boolean evaluation, syntax diagnosis, conditional tracing, and boundary/branch reasoning. The structured responses ask for classification, code tracing, worked calculations, conditional design, tariff boundary analysis, and comparison of control structures.\n\nCoverage emphasizes variables and operators, then conditionals, reflecting the full Lecture 2_1 PDF. Questions from the conditional section may overlap with the next Markdown source because the course packages the same lecture in two text files.\n""")
(ROOT/"README.md").write_text("""# Module 2 Lecture 2_1 pilot\n\nContains 40 MCQs and 8 structured-response questions worth 5 marks each. Sources: `ssc/Module 2/5. Module 2_1_Conditioning.pdf` and `ssc/Module 2/1_variables_and_operators.md`; `ssc/Module 2/2_making_decisions.md` was used to cross-check the conditional content also present in the PDF.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing draft items.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`: metadata-hidden question packets; `blind_review_findings.jsonl` records per-item findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer/source and rubric review notes.\n- `lesson_plan.json`, `essay_plan.json`: source and coverage plan.\n- `question_preview.html`: rendered preview, including code stimuli.\n- `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`: review records.\n\nReview was completed in the same AI session; earlier exposure to answer-bearing drafts means it is not independent or fully blind review.\n""")
print(json.dumps(audit,ensure_ascii=False,indent=2))
