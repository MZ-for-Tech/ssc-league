-- Keep the legacy bulk XP RPC inside the active season as well.
BEGIN;

CREATE OR REPLACE FUNCTION public.bulk_award_xp(
  target_group text,
  xp_amount integer,
  reason text,
  admin_auth_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_row_id uuid;
  active_id text;
BEGIN
  active_id := public.active_season_id();
  SELECT id INTO admin_row_id FROM public."Admin" WHERE auth_id = admin_auth_id;

  INSERT INTO public."XPTransaction" (season_id, student_id, action_type, description, amount)
  SELECT active_id, id, 'ACTIVITY', reason, xp_amount
  FROM public."Student"
  WHERE season_id = active_id
    AND (target_group = 'ALL' OR group_id = target_group);

  UPDATE public."Student"
  SET current_xp = current_xp + xp_amount
  WHERE season_id = active_id
    AND (target_group = 'ALL' OR group_id = target_group);

  INSERT INTO public."AuditLog" (admin_id, season_id, action, target, details)
  VALUES (admin_row_id, active_id, 'BULK_XP', target_group, format('%s XP - %s', xp_amount, reason));
END;
$$;

COMMIT;
