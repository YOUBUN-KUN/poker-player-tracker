const CACHE_NAME = "poker-tracker-v1.0.0"
const STATIC_CACHE_URLS = ["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// インストール時のキャッシュ
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching App Shell")
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log("Service Worker: Skip Waiting")
        return self.skipWaiting()
      }),
  )
})

// アクティベート時の古いキャッシュ削除
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting Old Cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Claiming Clients")
        return self.clients.claim()
      }),
  )
})

// フェッチイベント（ネットワーク優先戦略）
self.addEventListener("fetch", (event) => {
  // APIリクエストの場合はネットワーク優先
  if (event.request.url.includes("/api/") || event.request.url.includes("supabase.co")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // レスポンスが正常な場合のみキャッシュ
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから返す
          return caches.match(event.request)
        }),
    )
  } else {
    // 静的ファイルの場合はキャッシュ優先
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return response || fetch(event.request)
        })
        .catch(() => {
          // オフライン時のフォールバック
          if (event.request.destination === "document") {
            return caches.match("/")
          }
        }),
    )
  }
})

// プッシュ通知（将来の機能拡張用）
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "確認する",
          icon: "/icon-192x192.png",
        },
        {
          action: "close",
          title: "閉じる",
          icon: "/icon-192x192.png",
        },
      ],
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})
