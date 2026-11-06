// GPA calculator page: course rows, sessional GPA, CGPA, planners, share links.
import { parseGrade, computeGpa, combineCgpa, requiredAverage, requiredFinal, letterForGpa } from "./lib/gpa.js"
import { store } from "./store.js"
import { toast } from "./app.js"

const KEY = "portal.gpa"
const $ = (s) => document.querySelector(s)
const listEl = $("[data-courses]")
const fields = {
  prevCgpa: $("[data-prev-cgpa]"),
  prevCredits: $("[data-prev-credits]"),
  fCurrent: $("[data-f-current]"),
  fWeight: $("[data-f-weight]"),
  fTarget: $("[data-f-target]"),
  tTarget: $("[data-t-target]"),
  tCredits: $("[data-t-credits]"),
}

const blankCourse = () => ({ code: "", grade: "", weight: "0.5" })
const DEFAULT = { courses: [blankCourse(), blankCourse(), blankCourse(), blankCourse(), blankCourse()] }

// ---------- State: shared link > saved > default ----------
// Shared links and saved state are untrusted input: keep only known fields, coerced to safe strings.
const num = (v) => { const t = String(v ?? "").trim(); return /^d{0,4}(.d{0,3})?$/.test(t) ? t : "" }
function sanitize(s, keepPlanners = true) {
  if (!s || !Array.isArray(s.courses)) return null
  const clean = {
    courses: s.courses.slice(0, 40).map((c) => ({
      code: String(c?.code ?? "").slice(0, 12),
      grade: String(c?.grade ?? "").slice(0, 5),
      weight: String(c?.weight) === "1" ? "1" : "0.5",
    })),
    prevCgpa: num(s.prevCgpa),
    prevCredits: num(s.prevCredits),
  }
  if (keepPlanners) for (const k of ["fCurrent", "fWeight", "fTarget", "tTarget", "tCredits"]) clean[k] = num(s[k])
  return clean
}
function fromHash() {
  const m = location.hash.match(/^#s=([\w-]+)/)
  if (!m) return null
  try {
    const json = decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))
    const s = JSON.parse(json)
    return sanitize(s, false)
  } catch {
    return null
  }
}
function toHash(state) {
  const json = JSON.stringify({ courses: state.courses.filter((c) => c.code || c.grade), prevCgpa: state.prevCgpa, prevCredits: state.prevCredits })
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

let state = fromHash()
if (state) {
  history.replaceState(null, "", location.pathname)
  setTimeout(() => toast("Loaded shared grades"), 300)
} else {
  state = sanitize(store.get(KEY, null)) || structuredClone(DEFAULT)
}
if (!state.courses?.length) state.courses = [blankCourse()]

// ---------- Rendering ----------
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

const SAMPLE_CODES = ["CSC108H5", "MAT102H5", "PSY100Y5", "ECO100Y5", "STA107H5", "BIO152H5"]
function rowHtml(c, i) {
  return `<li class="course" data-i="${i}">
    <input class="input" type="text" value="${esc(c.code)}" placeholder="${SAMPLE_CODES[i % SAMPLE_CODES.length]}" aria-label="Course ${i + 1} code" data-k="code" maxlength="12" autocomplete="off">
    <input class="input" type="text" value="${esc(c.grade)}" placeholder="85 or A-" aria-label="Course ${i + 1} mark or letter" data-k="grade" maxlength="5" autocomplete="off" inputmode="text">
    <select class="select" aria-label="Course ${i + 1} credit weight" data-k="weight">
      <option value="0.5"${c.weight === "0.5" ? " selected" : ""}>0.5 (H)</option>
      <option value="1"${c.weight === "1" ? " selected" : ""}>1.0 (Y)</option>
    </select>
    <span class="grade-badge" data-badge></span>
    <button class="icon-btn" type="button" data-remove aria-label="Remove course ${i + 1}"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button>
  </li>`
}

function renderRows() {
  listEl.innerHTML = state.courses.map(rowHtml).join("")
  state.courses.forEach((_, i) => updateBadge(i))
}

function updateBadge(i) {
  const li = listEl.querySelector(`.course[data-i="${i}"]`)
  if (!li) return
  const g = parseGrade(state.courses[i].grade)
  const badge = li.querySelector("[data-badge]")
  const gradeInput = li.querySelector('[data-k="grade"]')
  gradeInput.classList.toggle("invalid", !!state.courses[i].grade.trim() && !g)
  if (!g) { badge.textContent = ""; badge.className = "grade-badge"; return }
  if (g.excluded) { badge.textContent = g.letter; badge.className = "grade-badge muted"; return }
  badge.textContent = `${g.letter} · ${g.gp.toFixed(1)}`
  badge.className = `grade-badge g-${g.letter[0].toLowerCase()}`
}

const C = 2 * Math.PI * 52
function renderResults() {
  const s = computeGpa(state.courses)
  const gauge = $("[data-gauge]")
  gauge.style.strokeDasharray = `${C}`
  gauge.style.strokeDashoffset = `${C * (1 - (s.gpa ?? 0) / 4)}`
  gauge.dataset.band = s.gpa == null ? "" : s.gpa >= 3.7 ? "a" : s.gpa >= 2.7 ? "b" : s.gpa >= 1.7 ? "c" : "d"
  $("[data-gpa]").textContent = s.gpa == null ? "–" : s.gpa.toFixed(2)
  $("[data-gpa-sub]").textContent = s.gpa == null ? "Add a grade to get started" : `${letterForGpa(s.gpa)} average · ${s.credits.toFixed(1)} credit${s.credits === 1 ? "" : "s"}`

  const prevC = parseFloat(state.prevCredits) || 0
  const prevG = parseFloat(state.prevCgpa)
  const hasPrev = prevC > 0 && prevG >= 0 && prevG <= 4
  const cg = hasPrev || s.credits ? combineCgpa(hasPrev ? prevG : 0, hasPrev ? prevC : 0, s.points, s.credits) : null
  $("[data-cgpa]").textContent = cg == null ? "–" : `${cg.toFixed(2)} over ${(prevC * hasPrev + s.credits).toFixed(1)} credits`

  // Final-exam planner
  const fOut = $("[data-f-out]")
  const f = state.fCurrent !== "" && state.fTarget !== "" ? requiredFinal(state.fCurrent, state.fWeight, state.fTarget) : null
  if (!f) fOut.innerHTML = "Fill in all three to see the mark you need."
  else if (f.needed <= 0) fOut.innerHTML = `<b class="ok">You're already there.</b> Even a 0 on the final keeps you at ${state.fTarget}%.`
  else if (!f.feasible) fOut.innerHTML = `<b class="bad">${f.needed}% needed</b>, more than 100%. Try a lower target or ask about bonus marks.`
  else fOut.innerHTML = `You need <b>${f.needed}%</b> on the final${f.needed >= 85 ? ". Tough but doable, start early." : "."}`

  // Target CGPA planner
  const tOut = $("[data-t-out]")
  const curCredits = (hasPrev ? prevC : 0) + s.credits
  const curCgpa = cg ?? 0
  const t = state.tTarget !== "" && curCredits > 0 ? requiredAverage(curCgpa, curCredits, state.tTarget, state.tCredits) : null
  if (!t) tOut.innerHTML = curCredits ? "Enter a target and the credits you have left." : "Add some grades or your current CGPA first."
  else if (t.needed <= 0) tOut.innerHTML = `<b class="ok">Already locked in.</b> You'd stay above ${state.tTarget} even with low grades.`
  else if (!t.feasible) tOut.innerHTML = `<b class="bad">${t.needed.toFixed(2)} average needed</b>: above 4.0, so not reachable in ${state.tCredits} credits.`
  else tOut.innerHTML = `Average <b>${t.needed.toFixed(2)}</b> (about <b>${letterForGpa(t.needed, true)}</b>) across your next ${state.tCredits} credits.`
}

function save() {
  store.set(KEY, state)
}

// ---------- Events ----------
listEl.addEventListener("input", (e) => {
  const li = e.target.closest(".course")
  if (!li) return
  const i = Number(li.dataset.i)
  state.courses[i][e.target.dataset.k] = e.target.value
  updateBadge(i)
  renderResults()
  save()
})
listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]")
  if (!btn) return
  const i = Number(btn.closest(".course").dataset.i)
  state.courses.splice(i, 1)
  if (!state.courses.length) state.courses.push(blankCourse())
  renderRows()
  renderResults()
  save()
})
$("[data-add]").addEventListener("click", () => {
  state.courses.push(blankCourse())
  renderRows()
  listEl.querySelector(`.course[data-i="${state.courses.length - 1}"] input`)?.focus()
  save()
})
// Clear needs a second click within 3s so a stray tap can't wipe a term's worth of grades
const clearBtn = $("[data-clear]")
let armed = null
clearBtn.addEventListener("click", () => {
  if (!armed) {
    clearBtn.lastChild.textContent = "Tap again to clear"
    armed = setTimeout(() => { armed = null; clearBtn.lastChild.textContent = "Clear" }, 3000)
    return
  }
  clearTimeout(armed)
  armed = null
  clearBtn.lastChild.textContent = "Clear"
  state = structuredClone(DEFAULT)
  hydrateFields()
  renderRows()
  renderResults()
  save()
  toast("All grades cleared")
})
$("[data-share]").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}#s=${toHash(state)}`
  try {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ title: "My UofT GPA", url })
    else { await navigator.clipboard.writeText(url); toast("Share link copied") }
  } catch { /* user cancelled */ }
})

const map = { prevCgpa: "prevCgpa", prevCredits: "prevCredits", fCurrent: "fCurrent", fWeight: "fWeight", fTarget: "fTarget", tTarget: "tTarget", tCredits: "tCredits" }
function hydrateFields() {
  for (const k in map) {
    state[k] ??= ""
    fields[k].value = state[k]
  }
}
for (const k in map) {
  fields[k].addEventListener("input", () => {
    state[k] = fields[k].value
    renderResults()
    save()
  })
}

hydrateFields()
renderRows()
renderResults()
