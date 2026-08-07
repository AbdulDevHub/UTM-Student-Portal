// ================= Universal Logic ========================

// Change Background When Dark Mode Toggle Click
// Check if 'dark-mode' was saved in localStorage
if (localStorage.getItem("dark-mode") === "true") {
  document.body.classList.add("dark-mode")
  document.getElementById("darkmode-toggle").checked = true
}

document
  .getElementById("darkmode-toggle")
  .addEventListener("change", function (event) {
    document.body.classList.toggle("dark-mode", event.target.checked)
    // Save the current state of 'dark-mode' in localStorage
    localStorage.setItem("dark-mode", event.target.checked)
  })

//  Weather Feature Logic
document.addEventListener("DOMContentLoaded", (event) => {
  // Get the button and the container
  const button = document.getElementById("show-weather")
  const container = document.getElementById("weather-widget")

  // Load the saved state of the button when the page loads
  if (localStorage.getItem("showWeatherButton") === "true") {
    container.classList.add("show")
    button.textContent = "Hide Weather"
  }
  // Add a click event listener to the button
  button.addEventListener("click", () => {
    // Check the current display status of the container
    if (container.classList.contains("show")) {
      // If the container is visible, hide it and update the button text
      container.classList.remove("show")
      button.textContent = "Show Weather"
    } else {
      // If the container is hidden, show it and update the button text
      container.classList.add("show")
      button.textContent = "Hide Weather"
    }

    // Save the current state of the button in localStorage
    localStorage.setItem(
      "showWeatherButton",
      container.classList.contains("show")
    )
  })
})

// Show Links Based On Major Selection
function showLinks(major) {
  var majors = [
    "cs/math",
    "biology",
    "ccit",
    "language",
    "psychology",
    "history",
  ]
  majors.forEach(function (m) {
    document.getElementById(m).classList.toggle("hidden", m !== major)
  })
}

// ================= Directory Search Logic ========================
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("link-search")
  if (!input) return // Not on the homepage

  const meta = document.getElementById("search-meta")
  const noResults = document.getElementById("no-results")
  const cards = Array.from(document.querySelectorAll("main .section-card"))

  function runFilter() {
    const query = input.value.trim().toLowerCase()
    let totalMatches = 0

    cards.forEach((card) => {
      const isMajorsCard = !!card.querySelector("#majors")
      const groups = card.querySelectorAll(".utm-links:not(.hidden)")
      let cardHasMatch = false

      groups.forEach((group) => {
        group.querySelectorAll("a").forEach((link) => {
          const text = (link.textContent || "").toLowerCase()
          const label = (link.getAttribute("aria-label") || "").toLowerCase()
          const matches = query === "" || text.includes(query) || label.includes(query)
          link.classList.toggle("hidden-by-search", !matches)
          if (matches) {
            totalMatches++
            cardHasMatch = true
          }
        })
      })

      // Never fully hide the majors selector card, just its links
      if (!isMajorsCard) {
        card.classList.toggle("hidden", query !== "" && !cardHasMatch)
      }
    })

    if (query === "") {
      meta.textContent = ""
      noResults.classList.remove("show")
    } else {
      meta.textContent = `${totalMatches} link${totalMatches === 1 ? "" : "s"} found`
      noResults.classList.toggle("show", totalMatches === 0)
    }
  }

  input.addEventListener("input", runFilter)

  // Re-run the filter whenever the major dropdown changes visible groups
  const majorsSelect = document.getElementById("majors")
  if (majorsSelect) {
    majorsSelect.addEventListener("change", () => {
      if (input.value.trim() !== "") runFilter()
    })
  }
})

// ================= Notes Page Logic ========================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode")
}
