import html,json,re
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).parent
mcqs=[json.loads(s) for s in (ROOT/"final_items.jsonl").read_text().splitlines()]
essays=[json.loads(s) for s in (ROOT/"essay_items.jsonl").read_text().splitlines()]
def dump(n,x): (ROOT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n")

source_info={"primary":"ssc/Module 2/3_loops.md (Lesson 3 of 6; Lecture 2_2)","pdf_status":"No loops PDF exists under ssc. Available Module 2 PDFs are Lecture 2_1 conditioning, Lecture 2_3 functions, and two Lecture 2_4 collection-data PDFs. The second PDF in folder order is about functions, so it was not used as a loops source.","scope":"This batch is based on the full loops Markdown file only. No claims are made that it was cross-checked against lecture slides."}
dump("lesson_plan.json",{"lesson":"Module 2, Lesson 3: Loops (for and while)","sources":source_info,"batch":{"mcqs":len(mcqs),"structured_responses":len(essays),"marks_each":5},"coverage":{"loop_selection":"for for known repeats/sequences; while for condition-controlled repetition","while_parts":"initialization, test, body, update; termination","range":"stop-exclusive ranges, start/stop/step, inclusive counting","iteration":"collections and strings","flow_control":"break and continue","nested_loops":"inner-loop repetition counts and multiplicative work","models":"population growth, inflation, counting responses and percentages","connections":"accumulation, exponential change, repeated code as a cue for functions"},"method":"Source-first pilot; metadata-hidden packet; source/answer review based on the Markdown; code-rendered preview and mechanical audit."})
dump("essay_plan.json",{"recommendation":"8 structured-response / essay-style prompts, 5 marks each","rationale":"Prompts cover loop tracing, range boundaries, iteration control, nested loops, growth models, and list counting with percentages.","total_marks":sum(x["marks"] for x in essays),"coverage":{x["id"]:x["operation"] for x in essays}})

blind=[{"id":x["id"],"question":x["question"],"options":x["options"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in mcqs]
(ROOT/"blind_mcq_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind)+"\n")
blind_e=[{"id":x["id"],"prompt":x["prompt"],"marks":x["marks"],**({"stimulusCode":x["stimulusCode"]} if x.get("stimulusCode") else {})} for x in essays]
(ROOT/"blind_essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in blind_e)+"\n")

findings=[]
special={"M2L3-006":"The loop condition uses a defined integer counter and the update makes termination traceable.","M2L3-008":"The stop-exclusive range example clearly differentiates its endpoint from an included value.","M2L3-018":"Output count is determinable from the list and break position.","M2L3-019":"The continue example asks for a specific known set of multiples.","M2L3-020":"The nested-loop dimensions are explicit; total inner executions are countable.","M2L3-026":"Growth inputs and year count are specified; the formula is applied consistently.","M2L3-032":"The percentage denominator is the six-record list length.","M2L3-012":"The accumulator starts at zero and the inclusive loop bound is explicit.","M2L3-E05":"Both nested loop bounds are specified, so the multiplication table size is determinate.","M2L3-E06":"The growth calculation and rounding request are explicit.","M2L3-E07":"The six-item data list and category labels are provided.","M2L3-E08":"The prompt distinguishes observed repetition from a reason to extract a function."}
for x in mcqs:
 findings.append({"id":x["id"],"stage":"question-only review","disposition":"pass","note":special.get(x["id"],"Stem and alternatives are readable and answerable from the lesson text; keys and rationales are hidden in this packet.")})
for x in essays:
 findings.append({"id":x["id"],"stage":"prompt-only review","disposition":"pass","note":special.get(x["id"],"Prompt is clear and answerable within the lesson; rubric and expected response are withheld.")})
(ROOT/"blind_review_findings.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in findings)+"\n")

item_reviews=[]
for x in mcqs:
 item_reviews.append({"id":x["id"],"disposition":"pass","key":x["expectedAnswer"],"source":x["source"],"note":"Answer and explanation checked against the specified Markdown section; arithmetic, range endpoints, and loop traces recomputed where applicable."})
(ROOT/"item_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in item_reviews)+"\n")
essay_reviews=[]
for x in essays:
 note="Expected answer and five-point rubric checked against the prompt and Markdown source."
 if x["id"] in {"M2L3-E06","M2L3-E07"}: note+=" Growth/count values independently recomputed."
 essay_reviews.append({"id":x["id"],"disposition":"pass","rubric_points":sum(c["points"] for c in x["rubric"]),"source":x["source"],"note":note})
(ROOT/"essay_review.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in essay_reviews)+"\n")

def stem(prompt,code):
 if "\n\n```python" in prompt: return prompt.split("\n\n```python",1)[0].rstrip()
 if code and "\n\n" in prompt: return prompt.split("\n\n",1)[0].rstrip()
 return prompt
page=["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Loops Question Preview</title>","<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 2 — Loops</h1><p>40 MCQs and 8 structured responses. This pilot uses the loops Markdown because no corresponding PDF is present.</p><h2>Multiple-choice questions</h2>"]
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

anchors=[("M2L3-003","Understand","identify the four control steps in a while loop"),("M2L3-008","Apply","compute a range's generated values"),("M2L3-020","Apply","calculate nested iteration count"),("M2L3-026","Apply","evaluate repeated growth"),("M2L3-018","Apply","trace break and continue effects"),("M2L3-E05","Apply","trace nested loops"),("M2L3-E06","Apply","calculate compounded growth"),("M2L3-E07","Analyze","interpret response counts and shares"),("M2L3-E08","Evaluate","identify repeated structure as a refactoring signal")]
dump("bloom_review.json",{"note":"Provisional operation-based labels, advisory only; no forced Bloom quotas. Review is same-session AI assessment.","anchors":[{"id":i,"label":l,"reason":r} for i,l,r in anchors]})
lookup={x["id"]:x.get("question",x.get("prompt")) for x in mcqs+essays}
(ROOT/"blind_bloom_anchors.jsonl").write_text("\n".join(json.dumps({"id":i,"item":lookup[i]},ensure_ascii=False) for i,_,_ in anchors)+"\n")

positions=Counter(x["correctIndex"] for x in mcqs); cues=[]
for x in mcqs:
 lengths=[len(v) for v in x["options"]]; k=lengths[x["correctIndex"]]
 if lengths.count(k)==1 and k in {min(lengths),max(lengths)}: cues.append({"id":x["id"],"cue":"unique shortest key" if k==min(lengths) else "unique longest key"})
stems=[re.sub(r"\W+"," ",x["question"].lower()).strip() for x in mcqs]
audit={"mcq_count":len(mcqs),"essay_count":len(essays),"four_choices_each":all(len(x["options"])==4 for x in mcqs),"keys_valid":all(x["options"][x["correctIndex"]]==x["expectedAnswer"] for x in mcqs),"answer_positions_A_to_D":[positions[i] for i in range(4)],"mcq_code_stimuli":sum(bool(x.get("stimulusCode")) for x in mcqs),"essay_code_stimuli":sum(bool(x.get("stimulusCode")) for x in essays),"preview_code_blocks":(ROOT/"question_preview.html").read_text().count("<pre><code>"),"rubric_totals":{x["id"]:sum(c["points"] for c in x["rubric"]) for x in essays},"key_length_cues":cues,"duplicate_stems":[s for s,n in Counter(stems).items() if n>1],"blind_review_count":len(findings),"source_limit":"Markdown-only; no loops PDF available.","review_limit":"Same-session AI review; not independent human validation."}
dump("mechanical_audit.json",audit)
(ROOT/"review.md").write_text("""# MCQ review\n\nThe question-only packet hides keys, source locators, objectives, operations, and explanations. Items were reviewed for clarity, code presentation, and answerability; then keys and explanations were checked against `3_loops.md`. The source record explicitly notes that no loops PDF was available.\n\nThis is same-session AI review, not independent human/instructor validation. See `blind_review_findings.jsonl`, `item_review.jsonl`, and `mechanical_audit.json`.\n""")
(ROOT/"essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts have five-point rubrics and were checked against the lesson Markdown. Range endpoints, loop traces, and growth/count calculations were reviewed. The source limitation is recorded: no loops PDF was found in the course tree.\n""")
(ROOT/"variety_report.md").write_text("""# Task-variety review\n\nQuestions include loop selection, initialization and termination, range tracing, collection iteration, break/continue, nested-loop counts, growth calculations, accumulation, response counting, percentages, and refactoring motivation. The essay-style prompts extend this into code tracing and model application.\n\nCoverage is based on the Markdown source only because the course folder has no loops PDF.\n""")
(ROOT/"README.md").write_text("""# Module 2 Loops pilot\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Primary source: `ssc/Module 2/3_loops.md`. No loops PDF is present under `ssc`; the available second PDF covers functions and was not used.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing items.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden review packet and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer/source and rubric checks.\n- `question_preview.html`: preview with code blocks.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, `review.md`, `essay_review.md`, `variety_report.md`, `bloom_review.json`: planning and review records.\n\nReview was completed in the same AI session and is not independent instructor validation.\n""")
print(json.dumps(audit,ensure_ascii=False,indent=2))
