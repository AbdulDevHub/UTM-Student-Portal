// University of Toronto grading scale and GPA maths (no DOM, unit-tested).
// Scale source: UofT Grading Practices Policy (refined letter grades, 4.0 scale).

export const SCALE = [
  { min: 90, max: 100, letter: "A+", gp: 4.0 },
  { min: 85, max: 89, letter: "A", gp: 4.0 },
  { min: 80, max: 84, letter: "A-", gp: 3.7 },
  { min: 77, max: 79, letter: "B+", gp: 3.3 },
  { min: 73, max: 76, letter: "B", gp: 3.0 },
  { min: 70, max: 72, letter: "B-", gp: 2.7 },
  { min: 67, max: 69, letter: "C+", gp: 2.3 },
  { min: 63, max: 66, letter: "C", gp: 2.0 },
  { min: 60, max: 62, letter: "C-", gp: 1.7 },
  { min: 57, max: 59, letter: "D+", gp: 1.3 },
  { min: 53, max: 56, letter: "D", gp: 1.0 },
  { min: 50, max: 52, letter: "D-", gp: 0.7 },
  { min: 0, max: 49, letter: "F", gp: 0.0 },
]

/** Letter + grade points for a percentage (UofT rounds marks to whole numbers). */
export function fromPercent(pct) {
  const p = Math.round(pct)
  if (!(p >= 0 && p <= 100)) return null
  return SCALE.find((s) => p >= s.min)
}

export function fromLetter(letter) {
  const L = String(letter).trim().toUpperCase().replace("−", "-")
  return SCALE.find((s) => s.letter === L) || null
}

/**
 * Parse what a student typed: "85", "85%", "A-", "b+", "CR", "NCR".
 * Returns { gp, letter, percent? } | { excluded: true, letter } | null (invalid/empty).
 */
export function parseGrade(input) {
  const raw = String(input ?? "").trim()
  if (!raw) return null
  const up = raw.toUpperCase()
  if (["CR", "NCR", "P", "INC", "WDR", "LWD", "AEG", "GWR", "IPR"].includes(up)) return { excluded: true, letter: up }
  const num = raw.replace("%", "").trim()
  if (/^\d+(\.\d+)?$/.test(num)) {
    const row = fromPercent(Number(num))
    return row ? { gp: row.gp, letter: row.letter, percent: Number(num) } : null
  }
  const row = fromLetter(up)
  return row ? { gp: row.gp, letter: row.letter } : null
}

const round2 = (n) => Math.round(n * 100) / 100

/** Weighted GPA of rows { grade, weight } (weight 0.5 = half credit, 1.0 = full year). */
export function computeGpa(rows) {
  let points = 0
  let credits = 0
  for (const r of rows) {
    const g = parseGrade(r.grade)
    const w = Number(r.weight)
    if (!g || g.excluded || !(w > 0)) continue
    points += g.gp * w
    credits += w
  }
  return { gpa: credits ? round2(points / credits) : null, credits, points }
}

/** New cumulative GPA after adding a session to a previous CGPA. */
export function combineCgpa(prevCgpa, prevCredits, sessionPoints, sessionCredits) {
  const pc = Number(prevCredits) || 0
  const pg = Number(prevCgpa) || 0
  const total = pc + sessionCredits
  if (!total) return null
  return round2((pg * pc + sessionPoints) / total)
}

/**
 * Average GPA needed over `plannedCredits` more credits to reach `target` CGPA.
 * Returns { needed, feasible } where needed may be > 4 (impossible) or < 0 (already safe).
 */
export function requiredAverage(currentCgpa, currentCredits, target, plannedCredits) {
  const c = Number(currentCredits) || 0
  const p = Number(plannedCredits)
  if (!(p > 0)) return null
  const needed = (Number(target) * (c + p) - Number(currentCgpa) * c) / p
  return { needed: round2(needed), feasible: needed <= 4.0 }
}

/**
 * Final-exam mark needed. `current` is your % on the work done so far,
 * `finalWeight` the exam's share of the course (%), `target` the course % you want.
 */
export function requiredFinal(current, finalWeight, target) {
  const w = Number(finalWeight) / 100
  if (!(w > 0 && w <= 1)) return null
  const needed = (Number(target) - Number(current) * (1 - w)) / w
  return { needed: Math.round(needed * 10) / 10, feasible: needed <= 100 }
}

/**
 * Letter grade that matches a GPA value. With `atLeast`, the lowest letter whose
 * grade points are >= gpa (what you need to aim for); otherwise the highest letter <= gpa.
 */
export function letterForGpa(gpa, atLeast = false) {
  if (gpa == null || Number.isNaN(gpa)) return null
  const rows = [...SCALE].reverse() // F → A+
  if (atLeast) return rows.find((r) => r.gp >= gpa - 1e-9)?.letter ?? null
  return [...rows].reverse().find((r) => r.gp <= gpa + 1e-9)?.letter ?? "F"
}
