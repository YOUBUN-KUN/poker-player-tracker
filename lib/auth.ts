import { supabase } from "./supabase"

export const signUp = async (email: string, password: string, nickname: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) return { data, error }

  // プロファイル作成
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        user_id: data.user.id,
        nickname: nickname,
      },
    ])

    if (profileError) {
      console.error("Profile creation error:", profileError)
    }
  }

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

  return { data, error }
}

export const getAllProfiles = async () => {
  const { data, error } = await supabase.from("profiles").select("*")
  return { data, error }
}
