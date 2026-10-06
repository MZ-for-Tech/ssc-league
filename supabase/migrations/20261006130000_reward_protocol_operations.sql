BEGIN;

CREATE TABLE public."SeasonWeek" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  week_number integer NOT NULL CHECK (week_number > 0),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  boost_multiplier numeric(5, 2) NOT NULL DEFAULT 1 CHECK (boost_multiplier > 0 AND boost_multiplier <= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, week_number),
  UNIQUE (season_id, id),
  CHECK (starts_on <= ends_on)
);

ALTER TABLE public."SeasonWeek" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read season weeks"
  ON public."SeasonWeek" FOR SELECT TO authenticated
  USING (public.is_admin_user());
GRANT SELECT ON public."SeasonWeek" TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public."SeasonWeek" FROM anon, authenticated;
CREATE TRIGGER "SeasonWeek_active_season_write_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON public."SeasonWeek"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();

CREATE TABLE public."RewardProtocolBatch" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  category text NOT NULL CHECK (category IN ('quiz', 'attendance', 'coursework', 'participation')),
  reward_key text NOT NULL,
  reward_label text NOT NULL,
  event_label text NOT NULL,
  award_date date NOT NULL,
  week_number integer NOT NULL CHECK (week_number > 0),
  base_amount integer NOT NULL CHECK (base_amount > 0),
  boost_multiplier numeric(5, 2) NOT NULL CHECK (boost_multiplier > 0),
  amount integer NOT NULL CHECK (amount > 0),
  admin_id uuid NOT NULL REFERENCES public."Admin"(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, id)
);

CREATE TABLE public."RewardProtocolRecipient" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL,
  batch_id uuid NOT NULL,
  student_id text NOT NULL,
  category text NOT NULL CHECK (category IN ('quiz', 'attendance', 'coursework', 'participation')),
  reward_key text NOT NULL,
  event_label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, student_id),
  FOREIGN KEY (season_id, batch_id) REFERENCES public."RewardProtocolBatch" (season_id, id),
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id)
);

-- Attendance milestones can only be awarded once to a student per season.
CREATE UNIQUE INDEX "RewardProtocolRecipient_attendance_once_idx"
  ON public."RewardProtocolRecipient" (season_id, student_id, reward_key)
  WHERE category = 'attendance';

-- Repeatable rewards may be processed in multiple batches, but not twice for
-- the same student and named event.
CREATE UNIQUE INDEX "RewardProtocolRecipient_repeatable_event_idx"
  ON public."RewardProtocolRecipient" (season_id, category, reward_key, lower(event_label), student_id)
  WHERE category <> 'attendance';

CREATE INDEX "RewardProtocolBatch_season_created_idx"
  ON public."RewardProtocolBatch" (season_id, created_at DESC);
CREATE INDEX "SeasonWeek_season_range_idx"
  ON public."SeasonWeek" (season_id, starts_on, ends_on);

CREATE TABLE public."SeasonSession" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  session_number integer CHECK (session_number > 0),
  session_date date NOT NULL,
  module_title text,
  topic_title text NOT NULL,
  coverage_status text NOT NULL DEFAULT 'planned' CHECK (coverage_status IN ('planned', 'done', 'not_covered', 'midterm', 'practical_quiz')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, id)
);

CREATE INDEX "SeasonSession_season_date_idx"
  ON public."SeasonSession" (season_id, session_date, session_number);
ALTER TABLE public."SeasonSession" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read season sessions"
  ON public."SeasonSession" FOR SELECT TO authenticated
  USING (public.is_admin_user());
GRANT SELECT ON public."SeasonSession" TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public."SeasonSession" FROM anon, authenticated;
CREATE TRIGGER "SeasonSession_active_season_write_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON public."SeasonSession"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();

CREATE TABLE public."SeasonRecognition" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL REFERENCES public."Season"(id),
  student_id text NOT NULL,
  event_date date NOT NULL,
  session_number integer CHECK (session_number IS NULL OR session_number > 0),
  recognition_type text NOT NULL CHECK (recognition_type IN ('support', 'extra_effort')),
  notes text,
  admin_id uuid NOT NULL REFERENCES public."Admin"(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (season_id, student_id) REFERENCES public."Student" (season_id, id),
  UNIQUE (season_id, student_id, event_date, recognition_type)
);
CREATE INDEX "SeasonRecognition_season_event_idx"
  ON public."SeasonRecognition" (season_id, event_date DESC);
ALTER TABLE public."SeasonRecognition" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read season recognition"
  ON public."SeasonRecognition" FOR SELECT TO authenticated
  USING (public.is_admin_user());
