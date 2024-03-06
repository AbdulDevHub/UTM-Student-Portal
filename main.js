// Change Background When Dark Mode Toggle Click 
document.getElementById('darkmode-toggle').addEventListener('change', function(event) {
    document.body.classList.toggle('dark-mode', event.target.checked)
})
