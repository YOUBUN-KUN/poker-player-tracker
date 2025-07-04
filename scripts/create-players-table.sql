-- プレイヤー情報テーブルを作成
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL UNIQUE,
  nickname VARCHAR(100) DEFAULT '',
  play_style VARCHAR(20) DEFAULT 'balanced',
  notes TEXT DEFAULT '',
  tells TEXT DEFAULT '',
  last_seen TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_nickname ON players(nickname);

-- RLS (Row Level Security) 有効化
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み書き可能なポリシー（仲間内での共有のため）
CREATE POLICY IF NOT EXISTS "Allow all operations for all users" ON players
  FOR ALL USING (true);
