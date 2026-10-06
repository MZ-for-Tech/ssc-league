import html
import json
from pathlib import Path

ROOT = Path(__file__).parent

def read_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]

def card(item, essay=False):
    ident = html.escape(item["id"])
    prompt = html.escape(item.get("question", item.get("prompt", ""))).replace("\n", "<br>")
    out = [f'<article class="card"><h3>{ident}</h3><p>{prompt}</p>']
    asset = item.get("stimulusAsset")
    if asset:
        path = html.escape(asset, quote=True)
        out.append(f'<figure><img src="{path}" alt="Flowchart stimulus for {ident}"><figcaption>{html.escape(Path(asset).name)}</figcaption></figure>')
    if not essay:
        out.append("<ol type=\"A\">" + "".join(f"<li>{html.escape(option)}</li>" for option in item["options"]) + "</ol>")
    out.append("</article>")
    return "\n".join(out)

mcqs = read_jsonl(ROOT / "final_items.jsonl")
essays = read_jsonl(ROOT / "essay_items.jsonl")
doc = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flowcharts Lesson 2 — Question Preview</title>
<style>body{font:16px/1.5 system-ui,sans-serif;color:#172b3a;max-width:980px;margin:2rem auto;padding:0 1rem}h1,h2{line-height:1.2}.card{border:1px solid #cbd5df;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0;break-inside:avoid}.card h3{margin:.1rem 0 .5rem;color:#285273}.card figure{margin:1rem 0;padding:.7rem;background:#f7f9fb;text-align:center}.card img{max-width:100%;max-height:720px;object-fit:contain}.card figcaption{font-size:.85rem;color:#526575}li{margin:.35rem 0}.note{background:#edf5fb;padding:.8rem 1rem;border-left:4px solid #287aab}</style></head><body>
<h1>Flowcharts Lesson 2 — Question Preview</h1><p class="note">This review view renders each attached SVG beside the associated stem. The final-item JSONL references the same assets through <code>stimulusAsset</code>. Answer keys are omitted from this preview.</p>
<h2>Multiple-choice questions</h2>'''
doc += "\n".join(card(x) for x in mcqs)
doc += "\n<h2>Structured-response questions</h2>\n" + "\n".join(card(x, essay=True) for x in essays)
doc += "\n</body></html>\n"
(ROOT / "question_preview.html").write_text(doc)
print(f"Rendered preview with {len(mcqs)} MCQs and {len(essays)} structured responses.")
