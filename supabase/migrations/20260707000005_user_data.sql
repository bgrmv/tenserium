-- Phase 8: User data store (replaces localStorage for authenticated users)

CREATE TABLE user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

CREATE INDEX idx_user_data_user_id ON user_data(user_id);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
