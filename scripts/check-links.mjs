// Checks every external link in js/data/links.js and reports the broken ones.
// Usage: node scripts/check-links.mjs [--json out.json]
// Exit code 1 when at least one link is broken (used by the weekly GitHub Action).
import { writeFileSync } from "node:fs"
import { allLinks } from "../js/data/links.js"

const UA = "Mozilla/5.0 (UTM-Student-Portal link checker; +https://github.com/AbdulDevHub/UTM-Student-Portal)"
const TIMEOUT_MS = 20000
const CONCURRENCY = 8

// Sites that block bots or need a login; a 401/403/429 from these is not "broken".
const SOFT_STATUSES = new Set([401, 403, 405, 429, 999])

async function probe(url) {
  for (const method of ["HEAD", "GET"]) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA, accept: "text/html,*/*" } })
      // UofT single sign-on answers anonymous bots with a 500 login page: that means the site is up.
      if (res.ok || SOFT_STATUSES.has(res.status) || /utorauth.utoronto.ca/.test(res.url)) return { ok: true, status: res.status }
      if (method === "GET") return { ok: false, status: res.status }
    } catch (err) {
      if (err.cause?.code === "UND_ERR_HEADERS_OVERFLOW") return { ok: true, status: "big-headers" }
      if (method === "GET") return { ok: false, status: err.name === "AbortError" ? "timeout" : err.cause?.code || err.message }
    } finally {
      clearTimeout(timer)
    }
  }
}

// Links marked `check: false` are known to be reachable only from the UofT network.
const targets = allLinks().filter((l) => /^https?:/.test(l.url) && l.check !== false)
const results = []
let i = 0
async function worker() {
  while (i < targets.length) {
    const link = targets[i++]
    let r = await probe(link.url)
    if (!r.ok) r = await probe(link.url) // one retry for flaky hosts
    results.push({ ...link, ...r })
    process.stdout.write(r.ok ? "." : "x")
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log()

const broken = results.filter((r) => !r.ok)
for (const b of broken) console.log(`BROKEN  ${b.status}  ${b.name}  ${b.url}`)
console.log(`${targets.length - broken.length}/${targets.length} links OK`)

const jsonIdx = process.argv.indexOf("--json")
if (jsonIdx > -1) writeFileSync(process.argv[jsonIdx + 1], JSON.stringify(broken.map(({ name, url, status, categoryTitle }) => ({ name, url, status, category: categoryTitle })), null, 2))
process.exit(broken.length ? 1 : 0)
