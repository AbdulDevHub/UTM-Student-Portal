// ================= Personal Notes Page Logic ========================

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, orderBy, query, where, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB036gHwHmbG-r_0VWlu4oifpZWEZJJ6uU",
    authDomain: "utm-student-portal.firebaseapp.com",
    projectId: "utm-student-portal",
    storageBucket: "utm-student-portal.appspot.com",
    messagingSenderId: "708863567163",
    appId: "1:708863567163:web:b81dfb03c1a30e7447431e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const userProfile = document.getElementById('user-profile');
const signInButton = document.getElementById('sign-in-button');
const signOutButton = document.getElementById('sign-out-button');

signInButton.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .then((result) => {
        console.log('User signed in');
        userProfile.style.display = 'flex';
    })
    .catch((error) => {
        console.error('Sign in error', error);
    });
});

signOutButton.addEventListener('click', () => {
    signOut(auth)
    .then(() => {
        console.log('User signed out');
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
        userProfile.style.display = 'none';

        // Clear the posts
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';
    })
    .catch((error) => {
        console.error('Sign out error', error);
    });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
    // User is signed in
    signInButton.style.display = 'none';
    signOutButton.style.display = 'block';
    userProfile.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture"><p>${user.displayName}</p>`;
    } else {
    // User is signed out
    signInButton.style.display = 'block';
    signOutButton.style.display = 'none';
    }
});

window.onload = function() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
        // User is signed in
        signInButton.style.display = 'none';
        signOutButton.style.display = 'block';
        userProfile.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture"><p>${user.displayName}</p>`;
        userProfile.style.display = 'flex';
        fetchPosts(); // Fetch posts when a user is signed in
        } else {
        // User is signed out
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
        }
    });
}

window.createPost = function() {
    const postTitle = document.getElementById('post-title').value;
    const postContent = document.getElementById('post-content').value;
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';

    addDoc(collection(db, 'posts'), {
        title: postTitle,
        content: postContent,
        userId: auth.currentUser.uid,
        public: false,
        timestamp: new Date() // Add a timestamp field
    })
    .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);

        // Create a new post element
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.setAttribute('data-id', docRef.id);
        postElement.innerHTML = `
            <h1>${postTitle}</h1>
            <p>${postContent}</p>
            <button class="edit-button" onclick="editPost('${doc.id}')">Edit</button>
            <button class="delete-button" onclick="deletePost('${docRef.id}')">Delete</button>
            <button class="publish-button" onclick="publishPost('${docRef.id}')">Publish</button>
        `;

        // Insert the new post element at the beginning of the posts container
        const postsContainer = document.getElementById('posts-container');
        postsContainer.insertBefore(postElement, postsContainer.firstChild);
    })
    .catch((error) => {
        console.error('Error adding document: ', error);
    });
}

window.publishPost = function(postId) {
    const postRef = doc(db, 'posts', postId);
    getDoc(postRef)
    .then((doc) => {
        if (doc.exists()) {
            const isPublic = doc.data().public;
            updateDoc(postRef, { public: !isPublic })
            .then(() => {
                console.log('Document successfully updated!');
                const postElement = document.querySelector(`.post[data-id="${postId}"]`);
                const publishButton = postElement.querySelector('.publish-button');
                publishButton.textContent = isPublic ? 'Publish' : 'Unpublish';
                // Open new tab that leads to the public notes page if the post is published
                if (!isPublic) {
                    window.open('https://utmstudentportal.netlify.app/pages/public_notes', '_blank');
                }
            })
            .catch((error) => {
                console.error('Error updating document: ', error);
            });
        } else {
            console.log('No such document!');
        }
    })
    .catch((error) => {
        console.error('Error getting document:', error);
    });
}

function fetchPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    const q = query(collection(db, 'posts'), where('userId', '==', auth.currentUser.uid), orderBy('timestamp', 'desc')); // Order posts by timestamp
    getDocs(q)
        .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.setAttribute('data-id', doc.id);
            postElement.innerHTML = `
            <h1>${doc.data().title}</h1>
            <p>${doc.data().content}</p>
            <button class="edit-button" onclick="editPost('${doc.id}')">Edit</button>
            <button class="delete-button" onclick="deletePost('${doc.id}')">Delete</button>
            <button class="publish-button" onclick="publishPost('${doc.id}')">${doc.data().public ? 'Unpublish' : 'Publish'}</button>
            `;
            postsContainer.appendChild(postElement);
        });
        })
        .catch((error) => {
        console.error('Error getting documents: ', error);
    });
}

window.editPost = function(postId) {
    const postRef = doc(db, 'posts', postId);
    getDoc(postRef)
        .then((doc) => {
            if (doc.exists()) {
                const postTitle = document.getElementById('post-title');
                const postContent = document.getElementById('post-content');

                // Populate the post form with the title and content of the post
                postTitle.value = doc.data().title;
                postContent.value = doc.data().content;

                // Delete the post
                deletePost(postId);
            } else {
                console.log('No such document!');
            }
        })
        .catch((error) => {
            console.error('Error getting document:', error);
    });
}

window.deletePost = function(postId) {
    deleteDoc(doc(db, 'posts', postId))
        .then(() => {
        console.log('Document successfully deleted!');

        // Remove the post element from the page
        const postElement = document.querySelector(`.post[data-id="${postId}"]`);
        postElement.remove();
        })
        .catch((error) => {
        console.error('Error removing document: ', error);
    });
}

window.searchPosts = function() {
    const searchField = document.getElementById('search-field').value.toLowerCase(); // Convert search field to lower case
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    const q = query(collection(db, 'posts'), where('userId', '==', auth.currentUser.uid));
    getDocs(q)
        .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Only show the post if the title or content includes the search text
            if (doc.data().title.toLowerCase().includes(searchField) || doc.data().content.toLowerCase().includes(searchField)) { // Convert title and content to lower case
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.setAttribute('data-id', doc.id); // Add the data-id attribute
            postElement.innerHTML = `
                <h1>${doc.data().title}</h1>
                <p>${doc.data().content}</p>
                <button class="edit-button" onclick="editPost('${doc.id}')">Edit</button>
                <button class="delete-button" onclick="deletePost('${doc.id}')">Delete</button>
                <button class="publish-button" onclick="publishPost('${doc.id}')">Publish</button>
            `;
            postsContainer.appendChild(postElement);
            }
        });
        })
        .catch((error) => {
        console.error('Error getting documents: ', error);
    });
}