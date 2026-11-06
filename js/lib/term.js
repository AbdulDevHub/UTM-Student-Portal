// Pure date logic for the term tracker (no DOM, unit-tested in tests/term.test.mjs).

const DAY = 86400000

/** Parse "YYYY-MM-DD" as a UTC midnight timestamp so day maths ignores DST. */
export function day(iso) {
  const [y, m, d] = iso.split("-").map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Today's date in Toronto as "YYYY-MM-DD" (the campus calendar day). */
export function torontoToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(now)
}

const daysBetween = (a, b) => Math.round((day(b) - day(a)) / DAY)

/** Monday of the week containing `iso` (UTC day number). */
function mondayOf(iso) {
  const t = day(iso)
  const dow = (new Date(t).getUTCDay() + 6) % 7 // Mon=0
  return t - dow * DAY
}

function inRange(iso, start, end) {
  return day(iso) >= day(start) && day(iso) <= day(end)
}

/**
 * Where we are in the academic year.
 * Returns { term, phase, week, totalWeeks, progress, label, detail } or a
 * "between terms" status pointing at the next term.
 */
export function termStatus(today, terms) {
  for (const term of terms) {
    const termEnd = term.examsEnd || term.classesEnd
    if (!inRange(today, term.classesStart, termEnd)) continue

    // Teaching weeks = calendar weeks from first Monday to last class, minus break weeks.
    const firstMon = mondayOf(term.classesStart)
    const breakMondays = new Set((term.breaks || []).map((b) => mondayOf(b.start)))
    const countWeeks = (untilIso) => {
      let n = 0
      for (let t = firstMon; t <= mondayOf(untilIso); t += 7 * DAY) if (!breakMondays.has(t)) n++
      return n
    }
    const totalWeeks = countWeeks(term.classesEnd)
    const progress = Math.min(1, Math.max(0, (day(today) - day(term.classesStart)) / (day(termEnd) - day(term.classesStart))))

    const onBreak = (term.breaks || []).find((b) => inRange(today, b.start, b.end))
    if (onBreak) return { term, phase: "break", week: null, totalWeeks, progress, label: onBreak.name, detail: `Back to class ${fmtShort(nextDay(onBreak.end))}` }

    if (day(today) <= day(term.classesEnd)) {
      const week = countWeeks(today)
      const left = daysBetween(today, term.classesEnd)
      return { term, phase: "classes", week, totalWeeks, progress, label: `Week ${week} of ${totalWeeks}`, detail: left === 0 ? "Last day of classes" : `${left} day${left === 1 ? "" : "s"} of classes left` }
    }
    if (term.examsStart && day(today) < day(term.examsStart)) return { term, phase: "study", week: null, totalWeeks, progress, label: "Study break", detail: `Exams start ${fmtShort(term.examsStart)}` }
    const left = daysBetween(today, termEnd)
    return { term, phase: "exams", week: null, totalWeeks, progress, label: "Exam period", detail: left === 0 ? "Last day of exams" : `${left} day${left === 1 ? "" : "s"} of exams left` }
  }

  const next = terms.find((t) => day(t.classesStart) > day(today))
  if (next) {
    const d = daysBetween(today, next.classesStart)
    return { term: next, phase: "off", week: null, totalWeeks: null, progress: 0, label: "Between terms", detail: `${next.name} starts in ${d} day${d === 1 ? "" : "s"}` }
  }
  return { term: null, phase: "unknown", week: null, totalWeeks: null, progress: 0, label: "Term dates coming soon", detail: "Check Important Dates for the next term" }
}

/** Events that are happening now or later, soonest first, with a days-away count. */
export function upcomingEvents(today, events, limit = 4) {
  return events
    .filter((e) => day(e.end || e.date) >= day(today))
    .sort((a, b) => day(a.date) - day(b.date))
    .slice(0, limit)
    .map((e) => {
      const inDays = daysBetween(today, e.date)
      const ongoing = inDays < 0 || (inDays === 0 && !!e.end)
      return { ...e, inDays: Math.max(0, inDays), ongoing, when: ongoing ? "Now" : relative(inDays) }
    })
}

export function relative(inDays) {
  if (inDays === 0) return "Today"
  if (inDays === 1) return "Tomorrow"
  if (inDays < 14) return `In ${inDays} days`
  const weeks = Math.round(inDays / 7)
  return `In ${weeks} weeks`
}

function nextDay(iso) {
  return new Date(day(iso) + DAY).toISOString().slice(0, 10)
}

export function fmtShort(iso) {
  return new Date(day(iso)).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })
}
