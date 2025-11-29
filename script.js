// Improved script.js (safe rendering, async/await, clean structure)

const API_URL = "http://localhost:3000/movies";

const movieListDiv = document.getElementById("movie-list");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("add-movie-form");

const editModal = document.getElementById("edit-modal");
const editTitle = document.getElementById("edit-title");
const editGenre = document.getElementById("edit-genre");
const editYear = document.getElementById("edit-year");
const saveEditBtn = document.getElementById("save-edit");
const closeModalBtn = document.getElementById("close-modal");

let allMovies = [];
let currentEditId = null;

// Utility message
function showMessage(msg) {
  alert(msg);
}

// SAFE RENDERING
function renderMovies(movies) {
  movieListDiv.innerHTML = "";

  if (!movies || movies.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No movies found.";
    movieListDiv.appendChild(p);
    return;
  }

  movies.forEach((m) => {
    const card = document.createElement("div");
    card.className = "movie";

    const titleEl = document.createElement("strong");
    titleEl.textContent = m.title;

    const yearEl = document.createElement("div");
    yearEl.textContent = `(${m.year})`;

    const genreEl = document.createElement("em");
    genreEl.textContent = m.genre;

    const controls = document.createElement("div");
    controls.style.marginTop = "8px";

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(m.id));

    const delBtn = document.createElement("button");
    delBtn.className = "delete";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteMovie(m.id));

    controls.appendChild(editBtn);
    controls.appendChild(delBtn);

    card.appendChild(titleEl);
    card.appendChild(yearEl);
    card.appendChild(genreEl);
    card.appendChild(controls);

    movieListDiv.appendChild(card);
  });
}

// FETCH ALL MOVIES
async function fetchMovies() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch movies");

    const data = await res.json();
    allMovies = Array.isArray(data) ? data : [];

    renderMovies(allMovies);
  } catch (err) {
    console.error(err);
    showMessage("Error fetching movies. Check JSON server.");
  }
}

fetchMovies();

// SEARCH
searchInput.addEventListener("input", () => {
  const s = searchInput.value.trim().toLowerCase();

  const filtered = allMovies.filter((m) => {
    const title = (m.title || "").toLowerCase();
    const genre = (m.genre || "").toLowerCase();
    const year = String(m.year || "").toLowerCase();
    return title.includes(s) || genre.includes(s) || year.includes(s);
  });

  renderMovies(filtered);
});

// ADD MOVIE
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const year = parseInt(document.getElementById("year").value, 10);

  if (!title || !genre || Number.isNaN(year)) {
    showMessage("Fill all fields correctly (Year must be number)");
    return;
  }

  const newMovie = { title, genre, year };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMovie),
    });

    if (!res.ok) throw new Error("Failed to add movie");

    form.reset();
    fetchMovies();
  } catch (err) {
    console.error(err);
    showMessage("Failed to add movie.");
  }
});

// OPEN EDIT MODAL
function openEditModal(id) {
  const movie = allMovies.find((m) => m.id === id);
  if (!movie) return showMessage("Movie not found");

  currentEditId = id;
  editTitle.value = movie.title;
  editGenre.value = movie.genre;
  editYear.value = movie.year;

  editModal.style.display = "flex";
  setTimeout(() => editTitle.focus(), 50);
}

// CLOSE MODAL
closeModalBtn.onclick = () => {
  editModal.style.display = "none";
};

// CLOSE ON BACKDROP CLICK
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) editModal.style.display = "none";
});

// CLOSE ON ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") editModal.style.display = "none";
});

// SAVE EDIT
saveEditBtn.onclick = async () => {
  if (!currentEditId) return;

  const updated = {
    title: editTitle.value.trim(),
    genre: editGenre.value.trim(),
    year: parseInt(editYear.value, 10),
  };

  if (!updated.title || !updated.genre || Number.isNaN(updated.year)) {
    return showMessage("Fill edit fields correctly");
  }

  try {
    const res = await fetch(`${API_URL}/${currentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("Update failed");

    editModal.style.display = "none";
    fetchMovies();
  } catch (err) {
    console.error(err);
    showMessage("Failed to update movie.");
  }
};

// DELETE MOVIE
async function deleteMovie(id) {
  if (!confirm("Delete this movie?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    fetchMovies();
  } catch (err) {
    console.error(err);
    showMessage("Failed to delete movie.");
  }
}
