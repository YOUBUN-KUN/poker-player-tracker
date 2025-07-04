"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock, User } from "lucide-react"
import { signIn, signUp } from "@/lib/auth"

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isSignUp) {
        if (!nickname.trim()) {
          throw new Error("ニックネームを入力してください")
        }
        const { error } = await signUp(email, password, nickname.trim())
        if (error) throw error
        setSuccess("確認メールを送信しました。メールをご確認ください。")
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      }
    } catch (error: any) {
      setError(error.message || "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setNickname("")
    setError(null)
    setSuccess(null)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "アカウント作成" : "ログイン"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="bg-red-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-100">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900 border-green-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-green-100">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="nickname" className="text-slate-200">
                ニックネーム *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  placeholder="表示名を入力"
                  required={isSignUp}
                  maxLength={50}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">他のユーザーに表示される名前です</p>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-slate-200">
              メールアドレス *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-200">
              パスワード *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                required
                minLength={6}
              />
            </div>
            {isSignUp && <p className="text-xs text-slate-400 mt-1">6文字以上で入力してください</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={toggleMode} className="text-sm text-blue-400 hover:text-blue-300">
              {isSignUp ? "既にアカウントをお持ちですか？ログイン" : "アカウントをお持ちでない方はこちら"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
