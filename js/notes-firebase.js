// Shared Firebase setup + UI helpers for the Notes page.
// The config below is Firebase's public web config (safe to ship); access is
// enforced by Firestore security rules on the server.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyB036gHwHmbG-r_0VWlu4oifpZWEZJJ6uU",
  authDomain: "utm-student-portal.firebaseapp.com",
  projectId: "utm-student-portal",
  storageBucket: "utm-student-portal.appspot.com",
  messagingSenderId: "708863567163",
  appId: "1:708863567163:web:b81dfb03c1a30e7447431e",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

/** Escape user-written text before it goes into HTML (notes are shared publicly). */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

export function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null
  return d ? d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : ""
}

/** Wire the sign-in / sign-out buttons and call onUser(user|null) on every auth change. */
export function setupAuth(onUser) {
  const profile = document.getElementById("user-profile")
  const signInBtn = document.getElementById("sign-in-button")
  const signOutBtn = document.getElementById("sign-out-button")
  const gate = document.querySelectorAll("[data-signed-in]")
  const signedOut = document.querySelectorAll("[data-signed-out]")

  signInBtn.addEventListener("click", () => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => console.error("Sign in error", e)))
  signOutBtn.addEventListener("click", () => signOut(auth).catch((e) => console.error("Sign out error", e)))

  onAuthStateChanged(auth, (user) => {
    signInBtn.hidden = !!user
    signOutBtn.hidden = !user
    profile.hidden = !user
    gate.forEach((el) => (el.hidden = !user))
    signedOut.forEach((el) => (el.hidden = !!user))
    if (user) {
      profile.innerHTML = `${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ""}<span>${esc(user.displayName || "Signed in")}</span>`
    }
    onUser(user)
  })
}
