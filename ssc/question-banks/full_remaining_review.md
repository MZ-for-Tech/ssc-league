# Full question-bank review

## Scope and method

The 14 lesson banks contain 560 MCQs and 112 structured-response questions (672 items total). The previously inspected sample covered 84 items (three MCQs and three essays per lesson). This review covered every other item: 518 MCQs and 70 essays, or 588 items. Together, the sample reviews and this pass account for every item in all 14 banks.

For each remaining item, I checked the stem and any code or visual stimulus, the keyed answer, distractor distinctions, the explanation or essay justification, the cited lesson source, the essay rubric, and whether the Bloom label reflects the work students must do. I recomputed numerical examples and traced code and diagrams where relevant. The visual review included the flowchart diagrams and the Module 3 chart assets.

## Corrections made

- Replaced semantically duplicate or weak MCQ options in `INTRO-040`, `M2L2-030`, and `M2L5-016`, `M2L5-022`, `M2L5-026`, `M2L5-033`, `M2L5-034`, and `M2L5-040`. The corrected options are in the generation scripts as well as the answer-bearing banks and review artifacts.
- Repaired `M2L2-034` by adding the nested-comparison code and concrete values needed to answer the question.
- During the per-option feedback pass, replaced duplicate correct-choice paraphrases in `M2L5-010`, `M2L5-013`, and `M2L5-037` with distinct, incorrect distractors; these option edits are preserved by the shared bank builder.
- Rewrote the keyed repair in `M2L6-035` to normalize both the character set and the string used for counting; its previous answer described an incomplete fix.
- Added explicit justifications to all eight Module 2 Lesson 2 essays, preserving their five-point rubrics. This closes the missing-justification gap in that earlier bank.
- Corrected item-level Bloom classifications where the original tag understated or overstated the cognitive work, including code tracing and calculation items labeled Understand or Remember, and a small number of recall items labeled Understand. The manual decisions are retained in `apply_bloom_taxonomy.py` and are written into every item with a rationale.

## Explanation-clarity follow-up

A later quality check found that 103 MCQ explanations referred to what the lesson or lecture says instead of making the reasoning stand on its own. Those explanations have been rewritten to connect the facts, rules, calculations, or code behavior to the keyed answer. Four additional short explanations were strengthened to make their reasoning clearer. The revisions are centralized in `explanation_overrides.py` and applied by the lesson build scripts so regeneration preserves them.

After the edits, all 560 MCQs have non-empty explanations; none frames the answer as correct merely because a lesson, lecture, PDF, or Markdown file says so. Essay justifications remain explicit and separately supported by their rubrics.

## Per-option feedback

Each of the 560 MCQs now includes four option-ordered explanations: the established reasoning for the keyed answer and a specific explanation of why each of the three distractors fails. This adds 1,680 distractor rationales. They address the particular mistaken rule, computation, code behavior, or interpretation represented by each choice. The mappings are maintained in `option_feedback_overrides.py`; the shared builder checks that every reason stays aligned with its choice and that the correct choice reuses the question explanation.

The importer requires complete feedback for all four choices and stores each rationale on its `QuestionOption`. After a learner submits an answer, the quiz displays the explanation for every choice; on revisits it restores that feedback only for questions already answered. This feedback was prepared and checked in the same-session review and has not received independent instructor validation.

No answer-key or arithmetic mismatch was found in the 588 previously unaudited items. The issues above concerned missing context, incomplete rationale, or distractor quality rather than a wrong keyed answer.

## Structural and visual scan

A final scan across all 672 items found:

- 560 MCQs with four distinct options, valid answer keys, question explanations, four aligned option explanations, and source locators.
- 112 essays with explicit justifications and rubrics whose points sum to the stated five marks.
- Bloom levels and rationales on every item.
- 82 item references to visual stimuli across 36 distinct assets; every referenced SVG/PNG exists. This includes the flowchart assets and the charts attached to visual questions.
- Zero structural, option-feedback alignment, missing-justification, rubric-total, Bloom-metadata, or referenced-asset errors.

The checks confirm file structure and references; they do not replace an instructor’s subject-matter review.

## Review limitation

This was a same-session AI review informed by the paired course sources. The earlier metadata-hidden passes are not independent blind reviews because the reviewer had already seen the answer-bearing drafts. A separate instructor or reviewer would provide a genuinely independent quality check.

## Supplemental quality pass after synchronization (2026-10-06)

Rechecked all 560 MCQs and 112 essays in the current answer-bearing files for required fields, four distinct choices, key/expected-answer alignment, option-feedback alignment, non-empty essay justifications, and rubric totals. Scanned every learner-facing prompt, choice, explanation, justification, rubric, and code stimulus for references that ask students to rely on a lesson, lecture, PDF, or course source; no candidates remain.

This pass found and corrected leftover source-referential wording in the pandas plotting explanation and four essay rubric criteria. It also changed a displayed code comment from “PDF version” to “Original approach,” and tightened two hardware/language rubrics. Generation sources and feedback overrides were updated alongside the bank. The importer completed, then all 560 question records, 2,240 options, and 112 essay records were compared with the local banks; all matched. `git diff --check` passed.

This supplemental scan focused on post-edit consistency and learner-facing wording. It does not replace the documented same-session review limitation or independent instructor validation.
