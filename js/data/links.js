// =====================================================================
//  UTM Student Portal: single source of truth for every link.
//
//  To add a link: add one object to the right category below, then run
//  `npm run build` (re-renders the homepage grid + sitemap) and commit.
//
//  Fields
//    name     Display name (Title Case)
//    url      Full URL (https only), or a site-relative path for portal pages
//    desc     Short description shown under the name and used by search
//    aliases  Extra words people type to find it (abbreviations, slang)
//    major    (majors category only) which major the link belongs to
// =====================================================================

// col: which homepage column the category sits in (1 or 2), or "full" for full width.
// Keep the two columns roughly the same height so the grid has no dead space.
export const categories = [
  { id: "essentials", title: "UTM Essentials", color: "essentials", col: 1 },
  { id: "tools", title: "UTM Tools", color: "tools", col: 2 },
  { id: "services", title: "Support & Services", color: "logistics", col: 1 },
  { id: "campus", title: "Campus Life", color: "campus", col: 2 },
  { id: "portal", title: "Portal Tools", color: "internal", col: 1 },
  { id: "majors", title: "Links by Major", color: "courses", col: 2 },
  { id: "external", title: "External Tools", color: "external", col: "full" },
]

export const majors = [
  { id: "cs", name: "Computer Science & Math" },
  { id: "biology", name: "Biology" },
  { id: "ccit", name: "CCIT" },
  { id: "language", name: "Language Studies" },
  { id: "psychology", name: "Psychology" },
  { id: "history", name: "Historical Studies" },
]

