// Note Taker: private notes per Google account, optionally published to Public Notes.
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
      toast(post.public ? "Published to Public Notes" : "Note is private again")
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
      if (editingId === id) resetForm()
      render()
      toast("Note deleted")
    } catch (err) {
      console.error(err)
      toast("Couldn't delete. Try again.")
    }
  }
})

setupAuth((user) => {
  if (user) load().catch((err) => { console.error(err); container.innerHTML = `<p class="empty-hint">Couldn't load your notes. Refresh to try again.</p>` })
  else { posts = []; container.innerHTML = ""; resetForm() }
})
