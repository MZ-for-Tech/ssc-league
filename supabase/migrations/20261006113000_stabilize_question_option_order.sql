-- Preserve the source answer order for newly imported question banks.
BEGIN;

ALTER TABLE public."QuestionOption"
  ADD COLUMN option_order smallint;

GRANT SELECT (option_order)
  ON public."QuestionOption" TO anon, authenticated;

COMMIT;