GRANT SELECT ON public."SeasonRecognition" TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public."SeasonRecognition" FROM anon, authenticated;
CREATE TRIGGER "SeasonRecognition_active_season_write_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON public."SeasonRecognition"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE INDEX "RewardProtocolRecipient_season_batch_idx"
  ON public."RewardProtocolRecipient" (season_id, batch_id);

ALTER TABLE public."RewardProtocolBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RewardProtocolRecipient" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read reward protocol batches"
  ON public."RewardProtocolBatch" FOR SELECT TO authenticated
  USING (public.is_admin_user());
CREATE POLICY "Admins read reward protocol recipients"
  ON public."RewardProtocolRecipient" FOR SELECT TO authenticated
  USING (public.is_admin_user());

GRANT SELECT ON public."RewardProtocolBatch", public."RewardProtocolRecipient" TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public."RewardProtocolBatch", public."RewardProtocolRecipient" FROM anon, authenticated;

CREATE TRIGGER "RewardProtocolBatch_active_season_write_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON public."RewardProtocolBatch"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "RewardProtocolRecipient_active_season_write_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON public."RewardProtocolRecipient"
  FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();

CREATE OR REPLACE FUNCTION public.award_reward_protocol(
  p_category text,
  p_reward_key text,
  p_reward_label text,
  p_event_label text,
  p_base_amount integer,
  p_student_ids text[],
  p_award_date date,
  p_admin_id uuid
)
RETURNS TABLE(batch_id uuid, recipient_count integer, week_number integer, boost_multiplier numeric, awarded_amount integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_id text;
  admin_row_id uuid;
  new_batch_id uuid;
  matched_count integer;
  matching_week_count integer;
  configured_week integer;
  configured_boost numeric(5, 2);
  effective_amount integer;
BEGIN
  IF auth.role() = 'service_role' THEN
    SELECT id INTO admin_row_id FROM public."Admin" WHERE id = p_admin_id;
  ELSE
    IF NOT public.is_admin_user() THEN
      RAISE EXCEPTION 'Administrator access is required.';
    END IF;
    SELECT id INTO admin_row_id FROM public."Admin" WHERE auth_id = auth.uid();
  END IF;
  IF admin_row_id IS NULL THEN
    RAISE EXCEPTION 'Administrator access is required.';
  END IF;

  IF NOT (
    (p_category = 'quiz' AND p_reward_key = 'pass_quiz' AND p_base_amount = 20)
    OR
    (p_category = 'attendance' AND p_reward_key IN ('first_two_weeks', 'sessions_1_2') AND p_base_amount = 10)
    OR (p_category = 'attendance' AND p_reward_key = 'sessions_3_4' AND p_base_amount = 15)
    OR (p_category = 'attendance' AND p_reward_key = 'sessions_5_6' AND p_base_amount = 20)
    OR (p_category = 'attendance' AND p_reward_key = 'sessions_7_plus' AND p_base_amount = 25)
    OR (p_category = 'coursework' AND p_reward_key = 'practice_exam' AND p_base_amount = 10)
    OR (p_category = 'coursework' AND p_reward_key = 'assignment' AND p_base_amount = 30)
    OR (p_category = 'coursework' AND p_reward_key = 'project' AND p_base_amount = 40)
    OR (p_category = 'coursework' AND p_reward_key = 'midterm_exam' AND p_base_amount = 40)
    OR (p_category = 'participation' AND p_reward_key IN ('punctuality', 'office_hours') AND p_base_amount = 10)
    OR (p_category = 'participation' AND p_reward_key = 'group_participation' AND p_base_amount = 15)
    OR (p_category = 'participation' AND p_reward_key IN ('extra_effort', 'knowledge_sharing') AND p_base_amount = 20)
  ) THEN
    RAISE EXCEPTION 'The selected reward does not match the published protocol.';
  END IF;

  IF p_reward_label IS DISTINCT FROM (CASE
    WHEN p_reward_key = 'pass_quiz' THEN 'Pass a Quiz'
    WHEN p_reward_key = 'first_two_weeks' THEN 'First 2 weeks'
    WHEN p_reward_key = 'sessions_1_2' THEN 'Sessions 1–2'
    WHEN p_reward_key = 'sessions_3_4' THEN 'Sessions 3–4'
    WHEN p_reward_key = 'sessions_5_6' THEN 'Sessions 5–6'
    WHEN p_reward_key = 'sessions_7_plus' THEN '7+ sessions'
    WHEN p_reward_key = 'practice_exam' THEN 'Practice exam'
    WHEN p_reward_key = 'assignment' THEN 'Submit an assignment'
    WHEN p_reward_key = 'project' THEN 'Project'
    WHEN p_reward_key = 'midterm_exam' THEN 'Pass midterm exam'
    WHEN p_reward_key = 'punctuality' THEN 'Punctuality'
    WHEN p_reward_key = 'office_hours' THEN 'Office hours'
    WHEN p_reward_key = 'group_participation' THEN 'Group participation'
    WHEN p_reward_key = 'extra_effort' THEN 'Extra effort'
    WHEN p_reward_key = 'knowledge_sharing' THEN 'Knowledge sharing'
    ELSE NULL
  END) THEN
    RAISE EXCEPTION 'The selected reward label does not match the published protocol.';
  END IF;

  IF p_student_ids IS NULL OR cardinality(p_student_ids) = 0 OR p_event_label IS NULL OR btrim(p_event_label) = '' OR p_award_date IS NULL THEN
    RAISE EXCEPTION 'Choose at least one student and provide an event name.';
  END IF;
  IF p_category <> 'attendance' AND length(btrim(p_event_label)) > 100 THEN
    RAISE EXCEPTION 'Event name must be 100 characters or fewer.';
  END IF;
  IF p_category = 'attendance' AND btrim(p_event_label) <> p_reward_label THEN
    RAISE EXCEPTION 'Attendance milestone labels must match the protocol.';
  END IF;
  active_id := public.active_season_id();
  SELECT count(*) INTO matching_week_count
    FROM public."SeasonWeek" sw
    WHERE sw.season_id = active_id AND p_award_date BETWEEN sw.starts_on AND sw.ends_on;
  IF matching_week_count <> 1 THEN
    RAISE EXCEPTION 'Configure exactly one league week covering this award date.';
  END IF;
  SELECT sw.week_number, sw.boost_multiplier
    INTO configured_week, configured_boost
    FROM public."SeasonWeek" sw
    WHERE sw.season_id = active_id AND p_award_date BETWEEN sw.starts_on AND sw.ends_on;
  IF configured_week IS NULL THEN
    RAISE EXCEPTION 'Add a week covering this award date in the season schedule first.';
  END IF;
  effective_amount := round(p_base_amount * configured_boost)::integer;
  IF effective_amount < 1 THEN
    RAISE EXCEPTION 'The boosted reward must be at least 1 XP.';
  END IF;
  SELECT count(DISTINCT s.id) INTO matched_count
    FROM public."Student" s
    WHERE s.season_id = active_id AND s.id = ANY(p_student_ids);
  IF matched_count <> cardinality(p_student_ids) THEN
    RAISE EXCEPTION 'One or more selected students are not in the active season.';
  END IF;

  INSERT INTO public."RewardProtocolBatch" (
    season_id, category, reward_key, reward_label, event_label, award_date, week_number,
    base_amount, boost_multiplier, amount, admin_id
  ) VALUES (
    active_id, p_category, p_reward_key, p_reward_label, btrim(p_event_label), p_award_date,
    configured_week, p_base_amount, configured_boost, effective_amount, admin_row_id
  ) RETURNING id INTO new_batch_id;

  INSERT INTO public."RewardProtocolRecipient" (season_id, batch_id, student_id, category, reward_key, event_label)
  SELECT active_id, new_batch_id, s.id, p_category, p_reward_key, btrim(p_event_label)
    FROM public."Student" s
    WHERE s.season_id = active_id AND s.id = ANY(p_student_ids);

  INSERT INTO public."XPTransaction" (
    id, season_id, student_id, amount, action_type, description, week_number, created_at
  )
  SELECT gen_random_uuid(), active_id, s.id, effective_amount, 'MANUAL_ENTRY',
    p_reward_label || ' — ' || btrim(p_event_label), configured_week, now()
    FROM public."Student" s
    WHERE s.season_id = active_id AND s.id = ANY(p_student_ids);

  UPDATE public."Student" s
    SET current_xp = coalesce(s.current_xp, 0) + effective_amount
    WHERE s.season_id = active_id AND s.id = ANY(p_student_ids);

  INSERT INTO public."AuditLog" (admin_id, season_id, action, target, details, created_at)
  VALUES (
    admin_row_id,
    active_id,
    'REWARD_PROTOCOL',
    p_event_label,
    format('%s: %s XP × %s = %s XP to %s students', p_reward_label, p_base_amount, configured_boost, effective_amount, matched_count),
    now()
  );

  RETURN QUERY SELECT new_batch_id, matched_count, configured_week, configured_boost, effective_amount;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'This reward was already issued to one or more selected students, or this event name has already been used.';
END;
$$;

REVOKE ALL ON FUNCTION public.award_reward_protocol(text, text, text, text, integer, text[], date, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_reward_protocol(text, text, text, text, integer, text[], date, uuid) TO authenticated, service_role;

COMMIT;
