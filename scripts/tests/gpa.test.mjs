import { test } from "node:test"
import assert from "node:assert/strict"
import { parseGrade, computeGpa, combineCgpa, requiredAverage, requiredFinal, fromPercent } from "../../js/lib/gpa.js"

test("percent → UofT letter and grade points (scale boundaries)", () => {
  const cases = [[100, "A+", 4], [90, "A+", 4], [89, "A", 4], [85, "A", 4], [84, "A-", 3.7], [80, "A-", 3.7], [79, "B+", 3.3], [77, "B+", 3.3], [76, "B", 3], [73, "B", 3], [72, "B-", 2.7], [70, "B-", 2.7], [69, "C+", 2.3], [66, "C", 2], [62, "C-", 1.7], [59, "D+", 1.3], [56, "D", 1], [52, "D-", 0.7], [50, "D-", 0.7], [49, "F", 0], [0, "F", 0]]
  for (const [p, l, gp] of cases) {
    assert.equal(fromPercent(p).letter, l, `${p}%`)
    assert.equal(fromPercent(p).gp, gp, `${p}%`)
  }
  assert.equal(fromPercent(79.5).letter, "A-") // rounds to 80
  assert.equal(fromPercent(101), null)
})
test("parseGrade accepts percents, letters, and CR/NCR", () => {
  assert.deepEqual(parseGrade("85%"), { gp: 4, letter: "A", percent: 85 })
  assert.deepEqual(parseGrade("b+"), { gp: 3.3, letter: "B+" })
  assert.equal(parseGrade("CR").excluded, true)
  assert.equal(parseGrade(""), null)
  assert.equal(parseGrade("Z"), null)
})
test("weighted GPA ignores CR and invalid rows", () => {
  const r = computeGpa([
    { grade: "A", weight: 0.5 },
    { grade: "B", weight: 1.0 },
    { grade: "CR", weight: 0.5 },
    { grade: "", weight: 0.5 },
  ])
  assert.equal(r.credits, 1.5)
  assert.equal(r.gpa, 3.33) // (2 + 3) / 1.5
})
test("CGPA, target planner and final-exam planner", () => {
  assert.equal(combineCgpa(3.0, 5, 4 * 2.5, 2.5), 3.33)
  assert.equal(combineCgpa("", "", 7.4, 2.5), 2.96)
  assert.deepEqual(requiredAverage(3.0, 10, 3.5, 5), { needed: 4.5, feasible: false })
  assert.deepEqual(requiredAverage(3.0, 10, 3.2, 10), { needed: 3.4, feasible: true })
  assert.deepEqual(requiredFinal(80, 40, 85), { needed: 92.5, feasible: true })
  assert.equal(requiredFinal(50, 30, 90).feasible, false)
  assert.equal(requiredFinal(80, 0, 85), null)
})

import { letterForGpa } from "../../js/lib/gpa.js"
test("letterForGpa maps averages to letters", () => {
  assert.equal(letterForGpa(3.33), "B+")
  assert.equal(letterForGpa(4), "A+")
  assert.equal(letterForGpa(0.5), "F")
  assert.equal(letterForGpa(3.4, true), "A-")
  assert.equal(letterForGpa(3.3, true), "B+")
  assert.equal(letterForGpa(4.2, true), null)
})
