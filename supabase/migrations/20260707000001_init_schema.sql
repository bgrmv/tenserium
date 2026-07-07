-- Phase 8: Core enums and users table

CREATE TYPE app_role AS ENUM ('user', 'support', 'moderator', 'admin');
CREATE TYPE league AS ENUM ('elementary', 'intermediate', 'advanced');
CREATE TYPE rank_tier AS ENUM ('iron', 'bronze', 'silver', 'gold', 'platinum');
CREATE TYPE session_mode AS ENUM ('normal', 'rank', 'squad', 'daily');
CREATE TYPE question_status AS ENUM ('active', 'draft', 'pending_review', 'archived');
CREATE TYPE error_status AS ENUM ('open', 'resolved', 'dismissed');
CREATE TYPE match_state AS ENUM ('queued', 'in_progress', 'completed');
CREATE TYPE feedback_category AS ENUM ('bug', 'feature', 'content', 'other');
CREATE TYPE feedback_status AS ENUM ('new', 'unread', 'answered', 'closed');

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nickname text,
  role app_role NOT NULL DEFAULT 'user',
  league league NOT NULL DEFAULT 'elementary',
  rank_tier rank_tier NOT NULL DEFAULT 'iron',
  rank_points integer NOT NULL DEFAULT 0,
  daily_rank_matches integer NOT NULL DEFAULT 0,
  last_active_at timestamptz,
  is_banned boolean NOT NULL DEFAULT false,
  suspended_until timestamptz,
  ban_reason text,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
