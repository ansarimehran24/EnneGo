const destinations = [
  { name: "Manali", type: "mountain", temp: 10, weather: "Cold", wind: 15 },
  { name: "Shimla", type: "mountain", temp: 12, weather: "Cloudy", wind: 12 },
  { name: "Leh", type: "mountain", temp: 5, weather: "Sunny", wind: 10 },
  { name: "Goa", type: "beach", temp: 30, weather: "Sunny", wind: 8 },
  { name: "Maldives", type: "beach", temp: 28, weather: "Clear", wind: 15 },
  { name: "Bali", type: "beach", temp: 29, weather: "Rainy", wind: 12 },
  { name: "Cherrapunji", type: "rainforest", temp: 20, weather: "Rainy", wind: 10 },
  { name: "Mawsynram", type: "rainforest", temp: 18, weather: "Rainy", wind: 9 },
  { name: "Kerala", type: "rainforest", temp: 25, weather: "Humid", wind: 7 },
  { name: "Delhi", type: "city", temp: 35, weather: "Hot", wind: 5 },
  { name: "Mumbai", type: "city", temp: 32, weather: "Sunny", wind: 10 },
  { name: "Bangalore", type: "city", temp: 28, weather: "Pleasant", wind: 8 }
];

let currentResults = [...destinations];
let favorites = new Set();

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const sortBy = document.getElementById("sortBy");
const darkModeToggle = document.getElementById("darkModeToggle");
const resultsDiv = document.getElementById("results");
const loader = document.getElementById("loader");

function searchDestinations(query) {
  if (!query) return [...destinations];
  return destinations.filter(dest =>
    dest.name.toLowerCase().includes(query.toLowerCase()) ||
    dest.type.toLowerCase().includes(query.toLowerCase())
  );
}

function filterByType(results, type) {
  if (!type) return results;
  return results.filter(dest => dest.type === type);
}

function sortResults(results, sortOption) {
  return [...results].sort((a, b) => {
    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "temp-asc") {
      return a.temp - b.temp;
    } else if (sortOption === "temp-desc") {
      return b.temp - a.temp;
    }
    return 0;
  });
}

function displayResults(results) {
  resultsDiv.innerHTML = "";
  results.forEach(dest => {
    const isFavorite = favorites.has(dest.name);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h2>${dest.name}</h2>
        <p>🌡️ Temp: ${dest.temp}°C</p>
        <p>🌦️ Weather: ${dest.weather}</p>
        <p>💨 Wind: ${dest.wind} km/h</p>
        <p>Type: ${dest.type}</p>
      </div>
      <button class="fav-btn" data-name="${dest.name}">${isFavorite ? '❤️' : '🤍'}</button>
    `;
    resultsDiv.appendChild(card);
  });

  // Add event listeners to favorite buttons
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', toggleFavorite);
  });
}

function toggleFavorite(event) {
  const name = event.target.dataset.name;
  if (favorites.has(name)) {
    favorites.delete(name);
    event.target.textContent = '🤍';
  } else {
    favorites.add(name);
    event.target.textContent = '❤️';
  }
}

function updateDisplay() {
  const query = searchInput.value;
  let results = searchDestinations(query);
  results = filterByType(results, filterType.value);
  results = sortResults(results, sortBy.value);
  displayResults(results);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

// Event listeners
searchBtn.addEventListener("click", () => {
  showLoader();
  setTimeout(() => {
    updateDisplay();
    hideLoader();
  }, 500); // Simulate loading
});

searchInput.addEventListener("input", updateDisplay);
filterType.addEventListener("change", updateDisplay);
sortBy.addEventListener("change", updateDisplay);
darkModeToggle.addEventListener("click", toggleDarkMode);

// Initial display
updateDisplay();