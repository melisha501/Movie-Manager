const API_URL = 'http://localhost:3000/movies';

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = []; // Stores full movie list

// ----------------------------
// Render Movies
// ----------------------------
function renderMovies(moviesToDisplay) {
    movieListDiv.innerHTML = '';

    if (moviesToDisplay.length === 0) {
        movieListDiv.innerHTML = '<p>No movies found.</p>';
        return;
    }

    moviesToDisplay.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');

        movieElement.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <button onclick="editMoviePrompt(${movie.id}, '${movie.title.replace(/'/g, "\\'")}', ${movie.year}, '${movie.genre.replace(/'/g, "\\'")}')">Edit</button>
            <button onclick="deleteMovie(${movie.id})">Delete</button>
        `;

        movieListDiv.appendChild(movieElement);
    });
}

// ----------------------------
// Fetch Movies (READ)
// ----------------------------
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(movies => {
            allMovies = movies;
            renderMovies(allMovies);
        })
        .catch(err => console.error("Error fetching movies:", err));
}
fetchMovies();

// ----------------------------
// Add Movie (CREATE)
// ----------------------------
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value,
        genre: document.getElementById('genre').value,
        year: parseInt(document.getElementById('year').value)
    };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie)
    })
    .then(() => {
        form.reset();
        fetchMovies();
    })
    .catch(err => console.error("Error adding movie:", err));
});

// ----------------------------
// Edit Movie (UPDATE)
// ----------------------------
function editMoviePrompt(id, oldTitle, oldYear, oldGenre) {
    const title = prompt("New title:", oldTitle);
    const year = prompt("New year:", oldYear);
    const genre = prompt("New genre:", oldGenre);

    if (!title || !year) return;

    const updatedMovie = { title, year: parseInt(year), genre };

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMovie)
    })
    .then(() => fetchMovies())
    .catch(err => console.error("Error updating movie:", err));
}

// ----------------------------
// Delete Movie (DELETE)
// ----------------------------
function deleteMovie(id) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(() => fetchMovies())
        .catch(err => console.error("Error deleting movie:", err));
}

// ----------------------------
// Search Function
// ----------------------------
searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query)
    );

    renderMovies(filtered);
});
