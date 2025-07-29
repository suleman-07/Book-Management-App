// 📁 File: app.js
let currentPage = 1;
const booksPerPage = 5;


// ----------- Book Class -----------
class Book {
  constructor(title, author, genre, publishedYear, rating) {
    this.id = Date.now() + Math.random();
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.publishedYear = publishedYear;
    this.rating = rating;
  }

  getSummary() {
    return `${this.title} by ${this.author}, Genre: ${this.genre}, Published: ${this.publishedYear}`;
  }

  updateDetails(newData) {
    for (let key in newData) {
      if (this.hasOwnProperty(key)) {
        this[key] = newData[key];
      }
    }
  }
}

let books = [];

// ----------- Book Management Functions -----------
function addBook(bookInstance) {
  books.push(bookInstance);
  updateGenreSidebar();
  displayBooks();
}

function deleteBook(bookId) {
  books = books.filter(book => book.id !== bookId);
  updateGenreSidebar();
  displayBooks();
}

function updateBook(bookId, updatedData) {
  const book = books.find(book => book.id === bookId);
  if (book) {
    book.updateDetails(updatedData);
    updateGenreSidebar();
    displayBooks();
  }
}

function getBooksByGenre(genre) {
  return books.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
}

function sortBooks(key, desc = true) {
  return books.slice().sort((a, b) => {
    if (typeof a[key] === 'number') {
      return desc ? b[key] - a[key] : a[key] - b[key];
    }
    return desc ? b[key].localeCompare(a[key]) : a[key].localeCompare(b[key]);
  });
}

function getAverageRating() {
  if (books.length === 0) return 0;
  const total = books.reduce((sum, book) => sum + book.rating, 0);
  return (total / books.length).toFixed(2);
}

function getUniqueAuthors() {
  return [...new Set(books.map(book => book.author))];
}

function getUniqueGenres() {
  return [...new Set(books.map(book => book.genre))];
}

// ----------- Storage Functions -----------
function saveToStorage(storageType) {
  const storage = storageType === "local" ? localStorage : sessionStorage;
  storage.setItem("books", JSON.stringify(books));
  alert(`Books saved to ${storageType}Storage`);
}

function loadFromStorage(storageType) {
  const storage = storageType === "local" ? localStorage : sessionStorage;
  const storedBooks = storage.getItem("books");
  if (storedBooks) {
    const parsed = JSON.parse(storedBooks);
    books = parsed.map(b => new Book(b.title, b.author, b.genre, b.publishedYear, b.rating));
    alert(`Books loaded from ${storageType}Storage`);
    displayBooks();
    updateGenreSidebar();
  } else {
    alert(`No books found in ${storageType}Storage`);
  }
}

function clearStorage(storageType) {
  const storage = storageType === "local" ? localStorage : sessionStorage;
  storage.removeItem("books");
  alert(`${storageType}Storage cleared`);
  updateGenreSidebar();
  displayBooks();
}

window.onload = () => {
  loadFromStorage("local");
  bindEvents();
};

// ----------- Simulated Server (Promise) -----------
function simulateServerResponse(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject({ success: false, message: "Server Error: Failed to process request." });
      } else {
        resolve({ success: true, data });
      }
    }, 1000);
  });
}

async function addBookAsync(book) {
  const status = document.getElementById("statusMessage");
  try {
    status.innerText = "⏳ Adding book...";
    const response = await simulateServerResponse(book);
    if (response.success) {
      addBook(book);
      status.innerText = `✅ Book added: ${book.title}`;
    }
  } catch (error) {
    status.innerText = `❌ Error: ${error.message}`;
  }
}

async function updateBookAsync(bookId, updatedData) {
  const status = document.getElementById("statusMessage");
  try {
    status.innerText = "⏳ Updating book...";
    const response = await simulateServerResponse(updatedData);
    if (response.success) {
      updateBook(bookId, updatedData);
      status.innerText = `✅ Book updated.`;
    }
  } catch (error) {
    status.innerText = `❌ Error: ${error.message}`;
  }
}

// ----------- UI Output -----------
function displayBooks(list = books) {
  const container = document.getElementById("bookList");
  container.innerHTML = "";

  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const paginatedBooks = list.slice(start, end);

  paginatedBooks.forEach(book => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.title}</strong> by ${book.author}<br>
      Genre: ${book.genre}, Year: ${book.publishedYear}, Rating: ${book.rating}<br>
      <button onclick="deleteBook(${book.id})">Delete</button>
      <button onclick="promptUpdate(${book.id})">Update</button>
    `;
    container.appendChild(li);
  });

  // Update page info
  document.getElementById("pageInfo").innerText = `Page ${currentPage}`;
}


function promptUpdate(id) {
  const newTitle = prompt("New Title:");
  const newRating = parseFloat(prompt("New Rating:"));
  updateBookAsync(id, { title: newTitle, rating: newRating });
}

function exportToJson() {
  const dataStr = JSON.stringify(books, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "books.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ----------- Genre Sidebar Using Map -----------
function updateGenreSidebar() {
  const genreMap = new Map();
  books.forEach(book => {
    genreMap.set(book.genre, (genreMap.get(book.genre) || 0) + 1);
  });
  const sidebar = document.getElementById("genreSidebar");
  if (sidebar) {
    sidebar.innerHTML = "<h4>📊 Genre Count</h4>";
    genreMap.forEach((count, genre) => {
      sidebar.innerHTML += `<p>${genre}: ${count}</p>`;
    });
  }
}

// ----------- Event Binding -----------
function bindEvents() {
  document.getElementById("bookForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const title = this.title.value;
    const author = this.author.value;
    const genre = this.genre.value;
    const year = parseInt(this.publishedYear.value);
    const rating = parseFloat(this.rating.value);
    addBookAsync(new Book(title, author, genre, year, rating));
    this.reset();
  });

  document.getElementById("searchInput").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    const filtered = books.filter(book => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query));
    displayBooks(filtered);
  });

  document.getElementById("sortSelect").addEventListener("change", function() {
    const sorted = sortBooks(this.value);
    displayBooks(sorted);
  });

  document.getElementById("genreFilter").addEventListener("change", function() {
    const genre = this.value;
    const filtered = genre ? getBooksByGenre(genre) : books;
    displayBooks(filtered);
  });
  document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayBooks();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(books.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayBooks();
  }
});


  document.getElementById("exportJsonBtn").addEventListener("click", exportToJson);
}
