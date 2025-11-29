const API_URL = "http://localhost:3000/movies";

const movieListDiv = document.getElementById("movie-list");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("add-movie-form");

let allMovies = [];
let currentEditId = null;

// =============== RENDER MOVIES =================
function renderMovies(movies) {
  movieListDiv.innerHTML = "";

  if (movies.length === 0) {
    movieListDiv.innerHTML = "<p>No movies found.</p>";
    return;
  }

  movies.forEach((m) => {
    const div = document.createElement("div");
    div.className = "movie";

    div.innerHTML = `
      <strong>${m.title}</strong> (${m.year})<br>
      <em>${m.genre}</em>

      <div style="margin-top:8px;">
        <button class="edit" onclick="editMovie(${m.id})">Edit</button>
        <button class="delete" onclick="deleteMovie(${m.id})">Delete</button>
      </div>
    `;

    movieListDiv.appendChild(div);
  });
}

// =============== FETCH ALL MOVIES =================
function fetchMovies() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      allMovies = data;
      renderMovies(allMovies);
    });
}

fetchMovies();

// =============== SEARCH MOVIES =================
searchInput.addEventListener("input", () => {
  const s = searchInput.value.toLowerCase();
  const filtered = allMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(s) ||
      m.genre.toLowerCase().includes(s)
  );
  renderMovies(filtered);
});

// =============== ADD MOVIE =================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const year = parseInt(document.getElementById("year").value);

  if (!title || !genre || !year) {
    alert("Please fill all fields correctly.");
    return;
  }

  const newMovie = { title, genre, year };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newMovie),
  }).then(() => {
    form.reset();
    fetchMovies();
  });
});

// =============== EDIT MOVIE =================
function editMovie(id) {
  const movie = allMovies.find((m) => m.id === id);

  document.getElementById("edit-title").value = movie.title;
  document.getElementById("edit-genre").value = movie.genre;
  document.getElementById("edit-year").value = movie.year;

  currentEditId = id;
  document.getElementById("edit-modal").style.display = "flex";
}

// Close modal
document.getElementById("close-modal").onclick = () => {
  document.getElementById("edit-modal").style.display = "none";
};

// Save edit
document.getElementById("save-edit").onclick = () => {
  const updated = {
    title: document.getElementById("edit-title").value,
    genre: document.getElementById("edit-genre").value,
    year: parseInt(document.getElementById("edit-year").value),
  };

  fetch(`${API_URL}/${currentEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  }).then(() => {
    document.getElementById("edit-modal").style.display = "none";
    fetchMovies();
  });
};

// =============== DELETE MOVIE =================
function deleteMovie(id) {
  if (!confirm("Delete this movie?")) return;

  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  }).then(() => fetchMovies());
}
