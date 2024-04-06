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
    "anthropology",
    "language",
    "psychology",
    "history",
  ]
  majors.forEach(function (m) {
    document.getElementById(m).style.display = m == major ? "flex" : "none"
  })
}

// ================= Notes Page Logic ========================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode")
}
