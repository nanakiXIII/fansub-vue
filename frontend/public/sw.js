const CACHE_NAME = 'fansub-cache-v2'
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return

  // Pages : réseau d'abord, repli sur le cache (puis sur l'accueil) hors-ligne.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
          return res
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
    )
    return
  }

  // Ressources statiques same-origin : cache d'abord, sinon réseau.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
          }
          return res
        })
      })
    )
  }
})
