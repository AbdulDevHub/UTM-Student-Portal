// Tiny localStorage wrapper. Every call is wrapped: storage can be blocked
// (private mode, strict settings) and the portal must still work without it.

export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key)
      return v == null ? fallback : JSON.parse(v)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable: feature just won't persist */
    }
  },
}

const PINS = "portal.pins"
const RECENT = "portal.recent"
const changed = () => window.dispatchEvent(new CustomEvent("portal:store"))

export const getPins = () => store.get(PINS, [])
export const isPinned = (id) => getPins().includes(id)

/** Toggle a pin; returns true when the link is now pinned. */
export function togglePin(id) {
  const pins = getPins()
  const i = pins.indexOf(id)
  if (i > -1) pins.splice(i, 1)
  else pins.push(id)
  store.set(PINS, pins)
  changed()
  return i === -1
}

export const getRecent = () => store.get(RECENT, [])
export function addRecent(id) {
  if (!id) return
  store.set(RECENT, [id, ...getRecent().filter((x) => x !== id)].slice(0, 8))
  changed()
}

// Keep other open tabs in sync
window.addEventListener("storage", (e) => {
  if (e.key === PINS || e.key === RECENT) changed()
})
