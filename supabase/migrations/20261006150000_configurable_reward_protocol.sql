BEGIN;

CREATE TABLE public."RewardProtocolTask" (
  category text NOT NULL CHECK (category IN ('quiz', 'attendance', 'coursework', 'participation')),
  reward_key text NOT NULL,
  reward_label text NOT NULL,
  xp integer NOT NULL CHECK (xp BETWEEN 1 AND 1000),
  sort_order integer NOT NULL,
  updated_by uuid REFERENCES public."Admin"(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (category, reward_key)
);

INSERT INTO public."RewardProtocolTask" (category, reward_key, reward_label, xp, sort_order) VALUES
  ('quiz', 'pass_quiz', 'Pass a Quiz', 20, 0),
  ('attendance', 'first_two_weeks', 'First 2 weeks', 10, 1),
  ('attendance', 'sessions_1_2', 'Sessions 1–2', 10, 2),
  ('attendance', 'sessions_3_4', 'Sessions 3–4', 15, 3),
  ('attendance', 'sessions_5_6', 'Sessions 5–6', 20, 4),
  ('attendance', 'sessions_7_plus', '7+ sessions', 25, 5),
  ('coursework', 'practice_exam', 'Practice exam', 10, 6),
  ('coursework', 'assignment', 'Submit an assignment', 30, 7),
  ('coursework', 'project', 'Project', 40, 8),
  ('coursework', 'midterm_exam', 'Pass midterm exam', 40, 9),
  ('participation', 'punctuality', 'Punctuality', 10, 10),
  ('participation', 'office_hours', 'Office hours', 10, 11),
  ('participation', 'group_participation', 'Group participation', 15, 12),
  ('participation', 'extra_effort', 'Extra effort', 20, 13),
  ('participation', 'knowledge_sharing', 'Knowledge sharing', 20, 14)
ON CONFLICT (category, reward_key) DO NOTHING;

ALTER TABLE public."RewardProtocolTask" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reward protocol tasks"
  ON public."RewardProtocolTask" FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public."RewardProtocolTask" TO anon, authenticated, service_role;
REVOKE INSERT, UPDATE, DELETE ON public."RewardProtocolTask" FROM anon, authenticated;
GRANT INSERT, UPDATE ON public."RewardProtocolTask" TO service_role;

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
  configured_base integer;
  configured_label text;
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

  SELECT task.xp, task.reward_label
    INTO configured_base, configured_label
    FROM public."RewardProtocolTask" task
    WHERE task.category = p_category AND task.reward_key = p_reward_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Choose a reward from the published protocol.';
  END IF;
  IF p_base_amount IS DISTINCT FROM configured_base OR p_reward_label IS DISTINCT FROM configured_label THEN
    RAISE EXCEPTION 'The selected reward does not match the current protocol values. Refresh and try again.';
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
  effective_amount := round(configured_base * configured_boost)::integer;
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
    active_id, p_category, p_reward_key, configured_label, btrim(p_event_label), p_award_date,
    configured_week, configured_base, configured_boost, effective_amount, admin_row_id
  ) RETURNING id INTO new_batch_id;

  INSERT INTO public."RewardProtocolRecipient" (season_id, batch_id, student_id, category, reward_key, event_label)
  SELECT active_id, new_batch_id, s.id, p_category, p_reward_key, btrim(p_event_label)
    FROM public."Student" s
    WHERE s.season_id = active_id AND s.id = ANY(p_student_ids);

  INSERT INTO public."XPTransaction" (
    id, season_id, student_id, amount, action_type, description, week_number, created_at
  )
  SELECT gen_random_uuid(), active_id, s.id, effective_amount, 'MANUAL_ENTRY',
    configured_label || ' — ' || btrim(p_event_label), configured_week, now()
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
    format('%s: %s XP × %s = %s XP to %s students', configured_label, configured_base, configured_boost, effective_amount, matched_count),
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
