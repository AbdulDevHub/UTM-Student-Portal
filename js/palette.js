// Ctrl+K command palette: fuzzy search over every link, plus a few actions.
import { allLinks, monogram } from "./data/links.js"
import { indexItems, search } from "./lib/search.js"
import { getPins, getRecent, addRecent } from "./store.js"

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
const POPULAR = ["acorn", "quercus", "timetable-builder", "exam-schedule", "important-dates", "gpa-calculator"]

export function initPalette({ toggleTheme }) {
  const dialog = document.getElementById("palette")
  if (!dialog || typeof dialog.showModal !== "function") return null
  const input = dialog.querySelector("#palette-input")
  const list = dialog.querySelector("#palette-list")

  const actions = [
    { id: "action-theme", name: "Toggle dark mode", desc: "Switch between light and dark", aliases: ["dark mode", "light mode", "theme", "night"], categoryTitle: "Action", color: "internal", action: () => toggleTheme() },
    { id: "action-home", name: "Portal home", desc: "Back to all links", aliases: ["home", "start"], categoryTitle: "Page", color: "internal", url: "/" },
    { id: "action-suggest", name: "Suggest a link", desc: "Open a GitHub issue", aliases: ["feedback", "missing", "add link", "bug"], categoryTitle: "Action", color: "internal", url: "https://github.com/AbdulDevHub/UTM-Student-Portal/issues/new?template=suggest-link.yml" },
  ]
  const items = [...allLinks(), ...actions]
  const byId = new Map(items.map((i) => [i.id, i]))
  const index = indexItems(items)
  let results = []
  let active = 0

  function groups() {
    const q = input.value.trim()
    if (q) return [["Results", search(q, index, 30).map((r) => r.item)]]
    const seen = new Set()
    const take = (ids) => ids.map((id) => byId.get(id)).filter((x) => x && !seen.has(x.id) && seen.add(x.id))
    return [
      ["Pinned", take(getPins())],
      ["Recent", take(getRecent()).slice(0, 5)],
      ["Popular", take(POPULAR)],
    ].filter(([, arr]) => arr.length)
  }

  function render() {
    results = []
    let html = ""
    for (const [title, arr] of groups()) {
      html += `<li class="palette-group" role="presentation">${title}</li>`
      for (const item of arr) {
        const i = results.push(item) - 1
        html += `<li class="palette-item" role="option" id="pal-${i}" data-i="${i}" aria-selected="false" style="--c: var(--c-${item.color})">
          <span class="mono" aria-hidden="true">${esc(monogram(item.name))}</span>
          <span class="p-text"><span class="p-name">${esc(item.name)}</span><span class="p-desc">${esc(item.desc || "")}</span></span>
          <span class="p-cat">${esc(item.categoryTitle || "")}</span>
          <svg class="icon p-enter" aria-hidden="true"><use href="#i-enter"/></svg></li>`
      }
    }
    if (!results.length) html = `<li class="palette-empty" role="presentation">No links match “${esc(input.value.trim())}”.<br>Try a shorter word, or <a href="https://github.com/AbdulDevHub/UTM-Student-Portal/issues/new?template=suggest-link.yml" target="_blank" rel="noopener">suggest it</a>.</li>`
    list.innerHTML = html
    setActive(0)
  }

  function setActive(i) {
    if (!results.length) return input.removeAttribute("aria-activedescendant")
    active = (i + results.length) % results.length
    list.querySelectorAll(".palette-item").forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.i) === active)))
    const el = list.querySelector(`#pal-${active}`)
    input.setAttribute("aria-activedescendant", `pal-${active}`)
    el?.scrollIntoView({ block: "nearest" })
  }

  function choose(item, newTab = false) {
    if (!item) return
    dialog.close()
    if (item.action) return item.action()
    if (!item.id.startsWith("action-")) addRecent(item.id)
    const internal = item.url.startsWith("/")
    if (internal && !newTab) location.href = item.url
    else if (item.url.startsWith("mailto:")) location.href = item.url
    else window.open(item.url, "_blank", "noopener")
  }

  input.addEventListener("input", render)
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1) }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[active], e.ctrlKey || e.metaKey) }
  })
  list.addEventListener("click", (e) => {
    const el = e.target.closest(".palette-item")
    if (el) choose(results[Number(el.dataset.i)], e.ctrlKey || e.metaKey)
  })
  list.addEventListener("mousemove", (e) => {
    const el = e.target.closest(".palette-item")
    if (el && Number(el.dataset.i) !== active) setActive(Number(el.dataset.i))
  })
  // Click on the backdrop closes
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close() })

  return {
    open(prefill = "") {
      input.value = prefill
      render()
      if (!dialog.open) dialog.showModal()
      input.focus()
    },
  }
}
