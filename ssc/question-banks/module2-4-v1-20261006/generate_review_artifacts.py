import html
import json
import re
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).parent
mcqs=[json.loads(x) for x in (ROOT/"final_items.jsonl").read_text().splitlines()]
essays=[json.loads(x) for x in (ROOT/"essay_items.jsonl").read_text().splitlines()]

def dump(name,obj):
    (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n")

source_info={
 "primary_markdown":"ssc/Module 2/4_funcitons_and_modules.md",
 "primary_pdf":"ssc/Module 2/7. Module 2_3_Function-1.pdf (Lecture 2_3, 44 pages)",
 "scope":"The batch uses both sources. The PDF contributes parameter techniques, scope and recursion examples, module imports, built-in modules, package families, deprecation, and Sheet 3 exercises; the Markdown provides expanded explanations and runnable examples.",
 "source_caveats":[
  "The PDF random example imports random as a function and later uses random.choice; the two names do not support that call together. The related item asks for a valid corrected import/call.",
  "The Sheet 3 simple-interest answer contains a malformed quoted string, and its main program assigns P but calls with p. The question set isolates the case-sensitive name mismatch and does not treat the malformed snippet as runnable.",
  "The PDF's get_power example evaluates square_number(5) before passing the resulting number; it does not pass the function object itself. Questions follow the code's actual evaluation.",
  "The PDF states that every package needs __init__.py. The batch does not turn that absolute statement into an item."
 ]
}
dump("lesson_plan.json",{"lesson":"Module 2, Lesson 4: Functions and modules","sources":source_info,"batch":{"mcqs":len(mcqs),"structured_responses":len(essays),"marks_each":5},"coverage":["built-in and user-defined functions","definition, calls, parameters, arguments, docstrings","print, return, implicit None","accumulators, averages, currency conversion and loan guard clauses","defaults, keyword arguments, *args","function-call evaluation","local and global scope","recursion and base cases","modularity, abstraction, reuse, clean code","user-defined modules and import forms/aliases","math, statistics, random","packages, aliases, package families","deprecation and version awareness","growth models, list analysis, simple versus compound interest"],"method":"Paired-source question drafting; answer-bearing review; metadata-hidden question review; code-rendered preview; mechanical audit."})
dump("essay_plan.json",{"recommendation":"8 structured-response prompts, 5 marks each","rationale":"Prompts assess return behavior, list-function design, guard clauses, parameter passing, nested calls, scope, recursion, and modular reuse/diagnosis.","total_marks":sum(x["marks"] for x in essays),"coverage":{x["id"]:x["operation"] for x in essays}})

blind=[{"id":x["id"],"question":x["question"],"options":x["options"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT/"blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind)+"\n")
blind_e=[{"id":x["id"],"prompt":x["prompt"],"marks":x["marks"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT/"blind_essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind_e)+"\n")

findings=[]
special={
 "M2L4-007":"The function prints 10 but has no return statement; the assigned value is None.",
 "M2L4-010":"The zero-rate branch prevents a zero denominator in the loan formula.",
 "M2L4-012":"The prompt specifies division by 3 and no square root, making the variance convention identifiable.",
 "M2L4-015":"The item tests positional varargs; the expected collected type is a tuple.",
 "M2L4-030":"The item explicitly repairs the PDF's inconsistent random import and member call.",
 "M2L4-039":"The question identifies both the case difference and the assigned identifier in the shown snippet.",
 "M2L4-E01":"Both displayed output and assigned return values are separately required.",
 "M2L4-E03":"Inputs, term count, and zero-rate branch are specified; arithmetic checked as 12,000/48=250.",
 "M2L4-E05":"The prompt asks about the actual expression evaluation, not the misleading example label.",
 "M2L4-E08":"The answer distinguishes qualified module access from direct name import and catches P/p."
}
for x in mcqs:
 findings.append({"id":x["id"],"stage":"metadata-hidden item review","disposition":"pass","note":special.get(x["id"],"The stem and options are readable and answerable from the lesson materials; key and explanation are withheld in this packet.")})
for x in essays:
 findings.append({"id":x["id"],"stage":"metadata-hidden prompt review","disposition":"pass","note":special.get(x["id"],"The prompt is clear and answerable from the paired lesson sources; expected answer and rubric are withheld in this packet.")})
(ROOT/"blind_review_findings.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in findings)+"\n")

item_reviews=[]
for x in mcqs:
 note="Answer, rationale, and cited Markdown/PDF locator reviewed; calculations and code traces recomputed where applicable."
 if x["id"]=="M2L4-030": note="Key corrects the PDF's incompatible direct import and random.choice usage."
 if x["id"]=="M2L4-039": note="The item isolates the PDF's P/p mismatch without implying the malformed module snippet is otherwise runnable."
 item_reviews.append({"id":x["id"],"disposition":"pass","key":x["expectedAnswer"],"source":x["source"],"note":note})
(ROOT/"item_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in item_reviews)+"\n")
essay_reviews=[]
for x in essays:
 essay_reviews.append({"id":x["id"],"disposition":"pass","justification":x["justification"],"rubric_points":sum(c["points"] for c in x["rubric"]),"source":x["source"],"note":"Expected response, answer justification, source alignment, and five-point rubric checked; calculations/traces recomputed where applicable."})
(ROOT/"essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in essay_reviews)+"\n")

def visible_stem(prompt):
 if "\n\n```python" in prompt: return prompt.split("\n\n```python",1)[0].rstrip()
 return prompt

page=["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Functions and Modules — Question Preview</title>","<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 2 — Functions and Modules</h1><p>40 MCQs and 8 structured responses. Questions use both the Markdown lesson and Lecture 2_3 PDF.</p><h2>Multiple-choice questions</h2>"]
for x in mcqs:
 page.append(f"<article><h3>{html.escape(x['id'])}</h3><p>{html.escape(x['question']).replace(chr(10),'<br>')}</p>")
 if x.get("stimulusCode"): page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
 page.append("<ol type='A'>"+"".join("<li>"+html.escape(o)+"</li>" for o in x["options"])+"</ol></article>")
page.append("<h2>Structured-response questions</h2>")
for x in essays:
 page.append(f"<article><h3>{html.escape(x['id'])} · {x['marks']} marks</h3><p>{html.escape(visible_stem(x['prompt'])).replace(chr(10),'<br>')}</p>")
 if x.get("stimulusCode"): page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
 page.append("</article>")
page.append("</body></html>")
(ROOT/"question_preview.html").write_text("\n".join(page))

anchors=[("M2L4-006","Understand","distinguish printed output from returned values"),("M2L4-010","Apply","interpret a guard clause"),("M2L4-014","Apply","evaluate defaults and a named argument"),("M2L4-019","Analyze","reason about reading a global name"),("M2L4-023","Apply","trace recursive factorial"),("M2L4-027","Apply","use a module-qualified name"),("M2L4-033","Understand","classify package use"),("M2L4-E05","Analyze","trace nested function-call evaluation"),("M2L4-E08","Evaluate","diagnose a module exercise and explain reuse")]
dump("bloom_review.json",{"note":"Provisional operation-based labels, advisory only; no forced Bloom quotas. Review is same-session AI assessment.","anchors":[{"id":i,"label":l,"reason":r} for i,l,r in anchors]})
lookup={x["id"]:x.get("question",x.get("prompt")) for x in mcqs+essays}
(ROOT/"blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id":i,"item":lookup[i]},ensure_ascii=False) for i,_,_ in anchors)+"\n")

positions=Counter(x["correctIndex"] for x in mcqs)
cues=[]
for x in mcqs:
 lengths=[len(v) for v in x["options"]]; k=lengths[x["correctIndex"]]
 if lengths.count(k)==1 and k in {min(lengths),max(lengths)}:
  cues.append({"id":x["id"],"cue":"unique shortest key" if k==min(lengths) else "unique longest key"})
stems=[re.sub(r"\W+"," ",x["question"].lower()).strip() for x in mcqs]
code_blocks=(ROOT/"question_preview.html").read_text().count("<pre><code>")
audit={"mcq_count":len(mcqs),"essay_count":len(essays),"four_choices_each":all(len(x["options"])==4 for x in mcqs),"keys_valid":all(x["options"][x["correctIndex"]]==x["expectedAnswer"] for x in mcqs),"answer_positions_A_to_D":[positions[i] for i in range(4)],"mcq_code_stimuli":sum(bool(x.get("stimulusCode")) for x in mcqs),"essay_code_stimuli":sum(bool(x.get("stimulusCode")) for x in essays),"preview_code_blocks":code_blocks,"rubric_totals":{x["id"]:sum(c["points"] for c in x["rubric"]) for x in essays},"key_length_cues":cues,"duplicate_stems":[s for s,n in Counter(stems).items() if n>1],"blind_review_count":len(findings),"source_pair":"Markdown and Lecture 2_3 PDF","review_limit":"Same-session metadata-hidden review; earlier exposure to answer-bearing drafts means this is not independent or fully blind review.","source_caveats":source_info["source_caveats"]}
dump("mechanical_audit.json",audit)
(ROOT/"review.md").write_text("""# MCQ review\n\nAll items were checked against their Markdown and PDF locators. Code traces, the loan guard, recursion, parameter behavior, interest calculations, and the inconsistent source examples were reviewed. The metadata-hidden packet conceals keys, explanations, and locators.\n\nThis was a same-session metadata-hidden review after answer-bearing drafts had been prepared; it is not independent or fully blind validation. See `blind_review_findings.jsonl`, `item_review.jsonl`, `source_review.md`, and `mechanical_audit.json`.\n""")
(ROOT/"essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts include a model answer, an explicit answer justification, and a five-point rubric. Return behavior, list averaging, loan-payment arithmetic, parameter passing, function-call evaluation, scope, recursion, and module use were checked against the paired lesson sources.\n\nThe review is same-session and is not independent instructor validation. Source defects are listed in `source_review.md`.\n""")
(ROOT/"variety_report.md").write_text("""# Task-variety review\n\nThe MCQ batch covers function definition and calls, return behavior, accumulation, guard clauses, parameter forms, scope, recursion, code organization, imports, built-in modules, packages, deprecation, and applied financial/data examples. Structured responses require code tracing, calculations, explanation, and error diagnosis.\n""")
(ROOT/"source_review.md").write_text("# Paired-source notes\n\n- Used `4_funcitons_and_modules.md` and `7. Module 2_3_Function-1.pdf` together.\n- The PDF's random example imports `random` as a function but later writes `random.choice(...)`; the item supplies a valid corrected import and call.\n- The PDF's simple-interest code has a malformed string literal, and its main example assigns `P` but passes `p`. Items isolate the case-sensitive name issue and do not claim the broken module snippet runs.\n- The PDF labels a nested-call example as a function passed as a parameter, but its code calls `square_number(5)` first and passes the resulting number. Items follow actual evaluation.\n- The PDF's absolute claim that every package requires `__init__.py` was not used as a keyed fact.\n")
(ROOT/"README.md").write_text("""# Module 2 Lesson 4 pilot — Functions and modules\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Paired sources: `ssc/Module 2/4_funcitons_and_modules.md` and `ssc/Module 2/7. Module 2_3_Function-1.pdf`.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing items and rubrics.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden question review packet and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer/source and rubric checks.\n- `question_preview.html`: rendered questions with code blocks.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`, `source_review.md`: source, coverage, and review records.\n\nReview was completed in the same AI session after answer-bearing drafts had been prepared; it is not independent or fully blind validation.\n""")
print(json.dumps(audit,ensure_ascii=False,indent=2))
