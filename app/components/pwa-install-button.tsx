"use client"

import { Button } from "@/components/ui/button"
import { Download, Smartphone } from "lucide-react"
import { usePWA } from "@/hooks/use-pwa"

export function PWAInstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA()

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <Smartphone className="h-4 w-4" />
        <span>アプリがインストール済み</span>
      </div>
    )
  }

  if (!isInstallable) {
    return null
  }

  return (
    <Button
      onClick={installApp}
      variant="outline"
      size="sm"
      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
    >
      <Download className="h-4 w-4 mr-2" />
      アプリをインストール
    </Button>
  )
}
