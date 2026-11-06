// Homepage: live search filter, pins, recents, majors tabs, term tracker, greeting.
import { allLinks, monogram } from "./data/links.js"
import { terms, events } from "./data/dates.js"
import { termStatus, upcomingEvents, torontoToday, fmtShort } from "./lib/term.js"
import { indexItems, search, normalize } from "./lib/search.js"
import { getPins, togglePin, getRecent, store } from "./store.js"
import { toast } from "./app.js"

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
const links = allLinks()
const byId = new Map(links.map((l) => [l.id, l]))

// ---------- Greeting ----------
const hour = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", hourCycle: "h23" }).format(new Date()))
const greet = hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
const greetEl = document.querySelector("[data-greeting]")

// ---------- Term tracker ----------
function renderTerm() {
  const today = torontoToday()
  const s = termStatus(today, terms)
  const card = document.getElementById("term")
  if (!card) return
  card.querySelector("[data-term-name]").textContent = s.term ? s.term.name : "UTM term tracker"
  card.querySelector("[data-term-week]").textContent = s.label
  card.querySelector("[data-term-detail]").textContent = s.detail
  const pct = Math.round(s.progress * 100)
  const bar = card.querySelector(".term-bar")
  bar.setAttribute("aria-valuenow", String(pct))
  bar.setAttribute("aria-valuetext", `${pct}% through ${s.term?.name || "the term"}`)
  bar.querySelector("span").style.width = `${Math.max(pct, 2)}%`
  if (s.phase === "unknown" || s.phase === "off") bar.hidden = s.phase === "unknown"

  const ul = card.querySelector("[data-term-events]")
  ul.innerHTML = upcomingEvents(today, events, 4)
    .map((e) => {
      const range = e.end ? `${fmtShort(e.date)} – ${fmtShort(e.end)}` : fmtShort(e.date)
      return `<li class="ev-${e.kind}"><span class="ev-dot" aria-hidden="true"></span><span class="ev-title">${esc(e.title)}</span><span class="ev-date">${range}</span><span class="ev-when${e.ongoing ? " now" : ""}">${e.when}</span></li>`
    })
    .join("")

  if (greetEl) greetEl.textContent = s.phase === "classes" ? `${greet} · ${s.term.name}, ${s.label.toLowerCase()}` : `${greet}, UTM`
}
renderTerm()

// ---------- Pins + recents ----------
const pinItem = (l) =>
  `<li><a href="${esc(l.url)}" data-link-id="${l.id}" style="--c: var(--c-${l.color})"${l.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}><span class="mono" aria-hidden="true">${esc(monogram(l.name))}</span><span>${esc(l.name)}</span></a></li>`

function renderMine() {
  const pins = getPins().map((id) => byId.get(id)).filter(Boolean)
  const pinList = document.querySelector("[data-pins]")
  pinList.innerHTML = pins.map(pinItem).join("")
  pinList.hidden = !pins.length
  document.querySelector("[data-pins-empty]").hidden = !!pins.length

  const recent = getRecent().map((id) => byId.get(id)).filter((l) => l && !getPins().includes(l.id)).slice(0, 6)
  const row = document.querySelector("[data-recent]")
  row.innerHTML = recent.map((l) => `<a href="${esc(l.url)}" data-link-id="${l.id}"${l.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(l.name)}</a>`).join("")
  row.hidden = document.querySelector("[data-recent-title]").hidden = !recent.length

  const pinned = new Set(getPins())
  document.querySelectorAll("#directory .tile").forEach((t) => {
    const btn = t.querySelector(".pin")
    const on = pinned.has(t.dataset.id)
    btn.setAttribute("aria-pressed", String(on))
    btn.setAttribute("aria-label", `${on ? "Unpin" : "Pin"} ${byId.get(t.dataset.id)?.name || ""}`)
  })
}
renderMine()
window.addEventListener("portal:store", renderMine)

document.getElementById("directory").addEventListener("click", (e) => {
  const btn = e.target.closest(".pin")
  if (!btn) return
  const id = btn.closest(".tile").dataset.id
  const nowPinned = togglePin(id)
  btn.classList.remove("pop")
  void btn.offsetWidth // restart animation
  btn.classList.add("pop")
  toast(nowPinned ? `Pinned ${byId.get(id).name}` : `Unpinned ${byId.get(id).name}`)
})

