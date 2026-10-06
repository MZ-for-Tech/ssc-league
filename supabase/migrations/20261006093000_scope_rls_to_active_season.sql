-- Keep the currently active season visible while ensuring that a later season
-- cutover automatically hides archived rows from non-admin users.
BEGIN;

GRANT SELECT ON public."Season" TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon;

CREATE OR REPLACE FUNCTION public.guard_active_season_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  active_id text;
BEGIN
  active_id := public.active_season_id();

  IF TG_TABLE_NAME = 'AuditLog' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.season_id IS NULL OR NEW.season_id = active_id THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'Cannot add audit records to an inactive season';
    END IF;
    RAISE EXCEPTION 'Audit records are append-only';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.season_id = active_id THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Writes are allowed only in the active season';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.season_id = active_id AND NEW.season_id = active_id THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Inactive season records are read-only';
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.season_id = active_id THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Inactive season records are read-only';
  END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.guard_active_season_write() TO anon, authenticated, service_role;

CREATE TRIGGER "Student_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."Student" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "Topic_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."Topic" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "Question_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."Question" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "QuestionOption_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."QuestionOption" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "TopicResource_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."TopicResource" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "StudentAnswer_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."StudentAnswer" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "WeeklyRankHistory_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."WeeklyRankHistory" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "XPTransaction_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."XPTransaction" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "AttendanceRecord_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."AttendanceRecord" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "Ping_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."Ping" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "QuestionReport_active_season_write_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."QuestionReport" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();
CREATE TRIGGER "AuditLog_append_only_guard" BEFORE INSERT OR UPDATE OR DELETE ON public."AuditLog" FOR EACH ROW EXECUTE FUNCTION public.guard_active_season_write();

DROP POLICY "Enable read access for all authenticated users" ON public."Student";
CREATE POLICY "Users read active students and admins read all"
  ON public."Student" FOR SELECT TO authenticated
  USING (season_id = public.active_season_id() OR public.is_admin_user());

DROP POLICY "Individuals can update their own data" ON public."Student";
CREATE POLICY "Students update own active profile"
  ON public."Student" FOR UPDATE TO authenticated
  USING (auth_id = (SELECT auth.uid()) AND season_id = public.active_season_id())
  WITH CHECK (auth_id = (SELECT auth.uid()) AND season_id = public.active_season_id());

DROP POLICY "Public Read Questions" ON public."Question";
CREATE POLICY "Read active questions and admin archives"
  ON public."Question" FOR SELECT TO public
  USING (season_id = public.active_season_id() OR public.is_admin_user());

DROP POLICY "Public Read Options" ON public."QuestionOption";
CREATE POLICY "Read active options and admin archives"
  ON public."QuestionOption" FOR SELECT TO public
  USING (season_id = public.active_season_id() OR public.is_admin_user());

DROP POLICY "Authenticated users can read topics" ON public."Topic";
CREATE POLICY "Read active topics and admin archives"
  ON public."Topic" FOR SELECT TO authenticated
  USING (season_id = public.active_season_id() OR public.is_admin_user());
DROP POLICY "Admins can insert topics" ON public."Topic";
CREATE POLICY "Admins insert active topics"
  ON public."Topic" FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
DROP POLICY "Admins can update topics" ON public."Topic";
CREATE POLICY "Admins update active topics"
  ON public."Topic" FOR UPDATE TO authenticated
  USING (public.is_admin_user() AND season_id = public.active_season_id())
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
DROP POLICY "Admins can delete topics" ON public."Topic";
CREATE POLICY "Admins delete active topics"
  ON public."Topic" FOR DELETE TO authenticated
  USING (public.is_admin_user() AND season_id = public.active_season_id());

DROP POLICY "Public Read Resources" ON public."TopicResource";
CREATE POLICY "Read active resources and admin archives"
  ON public."TopicResource" FOR SELECT TO public
  USING (season_id = public.active_season_id() OR public.is_admin_user());

DROP POLICY "Student Read Answers" ON public."StudentAnswer";
CREATE POLICY "Students read own active answers and admins read all"
  ON public."StudentAnswer" FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR (
      season_id = public.active_season_id()
      AND EXISTS (
        SELECT 1 FROM public."Student" s
        WHERE s.id = "StudentAnswer".student_id
          AND s.auth_id = (SELECT auth.uid())
          AND s.season_id = public.active_season_id()
      )
    )
  );
