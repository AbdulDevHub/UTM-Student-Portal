// Zero-dependency static server for local development: `npm run serve`.
// Mirrors Netlify: /dir/ serves dir/index.html, unknown paths serve 404.html.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, resolve } from "node:path"

const ROOT = resolve(".")
const PORT = Number(process.env.PORT) || 4173
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain",
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname)
  let file = normalize(join(ROOT, path))
  if (!file.startsWith(ROOT)) return res.writeHead(403).end()
  try {
    const s = await stat(file)
    if (s.isDirectory()) {
      if (!path.endsWith("/")) return res.writeHead(301, { location: path + "/" }).end()
      file = join(file, "index.html")
    }
    const body = await readFile(file)
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-cache" })
    res.end(body)
  } catch {
    const body = await readFile(join(ROOT, "404.html")).catch(() => "Not found")
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end(body)
  }
}).listen(PORT, () => console.log(`Serving ${ROOT} at http://localhost:${PORT}`))