// ---------- Majors tabs ----------
const majorsCat = document.querySelector(".cat--majors")
function selectMajor(id) {
  majorsCat.querySelectorAll(".major-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.major === id)))
  majorsCat.querySelectorAll(".tile[data-major]").forEach((t) => t.classList.toggle("major-on", t.dataset.major === id))
  majorsCat.querySelector(".cat-count").textContent = majorsCat.querySelectorAll(".tile.major-on").length
  store.set("portal.major", id)
}
if (majorsCat) {
  const saved = store.get("portal.major", null)
  const first = majorsCat.querySelector(".major-tabs button")?.dataset.major
  selectMajor(majorsCat.querySelector(`.major-tabs button[data-major="${saved}"]`) ? saved : first)
  majorsCat.querySelector(".major-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-major]")
    if (b) selectMajor(b.dataset.major)
  })
}

// ---------- Live search filter ----------
const input = document.getElementById("link-search")
const meta = document.getElementById("search-meta")
const noResults = document.getElementById("no-results")
const tiles = [...document.querySelectorAll("#directory .tile")]
const cats = [...document.querySelectorAll("#directory .cat")]
const index = indexItems(links)
let topHit = null

function highlight(nameEl, name, q) {
  // Mark the first query word that literally appears in the name (typo matches stay unmarked)
  const lower = name.toLowerCase()
  const t = normalize(q).split(" ").find((w) => w.length > 1 && lower.includes(w))
  if (!t) return (nameEl.textContent = name)
  const i = lower.indexOf(t)
  nameEl.innerHTML = `${esc(name.slice(0, i))}<mark>${esc(name.slice(i, i + t.length))}</mark>${esc(name.slice(i + t.length))}`
}

function runFilter() {
  const q = input.value.trim()
  majorsCat?.classList.toggle("searching", !!q)
  if (!q) {
    tiles.forEach((t) => {
      t.classList.remove("is-hidden")
      const n = t.querySelector(".tile-name")
      n.textContent = byId.get(t.dataset.id).name
    })
    cats.forEach((c) => c.classList.remove("is-hidden"))
    meta.textContent = ""
    noResults.hidden = true
    topHit = null
    return
  }
  const hits = search(q, index)
  const ids = new Set(hits.map((h) => h.item.id))
  topHit = hits[0]?.item || null
  tiles.forEach((t) => {
    const on = ids.has(t.dataset.id)
    t.classList.toggle("is-hidden", !on)
    if (on) highlight(t.querySelector(".tile-name"), byId.get(t.dataset.id).name, q)
  })
  cats.forEach((c) => c.classList.toggle("is-hidden", !c.querySelector(".tile:not(.is-hidden)")))
  noResults.hidden = hits.length > 0
  meta.textContent = hits.length ? `${hits.length} match${hits.length === 1 ? "" : "es"} · press Enter to open “${topHit.name}”` : ""
}

let urlTimer
input.addEventListener("input", () => {
  runFilter()
  clearTimeout(urlTimer)
  urlTimer = setTimeout(() => {
    const u = new URL(location.href)
    if (input.value.trim()) u.searchParams.set("q", input.value.trim())
    else u.searchParams.delete("q")
    history.replaceState(null, "", u)
  }, 400)
})
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && topHit) {
    e.preventDefault()
    document.querySelector(`#directory .tile[data-id="${topHit.id}"] a`)?.click()
  } else if (e.key === "Escape") {
    input.value = ""
    runFilter()
    history.replaceState(null, "", location.pathname)
  }
})
const initialQ = new URLSearchParams(location.search).get("q")
if (initialQ) {
  input.value = initialQ
  runFilter()
}

// ---------- Assistant popup ----------
let chatWindow
document.querySelector("[data-chat]")?.addEventListener("click", () => {
  if (chatWindow && !chatWindow.closed) return chatWindow.focus()
  chatWindow = window.open("https://utmstudentportalassistant.zapier.app", "utm-assistant", "width=480,height=640")
})
