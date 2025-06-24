const postsList = document.getElementById('postsList');
const postForm = document.getElementById('postForm');
const API_URL = 'http://localhost:3000/posts';
const currentYear = new Date().getFullYear();
document.getElementById('currentYear').textContent = currentYear;

let currentPostIndex = 0;
let postsArray = [];

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

function showPost(index) {
  const posts = document.querySelectorAll('.post');
  posts.forEach(function(post) {
    post.classList.remove('active');
  });
  if (posts.length > 0) {
    posts[index].classList.add('active');
  }
}

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

postForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get all form values
  const title = document.getElementById('title').value;
  const image = document.getElementById('image').value;
  const bodyContent = document.getElementById('bodyContent').value;
  const author = document.getElementById('author').value;
  
  // Validate required fields
  if (!title || !bodyContent || !author) {
    alert('Please fill in all required fields: Title, Content, and Author');
    return;
  }

  // If image URL is not provided, use a default placeholder
  const imageUrl = image || 'https://via.placeholder.com/600x400?text=No+Image';
  
  fetch(API_URL, {
    method: 'POST',
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
    })
    .catch(function(error) { console.error('Error adding post:', error); });
});

function deletePost(id) {
  if (confirm('Are you sure you want to delete this post?')) {
    fetch(API_URL + '/' + id, {
      method: 'DELETE',
    })
      .then(function() { fetchPosts(); })
      .catch(function(error) { console.error('Error deleting post:', error); });
  }
}

function editPost(id) {
  const post = postsArray.find(function(p) { return p.id === id; });
  if (!post) return;

  // Fill the form with the post data
  document.getElementById('title').value = post.title;
  document.getElementById('image').value = post.image;
  document.getElementById('bodyContent').value = post.bodyContent;
  document.getElementById('author').value = post.author;

  // Change the form to update instead of create
  postForm.onsubmit = function(e) {
    e.preventDefault();
    
    const updatedTitle = document.getElementById('title').value;
    const updatedImage = document.getElementById('image').value;
    const updatedBodyContent = document.getElementById('bodyContent').value;
    const updatedAuthor = document.getElementById('author').value;
    
    fetch(API_URL + '/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        title: updatedTitle, 
        image: updatedImage, 
        bodyContent: updatedBodyContent, 
        author: updatedAuthor 
      }),
    })
      .then(function(response) { return response.json(); })
      .then(function() {
        fetchPosts();
        postForm.reset();
        // Reset the form to create new posts
        postForm.onsubmit = handleFormSubmit;
      })
      .catch(function(error) { console.error('Error updating post:', error); });
  };
}

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
  searchResultsDiv.innerHTML = ''; // Clear previous results

  if (!results || results.length === 0) {
    searchResultsDiv.innerHTML = '<div class="no-results">No matching posts found</div>';
    return;
  }

  // Create unordered list element
  const resultsList = document.createElement('ul');
  resultsList.className = 'results-list';

  // Add each result as a list item
  results.forEach(function(post) {
    const listItem = document.createElement('li');
    listItem.className = 'result-item';
    
    // Create clickable link for each result
    const resultLink = document.createElement('a');
    resultLink.href = '#';
    resultLink.textContent = post.title;
    resultLink.className = 'result-link';
    
    // Click handler for navigation
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
    document.getElementById('searchInput').value = ''; // Clear search input
    document.getElementById('searchResults').innerHTML = ''; // Clear results
    // Smooth scroll to the post
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

// Store the original form handler
const handleFormSubmit = function(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const image = document.getElementById('image').value;
  const bodyContent = document.getElementById('bodyContent').value;
  const author = document.getElementById('author').value;
  
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, image, bodyContent, author }),
  })
    .then(function(response) { return response.json(); })
    .then(function() {
      fetchPosts();
      postForm.reset();
    })
    .catch(function(error) { console.error('Error adding post:', error); });
};

postForm.addEventListener('submit', handleFormSubmit);

document.addEventListener('DOMContentLoaded', function() {
  fetchPosts();
  setupSearch();
});