// Small typo-tolerant search used by the homepage filter and the Ctrl+K palette.
// No dependencies; unit-tested in tests/search.test.mjs.

export function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+]+/g, " ")
    .trim()
}

/** Optimal-string-alignment distance, capped: returns max+1 as soon as it is exceeded. */
export function editDistance(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const prev2 = new Array(b.length + 1).fill(0)
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1)
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > max) return max + 1
    prev2.splice(0, prev2.length, ...prev)
    prev = cur
  }
  return prev[b.length]
}

function prepField(text, weight) {
  const norm = normalize(text)
  const words = norm.split(" ").filter(Boolean)
  return { norm, words, initials: words.map((w) => w[0]).join(""), weight }
}

/** Build a searchable index from items: { name, desc?, aliases?, categoryTitle? }. */
export function indexItems(items) {
  return items.map((item) => ({
    item,
    name: normalize(item.name),
    fields: [
      prepField(item.name, 3),
      ...(item.aliases || []).map((a) => prepField(a, 2.4)),
      prepField(item.desc || "", 1),
      prepField(item.categoryTitle || "", 0.5),
    ],
  }))
}

function tokenScore(t, f) {
  if (!f.norm) return 0
  if (f.norm === t) return 1
  if (f.words.includes(t)) return 0.9
  if (f.words.some((w) => w.startsWith(t))) return 0.8
  if (t.length >= 2 && f.initials.startsWith(t)) return 0.7
  if (f.norm.replace(/ /g, "").includes(t)) return 0.55
  if (t.length >= 4) {
    const maxEd = t.length >= 7 ? 2 : 1
    if (f.words.some((w) => editDistance(w, t, maxEd) <= maxEd)) return 0.5
    if (f.words.some((w) => w.length > t.length && editDistance(w.slice(0, t.length), t, 1) <= 1)) return 0.4
  }
  return 0
}

/** Score one indexed entry; 0 means "no match". Every query word must match something. */
export function scoreEntry(query, entry) {
  const q = normalize(query)
  if (!q) return 0
  let total = 0
  for (const t of q.split(" ")) {
    let best = 0
    for (const f of entry.fields) best = Math.max(best, tokenScore(t, f) * f.weight)
    if (best === 0) return 0
    total += best
  }
  if (entry.name === q) total += 3
  else if (entry.name.startsWith(q)) total += 1.5
  // Tie-breaker: prefer names the query covers more of ("library" → "UTM Library" over "Library Films")
  total += Math.min(1, q.length / entry.name.length) * 0.5
  return total
}

/** Ranked matches for `query` (best first). */
export function search(query, index, limit = Infinity) {
  const out = []
  for (const entry of index) {
    const score = scoreEntry(query, entry)
    if (score > 0) out.push({ item: entry.item, score })
  }
  out.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
  return out.slice(0, limit)
}
