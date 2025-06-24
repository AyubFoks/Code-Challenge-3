// DOM Elements
const postsList = document.getElementById('postsList');
const postForm = document.getElementById('postForm');
const API_URL = 'http://localhost:3000/posts';

// Set current year in footer
const currentYear = new Date().getFullYear();
document.getElementById('currentYear').textContent = currentYear;

// Global variables
let currentPostIndex = 0;
let postsArray = [];
let isEditing = false; // Track if we're in edit mode
let currentEditId = null; // Track which post we're editing

/**
 * Display a single post in the UI
 */
function displayPost(post, index) {
  const postElement = document.createElement('div');
  postElement.className = 'post ' + (index === 0 ? 'active' : '');
  postElement.innerHTML = `
    <img src="${post.image}" alt="${post.title}">
    <h3>${post.title}</h3>
    <p>${post.bodyContent}</p>
    <p><em>By ${post.author}</em></p>
    <div class="post-actions">
      <button onclick="editPost(${post.id})">Edit</button>
      <button onclick="deletePost(${post.id})">Delete</button>
    </div>
  `;
  postsList.appendChild(postElement);
}

/**
 * Show a specific post by index
 */
function showPost(index) {
  const posts = document.querySelectorAll('.post');
  posts.forEach(function(post) {
    post.classList.remove('active');
  });
  if (posts.length > 0) {
    posts[index].classList.add('active');
  }
}

// Navigation event listeners
document.getElementById('nextBtn').addEventListener('click', function() {
  if (postsArray.length > 0) {
    currentPostIndex = (currentPostIndex + 1) % postsArray.length;
    showPost(currentPostIndex);
  }
});

document.getElementById('prevBtn').addEventListener('click', function() {
  if (postsArray.length > 0) {
    currentPostIndex = (currentPostIndex - 1 + postsArray.length) % postsArray.length;
    showPost(currentPostIndex);
  }
});

/**
 * Delete a post from the server
 */
function deletePost(id) {
  if (confirm('Are you sure you want to delete this post?')) {
    fetch(API_URL + '/' + id, {
      method: 'DELETE',
    })
      .then(function() { fetchPosts(); })
      .catch(function(error) { console.error('Error deleting post:', error); });
  }
}

/**
 * Prepare the form for editing an existing post
 */
function editPost(id) {
  const post = postsArray.find(function(p) { return p.id === id; });
  if (!post) return;

  // Set edit mode
  isEditing = true;
  currentEditId = id;

  // Fill the form with the post data
  document.getElementById('title').value = post.title;
  document.getElementById('image').value = post.image;
  document.getElementById('bodyContent').value = post.bodyContent;
  document.getElementById('author').value = post.author;

  // Change button text to indicate edit mode
  document.querySelector('button[type="submit"]').textContent = 'Update Post';
}

/**
 * Display recent posts in the sidebar
 */
function displayRecentPosts(posts) {
  const recentPostsContainer = document.getElementById('recentPosts');
  recentPostsContainer.innerHTML = '';
  
  const recentPosts = posts.slice()
    .sort(function(a, b) { return b.id - a.id; })
    .slice(0, 5);
  
  const listContainer = document.createElement('div');
  listContainer.className = 'recent-posts-list';
  
  recentPosts.forEach(function(post) {
    const postElement = document.createElement('li');
    postElement.className = 'recent-post-item';
    postElement.href = '#';
    postElement.textContent = post.title;
    postElement.addEventListener('click', function(e) {
      e.preventDefault();
      const postIndex = postsArray.findIndex(function(p) { return p.id === post.id; });
      if (postIndex !== -1) {
        currentPostIndex = postIndex;
        showPost(currentPostIndex);
        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
      }
    });
    listContainer.appendChild(postElement);
  });
  
  recentPostsContainer.appendChild(listContainer);
}

// Search functionality
function displaySearchResults(results) {
  const searchResultsDiv = document.getElementById('searchResults');
  searchResultsDiv.innerHTML = '';

  if (!results || results.length === 0) {
    searchResultsDiv.innerHTML = '<div class="no-results">No matching posts found</div>';
    return;
  }

  const resultsList = document.createElement('ul');
  resultsList.className = 'results-list';

  results.forEach(function(post) {
    const listItem = document.createElement('li');
    listItem.className = 'result-item';
    
    const resultLink = document.createElement('a');
    resultLink.href = '#';
    resultLink.textContent = post.title;
    resultLink.className = 'result-link';
    
    resultLink.addEventListener('click', function(e) {
      e.preventDefault();
      goToPost(post.id);
    });

    listItem.appendChild(resultLink);
    resultsList.appendChild(listItem);
  });

  searchResultsDiv.appendChild(resultsList);
}

function goToPost(postId) {
  const postIndex = postsArray.findIndex(function(p) { return p.id === postId; });
  if (postIndex !== -1) {
    currentPostIndex = postIndex;
    showPost(currentPostIndex);
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
  }
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
      document.getElementById('searchResults').innerHTML = '';
      return;
    }

    const results = postsArray.filter(function(post) { 
      return post.title.toLowerCase().includes(searchTerm) ||
             post.bodyContent.toLowerCase().includes(searchTerm) ||
             post.author.toLowerCase().includes(searchTerm);
    });

    displaySearchResults(results);
  }

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') performSearch();
  });
}

/**
 * Fetch all posts from the server
 */
function fetchPosts() {
  fetch(API_URL)
    .then(function(response) { return response.json(); })
    .then(function(posts) {
      postsList.innerHTML = '';
      postsArray = posts;
      posts.forEach(function(post, index) { displayPost(post, index); });
      if (posts.length > 0) {
        currentPostIndex = 0;
        showPost(currentPostIndex);
      }
      displayRecentPosts(posts);
    })
    .catch(function(error) { console.error('Error fetching posts:', error); });
}

/**
 * Handle form submission for both new posts and updates
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const image = document.getElementById('image').value;
  const bodyContent = document.getElementById('bodyContent').value;
  const author = document.getElementById('author').value;
  
  if (!title || !bodyContent || !author) {
    alert('Please fill in all required fields: Title, Content, and Author');
    return;
  }

  // Use default image if none provided
  const imageUrl = image || 'https://foksandfolks.co.ke/wp-content/uploads/2025/06/image-placeholder@2x-100.jpg';
  
  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `${API_URL}/${currentEditId}` : API_URL;
  
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      title: title, 
      image: imageUrl, 
      bodyContent: bodyContent, 
      author: author 
    }),
  })
    .then(function(response) { return response.json(); })
    .then(function() {
      fetchPosts();
      postForm.reset();
      
      // Reset edit mode
      if (isEditing) {
        isEditing = false;
        currentEditId = null;
        document.querySelector('button[type="submit"]').textContent = 'Post Now';
      }
    })
    .catch(function(error) { console.error('Error saving post:', error); });
}

// Event Listeners
postForm.addEventListener('submit', handleFormSubmit);

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  fetchPosts();
  setupSearch();
});