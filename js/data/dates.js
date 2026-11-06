// =====================================================================
//  UTM sessional dates used by the term tracker on the homepage.
//  Source: https://www.utm.utoronto.ca/registrar/future-dates and the
//  Fall 2026 - Winter 2027 registration guide (checked 2026-11-06).
//
//  Course drop deadlines (F/Y/S) were not published yet when this was
//  written. Add them to `events` as soon as the registrar posts them:
//    { date: "2026-11-xx", title: "Last day to drop F courses", kind: "deadline" },
//
//  Dates are local Toronto calendar days in YYYY-MM-DD form.
//  kind: "classes" | "break" | "exams" | "deadline" | "holiday"
// =====================================================================

export const terms = [
  {
    id: "fall-2026",
    name: "Fall 2026",
    classesStart: "2026-09-08",
    classesEnd: "2026-12-08",
    examsStart: "2026-12-10",
    examsEnd: "2026-12-22",
    breaks: [{ start: "2026-10-26", end: "2026-10-30", name: "Fall Break" }],
  },
  {
    id: "winter-2027",
    name: "Winter 2027",
    classesStart: "2027-01-11",
    classesEnd: "2027-04-12",
    examsStart: "2027-04-14",
    examsEnd: "2027-04-29",
    breaks: [{ start: "2027-02-15", end: "2027-02-19", name: "Reading Week" }],
  },
]

export const events = [
  { date: "2026-09-07", title: "Labour Day (university closed)", kind: "holiday" },
  { date: "2026-09-08", title: "Fall classes start", kind: "classes" },
  { date: "2026-09-21", title: "Late registration deadline (Fall-Winter, 4pm)", kind: "deadline" },
  { date: "2026-10-12", title: "Thanksgiving (university closed)", kind: "holiday" },
  { date: "2026-10-26", end: "2026-10-30", title: "Fall Break", kind: "break" },
  { date: "2026-11-26", title: "Winter-only tuition payment deadline", kind: "deadline" },
  { date: "2026-12-08", title: "Last day of Fall classes", kind: "classes" },
  { date: "2026-12-09", title: "Study break", kind: "break" },
  { date: "2026-12-10", end: "2026-12-22", title: "Fall exam period", kind: "exams" },
  { date: "2026-12-24", end: "2027-01-05", title: "Winter break (university closed)", kind: "holiday" },
  { date: "2027-01-11", title: "Winter classes start", kind: "classes" },
  { date: "2027-01-22", title: "Late registration deadline (Winter, 4pm)", kind: "deadline" },
  { date: "2027-02-15", end: "2027-02-19", title: "Reading Week + deferred exams", kind: "break" },
  { date: "2027-03-26", title: "Good Friday (university closed)", kind: "holiday" },
  { date: "2027-04-12", title: "Last day of Winter classes", kind: "classes" },
  { date: "2027-04-13", title: "Study break", kind: "break" },
  { date: "2027-04-14", end: "2027-04-29", title: "Winter exam period", kind: "exams" },
  { date: "2027-04-30", title: "End of Winter term", kind: "classes" },
]
