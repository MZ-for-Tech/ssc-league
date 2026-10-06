# Independent review handoff

Use `blind_review_input.jsonl` for the item review. It omits the planned objective and operation-family fields. It retains the answer key, explanation, and source pointer so you can check correctness and evidence.

Use `essay_review_input.jsonl` for the eight structured-response prompts. Check that the expected solution is source-supported, each prompt is answerable as written, equivalent valid algorithms receive credit, and each rubric matches the prompt and totals five marks.

For each stable ID, record:

- PASS or REVISE;
- any definite key, source, or logic error separately from preferences;
- ambiguity, distractor, or explanation concerns;
- your Bloom classification and a short rationale naming the essential operation.

Before classifying the batch, classify the ten examples in `bloom_anchors_unlabeled.jsonl`, then compare with `bloom_anchors_key.json`. Aim for 9/10 agreement as a confidence signal. If agreement is lower, discuss the boundary cases and rubric before reporting batch counts. Do not change labels to meet a distribution.

For task variety, group questions by the reasoning students actually perform. Report repeated procedures, source-coverage gaps, and wording similarities separately. New values or contexts alone do not count as a new task family. The full source-and-operation plan is in `lesson_plan.json`; consult it after your blind review so it does not shape initial Bloom classifications.

This package is a review handoff, not a claim that the independent review has happened.
