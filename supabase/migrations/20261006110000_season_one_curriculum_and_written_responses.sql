-- Season 1 curriculum metadata, complete question-bank provenance, and
-- ungraded structured-response prompts and submissions.
BEGIN;

CREATE TABLE public."Module" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  module_number smallint NOT NULL CHECK (module_number > 0),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  display_order smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, id),
  UNIQUE (season_id, module_number),
  UNIQUE (season_id, display_order)
);

ALTER TABLE public."Module" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read active modules and admin archives" ON public."Module"
  FOR SELECT TO authenticated USING (season_id = public.active_season_id() OR public.is_admin_user());
CREATE POLICY "Admins insert active modules" ON public."Module"
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
CREATE POLICY "Admins update active modules" ON public."Module"
  FOR UPDATE TO authenticated USING (public.is_admin_user() AND season_id = public.active_season_id())
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
CREATE POLICY "Admins delete active modules" ON public."Module"
  FOR DELETE TO authenticated USING (public.is_admin_user() AND season_id = public.active_season_id());
CREATE TRIGGER "Module_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."Module"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Module" TO authenticated, service_role;

ALTER TABLE public."Topic"
  ADD COLUMN module_id uuid,
  ADD COLUMN lesson_number smallint,
  ADD COLUMN curriculum_key text;
ALTER TABLE public."Topic"
  ADD CONSTRAINT "Topic_season_module_fkey"
    FOREIGN KEY (season_id, module_id) REFERENCES public."Module"(season_id, id),
  ADD CONSTRAINT "Topic_season_lesson_number_key" UNIQUE (season_id, module_id, lesson_number);
CREATE UNIQUE INDEX "Topic_season_curriculum_key_uidx"
  ON public."Topic" (season_id, curriculum_key);

ALTER TABLE public."Question"
  ADD COLUMN bank_item_id text,
  ADD COLUMN display_order smallint,
  ADD COLUMN objective text,
  ADD COLUMN operation text,
  ADD COLUMN source_ref text,
  ADD COLUMN explanation text,
  ADD COLUMN stimulus_code text,
  ADD COLUMN stimulus_asset_url text,
  ADD COLUMN stimulus_asset_alt text,
  ADD COLUMN bloom_level text,
  ADD COLUMN bloom_rationale text;
CREATE UNIQUE INDEX "Question_season_bank_item_uidx"
  ON public."Question" (season_id, bank_item_id);

CREATE TABLE public."EssayQuestion" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  topic_id integer NOT NULL,
  bank_item_id text NOT NULL,
  prompt text NOT NULL,
  response_type text,
  stimulus_code text,
  stimulus_asset_url text,
  stimulus_asset_alt text,
  source_ref text,
  operation text,
  bloom_level text,
  bloom_rationale text,
  expected_answer text,
  rubric jsonb NOT NULL DEFAULT '[]'::jsonb,
  justification text,
  suggested_marks smallint CHECK (suggested_marks IS NULL OR suggested_marks > 0),
  display_order smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, id),
  UNIQUE (season_id, bank_item_id),
  UNIQUE (season_id, topic_id, display_order),
  FOREIGN KEY (season_id, topic_id) REFERENCES public."Topic"(season_id, id)
);
CREATE INDEX "EssayQuestion_season_topic_idx" ON public."EssayQuestion" (season_id, topic_id, display_order);
ALTER TABLE public."EssayQuestion" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read active essays and admin archives" ON public."EssayQuestion"
  FOR SELECT TO authenticated USING (season_id = public.active_season_id() OR public.is_admin_user());
CREATE TRIGGER "EssayQuestion_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."EssayQuestion"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
GRANT SELECT (id, season_id, topic_id, bank_item_id, prompt, response_type,
  stimulus_code, stimulus_asset_url, stimulus_asset_alt, display_order, created_at)
  ON public."EssayQuestion" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."EssayQuestion" TO service_role;

CREATE TABLE public."StudentEssayResponse" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  student_id text NOT NULL,
  essay_question_id uuid NOT NULL,
  response_text text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, student_id, essay_question_id),
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student"(season_id, id),
  FOREIGN KEY (season_id, essay_question_id) REFERENCES public."EssayQuestion"(season_id, id)
);
CREATE INDEX "StudentEssayResponse_season_student_idx"
  ON public."StudentEssayResponse" (season_id, student_id);
ALTER TABLE public."StudentEssayResponse" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own active essay responses and admins read all" ON public."StudentEssayResponse"
  FOR SELECT TO authenticated USING (
    public.is_admin_user() OR (
      season_id = public.active_season_id()
      AND EXISTS (SELECT 1 FROM public."Student" s WHERE s.id = student_id
        AND s.auth_id = (SELECT auth.uid()) AND s.season_id = public.active_season_id())
    )
  );
CREATE POLICY "Students insert own active essay responses" ON public."StudentEssayResponse"
  FOR INSERT TO authenticated WITH CHECK (
    season_id = public.active_season_id()
    AND EXISTS (SELECT 1 FROM public."Student" s WHERE s.id = student_id
      AND s.auth_id = (SELECT auth.uid()) AND s.season_id = public.active_season_id())
  );
CREATE POLICY "Students update own active essay responses" ON public."StudentEssayResponse"
  FOR UPDATE TO authenticated USING (
    season_id = public.active_season_id()
    AND EXISTS (SELECT 1 FROM public."Student" s WHERE s.id = student_id
      AND s.auth_id = (SELECT auth.uid()) AND s.season_id = public.active_season_id())
  ) WITH CHECK (
    season_id = public.active_season_id()
    AND EXISTS (SELECT 1 FROM public."Student" s WHERE s.id = student_id
      AND s.auth_id = (SELECT auth.uid()) AND s.season_id = public.active_season_id())
  );
CREATE TRIGGER "StudentEssayResponse_active_season_write_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON public."StudentEssayResponse"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
GRANT SELECT, INSERT, UPDATE ON public."StudentEssayResponse" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."StudentEssayResponse" TO service_role;

-- Keep answer keys and feedback server-only; question text and options remain
-- readable to signed-in learners for the active season.
REVOKE SELECT ON public."Question" FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, topic_id, text, points, created_at, difficulty, season_id, display_order,
  bank_item_id, objective, operation, source_ref, stimulus_code,
  stimulus_asset_url, stimulus_asset_alt, bloom_level, bloom_rationale)
  ON public."Question" TO anon, authenticated;
REVOKE SELECT ON public."QuestionOption" FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, question_id, text, created_at, season_id)
  ON public."QuestionOption" TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public."StudentAnswer" FROM anon, authenticated;
GRANT SELECT ON public."StudentAnswer" TO authenticated;

COMMIT;
