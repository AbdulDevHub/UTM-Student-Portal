// Calculator page: keypad + keyboard input, live preview, saved history.
import { evaluate } from "./lib/calc.js"
import { store } from "./store.js"

const KEY = "portal.calc"
const expr = document.getElementById("calc-expr")
const preview = document.querySelector("[data-preview]")
const historyEl = document.querySelector("[data-history]")
let history = store.get(KEY, [])
let justEvaluated = false

const fmt = (n) => (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0) ? n.toExponential(6) : n.toLocaleString("en-CA", { maximumFractionDigits: 10 }))

function insert(text) {
  // After "=", typing a digit starts fresh; typing an operator continues from the answer
  if (justEvaluated && /^[0-9.(√]$/.test(text)) expr.value = ""
  justEvaluated = false
  const s = expr.selectionStart ?? expr.value.length
  const e = expr.selectionEnd ?? expr.value.length
  expr.value = expr.value.slice(0, s) + text + expr.value.slice(e)
  const pos = s + text.length
  expr.setSelectionRange(pos, pos)
  update()
}

function update() {
  preview.classList.remove("error")
  if (!expr.value.trim()) return (preview.textContent = "")
  try {
    const v = evaluate(expr.value)
    preview.textContent = String(v) === expr.value.trim() ? "" : `= ${fmt(v)}`
  } catch {
    preview.textContent = ""
  }
}

function equals() {
  if (!expr.value.trim()) return
  try {
    const v = evaluate(expr.value)
    history = [{ e: expr.value, r: v }, ...history].slice(0, 30)
    store.set(KEY, history)
    renderHistory()
    expr.value = String(v)
    preview.textContent = ""
    justEvaluated = true
  } catch (err) {
    preview.textContent = err.message
    preview.classList.add("error")
    expr.classList.remove("shake")
    void expr.offsetWidth
    expr.classList.add("shake")
  }
}

function renderHistory() {
  historyEl.innerHTML = history.length
    ? history.map((h, i) => `<li><button type="button" data-i="${i}"><span class="h-expr">${h.e.replace(/[&<>]/g, "")}</span><span class="h-res">= ${fmt(h.r)}</span></button></li>`).join("")
    : `<li class="h-empty">Your calculations will show up here.</li>`
}

document.querySelector("[data-keys]").addEventListener("click", (e) => {
  const b = e.target.closest("button")
  if (!b) return
  if (b.dataset.ins) insert(b.dataset.ins)
  else if (b.dataset.act === "clear") { expr.value = ""; update() }
  else if (b.dataset.act === "back") {
    const s = expr.selectionStart ?? expr.value.length
    if (s > 0) { expr.value = expr.value.slice(0, s - 1) + expr.value.slice(s); expr.setSelectionRange(s - 1, s - 1) }
    update()
  } else if (b.dataset.act === "ans") { if (history[0]) insert(String(history[0].r)) }
  else if (b.dataset.act === "equals") equals()
  if (matchMedia("(pointer: fine)").matches) expr.focus()
})

expr.addEventListener("input", () => { justEvaluated = false; update() })
expr.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals() }
  else if (e.key === "Escape") { expr.value = ""; update() }
  else if (justEvaluated && /^[0-9.]$/.test(e.key)) { expr.value = ""; justEvaluated = false }
})
// Typing anywhere on the page goes to the calculator
document.addEventListener("keydown", (e) => {
  if (e.target === expr || e.ctrlKey || e.metaKey || e.altKey) return
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
  if (/^[0-9+\-*/^().%]$/.test(e.key)) { expr.focus() }
})

historyEl.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]")
  if (b) insert(String(history[Number(b.dataset.i)].r))
})
document.querySelector("[data-clear-history]").addEventListener("click", () => {
  history = []
  store.set(KEY, history)
  renderHistory()
})

renderHistory()
if (matchMedia("(pointer: fine)").matches) expr.focus()
