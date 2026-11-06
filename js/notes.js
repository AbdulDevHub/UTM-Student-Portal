// Notes page: notes saved in this browser (localStorage), no account needed.
// Share a single note as a link (#share=...), and back up / restore all notes as JSON.
import { store } from "./store.js"
import { toast } from "./app.js"

const KEY = "portal.notes"
const DRAFT = "portal.notes.draft"
const $ = (s) => document.querySelector(s)
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

const form = $("#note-form")
const titleEl = $("#note-title")
const contentEl = $("#note-content")
const submitBtn = form.querySelector("[type=submit]")
const cancelBtn = $("#cancel-edit")
const searchEl = $("#note-search")
const list = $("#notes-list")
const countEl = $("#notes-count")

// ---------- Storage (sanitised: localStorage and imports are untrusted) ----------
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)
const clean = (n) => ({
  id: String(n?.id || newId()).slice(0, 64),
  title: String(n?.title ?? "").slice(0, 140),
  content: String(n?.content ?? "").slice(0, 50000),
  pinned: !!n?.pinned,
  created: Number(n?.created) || Date.now(),
  updated: Number(n?.updated) || Number(n?.created) || Date.now(),
})
const loadNotes = () => {
  const raw = store.get(KEY, [])
  return Array.isArray(raw) ? raw.filter(Boolean).map(clean) : []
}
let notes = loadNotes()
const save = () => store.set(KEY, notes)
let editingId = null

// ---------- Rendering ----------
const fmt = (t) => new Date(t).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })

function card(n) {
  return `<article class="post${n.pinned ? " pinned" : ""}" data-id="${esc(n.id)}">
    <div class="post-top"><h2>${n.title ? esc(n.title) : "<span class='muted'>Untitled</span>"}</h2>
      <button class="icon-btn pin-note" type="button" data-act="pin" aria-pressed="${n.pinned}" aria-label="${n.pinned ? "Unpin" : "Pin"} note"><svg class="icon" aria-hidden="true"><use href="#i-star"/></svg></button></div>
    <p class="post-content">${esc(n.content)}</p>
    <div class="post-foot"><span class="post-date">${n.updated > n.created + 1000 ? "Edited " : ""}${fmt(n.updated)}</span>
      <div class="post-actions">
        <button class="btn btn-sm" type="button" data-act="edit">Edit</button>
        <button class="btn btn-sm" type="button" data-act="share"><svg class="icon" aria-hidden="true"><use href="#i-link"/></svg>Share</button>
        <button class="btn btn-sm btn-danger" type="button" data-act="delete">Delete</button>
      </div>
    </div>
  </article>`
}

function render() {
  const q = searchEl.value.trim().toLowerCase()
  const sorted = [...notes].sort((a, b) => b.pinned - a.pinned || b.updated - a.updated)
  const shown = q ? sorted.filter((n) => `${n.title} ${n.content}`.toLowerCase().includes(q)) : sorted
  list.innerHTML = shown.length
    ? shown.map(card).join("")
    : `<p class="empty-hint">${notes.length ? "No notes match that search." : "No notes yet. Write your first one above. It stays in this browser, no sign-in needed."}</p>`
  countEl.textContent = notes.length ? `${notes.length} note${notes.length === 1 ? "" : "s"}` : ""
}

// ---------- Create / edit ----------
function resetForm() {
  editingId = null
  form.reset()
  submitBtn.textContent = "Save note"
  cancelBtn.hidden = true
  store.set(DRAFT, null)
}

form.addEventListener("submit", (e) => {
  e.preventDefault()
  const title = titleEl.value.trim()
  const content = contentEl.value.trim()
  if (!title && !content) return toast("Write something first")
  const editing = editingId && notes.find((n) => n.id === editingId)
  if (editing) {
    Object.assign(editing, { title, content, updated: Date.now() })
    toast("Note updated")
  } else {
    notes.push(clean({ title, content }))
    toast("Note saved")
  }
  save()
  resetForm()
  render()
})
form.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) form.requestSubmit()
})
cancelBtn.addEventListener("click", resetForm)
searchEl.addEventListener("input", render)

