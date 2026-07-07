-- Phase 8: Game data tables

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tense_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('sentence', 'context')),
  prompt jsonb NOT NULL,
  difficulty integer NOT NULL CHECK (difficulty IN (1, 2, 3)),
  league league NOT NULL DEFAULT 'elementary',
  status question_status NOT NULL DEFAULT 'active',
  accuracy_rate float,
  flagged_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_tense ON questions(tense_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  mode session_mode NOT NULL,
  score integer NOT NULL DEFAULT 0,
  accuracy float,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE session_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE SET NULL,
  is_correct boolean NOT NULL,
  response_ms integer NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_answers_session ON session_answers(session_id);
CREATE INDEX idx_session_answers_question ON session_answers(question_id);

ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;

CREATE TABLE daily_challenge (
  date date PRIMARY KEY,
  question_ids uuid[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daily_challenge ENABLE ROW LEVEL SECURITY;
