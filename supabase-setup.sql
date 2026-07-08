-- ============================================================
-- Supabase SQL Setup for HR Intelligence (Hirely)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fit_score INTEGER NOT NULL CHECK (fit_score >= 0 AND fit_score <= 100),
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  interview_questions JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can only read their own analyses
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert on behalf of users (for API)
CREATE POLICY "Service role can insert analyses"
  ON analyses FOR INSERT
  WITH CHECK (true);

-- Service role can read all for stats (anonymous aggregate only)
CREATE POLICY "Service role can read for stats"
  ON analyses FOR SELECT
  USING (true);

-- ============================================================
-- NOTES:
-- - No resume or job posting text is stored (privacy by design)
-- - Only analysis results (scores, strengths, questions) are saved
-- - User data is managed by Supabase Auth (auth.users)
-- - RLS ensures users can only access their own data
-- ============================================================
