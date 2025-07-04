import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Player = {
  id: string
  game_id: string
  nickname: string
  play_style: "tight" | "loose" | "aggressive" | "passive" | "balanced"
  notes: string
  tells: string
  last_seen: string
  created_at: string
  updated_at: string
  user_id?: string
  created_by?: string
}

export type Profile = {
  id: string
  user_id: string
  nickname: string
  created_at: string
  updated_at: string
}
