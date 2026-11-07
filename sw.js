// Service worker: makes the portal installable and usable offline.
// VERSION and the precache list are rewritten by `npm run build`.
const VERSION = "9edeea8e9d"
const PRECACHE = /* @precache */ [
  "/",
  "/gpa-calculator/",
  "/notes/",
  "/js/notes.js",
  "/css/style.css",
  "/js/app.js",
  "/js/home.js",
  "/js/gpa-page.js",
  "/js/palette.js",
  "/js/store.js",
  "/js/weather.js",
  "/js/data/links.js",
  "/js/data/dates.js",
  "/js/lib/search.js",
  "/js/lib/term.js",
  "/js/lib/gpa.js",
  "/js/lib/calc.js",
  "/images/icons/logo.svg",
  "/images/icons/icon-192.png",
  "/images/chatbot_icon_v3.png",
  "/site.webmanifest"
] /* /@precache */
const SHELL = `shell-${VERSION}`
const RUNTIME = `runtime-${VERSION}` // versioned so a deploy never serves stale assets

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"]

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)

  // Page navigations: network first (fresh content), fall back to cache, then the homepage.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Never cache redirected responses: replaying one for a navigation is a browser error
          if (res.ok && !res.redirected && url.origin === location.origin) {
            const copy = res.clone()
            caches.open(RUNTIME).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/")))
    )
    return
  }

  // Same-origin JS/CSS: network first so a deploy never mixes old and new modules.
  if (url.origin === location.origin && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(RUNTIME).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => caches.match(req))
    )
    return
  }

  // Other same-origin assets (images, manifest) and Google Fonts: stale-while-revalidate.
  if (url.origin === location.origin || FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok || res.type === "opaque") {
              const copy = res.clone()
              caches.open(RUNTIME).then((c) => c.put(req, copy))
            }
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
  }
  // Everything else (weather API, Firebase, Desmos) goes straight to the network.
})
