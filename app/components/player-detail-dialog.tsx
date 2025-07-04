"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Calendar, Clock, User } from "lucide-react"
import type { Player, Profile } from "@/lib/supabase"
import { getAllProfiles } from "@/lib/auth"

interface PlayerDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  player: Player | null
  getPlayStyleColor: (style: string) => string
  getPlayStyleLabel: (style: string) => string
}

export function PlayerDetailDialog({
  isOpen,
  onClose,
  onEdit,
  player,
  getPlayStyleColor,
  getPlayStyleLabel,
}: PlayerDetailDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchProfiles()
    }
  }, [isOpen])

  const fetchProfiles = async () => {
    const { data } = await getAllProfiles()
    if (data) {
      setProfiles(data)
    }
  }

  const getCreatorNickname = (userId?: string) => {
    if (!userId) return "不明"
    const profile = profiles.find((p) => p.user_id === userId)
    return profile?.nickname || "不明"
  }

  const formatContentWithAuthors = (content: string) => {
    if (!content) return null

    // [日時 - ニックネーム] の形式を検出して整形
    const parts = content.split(/\n\n(?=\[)/g)

    return parts.map((part, index) => {
      const match = part.match(/^\[([^\]]+)\]\n(.*)$/s)
      if (match) {
        const [, dateAndAuthor, text] = match
        const authorMatch = dateAndAuthor.match(/^(.+) - (.+)$/)
        if (authorMatch) {
          const [, date, author] = authorMatch
          return (
            <div key={index} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">{author}</span>
                <span className="text-xs text-slate-500">• {date}</span>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          )
        }
      }

      // 古い形式または記入者情報なしの場合
      return (
        <div key={index} className="mb-3 last:mb-0">
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{part}</p>
          </div>
        </div>
      )
    })
  }

  if (!player) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">プレイヤー詳細</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-slate-400 hover:text-white">
              <Edit className="h-4 w-4 mr-1" />
              編集
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{player.nickname || "未設定"}</h3>
              <p className="text-sm text-slate-400">Game ID: {player.game_id}</p>
              {player.created_by && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  作成者: {getCreatorNickname(player.created_by)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">プレイスタイル:</span>
              <Badge className={getPlayStyleColor(player.play_style)}>{getPlayStyleLabel(player.play_style)}</Badge>
            </div>
          </div>

          {/* メモ */}
          {player.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-slate-200">メモ</h4>
              </div>
              <div className="space-y-2">{formatContentWithAuthors(player.notes)}</div>
            </div>
          )}

          {/* テル・癖 */}
          {player.tells && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-slate-200">テル・癖</h4>
              </div>
              <div className="space-y-2">{formatContentWithAuthors(player.tells)}</div>
            </div>
          )}

          {/* 日時情報 */}
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>作成日: {new Date(player.created_at).toLocaleString("ja-JP")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>最終更新: {new Date(player.updated_at).toLocaleString("ja-JP")}</span>
            </div>
          </div>

          {/* 閉じるボタン */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
