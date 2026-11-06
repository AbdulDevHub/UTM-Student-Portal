import { test } from "node:test"
import assert from "node:assert/strict"
import { termStatus, upcomingEvents, torontoToday } from "../../js/lib/term.js"
import { terms, events } from "../../js/data/dates.js"

test("teaching weeks skip Fall Break", () => {
  assert.equal(termStatus("2026-09-08", terms).label, "Week 1 of 13")
  assert.equal(termStatus("2026-10-23", terms).label, "Week 7 of 13")
  assert.equal(termStatus("2026-10-28", terms).phase, "break")
  assert.equal(termStatus("2026-11-06", terms).label, "Week 8 of 13")
  assert.equal(termStatus("2026-12-08", terms).detail, "Last day of classes")
})
test("study break, exams, between terms, winter reading week", () => {
  assert.equal(termStatus("2026-12-09", terms).phase, "study")
  assert.equal(termStatus("2026-12-15", terms).phase, "exams")
  const off = termStatus("2027-01-01", terms)
  assert.equal(off.phase, "off")
  assert.match(off.detail, /Winter 2027 starts in 10 days/)
  assert.equal(termStatus("2027-02-17", terms).label, "Reading Week")
  assert.equal(termStatus("2027-04-12", terms).label, "Week 13 of 13")
  assert.equal(termStatus("2027-08-01", terms).phase, "unknown")
})
test("upcoming events include ongoing ranges and count days", () => {
  const up = upcomingEvents("2026-10-28", events, 2)
  assert.equal(up[0].title, "Fall Break")
  assert.equal(up[0].when, "Now")
  assert.equal(up[1].when, "In 4 weeks")
  assert.equal(upcomingEvents("2026-12-07", events, 1)[0].when, "Tomorrow")
})
test("torontoToday uses the campus time zone", () => {
  // 03:00 UTC on Nov 7 is still Nov 6 in Toronto
  assert.equal(torontoToday(new Date("2026-11-07T03:00:00Z")), "2026-11-06")
})
