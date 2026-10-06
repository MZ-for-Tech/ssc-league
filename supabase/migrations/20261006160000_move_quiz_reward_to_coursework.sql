BEGIN;

UPDATE public."RewardProtocolTask"
  SET category = 'coursework', sort_order = 0, updated_at = now()
  WHERE category = 'quiz';

UPDATE public."RewardProtocolBatch"
  SET category = 'coursework'
  WHERE category = 'quiz';

UPDATE public."RewardProtocolRecipient"
  SET category = 'coursework'
  WHERE category = 'quiz';

ALTER TABLE public."RewardProtocolTask"
  DROP CONSTRAINT "RewardProtocolTask_category_check",
  ADD CONSTRAINT "RewardProtocolTask_category_check"
    CHECK (category IN ('attendance', 'coursework', 'participation'));

ALTER TABLE public."RewardProtocolBatch"
  DROP CONSTRAINT "RewardProtocolBatch_category_check",
  ADD CONSTRAINT "RewardProtocolBatch_category_check"
    CHECK (category IN ('attendance', 'coursework', 'participation'));

ALTER TABLE public."RewardProtocolRecipient"
  DROP CONSTRAINT "RewardProtocolRecipient_category_check",
  ADD CONSTRAINT "RewardProtocolRecipient_category_check"
    CHECK (category IN ('attendance', 'coursework', 'participation'));

COMMIT;
