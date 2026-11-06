// Static "build" for the portal. No bundler, no dependencies.
//
//   node scripts/build.mjs          rewrite generated regions in place
//   node scripts/build.mjs --check  fail if any generated region is stale (CI / Verify)
//
// Each page keeps hand-written <head> metadata and content, plus marked regions
// that this script fills:
//   <!-- @head --> <!-- @header --> <!-- @footer -->   shared partials
//   <!-- @links -->                                     homepage link directory (from js/data/links.js)
//   <!-- @faq --> <!-- @faq-schema -->                  homepage FAQ + matching JSON-LD
// It also regenerates sitemap.xml and the service worker's precache list + version.

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { createHash } from "node:crypto"
import { categories, links, majors, linkId, monogram } from "../js/data/links.js"
import { terms } from "../js/data/dates.js"
import { fmtShort } from "../js/lib/term.js"

const SITE = "https://utmstudentportal.netlify.app"
const CHECK = process.argv.includes("--check")

const PAGES = [
  { file: "index.html", path: "/", priority: "1.0", changefreq: "weekly" },
  { file: "gpa-calculator/index.html", path: "/gpa-calculator/", priority: "0.9", changefreq: "monthly" },
  { file: "calculator/index.html", path: "/calculator/", priority: "0.6", changefreq: "yearly" },
  { file: "student-projects/index.html", path: "/student-projects/", priority: "0.6", changefreq: "monthly" },
  { file: "notes/index.html", path: "/notes/", priority: "0.5", changefreq: "weekly" },
  { file: "404.html", path: null },
]

// Files the service worker caches on install (the offline shell).
const PRECACHE = [
  "/",
  "/gpa-calculator/",
  "/calculator/",
  "/css/style.css",
  "/js/app.js",
  "/js/home.js",
  "/js/gpa-page.js",
  "/js/palette.js",
  "/js/store.js",
  "/js/weather.js",
  "/js/data/links.js",
  "/js/data/dates.js",
  "/js/lib/search.js",
  "/js/lib/term.js",
  "/js/lib/gpa.js",
  "/js/lib/calc.js",
  "/images/icons/logo.svg",
  "/images/icons/icon-192.png",
  "/images/chatbot_icon_v3.png",
  "/site.webmanifest",
]

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const read = (f) => readFileSync(f, "utf8").replace(/\r\n/g, "\n")
const indent = (text, pad) => text.trim().split("\n").map((l) => (l ? pad + l : l)).join("\n")

function fillRegion(html, name, content, file) {
  const re = new RegExp(`([ \\t]*)<!-- @${name} -->[\\s\\S]*?<!-- /@${name} -->`)
  const m = html.match(re)
  if (!m) throw new Error(`${file}: missing <!-- @${name} --> region`)
  const pad = m[1]
  return html.replace(re, () => `${pad}<!-- @${name} -->\n${indent(content, pad)}\n${pad}<!-- /@${name} -->`)
}

// ---------- link directory ----------
function tile(link) {
  const id = linkId(link)
  const internal = link.url.startsWith("/")
  const newTab = !internal && !link.url.startsWith("mailto:")
  const attrs = newTab ? ' target="_blank" rel="noopener"' : ""
  const major = link.major ? ` data-major="${link.major}"` : ""
  return `<li class="tile" data-id="${id}"${major}><a href="${esc(link.url)}" data-link-id="${id}"${attrs}><span class="mono" aria-hidden="true">${esc(monogram(link.name))}</span><span class="tile-text"><span class="tile-name">${esc(link.name)}</span><span class="tile-desc">${esc(link.desc || "")}</span></span></a><button class="pin" type="button" aria-pressed="false" aria-label="Pin ${esc(link.name)}"><svg class="icon" aria-hidden="true"><use href="#i-star"/></svg></button></li>`
}

