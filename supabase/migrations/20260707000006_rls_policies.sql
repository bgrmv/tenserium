-- Phase 8: Row Level Security policies

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS app_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: role hierarchy check
CREATE OR REPLACE FUNCTION has_role(min_role app_role)
RETURNS boolean AS $$
  SELECT CASE get_my_role()
    WHEN 'admin' THEN true
    WHEN 'moderator' THEN min_role IN ('user', 'support', 'moderator')
    WHEN 'support' THEN min_role IN ('user', 'support')
    WHEN 'user' THEN min_role = 'user'
    ELSE false
  END;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── users ────────────────────────────────────────────────────────────────────

CREATE POLICY "users_select"
  ON users FOR SELECT
  USING (id = auth.uid() OR has_role('support'));

CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_admin"
  ON users FOR UPDATE
  USING (has_role('admin'));

CREATE POLICY "users_delete_admin"
  ON users FOR DELETE
  USING (get_my_role() = 'admin');

-- ─── questions ────────────────────────────────────────────────────────────────

CREATE POLICY "questions_select_active"
  ON questions FOR SELECT
  USING (status = 'active' OR has_role('moderator'));

CREATE POLICY "questions_insert_moderator"
  ON questions FOR INSERT
  WITH CHECK (has_role('moderator'));

CREATE POLICY "questions_update_moderator"
  ON questions FOR UPDATE
  USING (has_role('moderator'));

CREATE POLICY "questions_delete_admin"
  ON questions FOR DELETE
  USING (get_my_role() = 'admin');

-- ─── sessions ─────────────────────────────────────────────────────────────────

CREATE POLICY "sessions_select"
  ON sessions FOR SELECT
  USING (user_id = auth.uid() OR has_role('support'));

CREATE POLICY "sessions_insert_own"
  ON sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ─── session_answers ──────────────────────────────────────────────────────────

CREATE POLICY "session_answers_select"
  ON session_answers FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
    OR has_role('support')
  );

CREATE POLICY "session_answers_insert_own"
  ON session_answers FOR INSERT
  WITH CHECK (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );

-- ─── daily_challenge ──────────────────────────────────────────────────────────

CREATE POLICY "daily_challenge_select"
  ON daily_challenge FOR SELECT
  USING (true);

CREATE POLICY "daily_challenge_write_moderator"
  ON daily_challenge FOR ALL
  USING (has_role('moderator'));

-- ─── error_reports ────────────────────────────────────────────────────────────

CREATE POLICY "error_reports_select"
  ON error_reports FOR SELECT
  USING (user_id = auth.uid() OR has_role('support'));

CREATE POLICY "error_reports_insert"
  ON error_reports FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "error_reports_update_support"
  ON error_reports FOR UPDATE
  USING (has_role('support'));

-- ─── feedback ─────────────────────────────────────────────────────────────────

CREATE POLICY "feedback_select"
  ON feedback FOR SELECT
  USING (user_id = auth.uid() OR has_role('support'));

CREATE POLICY "feedback_insert"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "feedback_update_support"
  ON feedback FOR UPDATE
  USING (has_role('support'));

-- ─── admin_audit_log ──────────────────────────────────────────────────────────

CREATE POLICY "audit_log_select_admin"
  ON admin_audit_log FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "audit_log_insert_admin"
  ON admin_audit_log FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

-- ─── announcements ────────────────────────────────────────────────────────────

CREATE POLICY "announcements_select_active"
  ON announcements FOR SELECT
  USING (active = true AND (expires_at IS NULL OR expires_at > now()) OR has_role('moderator'));

CREATE POLICY "announcements_write_moderator"
  ON announcements FOR ALL
  USING (has_role('moderator'));

-- ─── match_queue ──────────────────────────────────────────────────────────────

CREATE POLICY "match_queue_own"
  ON match_queue FOR ALL
  USING (user_id = auth.uid());

-- ─── matches ──────────────────────────────────────────────────────────────────

CREATE POLICY "matches_select"
  ON matches FOR SELECT
  USING (auth.uid() = ANY(player_ids) OR has_role('support'));

-- ─── match_answers ────────────────────────────────────────────────────────────

CREATE POLICY "match_answers_select"
  ON match_answers FOR SELECT
  USING (player_id = auth.uid() OR has_role('support'));

CREATE POLICY "match_answers_insert_own"
  ON match_answers FOR INSERT
  WITH CHECK (player_id = auth.uid());

-- ─── user_data ────────────────────────────────────────────────────────────────

CREATE POLICY "user_data_select_own"
  ON user_data FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_data_insert_own"
  ON user_data FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_data_update_own"
  ON user_data FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_data_delete_own"
  ON user_data FOR DELETE
  USING (user_id = auth.uid());

-- ─── Auto-create user profile on signup ──────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
