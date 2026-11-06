// Runs on every page: theme, clock, weather, Ctrl+K palette, recents, PWA.
import { addRecent } from "./store.js"
import { initPalette } from "./palette.js"
import { initWeather } from "./weather.js"

const root = document.documentElement

// ---------- Theme ----------
export function setTheme(next, persist = true) {
  root.dataset.theme = next
  if (persist) {
    try {
      localStorage.setItem("theme", next)
      localStorage.removeItem("dark-mode") // v1 key
    } catch { /* ignore */ }
  }
  document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(next === "dark")))
  window.dispatchEvent(new CustomEvent("portal:theme", { detail: next }))
}
export const toggleTheme = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark")

document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
  btn.setAttribute("aria-pressed", String(root.dataset.theme === "dark"))
  btn.addEventListener("click", toggleTheme)
})
// Follow the OS setting until the student picks a theme themselves
const mq = matchMedia("(prefers-color-scheme: dark)")
mq.addEventListener?.("change", (e) => {
  let chosen = null
  try { chosen = localStorage.getItem("theme") } catch { /* ignore */ }
  if (!chosen) setTheme(e.matches ? "dark" : "light", false)
})

// ---------- Toast ----------
let toastTimer
export function toast(msg) {
  const el = document.getElementById("toast")
  if (!el) return
  el.textContent = msg
  el.classList.add("show")
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200)
}

// ---------- Clock (campus time) ----------
const clock = document.querySelector("[data-clock]")
if (clock) {
  const timeFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit" })
  const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric" })
  const tick = () => {
    const now = new Date()
    clock.innerHTML = `${timeFmt.format(now)}<small>${dateFmt.format(now)}</small>`
    clock.dateTime = now.toISOString()
  }
  tick()
  setTimeout(() => { tick(); setInterval(tick, 60000) }, (60 - new Date().getSeconds()) * 1000)
}

// ---------- Recently opened ----------
const track = (e) => {
  const a = e.target.closest?.("a[data-link-id]")
  if (a) addRecent(a.dataset.linkId)
}
document.addEventListener("click", track)
document.addEventListener("auxclick", track)

// ---------- Ctrl+K palette ----------
const palette = initPalette({ toggleTheme, toast })
document.querySelectorAll("[data-open-palette]").forEach((b) => b.addEventListener("click", () => palette?.open()))
document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault()
    palette?.open()
  } else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey) {
    const homeSearch = document.getElementById("link-search")
    e.preventDefault()
    if (homeSearch) { homeSearch.focus(); homeSearch.select() } else palette?.open()
  }
})
// Show the right shortcut on Macs
if (/Mac|iPhone|iPad/.test(navigator.platform)) {
  document.querySelectorAll("kbd").forEach((k) => {
    if (k.textContent === "Ctrl K") k.textContent = "⌘K"
    else if (k.textContent === "Ctrl") k.textContent = "⌘"
  })
}

// ---------- Weather (after first paint) ----------
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300))
idle(() => initWeather())

// ---------- PWA: service worker + install button ----------
// Skipped on localhost so local edits are never served from cache (add ?sw to test it locally)
const swAllowed = location.protocol === "https:" || new URLSearchParams(location.search).has("sw")
if ("serviceWorker" in navigator && swAllowed) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}))
}
let deferredInstall
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  deferredInstall = e
  document.querySelectorAll("[data-install]").forEach((b) => (b.hidden = false))
})
document.querySelectorAll("[data-install]").forEach((b) =>
  b.addEventListener("click", async () => {
    if (!deferredInstall) return
    deferredInstall.prompt()
    await deferredInstall.userChoice
    deferredInstall = null
    document.querySelectorAll("[data-install]").forEach((x) => (x.hidden = true))
  })
)
window.addEventListener("appinstalled", () => toast("Installed! Find UTM Portal on your home screen."))