// Keep an unsaved draft so a refresh never loses what you were typing
const draft = store.get(DRAFT, null)
if (draft && (draft.title || draft.content)) {
  titleEl.value = String(draft.title || "")
  contentEl.value = String(draft.content || "")
}
form.addEventListener("input", () => {
  if (!editingId) store.set(DRAFT, { title: titleEl.value, content: contentEl.value })
})

// ---------- Card actions ----------
const armed = new Map()
list.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-act]")
  if (!btn) return
  const id = btn.closest(".post").dataset.id
  const note = notes.find((n) => n.id === id)
  if (!note) return

  switch (btn.dataset.act) {
    case "edit":
      editingId = id
      titleEl.value = note.title
      contentEl.value = note.content
      submitBtn.textContent = "Update note"
      cancelBtn.hidden = false
      form.scrollIntoView({ behavior: "smooth", block: "center" })
      titleEl.focus()
      break
    case "pin":
      note.pinned = !note.pinned
      save()
      render()
      break
    case "share": {
      const url = `${location.origin}/notes/#share=${encodeShare(note)}`
      try {
        if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ title: note.title || "Note", url })
        else { await navigator.clipboard.writeText(url); toast("Share link copied") }
      } catch { /* cancelled */ }
      break
    }
    case "delete":
      // Two-step delete so a misclick can't lose a note
      if (!armed.has(id)) {
        btn.textContent = "Tap to confirm"
        armed.set(id, setTimeout(() => { armed.delete(id); btn.textContent = "Delete" }, 3000))
        return
      }
      clearTimeout(armed.get(id))
      armed.delete(id)
      notes = notes.filter((n) => n.id !== id)
      if (editingId === id) resetForm()
      save()
      render()
      toast("Note deleted")
      break
  }
})

// ---------- Share links: the note travels inside the URL, nothing is uploaded ----------
function encodeShare(n) {
  const json = JSON.stringify({ t: n.title, c: n.content })
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
function decodeShare(s) {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))))
    return clean({ title: o.t, content: o.c })
  } catch {
    return null
  }
}
function showShared() {
  const shareMatch = location.hash.match(/^#share=([\w-]+)/)
  if (!shareMatch) return
  const shared = decodeShare(shareMatch[1])
  const box = $("#shared-note")
  if (!shared || !box) return
  box.querySelector("[data-shared-body]").innerHTML = `<h2>${esc(shared.title) || "Untitled"}</h2><p class="post-content">${esc(shared.content)}</p>`
  box.hidden = false
  const close = () => { box.hidden = true; history.replaceState(null, "", location.pathname) }
  box.querySelector("[data-save-shared]").onclick = () => {
    notes.push(clean({ title: shared.title, content: shared.content }))
    save()
    render()
    close()
    toast("Saved to your notes")
  }
  box.querySelector("[data-dismiss-shared]").onclick = close
  box.scrollIntoView({ block: "start" })
}
showShared()
// A share link opened while the Notes page is already open only changes the hash
window.addEventListener("hashchange", showShared)

// ---------- Backup / restore ----------
$("#export-notes").addEventListener("click", () => {
  if (!notes.length) return toast("No notes to back up yet")
  const blob = new Blob([JSON.stringify({ app: "utm-student-portal", version: 1, notes }, null, 2)], { type: "application/json" })
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `utm-notes-${new Date().toISOString().slice(0, 10)}.json` })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
})
$("#import-notes").addEventListener("change", async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ""
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    const incoming = (Array.isArray(data) ? data : data.notes || []).map(clean)
    const have = new Set(notes.map((n) => n.id))
    const added = incoming.filter((n) => !have.has(n.id))
    notes.push(...added)
    save()
    render()
    toast(`Restored ${added.length} note${added.length === 1 ? "" : "s"}`)
  } catch {
    toast("That file isn't a notes backup")
  }
})

// Other open tabs editing notes stay in sync
window.addEventListener("storage", (e) => {
  if (e.key === KEY) { notes = loadNotes(); render() }
})

render()
