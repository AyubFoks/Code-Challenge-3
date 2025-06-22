// DOM Elements
const postsList = document.getElementById('postsList');
const postForm = document.getElementById('postForm');
const API_URL = 'http://localhost:3000/posts';
const currentYear = new Date().getFullYear();
document.getElementById('currentYear').textContent = currentYear;

// Fetch all posts and display them
function fetchPosts() {
  fetch(API_URL)
    .then(response => response.json())
    .then(posts => {
      postsList.innerHTML = '';
      posts.forEach(post => displayPost(post));
    })
    .catch(error => console.error('Error fetching posts:', error));
}

// Display a single post
let currentPostIndex = 0;
let postsArray = [];

function displayPost(post, index) {
  const postElement = document.createElement('div');
  postElement.className = `post ${index === 0 ? 'active' : ''}`;
  postElement.innerHTML = `
    <img src="${post.image}" alt="${post.title}">
    <h3>${post.title}</h3>
    <p>${post.body}</p>
    <p><em>By ${post.author}</em></p>
    <div class="post-actions">
      <button onclick="editPost(${post.id})">Edit</button>
      <button onclick="deletePost(${post.id})">Delete</button>
    </div>
  `;
  postsList.appendChild(postElement);
}

function fetchPosts() {
  fetch(API_URL)
    .then(response => response.json())
    .then(posts => {
      postsList.innerHTML = '';
      postsArray = posts;
      posts.forEach((post, index) => displayPost(post, index));
      if (posts.length > 0) {
        currentPostIndex = 0;
        showPost(currentPostIndex);
      }
    })
    .catch(error => console.error('Error fetching posts:', error));
}

function showPost(index) {
  const posts = document.querySelectorAll('.post');
  posts.forEach(post => post.classList.remove('active'));
  if (posts.length > 0) {
    posts[index].classList.add('active');
  }
}

document.getElementById('nextBtn').addEventListener('click', () => {
  if (postsArray.length > 0) {
    currentPostIndex = (currentPostIndex + 1) % postsArray.length;
    showPost(currentPostIndex);
  }
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (postsArray.length > 0) {
    currentPostIndex = (currentPostIndex - 1 + postsArray.length) % postsArray.length;
    showPost(currentPostIndex);
  }
});

// Add a new post
postForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const image = document.getElementById('image').value;
  const body = document.getElementById('body').value;
  const author = document.getElementById('author').value;
  
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, image, body, author }),
  })
    .then(response => response.json())
    .then(() => {
      fetchPosts();
      postForm.reset();
    })
    .catch(error => console.error('Error adding post:', error));
});

// Delete a post
function deletePost(id) {
  fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })
    .then(() => fetchPosts())
    .catch(error => console.error('Error deleting post:', error));
}

// Edit a post (implementation would be similar to add, but with PUT method)
function editPost(id) {
  // In a real implementation, you would:
  // 1. Fetch the post data
  // 2. Populate the form with it
  // 3. Change the form submission to do a PUT request instead of POST
  console.log(`Edit post with ID: ${id}`);
  // Example implementation would be similar to the add functionality
  // but with method: 'PUT' and URL: `${API_URL}/${id}`
}

// Initial fetch of posts
fetchPosts();

// Display recent posts in sidebar
function displayRecentPosts(posts) {
  const recentPostsContainer = document.getElementById('recentPosts');
  recentPostsContainer.innerHTML = '';
  
  // Get 5 most recent posts (sorted by id, assuming higher ids are newer)
  const recentPosts = [...posts]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
  
  recentPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'recent-post';
    postElement.textContent = post.title;
    postElement.addEventListener('click', () => {
      // When clicked, show this post in the slideshow
      const postIndex = postsArray.findIndex(p => p.id === post.id);
      if (postIndex !== -1) {
        currentPostIndex = postIndex;
        showPost(currentPostIndex);
      }
    });
    recentPostsContainer.appendChild(postElement);
  });
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
      searchResults.innerHTML = '';
      return;
    }
    
    const results = postsArray.filter(post => 
      post.title.toLowerCase().includes(searchTerm)
      || post.body.toLowerCase().includes(searchTerm)
    );
    
    displaySearchResults(results);
  }
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div>No matching posts found</div>';
    return;
  }
  
  results.forEach(post => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.textContent = post.title;
    resultItem.addEventListener('click', () => {
      const postIndex = postsArray.findIndex(p => p.id === post.id);
      if (postIndex !== -1) {
        currentPostIndex = postIndex;
        showPost(currentPostIndex);
        searchInput.value = '';
        searchResults.innerHTML = '';
      }
    });
    searchResults.appendChild(resultItem);
  });
}

// Update your fetchPosts function to include recent posts display
function fetchPosts() {
  fetch(API_URL)
    .then(response => response.json())
    .then(posts => {
      postsList.innerHTML = '';
      postsArray = posts;
      posts.forEach((post, index) => displayPost(post, index));
      if (posts.length > 0) {
        currentPostIndex = 0;
        showPost(currentPostIndex);
      }
      displayRecentPosts(posts); // Add this line
    })
    .catch(error => console.error('Error fetching posts:', error));
}

// Call setupSearch when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
  setupSearch();
});