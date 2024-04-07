// ================= Public Notes Page Logic ========================

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
const signInMessage = document.getElementById('sign-in-message');

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
    signInMessage.style.display = 'none';
} else {
    // User is signed out
    signInButton.style.display = 'block';
    signOutButton.style.display = 'none';
    signInMessage.style.display = 'block';
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
            signInMessage.style.display = 'none';
            fetchPosts();
        } else {
            // User is signed out
            signInButton.style.display = 'block';
            signOutButton.style.display = 'none';
            signInMessage.style.display = 'block';
        }
    });
}

function fetchPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    const q = query(collection(db, 'posts'), where('public', '==', true), orderBy('timestamp', 'desc')); // Order posts by timestamp
    getDocs(q)
        .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.setAttribute('data-id', doc.id);
            postElement.innerHTML = `
            <h1>${doc.data().title}</h1>
            <p>${doc.data().content}</p>
            `;
            postsContainer.appendChild(postElement);
        });
        })
        .catch((error) => {
        console.error('Error getting documents: ', error);
    });
}

window.searchPosts = function() {
    const searchField = document.getElementById('search-field').value.toLowerCase(); // Convert search field to lower case
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    const q = query(collection(db, 'posts'), where('public', '==', true));
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
            `;
            postsContainer.appendChild(postElement);
            }
        });
        })
        .catch((error) => {
        console.error('Error getting documents: ', error);
    });
}