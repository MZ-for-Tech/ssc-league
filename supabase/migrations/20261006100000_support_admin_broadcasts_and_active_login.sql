-- Admins are global accounts, so broadcasts cannot require a Season Student
-- sender. Preserve student-to-student pings while recording admin broadcasts
-- explicitly and keep login lookup within the active season.
BEGIN;

ALTER TABLE public."Ping" ALTER COLUMN sender_id DROP NOT NULL;
ALTER TABLE public."Ping"
  ADD COLUMN sender_admin_id uuid REFERENCES public."Admin"(id),
  ADD COLUMN message text;
ALTER TABLE public."Ping"
  ADD CONSTRAINT "Ping_sender_required_check"
  CHECK (sender_id IS NOT NULL OR sender_admin_id IS NOT NULL);
CREATE INDEX "Ping_sender_admin_idx" ON public."Ping" (sender_admin_id);

CREATE OR REPLACE FUNCTION public.get_email_by_student_id(lookup_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public."Student"
  WHERE student_id = lookup_id
    AND season_id = public.active_season_id()
  LIMIT 1
$$;

COMMIT;