DROP POLICY "Student Insert Answers" ON public."StudentAnswer";
CREATE POLICY "Students insert own active answers"
  ON public."StudentAnswer" FOR INSERT TO authenticated
  WITH CHECK (
    season_id = public.active_season_id()
    AND EXISTS (
      SELECT 1 FROM public."Student" s
      WHERE s.id = "StudentAnswer".student_id
        AND s.auth_id = (SELECT auth.uid())
        AND s.season_id = public.active_season_id()
    )
  );

DROP POLICY "Authenticated users can read rank history" ON public."WeeklyRankHistory";
CREATE POLICY "Read active rank history and admin archives"
  ON public."WeeklyRankHistory" FOR SELECT TO authenticated
  USING (season_id = public.active_season_id() OR public.is_admin_user());
DROP POLICY "Admins can modify history" ON public."WeeklyRankHistory";
CREATE POLICY "Admins insert active rank history"
  ON public."WeeklyRankHistory" FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());

DROP POLICY "Users see own attendance, Admins see all" ON public."AttendanceRecord";
CREATE POLICY "Users read own active attendance and admins read all"
  ON public."AttendanceRecord" FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR (
      season_id = public.active_season_id()
      AND EXISTS (
        SELECT 1 FROM public."Student" s
        WHERE s.id = "AttendanceRecord".student_id
          AND s.auth_id = (SELECT auth.uid())
          AND s.season_id = public.active_season_id()
      )
    )
  );
DROP POLICY "Admins can insert attendance" ON public."AttendanceRecord";
CREATE POLICY "Admins insert active attendance"
  ON public."AttendanceRecord" FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
DROP POLICY "Admins can update attendance" ON public."AttendanceRecord";
CREATE POLICY "Admins update active attendance"
  ON public."AttendanceRecord" FOR UPDATE TO authenticated
  USING (public.is_admin_user() AND season_id = public.active_season_id())
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
DROP POLICY "Admins can delete attendance" ON public."AttendanceRecord";
CREATE POLICY "Admins delete active attendance"
  ON public."AttendanceRecord" FOR DELETE TO authenticated
  USING (public.is_admin_user() AND season_id = public.active_season_id());

DROP POLICY "Users see own transactions, Admins see all" ON public."XPTransaction";
CREATE POLICY "Users read own active transactions and admins read all"
  ON public."XPTransaction" FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR (
      season_id = public.active_season_id()
      AND EXISTS (
        SELECT 1 FROM public."Student" s
        WHERE s.id = "XPTransaction".student_id
          AND s.auth_id = (SELECT auth.uid())
          AND s.season_id = public.active_season_id()
      )
    )
  );
DROP POLICY "Admins can insert XP" ON public."XPTransaction";
CREATE POLICY "Admins insert active XP"
  ON public."XPTransaction" FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
DROP POLICY "Admins can update XP" ON public."XPTransaction";
CREATE POLICY "Admins update active XP"
  ON public."XPTransaction" FOR UPDATE TO authenticated
  USING (public.is_admin_user() AND season_id = public.active_season_id())
  WITH CHECK (public.is_admin_user() AND season_id = public.active_season_id());
DROP POLICY "Admins can delete XP" ON public."XPTransaction";
CREATE POLICY "Admins delete active XP"
  ON public."XPTransaction" FOR DELETE TO authenticated
  USING (public.is_admin_user() AND season_id = public.active_season_id());

DROP POLICY "Enable read for users involved" ON public."Ping";
CREATE POLICY "Users read active pings and admins read all"
  ON public."Ping" FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR (
      season_id = public.active_season_id()
      AND EXISTS (
        SELECT 1 FROM public."Student" s
        WHERE s.auth_id = (SELECT auth.uid())
          AND s.season_id = public.active_season_id()
          AND s.id IN ("Ping".sender_id, "Ping".receiver_id)
      )
    )
  );
DROP POLICY "Enable insert for authenticated users only" ON public."Ping";
CREATE POLICY "Users insert active pings"
  ON public."Ping" FOR INSERT TO authenticated
  WITH CHECK (
    season_id = public.active_season_id()
    AND (
      public.is_admin_user()
      OR EXISTS (
        SELECT 1 FROM public."Student" s
        WHERE s.id = "Ping".sender_id
          AND s.auth_id = (SELECT auth.uid())
          AND s.season_id = public.active_season_id()
      )
    )
  );

DROP POLICY "Students can create reports" ON public."QuestionReport";
CREATE POLICY "Students report active questions"
  ON public."QuestionReport" FOR INSERT TO authenticated
  WITH CHECK (
    season_id = public.active_season_id()
    AND EXISTS (
      SELECT 1 FROM public."Student" s
      WHERE s.id = "QuestionReport".student_id
        AND s.auth_id = (SELECT auth.uid())
        AND s.season_id = public.active_season_id()
    )
  );

COMMIT;
