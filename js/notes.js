// Notes page: private notes per Google account (My notes) plus the feed of
// notes students chose to publish (Shared notes), on two tabs.
import { collection, addDoc, getDocs, updateDoc, orderBy, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js"
import { auth, db, esc, formatDate, setupAuth } from "./notes-firebase.js"
import { toast } from "./app.js"

const form = document.getElementById("note-form")
const titleEl = document.getElementById("post-title")
const contentEl = document.getElementById("post-content")
const submitBtn = form.querySelector("[type=submit]")
const cancelBtn = document.getElementById("cancel-edit")
const searchEl = document.getElementById("search-field")
const container = document.getElementById("posts-container")
const countEl = document.getElementById("notes-count")

let posts = [] // { id, title, content, public, timestamp }
let editingId = null

function card(p) {
  return `<article class="post" data-id="${esc(p.id)}">
    <div class="post-top"><h2>${esc(p.title) || "<span class='muted'>Untitled</span>"}</h2><span class="badge ${p.public ? "on" : ""}">${p.public ? "Public" : "Private"}</span></div>
    <p class="post-content">${esc(p.content)}</p>
    <div class="post-foot"><span class="post-date">${formatDate(p.timestamp)}</span>
      <div class="post-actions">
        <button class="btn btn-sm" type="button" data-act="edit">Edit</button>
        <button class="btn btn-sm" type="button" data-act="publish">${p.public ? "Make private" : "Publish"}</button>
        <button class="btn btn-sm btn-danger" type="button" data-act="delete">Delete</button>
      </div>
    </div>
  </article>`
}

function render() {
  const q = searchEl.value.trim().toLowerCase()
  const shown = q ? posts.filter((p) => `${p.title} ${p.content}`.toLowerCase().includes(q)) : posts
  container.innerHTML = shown.length
    ? shown.map(card).join("")
    : `<p class="empty-hint">${posts.length ? "No notes match that search." : "No notes yet. Write your first one above."}</p>`
  countEl.textContent = posts.length ? `${posts.length} note${posts.length === 1 ? "" : "s"}` : ""
}

async function load() {
  const q = query(collection(db, "posts"), where("userId", "==", auth.currentUser.uid), orderBy("timestamp", "desc"))
  const snap = await getDocs(q)
  posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  render()
}

function resetForm() {
  editingId = null
  form.reset()
  submitBtn.textContent = "Save note"
  cancelBtn.hidden = true
}

form.addEventListener("submit", async (e) => {
  e.preventDefault()
  const title = titleEl.value.trim()
  const content = contentEl.value.trim()
  if (!title && !content) return toast("Write something first")
  submitBtn.disabled = true
  try {
    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), { title, content })
      Object.assign(posts.find((p) => p.id === editingId), { title, content })
      publicPosts = null
      toast("Note updated")
    } else {
      const data = { title, content, userId: auth.currentUser.uid, public: false, timestamp: new Date() }
      const ref = await addDoc(collection(db, "posts"), data)
      posts.unshift({ id: ref.id, ...data })
      toast("Note saved")
    }
    resetForm()
    render()
  } catch (err) {
    console.error(err)
    toast("Couldn't save. Check your connection.")
  } finally {
    submitBtn.disabled = false
  }
})
cancelBtn.addEventListener("click", resetForm)
searchEl.addEventListener("input", render)

