-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE round_status AS ENUM ('active', 'submission_window', 'ended');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Game Rounds Table
CREATE TABLE game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_number INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  highest_holder_address TEXT,
  highest_holder_balance NUMERIC,
  status round_status NOT NULL DEFAULT 'active',
  target_item TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_game_rounds_status ON game_rounds(status);
CREATE INDEX idx_game_rounds_round_number ON game_rounds(round_number DESC);

-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  status submission_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_round_id ON submissions(round_id);
CREATE INDEX idx_submissions_wallet ON submissions(wallet_address);

-- Holders Table
CREATE TABLE holders (
  wallet_address TEXT PRIMARY KEY,
  balance NUMERIC NOT NULL,
  rank INTEGER NOT NULL,
  percentage NUMERIC NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_holders_rank ON holders(rank);
CREATE INDEX idx_holders_balance ON holders(balance DESC);

-- Config Table
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config values
INSERT INTO config (key, value) VALUES
  ('token_address', '"your-token-mint-address-here"'::jsonb),
  ('admin_addresses', '[]'::jsonb),
  ('fee_pool_total', '0'::jsonb);

-- Row Level Security Policies
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Public read for game_rounds
CREATE POLICY "Public can view game rounds" ON game_rounds
  FOR SELECT USING (true);

-- Public read for approved submissions
CREATE POLICY "Public can view approved submissions" ON submissions
  FOR SELECT USING (status = 'approved');

-- Public read for holders
CREATE POLICY "Public can view holders" ON holders
  FOR SELECT USING (true);

-- Public read for config (non-sensitive)
CREATE POLICY "Public can view config" ON config
  FOR SELECT USING (key != 'admin_addresses');

-- Service role can do everything (backend API uses service key)

