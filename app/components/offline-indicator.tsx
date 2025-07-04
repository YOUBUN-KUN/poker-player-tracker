"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"
import { useOnline } from "@/hooks/use-online"

export function OfflineIndicator() {
  const isOnline = useOnline()

  if (isOnline) {
    return null
  }

  return (
    <Alert className="mb-4 bg-orange-900 border-orange-700">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-orange-100">
        オフラインモードです。データの同期は接続が復旧してから行われます。
      </AlertDescription>
    </Alert>
  )
}
