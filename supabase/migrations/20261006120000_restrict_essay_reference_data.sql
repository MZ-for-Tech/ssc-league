-- Learners can read essay prompts and stimulus only. Reference answers and
-- marking rubrics remain server-side for a later, explicitly enabled review flow.
BEGIN;

REVOKE SELECT ON public."EssayQuestion" FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, season_id, topic_id, bank_item_id, prompt, response_type,
  stimulus_code, stimulus_asset_url, stimulus_asset_alt, display_order, created_at)
  ON public."EssayQuestion" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."EssayQuestion" TO service_role;

COMMIT;