function renderCategory(cat) {
  const items = links[cat.id] || []
  const tabs =
    cat.id === "majors"
      ? `\n  <div class="major-tabs" role="group" aria-label="Choose your major">${majors.map((m, i) => `<button type="button" data-major="${m.id}" aria-pressed="${i === 0}">${esc(m.name)}</button>`).join("")}</div>`
      : ""
  return `<section class="cat cat--${cat.id}" id="${cat.id}" data-cat="${cat.id}" aria-labelledby="h-${cat.id}">
  <div class="cat-head"><h2 id="h-${cat.id}">${esc(cat.title)}</h2><span class="cat-count">${items.length}</span></div>${tabs}
  <ul class="tiles">
${items.map((l) => "    " + tile(l)).join("\n")}
  </ul>${cat.id === "portal" ? QUICK_MATH_HINT : cat.id === "majors" ? MAJOR_HINT : ""}
</section>`
}

const MAJOR_HINT = `
  <p class="cat-hint"><span class="mono" aria-hidden="true">+</span><span><b>Missing your program?</b> <a href="https://github.com/AbdulDevHub/UTM-Student-Portal/issues/new?template=suggest-link.yml" target="_blank" rel="noopener">Suggest a link for your major</a> and it can be added for everyone.</span></p>`

// Shown at the bottom of Portal Tools (also soaks up spare column height)
const QUICK_MATH_HINT = `
  <p class="cat-hint"><span class="mono" aria-hidden="true">=</span><span><b>Quick math, anywhere.</b> Press <kbd>Ctrl</kbd> <kbd>K</kbd> and type a sum like <code>85*0.4+72*0.6</code> to get the answer.</span></p>`

// Two explicit columns (balanced via `col` in links.js), then full-width categories.
function renderDirectory() {
  const col = (n) => categories.filter((c) => c.col === n).map(renderCategory).join("\n")
  const wrap = (html) => `<div class="dir-col">\n${indent(html, "  ")}\n</div>`
  return [wrap(col(1)), wrap(col(2)), col("full")].join("\n")
}

// ---------- FAQ (visible HTML and FAQPage JSON-LD from one source) ----------
function faqItems() {
  const [fall, winter] = terms
  const linkCount = Object.values(links).reduce((n, arr) => n + arr.length, 0)
  return [
    {
      q: "What is the UTM Student Portal?",
      a: `A free, student-made page that puts ${linkCount} University of Toronto Mississauga links in one searchable place: ACORN, Quercus, the exam schedule, timetable builder, library, campus services and more. It also has a live term tracker, Mississauga weather, a UofT GPA calculator and Desmos calculators.`,
    },
    {
      q: "How do I calculate my UofT GPA?",
      a: `UofT converts each course mark to grade points on a 4.0 scale (85–100% = 4.0, 80–84% = 3.7, 77–79% = 3.3, 73–76% = 3.0, and so on), then averages them weighted by credit value: 0.5 for half-year (H) courses and 1.0 for full-year (Y) courses. CR/NCR courses are left out. The <a href="/gpa-calculator/">UTM GPA calculator</a> does this for you and also works out your cumulative GPA and the final-exam mark you need.`,
    },
    {
      q: `When do classes and exams happen in ${fall.name} and ${winter.name}?`,
      a: `${fall.name} classes run ${fmtShort(fall.classesStart)} to ${fmtShort(fall.classesEnd)}, ${fall.classesStart.slice(0, 4)}, with exams ${fmtShort(fall.examsStart)}–${fmtShort(fall.examsEnd)}. ${winter.name} classes run ${fmtShort(winter.classesStart)} to ${fmtShort(winter.classesEnd)}, ${winter.classesStart.slice(0, 4)}, with exams ${fmtShort(winter.examsStart)}–${fmtShort(winter.examsEnd)}. Always confirm deadlines on the <a href="https://www.utm.utoronto.ca/registrar/dates" target="_blank" rel="noopener">UTM Registrar's Important Dates page</a>.`,
    },
    {
      q: "Where can I find my UTM final exam schedule?",
      a: `Use the <a href="https://metis.utm.utoronto.ca/examschedule/finalexams.php" target="_blank" rel="noopener">UTM Exam Schedule</a> link (sign in with your UTORid). It lists the date, time and room for each of your final exams.`,
    },
    {
      q: "Can I install the portal on my phone?",
      a: `Yes. Open the site in your phone's browser and choose “Add to Home Screen” (iPhone: Share → Add to Home Screen; Android: the Install prompt or ⋮ → Install app). It opens like an app and the main pages still load without a connection.`,
    },
    {
      q: "Is this an official University of Toronto website?",
      a: `No. It is an independent project built by a UTM student and is not affiliated with or endorsed by the University of Toronto. Every link goes to the official source, and you can <a href="https://github.com/AbdulDevHub/UTM-Student-Portal/issues/new?template=suggest-link.yml" target="_blank" rel="noopener">suggest a new link on GitHub</a>.`,
    },
  ]
}

