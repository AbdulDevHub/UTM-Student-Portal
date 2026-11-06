import { test } from "node:test"
import assert from "node:assert/strict"
import { indexItems, search, editDistance } from "../js/lib/search.js"
import { allLinks } from "../js/data/links.js"

const index = indexItems(allLinks())
const top = (q) => search(q, index, 1)[0]?.item.name

test("exact names, aliases and abbreviations", () => {
  assert.equal(top("acorn"), "ACORN")
  assert.equal(top("ttb"), "Timetable Builder")
  assert.equal(top("gpa"), "GPA Calculator")
  assert.equal(top("rawc"), "Athletics & Fitness")
  assert.equal(top("snow day"), "Campus Status")
  assert.equal(top("mfa"), "UTORMFA")
})
test("typos still find the right link", () => {
  assert.equal(top("quercis"), "Quercus")
  assert.equal(top("timetabel"), "Timetable Builder")
  assert.equal(top("libary"), "UTM Library")
})
test("no match returns nothing", () => {
  assert.equal(search("zzzzqqq", index).length, 0)
})
test("every link has a unique id and https url", () => {
  const ids = new Set()
  for (const l of allLinks()) {
    assert.ok(!ids.has(l.id), `duplicate id ${l.id}`)
    ids.add(l.id)
    assert.ok(!l.url.startsWith("http:"), `insecure url ${l.url}`)
  }
})
test("editDistance handles transpositions", () => {
  assert.equal(editDistance("acron", "acorn"), 1)
})
