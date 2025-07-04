"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Users, AlertCircle, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, type Player } from "@/lib/supabase"
import { signOut } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { PlayerDialog } from "./components/player-dialog"
import { PlayerCard } from "./components/player-card"
import { PlayerDetailDialog } from "./components/player-detail-dialog"
import { AuthDialog } from "./components/auth-dialog"

export default function HomePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchPlayers()
      } else {
        setLoading(false)
      }
    }
  }, [user, authLoading])

  const fetchPlayers = async () => {
    try {
      setError(null)
      const { data, error } = await supabase.from("players").select("*").order("updated_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setError("データベースが初期化されていません。管理者にお問い合わせください。")
        } else {
          setError(`データの取得に失敗しました: ${error.message}`)
        }
        return
      }
      setPlayers(data || [])
    } catch (error) {
      console.error("Error fetching players:", error)
      setError("予期しないエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.game_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePlayerSave = () => {
    fetchPlayers()
    setIsDialogOpen(false)
    setSelectedPlayer(null)
  }

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player)
    setIsDetailDialogOpen(true)
  }

  const handlePlayerEdit = () => {
    setIsDetailDialogOpen(false)
    setIsDialogOpen(true)
  }

  const getPlayStyleColor = (style: string) => {
    switch (style) {
      case "tight":
        return "bg-blue-100 text-blue-800"
      case "loose":
        return "bg-red-100 text-red-800"
      case "aggressive":
        return "bg-orange-100 text-orange-800"
      case "passive":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlayStyleLabel = (style: string) => {
    switch (style) {
      case "tight":
        return "タイト"
      case "loose":
        return "ルース"
      case "aggressive":
        return "アグレッシブ"
      case "passive":
        return "パッシブ"
      default:
        return "バランス"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  // 未ログイン時の表示
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🃏 ポーカープレイヤートラッカー</h1>
          <p className="text-slate-300 mb-8">アミューズメントポーカーのプレイヤー情報を記録・共有</p>
          <Button onClick={() => setIsAuthDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <LogIn className="h-4 w-4 mr-2" />
            ログイン / アカウント作成
          </Button>
        </div>
        <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">🃏 ポーカープレイヤートラッカー</h1>
            <p className="text-slate-300">アミューズメントポーカーのプレイヤー情報を記録・共有</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="h-4 w-4" />
              <span className="text-sm">{profile?.nickname || user?.email}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-1" />
              ログアウト
            </Button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <Alert className="mb-6 bg-red-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-100">{error}</AlertDescription>
          </Alert>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">登録プレイヤー数</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{players.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">最多プレイスタイル</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {players.length > 0
                  ? getPlayStyleLabel(
                      Object.entries(
                        players.reduce(
                          (acc, player) => {
                            acc[player.play_style] = (acc[player.play_style] || 0) + 1
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                      ).sort(([, a], [, b]) => b - a)[0]?.[0] || "balanced",
                    )
                  : "なし"}
              </Badge>
            </CardHeader>
          </Card>
        </div>

        {/* 検索とプレイヤー追加 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Game IDまたはプレイヤーネームで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700" disabled={!!error}>
            <Plus className="h-4 w-4 mr-2" />
            プレイヤー追加
          </Button>
        </div>

        {/* プレイヤーリスト */}
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={handlePlayerClick}
                getPlayStyleColor={getPlayStyleColor}
                getPlayStyleLabel={getPlayStyleLabel}
              />
            ))}
          </div>
        )}

        {!error && filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">
              {searchTerm ? "検索結果が見つかりません" : "プレイヤーが登録されていません"}
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              最初のプレイヤーを追加
            </Button>
          </div>
        )}

        {/* プレイヤー詳細ダイアログ */}
        <PlayerDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false)
            setSelectedPlayer(null)
          }}
          onEdit={handlePlayerEdit}
          player={selectedPlayer}
          getPlayStyleColor={getPlayStyleColor}
          getPlayStyleLabel={getPlayStyleLabel}
        />

        {/* プレイヤー追加/編集ダイアログ */}
        <PlayerDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedPlayer(null)
          }}
          onSave={handlePlayerSave}
          player={selectedPlayer}
        />
      </div>
    </div>
  )
}