function renderFaq() {
  return `<section class="faq" id="faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Frequently asked questions</h2>
${faqItems().map((f) => `  <details>\n    <summary>${esc(f.q)}</summary>\n    <p>${f.a}</p>\n  </details>`).join("\n")}
</section>`
}

function renderFaqSchema() {
  const strip = (h) => h.replace(/<[^>]+>/g, "")
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems().map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
  }
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`
}

// ---------- run ----------
const outputs = new Map() // file -> new content
const headPartial = read("scripts/partials/head.html")
const headerPartial = read("scripts/partials/header.html")
const footerPartial = read("scripts/partials/footer.html")

for (const page of PAGES) {
  if (!existsSync(page.file)) throw new Error(`missing page ${page.file}`)
  let html = read(page.file)
  html = fillRegion(html, "head", headPartial, page.file)
  const header = page.path ? headerPartial.replace(`data-nav="${page.path}"`, `data-nav="${page.path}" aria-current="page"`) : headerPartial
  html = fillRegion(html, "header", header, page.file)
  html = fillRegion(html, "footer", footerPartial, page.file)
  if (page.file === "index.html") {
    html = fillRegion(html, "links", renderDirectory(), page.file)
    html = fillRegion(html, "faq", renderFaq(), page.file)
    html = fillRegion(html, "faq-schema", renderFaqSchema(), page.file)
  }
  outputs.set(page.file, html)
}

// Service worker: version = hash of everything it precaches, so any change ships a fresh cache.
const hash = createHash("sha256")
for (const p of PRECACHE) {
  const f = p.endsWith("/") ? p.slice(1) + "index.html" : p.slice(1)
  // Text files are hashed with LF endings so Windows (CRLF) and CI (LF) agree on the version
  const text = /\.(html|css|js|json|webmanifest|svg|txt|xml)$/.test(f) || !f.includes(".")
  hash.update(outputs.get(f) ?? (existsSync(f) ? (text ? read(f) : readFileSync(f)) : ""))
}
let sw = read("sw.js")
sw = sw.replace(/const VERSION = ".*?"/, `const VERSION = "${hash.digest("hex").slice(0, 10)}"`)
sw = sw.replace(/\/\* @precache \*\/[\s\S]*?\/\* \/@precache \*\//, `/* @precache */ ${JSON.stringify(PRECACHE, null, 2).replace(/\n/g, "\n")} /* /@precache */`)
outputs.set("sw.js", sw)

// Sitemap (lastmod = build day; skipped in --check so CI doesn't fail at midnight)
if (!CHECK) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = PAGES.filter((p) => p.path)
    .map((p) => `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`)
    .join("\n")
  outputs.set("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
}

let stale = []
for (const [file, content] of outputs) {
  const current = existsSync(file) ? read(file) : ""
  if (current === content) continue
  if (CHECK) stale.push(file)
  else writeFileSync(file, content)
}
if (CHECK && stale.length) {
  console.error(`Generated files are out of date: ${stale.join(", ")}\nRun: npm run build`)
  process.exit(1)
}
console.log(CHECK ? "Build output is up to date." : `Built ${outputs.size} files.`)
