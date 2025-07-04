-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON players;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON players;
DROP POLICY IF EXISTS "Allow all operations for all users" ON players;

-- 認証済みユーザーのみアクセス可能なポリシーを作成
CREATE POLICY "Allow authenticated users to manage players" ON players
  FOR ALL USING (auth.role() = 'authenticated');
