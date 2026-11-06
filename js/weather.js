// Live Mississauga weather from Open-Meteo (free, no API key, CORS-enabled).
import { store } from "./store.js"

const API =
  "https://api.open-meteo.com/v1/forecast?latitude=43.5483&longitude=-79.6627" +
  "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
  "&timezone=America%2FToronto&forecast_days=4"
const KEY = "portal.weather"
const TTL = 15 * 60 * 1000

/** WMO weather code → label + icon id. */
export function describe(code, isDay = 1) {
  if (code === 0) return { label: "Clear", icon: isDay ? "i-sun" : "i-moon" }
  if (code <= 2) return { label: code === 1 ? "Mainly clear" : "Partly cloudy", icon: isDay ? "i-cloud-sun" : "i-cloud" }
  if (code === 3) return { label: "Overcast", icon: "i-cloud" }
  if (code === 45 || code === 48) return { label: "Fog", icon: "i-fog" }
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "i-rain" }
  if (code >= 61 && code <= 67) return { label: code >= 66 ? "Freezing rain" : "Rain", icon: "i-rain" }
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "i-snow" }
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: "i-rain" }
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "i-snow" }
  if (code >= 95) return { label: "Thunderstorm", icon: "i-storm" }
  return { label: "—", icon: "i-cloud" }
}

async function load() {
  const cached = store.get(KEY, null)
  if (cached && Date.now() - cached.t < TTL) return cached.data
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(res.status)
    const data = await res.json()
    store.set(KEY, { t: Date.now(), data })
    return data
  } catch {
    return cached?.data || null // stale beats nothing when offline
  }
}

const icon = (id, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`
const dayName = (iso, i) => (i === 0 ? "Today" : new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" }))

export async function initWeather() {
  const wrap = document.querySelector("[data-weather]")
  if (!wrap) return
  const pill = wrap.querySelector(".weather-pill")
  const panel = wrap.querySelector(".weather-panel")
  const data = await load()
  if (!data?.current) return

  const c = data.current
  const now = describe(c.weather_code, c.is_day)
  const temp = Math.round(c.temperature_2m)
  pill.innerHTML = `${icon(now.icon)}<span class="w-temp">${temp}°</span>`
  pill.setAttribute("aria-label", `Mississauga weather: ${temp}°C, ${now.label}`)
  pill.hidden = false

  const d = data.daily
  panel.innerHTML = `
    <div class="w-now">${icon(now.icon)}<div><div class="w-big">${temp}°C</div><div class="w-cond">${now.label} · UTM, Mississauga</div></div></div>
    <div class="w-stats">
      <div class="w-stat">Feels like<b>${Math.round(c.apparent_temperature)}°</b></div>
      <div class="w-stat">Wind<b>${Math.round(c.wind_speed_10m)} km/h</b></div>
      <div class="w-stat">Humidity<b>${Math.round(c.relative_humidity_2m)}%</b></div>
    </div>
    <div class="w-days">${d.time
      .map((t, i) => {
        const w = describe(d.weather_code[i])
        return `<div class="w-day" title="${w.label}">${dayName(t, i)}${icon(w.icon)}<b>${Math.round(d.temperature_2m_max[i])}°</b> <span>${Math.round(d.temperature_2m_min[i])}°</span><br><span title="Chance of precipitation">${d.precipitation_probability_max[i] ?? 0}% 💧</span></div>`
      })
      .join("")}</div>
    <p class="w-credit">Forecast by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></p>`

  const close = () => { panel.hidden = true; pill.setAttribute("aria-expanded", "false") }
  pill.addEventListener("click", (e) => {
    e.stopPropagation()
    const open = panel.hidden
    panel.hidden = !open
    pill.setAttribute("aria-expanded", String(open))
  })
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close() })
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { close(); pill.focus() } })
}