export const links = {
  essentials: [
    { name: "ACORN", url: "https://acorn.utoronto.ca/", desc: "Enrol, grades, fees, transcripts", aliases: ["rosi", "enrol", "enroll", "grades", "fees", "transcript", "tuition"] },
    { name: "Quercus", url: "https://q.utoronto.ca/", desc: "Courses, assignments, announcements", aliases: ["canvas", "q", "lms", "assignments", "courses"] },
    { name: "Academic Calendar", url: "https://utm.calendar.utoronto.ca/", desc: "Programs, courses, prerequisites", aliases: ["course calendar", "prereqs", "programs", "program requirements"] },
    { name: "Important Dates", url: "https://www.utm.utoronto.ca/registrar/dates", desc: "Drop deadlines, breaks, term dates", aliases: ["deadlines", "drop date", "sessional dates", "reading week"] },
    { name: "Exam Schedule", url: "https://metis.utm.utoronto.ca/examschedule/finalexams.php", desc: "Final exam dates, times, rooms", aliases: ["finals", "exams", "final exam"] },
    { name: "UofT Mail", url: "https://mail.utoronto.ca/", desc: "Your @mail.utoronto.ca inbox", aliases: ["email", "outlook", "inbox"] },
    { name: "Campus Status", url: "https://www.utm.utoronto.ca/campus-status", desc: "Closures, snow days, alerts", aliases: ["snow day", "closed", "closure", "alerts"] },
    { name: "Map & Directions", url: "https://www.utm.utoronto.ca/visitors/maps-and-directions", desc: "Campus map and building codes", aliases: ["map", "buildings", "rooms", "directions", "dv", "cct", "ib"] },
    { name: "Shuttle Bus", url: "https://www.utm.utoronto.ca/shuttle/", desc: "UTM ↔ St. George shuttle schedule", aliases: ["shuttle", "bus", "st george", "intercampus"] },
    { name: "Public Transit", url: "https://www.utm.utoronto.ca/visitors/public-transit", desc: "MiWay, GO and TTC routes to campus", aliases: ["miway", "go transit", "ttc", "upass", "bus"] },
    { name: "Parking", url: "https://www.utm.utoronto.ca/parking/", desc: "Permits, lots and rates", aliases: ["parking permit", "car", "lot"] },
  ],

  tools: [
    { name: "Timetable Builder", url: "https://ttb.utoronto.ca/", desc: "Plan your course schedule", aliases: ["ttb", "timetable", "schedule", "course times", "sections"] },
    { name: "Degree Explorer", url: "https://www.acorn.utoronto.ca/degree-explorer/", desc: "Check program and degree progress", aliases: ["degree", "requirements", "graduation", "program progress"] },
    { name: "Course Syllabus", url: "https://student.utm.utoronto.ca/CourseInfo/", desc: "Past course outlines (UofT network/VPN)", check: false, aliases: ["syllabus", "outline", "course info"] },
    { name: "UTM Library", url: "https://utm.library.utoronto.ca/", desc: "Hazel McCallion Library, books, databases", aliases: ["library", "hmalc", "books", "research", "articles"] },
    { name: "Study Room Booking", url: "https://library.utm.utoronto.ca/visit/study-space", desc: "Book a library study room", aliases: ["study room", "book room", "rooms", "room booking"] },
    { name: "Career Portal (CLNx)", url: "https://clnx.utoronto.ca/home.htm", desc: "Jobs, work-study, career events", aliases: ["clnx", "jobs", "work study", "co-op", "internships", "careers"] },
    { name: "Activate UTORid", url: "https://www.utorid.utoronto.ca/cgi-bin/utorid/activate.pl", desc: "Set up your UofT account", aliases: ["utorid", "join id", "account"] },
    { name: "Change UTORid Password", url: "https://www.utorid.utoronto.ca/cgi-bin/utorid/verify.pl", desc: "Reset or verify your password", aliases: ["password", "utorid", "verify", "reset password"] },
    { name: "UTORMFA", url: "https://security.utoronto.ca/services/utormfa/", desc: "Two-factor authentication setup", aliases: ["mfa", "2fa", "duo", "two factor"] },
    { name: "UTORMFA Bypass Codes", url: "https://bypass.utormfa.utoronto.ca/", desc: "Backup codes if you lose your phone", aliases: ["bypass", "backup codes", "mfa", "2fa"] },
    { name: "System Status", url: "https://www.systemstatus.utoronto.ca/", desc: "Is ACORN or Quercus down?", aliases: ["outage", "down", "status"] },
    { name: "IT Help Desk", url: "mailto:help.desk@utoronto.ca", desc: "Email UofT tech support", aliases: ["it", "tech support", "help"] },
    { name: "Library Films", url: "https://utm.library.utoronto.ca/content/popular-films-televison", desc: "Popular films and TV from the library", aliases: ["movies", "film", "tv", "dvd"] },
  ],

  services: [
    { name: "Office of the Registrar", url: "https://uoft.service-now.com/utm_askregistrar", desc: "Ask the registrar a question", aliases: ["registrar", "ask registrar", "enrolment help"] },
    { name: "Academic Skills Centre", url: "https://www.utm.utoronto.ca/rgasc/", desc: "RGASC writing, math and study help", aliases: ["rgasc", "writing centre", "tutoring", "facilitated study groups", "fsg"] },
    { name: "Health & Counselling", url: "https://www.utm.utoronto.ca/health/", desc: "Doctors, counselling, mental health", aliases: ["doctor", "counselling", "therapy", "mental health", "clinic"] },
    { name: "Accessibility Services", url: "https://www.utm.utoronto.ca/accessibility/", desc: "Accommodations and test centre", aliases: ["accommodations", "as", "disability", "test centre"] },
    { name: "Career Centre", url: "https://www.utm.utoronto.ca/careers/", desc: "Resumes, interviews, career advice", aliases: ["resume", "interview", "career advice", "jobs"] },
    { name: "Health & Dental Plan", url: "https://utmsu.ca/services/health-dental/", desc: "UTMSU student insurance plan", aliases: ["insurance", "dental", "health plan", "opt out"] },
    { name: "GSC Student Opt Out", url: "https://onlineservices.greenshield.ca/StudentOptOut/Learn.aspx?cl=78611&edu=1000", desc: "Opt out of the health plan", aliases: ["greenshield", "opt out", "insurance refund"] },
    { name: "UTM Student Union", url: "https://utmsu.ca/", desc: "UTMSU services, events, U-Pass", aliases: ["utmsu", "union", "upass"] },
    { name: "UTM Official Site", url: "https://www.utm.utoronto.ca/", desc: "University of Toronto Mississauga", aliases: ["utm", "website", "home"] },
    { name: "UofT Brand Portal", url: "https://brand.utoronto.ca/", desc: "Official logos and templates", aliases: ["logo", "branding", "templates"] },
  ],

  campus: [
    { name: "Clubs & Societies", url: "https://utmsu.ca/campus-groups/clubs/", desc: "Find and join student clubs", aliases: ["clubs", "societies", "ulife", "events"] },
    { name: "Student Affairs & Services", url: "https://www.utm.utoronto.ca/sas/", desc: "Everything outside the classroom", aliases: ["sas", "student life"] },
    { name: "Campus Housing", url: "https://www.utm.utoronto.ca/housing/", desc: "Residence and off-campus housing", aliases: ["residence", "rez", "dorms", "housing"] },
    { name: "Athletics & Fitness", url: "https://www.utm.utoronto.ca/athletics/", desc: "RAWC gym, intramurals, classes", aliases: ["gym", "rawc", "fitness", "intramurals", "pool", "sports"] },
    { name: "The Medium", url: "https://themedium.ca/", desc: "UTM student newspaper", aliases: ["news", "newspaper", "student news"] },
    { name: "Student Centre", url: "https://utmsu.ca/services/student-centre/", desc: "UTMSU building, Blind Duck pub", aliases: ["pub", "blind duck", "food", "student centre"] },
  ],

  majors: [
    { major: "cs", name: "MarkUs", url: "https://markus.teach.cs.toronto.edu/", desc: "Submit CS assignments", aliases: ["markus", "submit", "assignments"] },
    { major: "cs", name: "Crowdmark", url: "https://app.crowdmark.com/sign-in/utoronto", desc: "Graded tests and assignments", aliases: ["crowdmark", "tests", "graded"] },
    { major: "cs", name: "Piazza", url: "https://piazza.com/", desc: "Course Q&A boards", aliases: ["piazza", "discussion", "forum", "q&a"] },
    { major: "cs", name: "MathMatize", url: "https://mathmatize.com/", desc: "Math practice and quizzes", aliases: ["math", "quizzes"] },
    { major: "cs", name: "CSSC", url: "https://cssc.utm.utoronto.ca/", desc: "Computer Science Student Community", aliases: ["cs club", "mcss", "community"] },
    { major: "cs", name: "PEY Career Portal", url: "https://www.uoftengcareerportal.ca/myAccount/dashboard.htm", desc: "Professional Experience Year jobs", aliases: ["pey", "internship", "co-op", "engineering career"] },
    { major: "biology", name: "Biology Programs & Courses", url: "https://utm.calendar.utoronto.ca/section/Biology", desc: "Calendar section for Biology", aliases: ["bio", "biology courses"] },
    { major: "biology", name: "Teaching Greenhouse", url: "https://www.utm.utoronto.ca/biology/research/resources/teaching-greenhouse", desc: "UTM biology greenhouse", aliases: ["greenhouse", "plants"] },
    { major: "ccit", name: "CCIT Programs & Courses", url: "https://utm.calendar.utoronto.ca/section/Communication,-Culture,-Information-and-Technology", desc: "Calendar section for CCIT", aliases: ["iccit", "ccit courses", "dem"] },
    { major: "ccit", name: "CCIT Internships", url: "https://www.utm.utoronto.ca/iccit/students/student-resources/internships", desc: "ICCIT internship program", aliases: ["iccit internship", "internship"] },
    { major: "language", name: "Language Studies", url: "https://www.utm.utoronto.ca/language-studies/about-us/why-language-studies", desc: "Department overview", aliases: ["languages", "french", "spanish", "italian"] },
    { major: "language", name: "Linguistics", url: "https://www.utm.utoronto.ca/language-studies/areas-of-study/linguistics", desc: "Linguistics programs and courses", aliases: ["linguistics", "lin"] },
    { major: "psychology", name: "Why Study Psychology", url: "https://www.utm.utoronto.ca/psychology/why-study-psychology", desc: "Department overview", aliases: ["psych", "psy"] },
    { major: "psychology", name: "Psychology Programs", url: "https://www.utm.utoronto.ca/future-students/programs/psychology", desc: "Program overview and courses", aliases: ["psych program", "psy courses"] },
    { major: "history", name: "Historical Studies", url: "https://www.utm.utoronto.ca/historical-studies/", desc: "Department of Historical Studies", aliases: ["history", "classics", "his"] },
    { major: "history", name: "History Programs", url: "https://www.utm.utoronto.ca/future-students/programs/history", desc: "Program overview and courses", aliases: ["history courses"] },
  ],

  // Site-relative pages that live in this repo
  portal: [
    { name: "GPA Calculator", url: "/gpa-calculator/", desc: "UofT GPA, CGPA and final-exam planner", aliases: ["gpa", "cgpa", "grades", "final exam", "what do i need"] },
    { name: "Desmos", url: "/desmos/", desc: "Scientific, graphing and matrix calculators", aliases: ["calc", "calculator", "desmos", "graphing", "scientific", "matrix", "graph", "math"] },
    { name: "Notes", url: "/notes/", desc: "Quick notes saved in your browser", aliases: ["notes", "notepad", "note taker", "write"] },
    { name: "Student Projects", url: "/student-projects/", desc: "Apps and games built by students", aliases: ["projects", "portfolio", "showcase"] },
  ],

  external: [
    { name: "Microsoft 365", url: "https://www.microsoft365.com/", desc: "Free Word, Excel, OneDrive for UofT", aliases: ["office", "word", "excel", "powerpoint", "onedrive", "teams"] },
    { name: "ChatGPT", url: "https://chatgpt.com/", desc: "OpenAI assistant", aliases: ["ai", "gpt", "openai"] },
    { name: "Google Gemini", url: "https://gemini.google.com/app", desc: "Google AI assistant", aliases: ["ai", "bard", "gemini"] },
    { name: "Notion", url: "https://www.notion.so/", desc: "Notes, docs and planners", aliases: ["notes", "planner", "docs"] },
    { name: "Figma", url: "https://www.figma.com/", desc: "UI/UX design (free for students)", aliases: ["design", "ui", "ux", "prototype"] },
    { name: "Adobe Creative Cloud", url: "https://www.adobe.com/home", desc: "Photoshop, Illustrator, Premiere", aliases: ["photoshop", "illustrator", "premiere", "adobe"] },
    { name: "Autodesk Education", url: "https://www.autodesk.com/education/edu-software/overview", desc: "Free AutoCAD, Maya, Fusion", aliases: ["autocad", "maya", "fusion", "3d"] },
    { name: "Quizlet", url: "https://quizlet.com/", desc: "Flashcards and study sets", aliases: ["flashcards", "study"] },
    { name: "Kahoot", url: "https://kahoot.it/", desc: "Join a class quiz game", aliases: ["quiz", "game pin"] },
    { name: "Socrative", url: "https://www.socrative.com/", desc: "Classroom quizzes and polls", aliases: ["quiz", "poll"] },
    { name: "Citation Machine", url: "https://www.citationmachine.net/apa", desc: "APA, MLA and Chicago citations", aliases: ["citations", "apa", "mla", "bibliography", "references"] },
    { name: "EasyBib", url: "https://www.easybib.com/", desc: "Citation generator", aliases: ["citations", "bibliography"] },
    { name: "Purdue OWL", url: "https://owl.purdue.edu/owl/index.html", desc: "Writing and citation style guides", aliases: ["owl", "writing", "apa guide", "mla guide"] },
    { name: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn", desc: "Learning How to Learn course", aliases: ["online course", "mooc", "study skills"] },
    { name: "LinkedIn", url: "https://www.linkedin.com/", desc: "Professional network", aliases: ["networking", "jobs"] },
    { name: "LinkedIn Learning", url: "https://www.linkedin.com/learning/", desc: "Video courses (free via UofT)", aliases: ["lynda", "courses", "tutorials"] },
    { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", desc: "Learn to code for free", aliases: ["coding", "programming", "web dev"] },
    { name: "Skillshare", url: "https://www.skillshare.com/en/home", desc: "Creative video classes", aliases: ["classes", "creative"] },
    { name: "Wizeprep", url: "https://www.wizeprep.com/", desc: "Exam prep for university courses", aliases: ["exam prep", "wizedemy", "tutoring"] },
    { name: "Twine", url: "https://twinery.org/", desc: "Interactive story tool", aliases: ["stories", "game", "ccit"] },
    { name: "OSAP", url: "https://osap.gov.on.ca/StudentProfileSFAWeb/secured/sfa/myosap.xhtml", desc: "Ontario student grants and loans", aliases: ["loans", "grants", "financial aid"] },
    { name: "OUAC", url: "https://www.ouac.on.ca/", desc: "Ontario university applications", aliases: ["apply", "application", "transfer"] },
    { name: "uBlock Origin", url: "https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm", desc: "Ad blocker extension", aliases: ["adblock", "ads", "extension"] },
  ],
}

/** Stable id for a link, used for pins and recents (survives reordering). */
export function linkId(link) {
  return link.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

/** Flat list of every link with its category attached. */
export function allLinks() {
  const out = []
  for (const cat of categories) {
    for (const link of links[cat.id] || []) {
      out.push({ ...link, id: linkId(link), category: cat.id, categoryTitle: cat.title, color: cat.color })
    }
  }
  return out
}

/** Two-letter badge shown on each tile ("ACORN" → "AC", "Timetable Builder" → "TB"). */
const STOP = new Set(["of", "the", "and", "a", "for", "utm", "uoft", "my"])
export function monogram(name) {
  const words = name.replace(/\(.*?\)/g, "").split(/[\s&\-/+]+/).filter((w) => /[A-Za-z0-9]/.test(w))
  const sig = words.filter((w) => !STOP.has(w.toLowerCase()))
  const use = sig.length ? sig : words
  if (use.length === 1) {
    const w = use[0]
    return w === w.toUpperCase() ? w.slice(0, 2) : w[0].toUpperCase() + w.slice(1, 2).toLowerCase()
  }
  return (use[0][0] + use[1][0]).toUpperCase()
}
