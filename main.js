// =================Universal Logic========================
// Change Background When Dark Mode Toggle Click 
document.getElementById('darkmode-toggle').addEventListener('change', function(event) {
    document.body.classList.toggle('dark-mode', event.target.checked)
})

// =================Notes Page Logic========================
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
    postElement.innerHTML = `<h1>${title}</h1><p>${message}</p><p style="font-size: 80%">Tags: ${tags}</p>`; // Format the post with title, message, and tags

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

window.onload = function() {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    const postsContainer = document.getElementById('posts-container');

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.setAttribute('data-tags', post.tags); // Ensure tags are added as a data attribute for searching
        postElement.innerHTML = `<h1>${post.title}</h1><p>${post.message}</p><p style="font-size: 80%">Tags: ${post.tags}</p>`; // Format the post with title, message, and tags

        postsContainer.appendChild(postElement);
    });
}