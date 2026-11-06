import { test } from "node:test"
import assert from "node:assert/strict"
import { evaluate } from "../../js/lib/calc.js"

test("basic arithmetic and precedence", () => {
  assert.equal(evaluate("1+2*3"), 7)
  assert.equal(evaluate("(1+2)*3"), 9)
  assert.equal(evaluate("10÷4"), 2.5)
  assert.equal(evaluate("2×3"), 6)
  assert.equal(evaluate("2^3^2"), 512)
  assert.equal(evaluate("0.1+0.2"), 0.3)
})
test("unary minus, percent, sqrt, implicit multiply", () => {
  assert.equal(evaluate("-2^2"), -4)
  assert.equal(evaluate("2*-3"), -6)
  assert.equal(evaluate("-3*2"), -6)
  assert.equal(evaluate("50%"), 0.5)
  assert.equal(evaluate("200*15%"), 30)
  assert.equal(evaluate("√9+1"), 4)
  assert.equal(evaluate("√(16)"), 4)
  assert.equal(evaluate("2(3+4)"), 14)
})
test("errors", () => {
  assert.throws(() => evaluate("1/0"), /divide by zero/)
  assert.throws(() => evaluate("1+"), /Incomplete/)
  assert.throws(() => evaluate("(1+2"), /Unbalanced/)
  assert.throws(() => evaluate("1+2)"), /Unbalanced/)
  assert.throws(() => evaluate("alert(1)"), /Unexpected/)
  assert.throws(() => evaluate("1..2"), /Invalid number/)
  assert.throws(() => evaluate(""), /Nothing/)
})

import { looksLikeMath, tryCalc } from "../../js/lib/calc.js"
test("quick-math detection for the search boxes", () => {
  assert.equal(tryCalc("85*0.4+72*0.6"), 77.2)
  assert.equal(tryCalc("√2^2"), 2)
  assert.equal(looksLikeMath("csc108"), false)
  assert.equal(looksLikeMath("2026"), false)
  assert.equal(looksLikeMath("-5"), false)
  assert.equal(tryCalc("1/0"), null)
})
