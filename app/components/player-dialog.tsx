"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import { supabase, type Player } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile } from "@/lib/auth"

interface PlayerDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  player?: Player | null
}

export function PlayerDialog({ isOpen, onClose, onSave, player }: PlayerDialogProps) {
  const { user } = useAuth()
  const [userNickname, setUserNickname] = useState("")
  const [formData, setFormData] = useState({
    game_id: "",
    nickname: "",
    play_style: "balanced" as const,
    notes: "",
    tells: "",
    newNotes: "",
    newTells: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return
    const { data } = await getUserProfile(user.id)
    if (data) {
      setUserNickname(data.nickname)
    }
  }

  useEffect(() => {
    if (player) {
      setFormData({
        game_id: player.game_id,
        nickname: player.nickname,
        play_style: player.play_style as any,
        notes: player.notes,
        tells: player.tells,
        newNotes: "",
        newTells: "",
      })
    } else {
      setFormData({
        game_id: "",
        nickname: "",
        play_style: "balanced",
        notes: "",
        tells: "",
        newNotes: "",
        newTells: "",
      })
    }
    setError(null)
  }, [player, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const currentDate = new Date().toLocaleString("ja-JP")

      // 追記処理（記入者情報付き）
      let updatedNotes = formData.notes
      let updatedTells = formData.tells

      if (player && formData.newNotes.trim()) {
        const newEntry = `[${currentDate} - ${userNickname}]\n${formData.newNotes.trim()}`
        updatedNotes = formData.notes ? `${formData.notes}\n\n${newEntry}` : newEntry
      } else if (!player) {
        updatedNotes = formData.newNotes.trim()
      }

      if (player && formData.newTells.trim()) {
        const newEntry = `[${currentDate} - ${userNickname}]\n${formData.newTells.trim()}`
        updatedTells = formData.tells ? `${formData.tells}\n\n${newEntry}` : newEntry
      } else if (!player) {
        updatedTells = formData.newTells.trim()
      }

      const dataToSave = {
        game_id: formData.game_id,
        nickname: formData.nickname,
        play_style: formData.play_style,
        notes: updatedNotes,
        tells: updatedTells,
        user_id: user.id,
        created_by: player ? player.created_by : user.id,
      }

      if (player) {
        // 更新
        const { error } = await supabase
          .from("players")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", player.id)

        if (error) {
          console.error("Update error:", error)
          throw error
        }
      } else {
        // 新規作成
        const { error } = await supabase.from("players").insert([dataToSave])

        if (error) {
          console.error("Insert error:", error)
          throw error
        }
      }

      onSave()
    } catch (error: any) {
      console.error("Error saving player:", error)
      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        setError("データベースが初期化されていません。管理者にお問い合わせください。")
      } else if (error.message?.includes("duplicate key")) {
        setError("このGame IDは既に登録されています。")
      } else {
        setError(`保存に失敗しました: ${error.message || "不明なエラー"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{player ? "プレイヤー情報編集" : "新しいプレイヤーを追加"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="bg-red-900 border-red-700 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-100">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="game_id" className="text-slate-200">
              Game ID名 *
            </Label>
            <Input
              id="game_id"
              value={formData.game_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, game_id: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              required
              disabled={!!player}
            />
            {player && <p className="text-xs text-slate-400 mt-1">Game IDは編集できません</p>}
          </div>

          <div>
            <Label htmlFor="nickname" className="text-slate-200">
              プレイヤーネーム
            </Label>
            <Input
              id="nickname"
              value={formData.nickname}
              onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-200">プレイスタイル</Label>
            <Select
              value={formData.play_style}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, play_style: value as any }))}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="tight">タイト</SelectItem>
                <SelectItem value="loose">ルース</SelectItem>
                <SelectItem value="aggressive">アグレッシブ</SelectItem>
                <SelectItem value="passive">パッシブ</SelectItem>
                <SelectItem value="balanced">バランス</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 既存のメモ表示（編集時のみ） */}
          {player && formData.notes && (
            <div>
              <Label className="text-slate-200">現在のメモ</Label>
              <div className="bg-slate-700 border border-slate-600 rounded-md p-3 text-sm text-slate-300 max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{formData.notes}</pre>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="newNotes" className="text-slate-200 flex items-center gap-1">
              {player ? (
                <>
                  <Plus className="h-3 w-3" />
                  メモを追加 ({userNickname})
                </>
              ) : (
                "メモ"
              )}
            </Label>
            <Textarea
              id="newNotes"
              value={formData.newNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, newNotes: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder={player ? "新しいメモを追加..." : "プレイヤーの特徴や戦略について..."}
            />
          </div>

          {/* 既存のテル表示（編集時のみ） */}
          {player && formData.tells && (
            <div>
              <Label className="text-slate-200">現在のテル・癖</Label>
              <div className="bg-slate-700 border border-slate-600 rounded-md p-3 text-sm text-slate-300 max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{formData.tells}</pre>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="newTells" className="text-slate-200 flex items-center gap-1">
              {player ? (
                <>
                  <Plus className="h-3 w-3" />
                  テル・癖を追加 ({userNickname})
                </>
              ) : (
                "テル・癖"
              )}
            </Label>
            <Textarea
              id="newTells"
              value={formData.newTells}
              onChange={(e) => setFormData((prev) => ({ ...prev, newTells: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder={player ? "新しいテルや癖を追加..." : "観察したテルや癖について..."}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
