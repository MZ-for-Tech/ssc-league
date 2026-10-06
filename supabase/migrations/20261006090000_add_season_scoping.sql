-- Season model foundation. Existing records receive S0 through the column
-- defaults; no application data is deleted or rewritten.
BEGIN;

CREATE TABLE public."Season" (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('setup', 'active', 'archived')),
  starts_on date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public."Season" (id, name, status)
VALUES
  ('S0', 'Season 0', 'active'),
  ('S1', 'Season 1', 'setup');

CREATE UNIQUE INDEX "Season_one_active_idx"
  ON public."Season" (status)
  WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.active_season_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public."Season" WHERE status = 'active' LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."Admin" WHERE auth_id = (SELECT auth.uid())
  )
$$;

REVOKE ALL ON FUNCTION public.active_season_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.active_season_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated, service_role;

ALTER TABLE public."Season" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read the active season"
  ON public."Season" FOR SELECT TO anon, authenticated
  USING (status = 'active');
CREATE POLICY "Admins can read all seasons"
  ON public."Season" FOR SELECT TO authenticated
  USING (public.is_admin_user());

ALTER TABLE public."Student"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."Topic"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."Question"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."QuestionOption"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."TopicResource"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."StudentAnswer"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."WeeklyRankHistory"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."XPTransaction"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."AttendanceRecord"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."Ping"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."QuestionReport"
  ADD COLUMN season_id text NOT NULL DEFAULT 'S0' REFERENCES public."Season"(id);
ALTER TABLE public."AuditLog"
  ADD COLUMN season_id text REFERENCES public."Season"(id);

-- Composite keys let the database reject links across seasons.
CREATE UNIQUE INDEX "Student_season_id_id_uidx" ON public."Student" (season_id, id);
CREATE UNIQUE INDEX "Topic_season_id_id_uidx" ON public."Topic" (season_id, id);
CREATE UNIQUE INDEX "Question_season_id_id_uidx" ON public."Question" (season_id, id);
CREATE UNIQUE INDEX "QuestionOption_season_id_id_uidx" ON public."QuestionOption" (season_id, id);

ALTER TABLE public."Question"
  ADD CONSTRAINT "Question_season_topic_fkey"
  FOREIGN KEY (season_id, topic_id) REFERENCES public."Topic" (season_id, id) NOT VALID;
ALTER TABLE public."QuestionOption"
  ADD CONSTRAINT "QuestionOption_season_question_fkey"
  FOREIGN KEY (season_id, question_id) REFERENCES public."Question" (season_id, id) NOT VALID;
ALTER TABLE public."TopicResource"
  ADD CONSTRAINT "TopicResource_season_topic_fkey"
  FOREIGN KEY (season_id, topic_id) REFERENCES public."Topic" (season_id, id) NOT VALID;
ALTER TABLE public."StudentAnswer"
  ADD CONSTRAINT "StudentAnswer_season_student_fkey"
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."StudentAnswer"
  ADD CONSTRAINT "StudentAnswer_season_question_fkey"
  FOREIGN KEY (season_id, question_id) REFERENCES public."Question" (season_id, id) NOT VALID;
ALTER TABLE public."StudentAnswer"
  ADD CONSTRAINT "StudentAnswer_season_option_fkey"
  FOREIGN KEY (season_id, selected_option_id) REFERENCES public."QuestionOption" (season_id, id) NOT VALID;
ALTER TABLE public."WeeklyRankHistory"
  ADD CONSTRAINT "WeeklyRankHistory_season_student_fkey"
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."XPTransaction"
  ADD CONSTRAINT "XPTransaction_season_student_fkey"
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."AttendanceRecord"
  ADD CONSTRAINT "AttendanceRecord_season_student_fkey"
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."Ping"
  ADD CONSTRAINT "Ping_season_sender_fkey"
  FOREIGN KEY (season_id, sender_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."Ping"
  ADD CONSTRAINT "Ping_season_receiver_fkey"
  FOREIGN KEY (season_id, receiver_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."QuestionReport"
  ADD CONSTRAINT "QuestionReport_season_student_fkey"
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id) NOT VALID;
ALTER TABLE public."QuestionReport"
  ADD CONSTRAINT "QuestionReport_season_question_fkey"
  FOREIGN KEY (season_id, question_id) REFERENCES public."Question" (season_id, id) NOT VALID;

ALTER TABLE public."Question" VALIDATE CONSTRAINT "Question_season_topic_fkey";
ALTER TABLE public."QuestionOption" VALIDATE CONSTRAINT "QuestionOption_season_question_fkey";
ALTER TABLE public."TopicResource" VALIDATE CONSTRAINT "TopicResource_season_topic_fkey";
ALTER TABLE public."StudentAnswer" VALIDATE CONSTRAINT "StudentAnswer_season_student_fkey";
ALTER TABLE public."StudentAnswer" VALIDATE CONSTRAINT "StudentAnswer_season_question_fkey";
ALTER TABLE public."StudentAnswer" VALIDATE CONSTRAINT "StudentAnswer_season_option_fkey";
ALTER TABLE public."WeeklyRankHistory" VALIDATE CONSTRAINT "WeeklyRankHistory_season_student_fkey";
ALTER TABLE public."XPTransaction" VALIDATE CONSTRAINT "XPTransaction_season_student_fkey";
ALTER TABLE public."AttendanceRecord" VALIDATE CONSTRAINT "AttendanceRecord_season_student_fkey";
ALTER TABLE public."Ping" VALIDATE CONSTRAINT "Ping_season_sender_fkey";
ALTER TABLE public."Ping" VALIDATE CONSTRAINT "Ping_season_receiver_fkey";
ALTER TABLE public."QuestionReport" VALIDATE CONSTRAINT "QuestionReport_season_student_fkey";
ALTER TABLE public."QuestionReport" VALIDATE CONSTRAINT "QuestionReport_season_question_fkey";

CREATE INDEX "Student_season_xp_idx" ON public."Student" (season_id, current_xp DESC);
CREATE INDEX "Topic_season_week_idx" ON public."Topic" (season_id, week_number);
CREATE INDEX "Question_season_topic_idx" ON public."Question" (season_id, topic_id);
CREATE INDEX "StudentAnswer_season_student_idx" ON public."StudentAnswer" (season_id, student_id);
CREATE INDEX "WeeklyRankHistory_season_week_idx" ON public."WeeklyRankHistory" (season_id, week_number);
CREATE INDEX "XPTransaction_season_student_idx" ON public."XPTransaction" (season_id, student_id);
CREATE INDEX "AttendanceRecord_season_student_idx" ON public."AttendanceRecord" (season_id, student_id);
CREATE INDEX "Ping_season_receiver_idx" ON public."Ping" (season_id, receiver_id);
CREATE INDEX "QuestionReport_season_question_idx" ON public."QuestionReport" (season_id, question_id);

COMMIT;
