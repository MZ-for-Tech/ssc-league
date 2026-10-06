# Review handoff

Use `blind_review_input.jsonl` for MCQ content review and `essay_review_input.jsonl` for the eight structured-response prompts. The review copy omits objective and operation labels; the MCQ copy retains keyed answers, explanations, and source pointers so correctness and support can be checked.

Open `question_preview.html` to see the questions with their actual diagrams rendered beside them. It omits answer keys and includes all 31 diagram instances.

Every item marked `[Diagram]` must display the SVG at its `stimulusAsset` path alongside the stem. The essay review packet likewise retains each diagram asset reference. Review the actual rendered SVG, not only its filename or alt text. A text-only rendering of those items is incomplete.

For every stable ID, record PASS or REVISE; separate definite factual/key/source issues from editorial preferences; check ambiguity, distractor plausibility, and explanation; and classify the highest operation essential to answer.

First classify the ten examples in `bloom_anchors_unlabeled.jsonl`, then compare with `bloom_anchors_key.json`. Use 9/10 as a confidence alert, not a pass/fail gate. Do not alter anchor labels to make them agree. After that, classify the batch without trying to match the plan's advisory distributions.

For task variety, group items by the reasoning actually required. Report repeated procedures and source coverage separately from exact/near duplicate wording. Consult `lesson_plan.json` only after the blind grouping.

This is an AI review handoff. It does not claim teacher or independent human approval.
