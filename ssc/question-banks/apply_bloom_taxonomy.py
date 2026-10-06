"""Add provisional, operation-based Bloom labels to every SSC bank item.

Run from the repository root with: python3 ssc/question-banks/apply_bloom_taxonomy.py
The classification is advisory and is not an independent review.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
REASON = {
    "Remember": "requires retrieving or recognizing a taught fact or convention",
    "Understand": "requires interpreting, explaining, or classifying meaning",
    "Apply": "requires carrying out a learned rule, calculation, or procedure on the given case",
    "Analyze": "requires diagnosing a problem or inferring how parts or conditions relate",
    "Evaluate": "requires judging a claim or choice against evidence or stated criteria",
    "Create": "requires constructing a coherent solution or product that meets the stated constraints",
}

# These are item-level judgments for multi-step or borderline demands where a
# general cue would otherwise confuse reading with construction, or explanation
# with evidence-based analysis.  The IDs are stable across reruns.
MANUAL = {
    "module1-3-v1-20261006": {
        **{f"INTRO-{i:03d}": "Understand" for i in [1,3,5,6,10,12,13,15,16,19,24,26,27,29,31,38]},
        **{f"INTRO-{i:03d}": "Apply" for i in [2,4,8,34,37,39]},
        **{f"INTRO-{i:03d}": "Analyze" for i in [17,23,35,36]},
        **{f"INTRO-{i:03d}": "Remember" for i in [22]},
        **{f"INTRO-{i:03d}": "Remember" for i in [7,9,11,14,18,20,21,25,30,32,33,40]},
        "INTRO-028":"Understand", "INTRO-029":"Understand", "INTRO-034":"Apply",
        "INTRO-E01":"Analyze", "INTRO-E02":"Apply", "INTRO-E03":"Analyze", "INTRO-E04":"Analyze",
        "INTRO-E05":"Analyze", "INTRO-E06":"Analyze", "INTRO-E07":"Apply", "INTRO-E08":"Apply",
    },
    "module1-2-v1-20261006": {"FLOW-E07":"Apply"},
    "module2-1-v1-20261006": {"M2L1-024":"Remember", "M2L1-E01":"Apply", "M2L1-E02":"Apply"},
    "module2-2-v1-20261006": {"M2L2-001":"Remember", "M2L2-E03":"Apply", "M2L2-E05":"Apply"},
    "module2-3-v1-20261006": {
        "M2L3-002":"Remember", "M2L3-011":"Apply", "M2L3-021":"Apply", "M2L3-022":"Apply",
        "M2L3-E02":"Apply", "M2L3-E03":"Apply",
    },
    "module2-4-v1-20261006": {"M2L4-040":"Understand", "M2L4-E08":"Analyze"},
    "module2-5-v1-20261006": {"M2L5-038":"Apply", "M2L5-039":"Apply", "M2L5-E05":"Apply"},
    "module2-6-v1-20261006": {
        "M2L6-021":"Understand", "M2L6-038":"Apply", "M2L6-039":"Apply", "M2L6-E06":"Apply",
    },
    "module3-1-v1-20261006": {
        "M3L1-003":"Apply", "M3L1-004":"Apply", "M3L1-005":"Apply", "M3L1-006":"Apply",
        "M3L1-022":"Evaluate", "M3L1-027":"Apply", "M3L1-038":"Apply", "M3L1-E05":"Understand",
    },
    "module3-2-v1-20261006": {
        "M3L2-002":"Apply", "M3L2-005":"Apply", "M3L2-006":"Apply", "M3L2-009":"Apply", "M3L2-013":"Apply",
        "M3L2-015":"Apply", "M3L2-018":"Apply", "M3L2-020":"Apply", "M3L2-021":"Apply", "M3L2-025":"Apply",
        "M3L2-027":"Apply", "M3L2-030":"Apply", "M3L2-031":"Apply", "M3L2-032":"Apply", "M3L2-033":"Apply",
        "M3L2-034":"Apply", "M3L2-036":"Apply", "M3L2-038":"Apply", "M3L2-039":"Apply",
        "M3L2-040":"Analyze", "M3L2-E01":"Understand", "M3L2-E02":"Create", "M3L2-E03":"Analyze",
        "M3L2-E04":"Apply", "M3L2-E05":"Apply", "M3L2-E06":"Create", "M3L2-E07":"Analyze", "M3L2-E08":"Create",
    },
    "module3-3-v1-20261006": {
        **{f"M3L3-{i:03d}":"Apply" for i in [1,2,13,14,15,20,21,22,23,26,27,28,30,31,34,35,36,37,38]},
        "M3L3-004":"Remember", "M3L3-007":"Remember", "M3L3-008":"Analyze", "M3L3-009":"Evaluate",
        "M3L3-011":"Evaluate", "M3L3-017":"Evaluate", "M3L3-032":"Remember",
        "M3L3-E01":"Evaluate", "M3L3-E02":"Evaluate", "M3L3-E03":"Analyze", "M3L3-E04":"Create",
        "M3L3-E05":"Apply", "M3L3-E06":"Apply", "M3L3-E07":"Apply", "M3L3-E08":"Apply",
    },
    "module3-4-v1-20261006": {
        **{f"M3L4-{i:03d}":"Apply" for i in [5,6,7,12,13,15,16,18,24,26,27,29,30,32,33,35,36,37]},
        **{f"M3L4-{i:03d}":"Analyze" for i in [17,19,22,31,34,39]},
        "M3L4-003":"Apply", "M3L4-009":"Understand", "M3L4-010":"Evaluate", "M3L4-011":"Evaluate", "M3L4-040":"Understand",
        "M3L4-E01":"Evaluate", "M3L4-E02":"Analyze", "M3L4-E03":"Analyze", "M3L4-E04":"Evaluate",
        "M3L4-E05":"Analyze", "M3L4-E06":"Evaluate", "M3L4-E07":"Evaluate", "M3L4-E08":"Create",
    },
    "module3-5-v1-20261006": {
        **{f"M3L5-{i:03d}":"Apply" for i in [2,3,6,7,10,12,15,16,17,19,20,21,28,32,33,36,40]},
        **{f"M3L5-{i:03d}":"Analyze" for i in [8,26,27,29,37]},
        "M3L5-004":"Remember", "M3L5-025":"Understand",
        "M3L5-038":"Evaluate", "M3L5-E01":"Evaluate", "M3L5-E02":"Evaluate", "M3L5-E03":"Analyze",
        "M3L5-E04":"Analyze", "M3L5-E05":"Evaluate", "M3L5-E06":"Analyze", "M3L5-E07":"Evaluate", "M3L5-E08":"Create",
    },
}

def norm(value):
    return str(value or "").strip().lower()

def read_existing_labels(folder):
    """Reuse the prior full MCQ classifications and anchor labels where present."""
    p = folder / "bloom_review.json"
    if not p.exists():
        return {}
    try:
        doc = json.loads(p.read_text())
    except Exception:
        return {}
    out = {}
    # Retain earlier decisions only when the report classified the full MCQ
    # batch. Selected anchors are not silently expanded to the entire lesson.
    rows = doc.get("items", [])
    ids = {row.get("id") for row in rows}
    if len(ids) >= 40:
        for row in rows:
            label = row.get("bloom") or row.get("label")
            if label:
                out[row["id"]] = str(label).title()
    return out

def infer_level(item, is_essay, prior, folder_name):
    manual = MANUAL.get(folder_name, {}).get(item["id"])
    if manual in LEVELS:
        return manual
    if item["id"] in prior and prior[item["id"]] in LEVELS:
        return prior[item["id"]]

    prompt = norm(item.get("question") or item.get("prompt"))
    task = norm(item.get("operation") or item.get("objective"))
    text = f"{task}. {prompt}"

    # Creating a new procedure, code artifact, or plan is Create even when its
    # prompt also says to explain or justify it.
    if is_essay and re.search(r"\b(design|devise|construct|write|build|develop|plan|produce|create|outline)\b", task):
        if not re.search(r"\b(debug|diagnos|repair|refactor)\b", task):
            return "Create"
    if is_essay and re.search(r"\b(design|devise|construct|write|build|develop|plan|produce|create)\s+(?:a|an|the|your|one|new|valid|clear|compact|correct|complete|simple|general|coherent|working|reusable|pandas|python|flowchart|function|algorithm|conditional|condition|solution|workflow|program|code|expression|example|response|method|sequence|representation|summary|classification|query|list|dictionary|map|table|chart|outline)\b", prompt):
        if not re.search(r"\b(debug|diagnos|repair|refactor)\b", task):
            return "Create"

    # Evaluation requires a reasoned judgment, not merely choosing an answer.
    if re.search(r"\b(critique|critically evaluate|judge|assess the quality|evaluate alternatives|compare alternatives|recommend|defend your choice|which should guide the choice|best supported|most appropriate and justify)\b", text):
        return "Evaluate"
    if is_essay and re.search(r"\b(compare|choose|select|recommend)\b", task) and re.search(r"\b(criteria|criterion|trade.?off|justify|advantage|limitation|which you would choose)\b", prompt):
        return "Evaluate"
    if not is_essay and re.search(r"\b(best supported|most justified|strongest reason|what should guide the choice|which is the best)\b", prompt):
        return "Evaluate"

    # Diagnosis, debugging, and analysis of interacting conditions are Analyze.
    if re.search(r"\b(diagnos|debug|repair|refactor|analy[sz]e|branch shadowing|unreachable|false duplicate|missingness bias|selection limitation|interact|relationship between|why can .* change|what follows from)\b", text):
        return "Analyze"
    if is_essay and re.search(r"\b(explain why|identify the defect|find the defect|distinguish the causes|infer why|compare .* (?:behavior|structure|result)|trace .* and explain why)\b", prompt):
        return "Analyze"

    # Executing a procedure on supplied values or code is Apply.
    if re.search(r"\b(trace|calculate|compute|execute|apply|use the .* rule|substitute|find the result|work out|determine the output|run the code|which value|what value|how many times|what is printed|what does .* return|which branch runs|which path)\b", text):
        return "Apply"
    if is_essay and re.search(r"\b(trace|calculate|compute|classify .* examples|show the result|work through|give the output)\b", prompt):
        return "Apply"

    # Retrieving fixed terminology/rules is Remember; meaning and explanation
    # of a concept or example is Understand.
    if re.search(r"\b(recall|define|name|state the definition|which symbol|which keyword|which operator|which language|which library|what is the name|recognize the term)\b", text):
        return "Remember"
    if re.search(r"\b(explain|interpret|distinguish|classify|describe|identify the role|what does .* mean|what does .* do|why is .* used|what is the purpose|what follows from)\b", text):
        return "Understand"

    # Safe fallbacks based on item form and the actual task language.
    if is_essay:
        if re.search(r"\b(compare|contrast|analy[sz]e|diagnos|critique)\b", prompt):
            return "Analyze"
        if re.search(r"\b(trace|calculate|apply|use|show|state|identify)\b", prompt):
            return "Apply"
        return "Understand"
    if re.search(r"\b(which|what|when|where|who)\b", prompt) and re.search(r"\b(definition|property|purpose|role|symbol|term|syntax)\b", prompt):
        return "Remember"
    return "Understand"

def main():
    folders = sorted(p for p in ROOT.iterdir() if p.is_dir() and (p / "final_items.jsonl").exists())
    for folder in folders:
        prior = read_existing_labels(folder)
        labeled = []
        total_counts = Counter()
        type_counts = {"MCQ": Counter(), "Essay": Counter()}
        item_rows = []
        for filename, is_essay, kind in [("final_items.jsonl", False, "MCQ"), ("essay_items.jsonl", True, "Essay")]:
            path = folder / filename
            if not path.exists():
                continue
            rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
            for item in rows:
                level = infer_level(item, is_essay, prior, folder.name)
                task = item.get("operation") or item.get("objective") or "the stated task"
                rationale = f"Classified {level} because the required task is to {task}; this {REASON[level]}. The label reflects the highest process essential to the item, not its command verb alone."
                item["bloomLevel"] = level
                item["bloomRationale"] = rationale
                total_counts[level] += 1
                type_counts[kind][level] += 1
                row = {"id": item["id"], "type": kind, "level": level, "rationale": rationale}
                item_rows.append(row)
                labeled.append(item)
            path.write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in rows) + "\n")

        report = {
            "lesson": folder.name,
            "method": "Provisional operation-based Revised Bloom classification. For each item, label the highest cognitive process essential to a correct response; classify the task, not its command verb. Full-batch classifications from earlier review are retained where present; otherwise the item wording, objective, and operation are assessed.",
            "status": "All MCQs and essays have item-level labels. Same-session AI authoring review; not independently validated.",
            "counts": {"MCQ": {level: type_counts["MCQ"][level] for level in LEVELS},
                       "Essay": {level: type_counts["Essay"][level] for level in LEVELS},
                       "Combined": {level: total_counts[level] for level in LEVELS}},
            "items": item_rows,
        }
        (folder / "bloom_review_full.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        (folder / "bloom_item_review.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in item_rows) + "\n")
        readme = folder / "README.md"
        if readme.exists():
            text = readme.read_text()
            note = "\n## Bloom’s taxonomy\n\nEvery MCQ and structured response has a provisional operation-based Bloom level and rationale in the item JSONL and `bloom_review_full.json`. Labels describe the highest cognitive process needed; no level quotas are imposed. This same-session AI classification has not received independent review.\n"
            if "## Bloom’s taxonomy" not in text:
                readme.write_text(text.rstrip() + "\n" + note)
        print(folder.name, json.dumps(report["counts"], ensure_ascii=False))

    index = ROOT / "README.md"
    if index.exists():
        text = index.read_text()
        note = "\nAll lesson banks now include item-level, provisional Bloom classifications for MCQs and structured responses. See each bank’s `bloom_review_full.json` for rationales and distributions; classifications are same-session AI reviews and are not independently validated.\n"
        if "item-level, provisional Bloom classifications" not in text:
            index.write_text(text.rstrip() + "\n" + note)

    summary = {
        "method": "Provisional operation-based Revised Bloom classification; label the highest process essential to a correct response.",
        "status": "Same-session AI classification; not independently validated.",
        "lesson_count": len(folders),
        "item_count": 0,
        "counts": {"MCQ": {level: 0 for level in LEVELS}, "Essay": {level: 0 for level in LEVELS}, "Combined": {level: 0 for level in LEVELS}},
        "lessons": [],
    }
    for folder in folders:
        report = json.loads((folder / "bloom_review_full.json").read_text())
        summary["item_count"] += sum(report["counts"]["Combined"].values())
        for kind in ("MCQ", "Essay", "Combined"):
            for level in LEVELS:
                summary["counts"][kind][level] += report["counts"][kind][level]
        summary["lessons"].append({"lesson": folder.name, "counts": report["counts"]})
    (ROOT / "bloom_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")

if __name__ == "__main__":
    main()
