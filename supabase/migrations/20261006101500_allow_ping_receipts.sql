-- A recipient may mark an active-season ping as read, without granting access
-- to pings from another season or changing the archive.
BEGIN;

CREATE POLICY "Receivers mark active pings read"
  ON public."Ping" FOR UPDATE TO authenticated
  USING (
    season_id = public.active_season_id()
    AND EXISTS (
      SELECT 1 FROM public."Student" s
      WHERE s.id = "Ping".receiver_id
        AND s.auth_id = (SELECT auth.uid())
        AND s.season_id = public.active_season_id()
    )
  )
  WITH CHECK (
    season_id = public.active_season_id()
    AND EXISTS (
      SELECT 1 FROM public."Student" s
      WHERE s.id = "Ping".receiver_id
        AND s.auth_id = (SELECT auth.uid())
        AND s.season_id = public.active_season_id()
    )
  );

COMMIT;
