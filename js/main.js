// ================= Universal Logic ========================

// Change Background When Dark Mode Toggle Click 
// Check if 'dark-mode' was saved in localStorage
if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkmode-toggle').checked = true;
}

document.getElementById('darkmode-toggle').addEventListener('change', function(event) {
    document.body.classList.toggle('dark-mode', event.target.checked);
    // Save the current state of 'dark-mode' in localStorage
    localStorage.setItem('dark-mode', event.target.checked);
});

//  Weather Feature Logic
document.addEventListener('DOMContentLoaded', (event) => {
    // Get the button and the container
    const button = document.getElementById('show-weather');
    const container = document.getElementById('weather-widget');

    // Load the saved state of the button when the page loads
    if (localStorage.getItem('showWeatherButton') === 'true') {
        container.classList.add('show');
        button.textContent = 'Hide Weather';
    }
    // Add a click event listener to the button
    button.addEventListener('click', () => {
        // Check the current display status of the container
        if (container.classList.contains('show')) {
            // If the container is visible, hide it and update the button text
            container.classList.remove('show');
            button.textContent = 'Show Weather';
        } else {
            // If the container is hidden, show it and update the button text
            container.classList.add('show');
            button.textContent = 'Hide Weather';
        }

        // Save the current state of the button in localStorage
        localStorage.setItem('showWeatherButton', container.classList.contains('show'));
    });
});

// Show Links Based On Major Selection
function showLinks(major) {
    var majors = ["cs/math", "biology", "ccit", "anthropology", "language", "psychology", "history"];
    majors.forEach(function(m) {
        document.getElementById(m).style.display = (m == major) ? "flex" : "none";
    });
}

// ================= Notes Page Logic ========================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function filterPostsByTag() {
    const searchValue = document.getElementById('search-tags').value.toLowerCase().trim();
    const posts = document.querySelectorAll('.post');
    if (searchValue === '') {
        // If search is cleared, display all posts again
        posts.forEach(post => post.style.display = 'block');
    } else {
        updatePostVisibility(posts, searchValue);
    }
    // Clear search field after searching
    document.getElementById('search-tags').value = '';
}

function updatePostVisibility(posts, searchValue) {
    posts.forEach(post => {
        const tags = post.getAttribute('data-tags').toLowerCase();
        const title = post.querySelector('h1').textContent.toLowerCase();
        const message = post.querySelector('p').textContent.toLowerCase();
        // Split tags into an array and check if any tag exactly matches or contains the search value
        const tagMatches = tags.match(/\((.*?)\)/g);
        const tagArray = tagMatches ? tagMatches.map(tag => tag.toLowerCase()) : [];
        const isExactMatch = tagArray.includes(`(${searchValue})`);
        const isSimilarMatch = tagArray.some(tag => tag.includes(searchValue));
        const isTitleMatch = title.includes(searchValue);
        const isMessageMatch = message.includes(searchValue);
        // Display post if there's an exact match in tags, or if title/message contains the search value
        post.style.display = (isExactMatch || isSimilarMatch || isTitleMatch || isMessageMatch) ? 'block' : 'none';
    });
}

function createPost() {
    const content = document.getElementById('new-post-content').value;
    const postsContainer = document.getElementById('posts-container');

    const lines = content.split('\n');
    if (lines.length < 3) {
        alert("Please ensure you have entered a title, message, and tags before posting.");
        return; // Ensure there are at least 3 lines: title, content, tags
    }

    const title = lines[0];
    const message = lines.slice(1, -1).join('<br>'); // Join all lines except the first and last as the main message
    const tags = lines[lines.length - 1];

    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.setAttribute('data-tags', tags); // Ensure tags are added as a data attribute for searching

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('delete-button'); // Add class to the delete button
    deleteButton.onclick = function() {
        postsContainer.removeChild(postElement);
    };

    postElement.innerHTML = `<h1>${title}</h1><p>${message}</p><p style="font-size: 80%">Tags: ${tags}</p>`; // Format the post with title, message, and tags
    postElement.appendChild(deleteButton); // Append delete button to the post

    postsContainer.appendChild(postElement);

    // Save post to local storage
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push({title, message, tags});
    localStorage.setItem('posts', JSON.stringify(posts));

    // Clear input field after posting
    document.getElementById('new-post-content').value = '';

    // Reapply the current filter to ensure consistency with the search criteria
    filterPostsByTag();
}

// Load posts from local storage
window.onload = function() {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    const postsContainer = document.getElementById('posts-container');

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.setAttribute('data-tags', post.tags); // Ensure tags are added as a data attribute for searching
        postElement.innerHTML = `<h1>${post.title}</h1><p>${post.message}</p><p style="font-size: 80%">Tags: ${post.tags}</p>`; // Format the post with title, message, and tags

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.classList.add('delete-button'); // Add class to the delete button
        deleteButton.onclick = function() {
            postsContainer.removeChild(postElement);
            // Update local storage
            let posts = JSON.parse(localStorage.getItem('posts')) || [];
            posts = posts.filter(p => p.title !== post.title && p.message !== post.message && p.tags !== post.tags);
            localStorage.setItem('posts', JSON.stringify(posts));
        };

        postElement.appendChild(deleteButton); // Append delete button to the post
        postsContainer.appendChild(postElement);
    });
}
