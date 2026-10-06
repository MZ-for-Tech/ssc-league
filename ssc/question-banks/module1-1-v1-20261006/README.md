# Algorithms Lesson 1 MCQ pilot

**Status: AI-reviewed draft, nonproduction.** The 40 MCQs and eight structured-response items received a second metadata-hidden AI review pass, with revisions and a focused re-audit recorded in the review reports. No independent reviewer or instructor has approved them.

## Sources and scope

The bank uses the local course copy, `Module 1/algo.md`, together with `Module 1_1 Algorithms.pdf`. The lesson pairs the lecture’s introductory concepts and worked algorithms with explanatory Python examples and tracing practice. The source and operation map is in `lesson_plan.json`; the questions are in `final_items.jsonl`.

The batch covers problem types, algorithm design and the development cycle, input/process/output, algorithm properties, sequence, selection, loops, tracing, sentinels, digit operations, and comparing simple alternative algorithms. Flowchart drawing and unrelated Python/data-structure topics are out of scope.

## Structured-response questions

The companion essay bank has **8 prompts worth 5 marks each** (40 marks total): three design/pseudocode tasks, two traces, two debugging tasks, and one justified comparison. Here “essay” means a structured written or pseudocode response, not a long prose essay. See `essay_items.jsonl`, its allocation in `essay_plan.json`, and the audit in `essay_review.md`.

## Initial findings

- 40 items, each with four options and a stable ID.
- 40 distinct normalized stems; no exact normalized duplicates.
- Correct answer positions: 10 in each of the four slots; maximum same-slot run: 2.
- All recorded keys match their `expectedAnswer` fields.
- The content pass found source support and a defensible key for all 40 items.
- The first option-length scan flagged 24 items; those options were revised and rescanned. No keyed option is now uniquely shortest or longest.

The review is a second AI pass in the same session, not an independent reviewer audit. Bloom calibration agreement is provisional because the anchor key was authored in the same session. Reviewer copies for both formats and the calibration materials are in this folder; see `reviewer_instructions.md`. The bank is not approved for app import.

All eight essays include an explicit answer justification, model answer, and five-point rubric.

## Bloom’s taxonomy

Every MCQ and structured response has a provisional operation-based Bloom level and rationale in the item JSONL and `bloom_review_full.json`. Labels describe the highest cognitive process needed; no level quotas are imposed. This same-session AI classification has not received independent review.
