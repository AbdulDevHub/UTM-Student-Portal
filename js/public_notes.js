// Public Notes: read-only feed of notes students chose to publish.
import { collection, getDocs, orderBy, query, where } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js"
import { db, esc, formatDate, setupAuth } from "./notes-firebase.js"

const searchEl = document.getElementById("search-field")
const container = document.getElementById("posts-container")
const countEl = document.getElementById("notes-count")
let posts = []

function render() {
  const q = searchEl.value.trim().toLowerCase()
  const shown = q ? posts.filter((p) => `${p.title} ${p.content}`.toLowerCase().includes(q)) : posts
  container.innerHTML = shown.length
    ? shown
        .map(
          (p) => `<article class="post">
            <div class="post-top"><h2>${esc(p.title) || "Untitled"}</h2></div>
            <p class="post-content">${esc(p.content)}</p>
            <div class="post-foot"><span class="post-date">${formatDate(p.timestamp)}</span></div>
          </article>`
        )
        .join("")
    : `<p class="empty-hint">${posts.length ? "No public notes match that search." : "No public notes yet. Be the first: publish one from the Note Taker."}</p>`
  countEl.textContent = posts.length ? `${posts.length} shared note${posts.length === 1 ? "" : "s"}` : ""
}

async function load() {
  const snap = await getDocs(query(collection(db, "posts"), where("public", "==", true), orderBy("timestamp", "desc")))
  posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  render()
}

searchEl.addEventListener("input", render)
setupAuth((user) => {
  if (user) load().catch((err) => { console.error(err); container.innerHTML = `<p class="empty-hint">Couldn't load notes. Refresh to try again.</p>` })
  else { posts = []; container.innerHTML = "" }
})
