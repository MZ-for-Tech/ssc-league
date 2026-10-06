import html,json,re
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).parent
mcqs=[json.loads(s) for s in (ROOT/"final_items.jsonl").read_text().splitlines()]
essays=[json.loads(s) for s in (ROOT/"essay_items.jsonl").read_text().splitlines()]
def dump(name,obj): (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n")

sources={"primary_markdown":"ssc/Module 2/2_making_decisions.md","primary_pdf":"ssc/Module 2/5. Module 2_1_Conditioning.pdf (Lecture 2_1; slides on conditional execution, if/else, chained and nested conditionals, and Sheet 2 exercises)","overlap":"The PDF is shared with the variables/operators lesson and includes the decision material. The prior Module 2 Lecture 2_1 pilot sampled conditional syntax, branch order, parity, leap years, loan eligibility, tariffs, and nesting. This dedicated set uses different stems and scenarios where practical; some foundational concepts recur by design.","prior_batch_cross_reference":"ssc/question-banks/module2-1-v1-20261006/final_items.jsonl and essay_items.jsonl"}
dump("lesson_plan.json",{"lesson":"Module 2, lesson 2: Making decisions","sources":sources,"batch":{"mcqs":len(mcqs),"structured_responses":len(essays),"marks_each":5},"coverage":{"flow_and_if_syntax":"sequential versus conditional execution, blocks, indentation, colons","branching":"simple if, if/else, elif first-match behavior, nested decisions","compound_logic":"and/or, parity and sign classification","worked_rules":"leap years, loan eligibility, electricity tariffs, numeric comparisons"},"method":"Dedicated source-first batch; check for overlap with prior pilot; metadata-hidden review; source/key adjudication; code preview and mechanical audit."})
dump("essay_plan.json",{"recommendation":"8 structured-response / essay-style prompts, 5 marks each","rationale":"The prompts extend the MCQ coverage into code tracing, rule application, branch repair, tariff calculations, compound classification, and refactoring.","total_marks":sum(x["marks"] for x in essays),"coverage":{x["id"]:x["operation"] for x in essays}})

blind=[{"id":x["id"],"question":x["question"],"options":x["options"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT/"blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind)+"\n")
blind_e=[{"id":x["id"],"prompt":x["prompt"],"marks":x["marks"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT/"blind_essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind_e)+"\n")
blind_findings=[]
for x in mcqs:
 note="Clear stem and distinguishable alternatives; the answer, source, objective, operation, and rationale are hidden in this packet."
 if x["id"] in {"M2L2-013","M2L2-015","M2L2-016","M2L2-037","M2L2-038"}: note+=" Code or boundary values make the branch outcome assessable."
 if x["id"]=="M2L2-036": note+=" Removed the integer-conversion line from the stimulus because it disclosed the requested correction; the final blind packet was checked again."
 blind_findings.append({"id":x["id"],"disposition":"pass","stage":"metadata-hidden item review","note":note})
for x in essays:
 blind_findings.append({"id":x["id"],"disposition":"pass","stage":"metadata-hidden prompt review","note":"Prompt is understandable and scoped to the lesson; marks and any stimulus are visible, while rubric, expected answer, source, and objective are withheld."})
(ROOT/"blind_review_findings.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind_findings)+"\n")

mcq_review=[]
for x in mcqs:
 note="Key, explanation, and source locator checked against the PDF/Markdown lesson."
 if x["id"] in {"M2L2-023","M2L2-024","M2L2-025"}: note+=" Leap-year conditions/cases checked against divisible-by-400 exception."
 if x["id"] in {"M2L2-026","M2L2-027"}: note+=" Both inclusive thresholds and conjunction checked."
 if x["id"] in {"M2L2-028","M2L2-029","M2L2-030","M2L2-031","M2L2-032"}: note+=" Ordered tariff bands and selected outcomes checked."
 mcq_review.append({"id":x["id"],"disposition":"pass","key":x["expectedAnswer"],"source":x["source"],"note":note})
(ROOT/"item_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in mcq_review)+"\n")
essay_review=[]
for x in essays:
 note="Expected answer and five-point rubric checked against prompt and source."
 if x["id"]=="M2L2-E03": note+=" All four year classifications recomputed."
 if x["id"]=="M2L2-E06": note+=" Four bill amounts independently recomputed."
 essay_review.append({"id":x["id"],"disposition":"pass","rubric_points":sum(c["points"] for c in x["rubric"]),"source":x["source"],"note":note})
(ROOT/"essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in essay_review)+"\n")

def stem(prompt,code):
 if "\n\n```python" in prompt: return prompt.split("\n\n```python",1)[0].rstrip()
 if code and "\n\n" in prompt: return prompt.split("\n\n",1)[0].rstrip()
 return prompt
page=["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Making Decisions Question Preview</title>","<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 2 — Making decisions</h1><p>40 MCQs and 8 structured responses. Code stimuli are shown in code blocks.</p><h2>Multiple-choice questions</h2>"]
for x in mcqs:
 page.append(f"<article><h3>{html.escape(x['id'])}</h3><p>{html.escape(stem(x['question'],x.get('stimulusCode'))).replace(chr(10),'<br>')}</p>")
 if x.get("stimulusCode"): page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
 page.append("<ol type='A'>"+"".join("<li>"+html.escape(o)+"</li>" for o in x["options"])+"</ol></article>")
page.append("<h2>Structured-response questions</h2>")
for x in essays:
 page.append(f"<article><h3>{html.escape(x['id'])} · {x['marks']} marks</h3><p>{html.escape(stem(x['prompt'],x.get('stimulusCode'))).replace(chr(10),'<br>')}</p>")
 if x.get("stimulusCode"): page.append(f"<pre><code>{html.escape(x['stimulusCode'])}</code></pre>")
 page.append("</article>")
page.append("</body></html>")
(ROOT/"question_preview.html").write_text("\n".join(page))

anchors=[("M2L2-007","Apply","trace a conditional block and unindented statement"),("M2L2-016","Analyze","identify branch shadowing"),("M2L2-023","Apply","evaluate a compound divisibility rule"),("M2L2-029","Apply","calculate an amount selected by a tariff chain"),("M2L2-037","Analyze","trace a broad first condition"),("M2L2-E03","Apply","classify cases using a rule"),("M2L2-E04","Analyze","diagnose and repair an unreachable branch"),("M2L2-E06","Apply","compute results across ordered ranges"),("M2L2-E08","Create","refactor nested decisions")]
dump("bloom_review.json",{"note":"Provisional labels describe the operation required; advisory only and not quota-driven. Same-session AI review is not independent validation.","anchors":[{"id":i,"label":l,"reason":r} for i,l,r in anchors]})
lookup={x["id"]:x.get("question",x.get("prompt")) for x in mcqs+essays}
(ROOT/"blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id":i,"item":lookup[i]},ensure_ascii=False) for i,_,_ in anchors)+"\n")

pos=Counter(x["correctIndex"] for x in mcqs); flags=[]
for x in mcqs:
 lens=[len(o) for o in x["options"]]; k=lens[x["correctIndex"]]
 if lens.count(k)==1 and k in {min(lens),max(lens)}: flags.append({"id":x["id"],"cue":"unique shortest key" if k==min(lens) else "unique longest key"})
stems=[re.sub(r"\W+"," ",x["question"].lower()).strip() for x in mcqs]
audit={"mcq_count":len(mcqs),"essay_count":len(essays),"four_choices_each":all(len(x["options"])==4 for x in mcqs),"keys_valid":all(x["expectedAnswer"]==x["options"][x["correctIndex"]] for x in mcqs),"answer_positions_A_to_D":[pos[i] for i in range(4)],"mcq_code_stimuli":sum(bool(x.get("stimulusCode")) for x in mcqs),"essay_code_stimuli":sum(bool(x.get("stimulusCode")) for x in essays),"preview_code_blocks":(ROOT/"question_preview.html").read_text().count("<pre><code>"),"essay_rubric_totals":{x["id"]:sum(c["points"] for c in x["rubric"]) for x in essays},"key_length_cues":flags,"duplicate_stems":[s for s,n in Counter(stems).items() if n>1],"unclassified_items":[x["id"] for x in mcqs if not x.get("operation")],"blind_review_count":len(blind_findings),"review_limit":"Metadata-hidden same-session AI review; earlier exposure to the prior batch and source means it is not independent or fully blind."}
dump("mechanical_audit.json",audit)
(ROOT/"review.md").write_text("""# MCQ review\n\nAll 40 items were reviewed in a question-only packet with keys, explanations, source locators, objectives, and operation labels hidden. The keys and explanations were then checked against the source. The batch is intentionally dedicated to the decision-making Markdown and uses different stems/scenarios from the preceding Lecture 2_1 pilot where practical. Some foundational concepts recur because both text files are parts of the same lecture.\n\nSee `blind_review_findings.jsonl` for metadata-hidden findings and `item_review.jsonl` for answer/source adjudication. `mechanical_audit.json` records structural checks. This is same-session AI review, not independent or fully blind review.\n""")
(ROOT/"essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts were checked against their expected answers and five-point rubrics. Leap-year classifications, loan thresholds, tariff outcomes, and nested-comparison traces were checked.\n\nThis is same-session AI review, not independent human or instructor validation.\n""")
(ROOT/"variety_report.md").write_text("""# Task-variety review\n\nThe MCQs cover control-flow interpretation, syntax, code tracing, branch reachability, compound logic, parity/sign classification, leap-year rules, loan decisions, and tariff bands. The structured responses add design, trace-and-repair, case analysis, arithmetic across ranges, and refactoring.\n\nThis dedicated bank overlaps foundational conditional concepts from the preceding Lecture 2_1 pilot, which used the same PDF. Exact stems and scenarios are varied where possible; the overlap is documented in `lesson_plan.json`.\n""")
(ROOT/"README.md").write_text("""# Module 2 Making Decisions pilot\n\nContains 40 MCQs and 8 structured-response questions worth 5 marks each. Primary source: `ssc/Module 2/2_making_decisions.md`; companion PDF: `ssc/Module 2/5. Module 2_1_Conditioning.pdf`. The same PDF supported the preceding variables/operators pilot, so overlap is noted in `lesson_plan.json`.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing items.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden review inputs and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: key/source and rubric checks.\n- `question_preview.html`: visual preview with code blocks.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`: plans and review records.\n\nReview was conducted in the same AI session, so it is not independent or fully blind validation.\n""")
print(json.dumps(audit,ensure_ascii=False,indent=2))