const armed = new Map()
container.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-act]")
  if (!btn) return
  const id = btn.closest(".post").dataset.id
  const post = posts.find((p) => p.id === id)
  if (!post) return
  const act = btn.dataset.act

  if (act === "edit") {
    editingId = id
    titleEl.value = post.title || ""
    contentEl.value = post.content || ""
    submitBtn.textContent = "Update note"
    cancelBtn.hidden = false
    form.scrollIntoView({ behavior: "smooth", block: "center" })
    titleEl.focus()
  } else if (act === "publish") {
    try {
      await updateDoc(doc(db, "posts", id), { public: !post.public })
      post.public = !post.public
      render()
      publicPosts = null
      toast(post.public ? "Published to Shared notes" : "Note is private again")
    } catch (err) {
      console.error(err)
      toast("Couldn't update. Try again.")
    }
  } else if (act === "delete") {
    // Two-step delete so a misclick can't lose a note
    if (!armed.has(id)) {
      btn.textContent = "Tap to confirm"
      armed.set(id, setTimeout(() => { armed.delete(id); btn.textContent = "Delete" }, 3000))
      return
    }
    clearTimeout(armed.get(id))
    armed.delete(id)
    try {
      await deleteDoc(doc(db, "posts", id))
      posts = posts.filter((p) => p.id !== id)
      publicPosts = null
      if (editingId === id) resetForm()
      render()
      toast("Note deleted")
    } catch (err) {
      console.error(err)
      toast("Couldn't delete. Try again.")
    }
  }
})

// ---------- Shared notes ----------
const pubSearch = document.getElementById("public-search")
const pubContainer = document.getElementById("public-container")
const pubCount = document.getElementById("public-count")
let publicPosts = null // null = not loaded yet

function renderPublic() {
  const q = pubSearch.value.trim().toLowerCase()
  const shown = q ? publicPosts.filter((p) => `${p.title} ${p.content}`.toLowerCase().includes(q)) : publicPosts
  pubContainer.innerHTML = shown.length
    ? shown.map((p) => `<article class="post"><div class="post-top"><h2>${esc(p.title) || "Untitled"}</h2></div><p class="post-content">${esc(p.content)}</p><div class="post-foot"><span class="post-date">${formatDate(p.timestamp)}</span></div></article>`).join("")
    : `<p class="empty-hint">${publicPosts.length ? "No shared notes match that search." : "No shared notes yet. Publish one from My notes to be the first."}</p>`
  pubCount.textContent = publicPosts.length ? `${publicPosts.length} note${publicPosts.length === 1 ? "" : "s"}` : ""
}
async function loadPublic(force = false) {
  if (publicPosts && !force) return renderPublic()
  pubContainer.innerHTML = `<p class="empty-hint">Loading shared notes…</p>`
  try {
    const snap = await getDocs(query(collection(db, "posts"), where("public", "==", true), orderBy("timestamp", "desc")))
    publicPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    renderPublic()
  } catch (err) {
    console.error(err)
    pubContainer.innerHTML = `<p class="empty-hint">Couldn't load shared notes. Refresh to try again.</p>`
  }
}
pubSearch.addEventListener("input", () => publicPosts && renderPublic())

// ---------- Tabs (?view=public opens Shared notes) ----------
const tabs = [...document.querySelectorAll("[data-note-tabs] [role=tab]")]
function showTab(id, focus) {
  for (const t of tabs) {
    const on = t.id === id
    t.setAttribute("aria-selected", String(on))
    t.tabIndex = on ? 0 : -1
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on
  }
  const u = new URL(location.href)
  if (id === "tab-public") { u.searchParams.set("view", "public"); if (auth.currentUser) loadPublic() }
  else u.searchParams.delete("view")
  history.replaceState(null, "", u)
  if (focus) document.getElementById(id).focus()
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => showTab(t.id))
  t.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (d) showTab(tabs[(i + d + tabs.length) % tabs.length].id, true)
  })
})
const startPublic = new URLSearchParams(location.search).get("view") === "public"
showTab(startPublic ? "tab-public" : "tab-mine")

setupAuth((user) => {
  if (user) {
    load().catch((err) => { console.error(err); container.innerHTML = `<p class="empty-hint">Couldn't load your notes. Refresh to try again.</p>` })
    if (!document.getElementById("panel-public").hidden) loadPublic()
  } else { posts = []; publicPosts = null; container.innerHTML = ""; pubContainer.innerHTML = ""; resetForm() }
})
