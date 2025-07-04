"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Player } from "@/lib/supabase"

interface PlayerCardProps {
  player: Player
  onClick: (player: Player) => void
  getPlayStyleColor: (style: string) => string
  getPlayStyleLabel: (style: string) => string
}

export function PlayerCard({ player, onClick, getPlayStyleColor, getPlayStyleLabel }: PlayerCardProps) {
  return (
    <Card
      className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
      onClick={() => onClick(player)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{player.nickname || "未設定"}</h3>
            <p className="text-sm text-slate-400">ID: {player.game_id}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={getPlayStyleColor(player.play_style)}>{getPlayStyleLabel(player.play_style)}</Badge>
        </div>

        {player.notes && (
          <div>
            <p className="text-xs text-slate-400 mb-1">メモ:</p>
            <p className="text-sm text-slate-200 line-clamp-2">{player.notes}</p>
          </div>
        )}

        {player.tells && (
          <div>
            <p className="text-xs text-slate-400 mb-1">テル:</p>
            <p className="text-sm text-slate-200 line-clamp-2">{player.tells}</p>
          </div>
        )}

        <div className="text-xs text-slate-500">
          最終更新: {new Date(player.updated_at).toLocaleDateString("ja-JP")}
        </div>
      </CardContent>
    </Card>
  )
}
