# Structured-response item review

## Review status

This is a second AI review of the eight prompts and scoring rubrics using `essay_review_input.jsonl`, which omits objective/task-family metadata. The same assistant authored the set and retains conversation context, so it is not independent of authorship or instructor approval.

## Scope and design

The prompts follow the agreed mix: three algorithm-design/pseudocode tasks, two traces, two debugging tasks, and one justified algorithm comparison. Each is worth five marks, for a 40-mark set. Responses are structured work rather than long-form prose.

The prompts use the lesson’s maximum-finding procedure, triangle-area formula, factorial and sentinel loops, digit reversal, loop components, and comparison of iterative and formula approaches. They do not require constructs beyond those in the supplied sources.

## Answer and rubric review

All eight expected answers were checked against the supplied examples and the values in their prompts. The factorial trace gives 120 and stops when I becomes 6; the digit-reversal trace for 507 yields 705 with the zero retained in the middle; the sentinel examples sum 22 and exclude −1. The two debugging tasks identify distinct defects: a zero-initialized product accumulator and adding the sentinel after loop termination.

The second pass found no remaining answer or rubric-total errors. It clarified the comparison answer for `ALGO-E08` so the expected response explains a criterion beyond runtime, and focused review confirmed that all eight rubrics total five marks.

Each rubric has five criteria whose point values sum to the stated five marks. The prompts specify inputs and stopping conditions where needed. Equivalent correct pseudocode should receive credit even when it differs from the sample answer wording.

## Remaining review

Across formats, several essay tasks deliberately deepen MCQ practice on maximum-finding, factorials, sentinels, and method comparison. The triangle-area design prompt and accumulator-initialization debug task broaden the operation set. This still means the combined bank has less task-family variety than the item count suggests. The independent reviewer should judge whether that repetition is appropriate.

An instructor should confirm that students have already learned each Python operator and construct used, and that the relative emphasis matches the course. The independent reviewer should check prompt ambiguity, source alignment, rubric fairness, and whether partial credit is appropriate. These items are not app-import approved.

All eight essays include an explicit answer justification, model answer, and five-point rubric.
