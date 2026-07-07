-- Phase 8: Match and queue tables (for Phase 10 Rank Mode)

CREATE TABLE match_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  league league NOT NULL,
  tier rank_tier NOT NULL,
  enqueued_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_queue_league ON match_queue(league);
CREATE INDEX idx_match_queue_enqueued_at ON match_queue(enqueued_at);

ALTER TABLE match_queue ENABLE ROW LEVEL SECURITY;

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_ids uuid[] NOT NULL,
  is_squad boolean NOT NULL DEFAULT false,
  league league NOT NULL,
  tier rank_tier NOT NULL,
  state match_state NOT NULL DEFAULT 'queued',
  scores jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_state ON matches(state);
CREATE INDEX idx_matches_created_at ON matches(created_at);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE TABLE match_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_idx integer NOT NULL,
  tense_id text NOT NULL,
  is_correct boolean NOT NULL,
  response_ms integer NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_answers_match ON match_answers(match_id);
CREATE INDEX idx_match_answers_player ON match_answers(player_id);

ALTER TABLE match_answers ENABLE ROW LEVEL SECURITY;
