/* ============================================================
   EnneGo – AI Travel Planner | script.js
   HuggingFace (Qwen3-1.7B / Llama-3.2-1B) + Weatherstack API
   + Unsplash Public API for destination images
   ============================================================ */

// ── API Configuration ──────────────────────────────────────
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

const WEATHER_API_KEY  = "ad3bf76b14350b6d193245448fa05c47";
const WEATHER_BASE_URL = "http://api.weatherstack.com/current";

// Wikipedia REST API – free, public, no API key required.
// Endpoint: https://en.wikipedia.org/api/rest_v1/page/summary/{title}
// Returns originalimage.source — a real Wikimedia-hosted destination photo.
const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary";

// Manual Wikipedia article title overrides for destinations whose names
// differ from their Wikipedia article titles.
const WIKI_OVERRIDES = {
  "Leh":           "Leh",
  "Andaman":       "Andaman_Islands",
  "Cherrapunji":   "Cherrapunji",
  "Mawsynram":     "Mawsynram",
  "Coorg":         "Kodagu",
  "Rann of Kutch": "Rann_of_Kutch",
  "Ooty":          "Ooty",
  "Hampi":         "Hampi",
  "Phuket":        "Phuket_City",
  "Bali":          "Bali",
  "Maldives":      "Maldives",
  "Bangalore":     "Bangalore",
  "Kolkata":       "Kolkata",
};

// ── Destination Database ───────────────────────────────────
const destinations = [
  // Mountains
  { name: "Manali",        type: "mountain",   baseTemp: 10,  baseWeather: "Cold",     wind: 15, country: "India",   emoji: "🏔️", season: "Summer" },
  { name: "Shimla",        type: "mountain",   baseTemp: 12,  baseWeather: "Cloudy",   wind: 12, country: "India",   emoji: "🏔️", season: "Summer" },
  { name: "Leh",           type: "mountain",   baseTemp: 5,   baseWeather: "Sunny",    wind: 10, country: "India",   emoji: "⛰️", season: "Summer" },
  { name: "Darjeeling",    type: "mountain",   baseTemp: 14,  baseWeather: "Misty",    wind: 8,  country: "India",   emoji: "🌄", season: "Spring" },
  { name: "Ooty",          type: "mountain",   baseTemp: 18,  baseWeather: "Pleasant", wind: 6,  country: "India",   emoji: "🌿", season: "Spring" },
  // Beaches
  { name: "Goa",           type: "beach",      baseTemp: 30,  baseWeather: "Sunny",    wind: 8,  country: "India",   emoji: "🏖️", season: "Winter" },
  { name: "Maldives",      type: "beach",      baseTemp: 28,  baseWeather: "Clear",    wind: 15, country: "Maldives",emoji: "🌊", season: "Winter" },
  { name: "Bali",          type: "beach",      baseTemp: 29,  baseWeather: "Rainy",    wind: 12, country: "Indonesia",emoji:"🏝️", season: "Summer" },
  { name: "Phuket",        type: "beach",      baseTemp: 31,  baseWeather: "Sunny",    wind: 10, country: "Thailand",emoji: "⛱️", season: "Winter" },
  { name: "Andaman",       type: "beach",      baseTemp: 27,  baseWeather: "Clear",    wind: 9,  country: "India",   emoji: "🐠", season: "Winter" },
  // Rainforests
  { name: "Cherrapunji",   type: "rainforest", baseTemp: 20,  baseWeather: "Rainy",    wind: 10, country: "India",   emoji: "🌧️", season: "Monsoon"},
  { name: "Mawsynram",     type: "rainforest", baseTemp: 18,  baseWeather: "Rainy",    wind: 9,  country: "India",   emoji: "🌿", season: "Monsoon"},
  { name: "Kerala",        type: "rainforest", baseTemp: 25,  baseWeather: "Humid",    wind: 7,  country: "India",   emoji: "🌴", season: "Winter" },
  { name: "Coorg",         type: "rainforest", baseTemp: 22,  baseWeather: "Misty",    wind: 6,  country: "India",   emoji: "☕", season: "Spring" },
  // Cities
  { name: "Delhi",         type: "city",       baseTemp: 35,  baseWeather: "Hot",      wind: 5,  country: "India",   emoji: "🏛️", season: "Winter" },
  { name: "Mumbai",        type: "city",       baseTemp: 32,  baseWeather: "Sunny",    wind: 10, country: "India",   emoji: "🌆", season: "Winter" },
  { name: "Bangalore",     type: "city",       baseTemp: 28,  baseWeather: "Pleasant", wind: 8,  country: "India",   emoji: "🌃", season: "All"    },
  { name: "Jaipur",        type: "city",       baseTemp: 33,  baseWeather: "Sunny",    wind: 12, country: "India",   emoji: "🏰", season: "Winter" },
  { name: "Kolkata",       type: "city",       baseTemp: 30,  baseWeather: "Humid",    wind: 7,  country: "India",   emoji: "🌉", season: "Winter" },
  // Deserts
  { name: "Jaisalmer",     type: "desert",     baseTemp: 38,  baseWeather: "Hot",      wind: 15, country: "India",   emoji: "🏜️", season: "Winter" },
  { name: "Rann of Kutch", type: "desert",     baseTemp: 36,  baseWeather: "Clear",    wind: 12, country: "India",   emoji: "🌕", season: "Winter" },
  // Heritage
  { name: "Agra",          type: "heritage",   baseTemp: 33,  baseWeather: "Sunny",    wind: 8,  country: "India",   emoji: "🕌", season: "Winter" },
  { name: "Varanasi",      type: "heritage",   baseTemp: 28,  baseWeather: "Misty",    wind: 6,  country: "India",   emoji: "🕯️", season: "Winter" },
  { name: "Hampi",         type: "heritage",   baseTemp: 30,  baseWeather: "Sunny",    wind: 9,  country: "India",   emoji: "🏺", season: "Winter" },
];

// ── State ──────────────────────────────────────────────────
let currentResults  = [...destinations];

// Load favorites from local storage, fallback to empty array
const savedFavorites = JSON.parse(localStorage.getItem('ennego_favorites')) || [];
let favorites       = new Set(savedFavorites);

let weatherCache    = {};          // Cache weather by dest name
let imageCache      = {};          // Cache Wikipedia image URLs by dest name
let aiScores        = {};          // Cache AI scores by dest name
let isSearching     = false;
let isChatting      = false;

// ── DOM References ─────────────────────────────────────────
const searchInput   = document.getElementById("searchInput");
const searchBtn     = document.getElementById("searchBtn");
const filterType    = document.getElementById("filterType");
const filterWeather = document.getElementById("filterWeather");
const sortBy        = document.getElementById("sortBy");
const tempMin       = document.getElementById("tempMin");
const tempMax       = document.getElementById("tempMax");
const resultsDiv    = document.getElementById("results");
const loader        = document.getElementById("loader");
const loaderText    = document.getElementById("loaderText");
const aiSummary     = document.getElementById("aiSummary");
const aiSummaryText = document.getElementById("aiSummaryText");
const noResults     = document.getElementById("noResults");
const resultsTitle  = document.getElementById("resultsTitle");
const resultsCount  = document.getElementById("resultsCount");

// ── HuggingFace API Query ──────────────────────────────────
async function queryHF(messages, modelOverride) {
  const token = localStorage.getItem("hf_token");
  if (!token) {
    if(isSearching) showLoader("Missing API Key..."); // Graceful UI update
    openSettingsModal();
    throw new Error("Missing Hugging Face Token. Please configure in settings.");
  }

  const model = modelOverride || document.getElementById("aiModel").value;
  const response = await fetch(HF_API_URL, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ messages, model }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error ${response.status}: ${err}`);
  }
  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

// ── Weatherstack API ───────────────────────────────────────
async function fetchWeather(destination) {
  if (weatherCache[destination]) return weatherCache[destination];
  try {
    // Note: weatherstack free plan requires http (not https)
    const url = `${WEATHER_BASE_URL}?access_key=${WEATHER_API_KEY}&query=${encodeURIComponent(destination)}&units=m`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.info || "Weather API error");
    weatherCache[destination] = data;
    return data;
  } catch(e) {
    console.warn(`Weather fetch failed for ${destination}:`, e.message);
    return null;
  }
}

// ── Wikipedia Image API ────────────────────────────────────
// FREE · PUBLIC · NO API KEY · Uses Wikimedia CDN images.
// Fetches the lead image for any destination's Wikipedia article.
async function fetchUnsplashImage(destName, type) {
  // Function name kept as fetchUnsplashImage to avoid renaming all callers.
  if (imageCache[destName] !== undefined) return imageCache[destName];
  try {
    // Use override title if defined, otherwise encode the destination name
    const title = encodeURIComponent(
      WIKI_OVERRIDES[destName] || destName.replace(/ /g, "_")
    );
    const url = `${WIKI_API}/${title}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
    const data = await res.json();

    // Prefer originalimage for highest quality, fall back to thumbnail
    const imgUrl = data?.originalimage?.source || data?.thumbnail?.source || null;
    imageCache[destName] = imgUrl;
    return imgUrl;
  } catch (e) {
    console.warn(`Wikipedia image failed for ${destName}:`, e.message);
    imageCache[destName] = null;
    return null;
  }
}

// ── AI: Parse Destinations from LLM Response ──────────────
function parseDestinationsFromAI(text) {
  const lower = text.toLowerCase();
  const found = [];
  destinations.forEach(d => {
    if (lower.includes(d.name.toLowerCase())) {
      found.push(d.name);
    }
  });
  return found;
}

// ── AI: Get Scores from LLM Response ──────────────────────
function parseScoresFromAI(text, destNames) {
  const scores = {};
  destNames.forEach(name => {
    const idx = text.toLowerCase().indexOf(name.toLowerCase());
    if (idx !== -1) {
      // Try to find a number near the destination name
      const snippet = text.slice(Math.max(0, idx - 10), idx + 60);
      const match = snippet.match(/(\d{1,2}(?:\.\d)?)\s*(?:\/\s*10|\s*out)/i);
      if (match) {
        scores[name] = parseFloat(match[1]);
      } else {
        scores[name] = 7.0; // default
      }
    }
  });
  return scores;
}

// ── AI Search ─────────────────────────────────────────────
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    updateDisplay();
    return;
  }
  if (isSearching) return;
  isSearching = true;
  searchBtn.disabled = true;

  showLoader("🤖 AI is analyzing your travel query...");
  aiSummary.classList.add("hidden");

  try {
    const systemPrompt = `You are an expert travel recommendation AI for India and Asia. 
You have access to this list of destinations: ${destinations.map(d => d.name).join(", ")}.

When a user describes their ideal trip, you must:
1. Identify the most relevant destinations from that list (pick 3-8 best matches)
2. Give each a suitability score out of 10
3. Provide a brief 1-2 sentence summary explaining why these match the query

Format your reply EXACTLY like this:
DESTINATIONS: [comma-separated names from list only]
SCORES: [DestName: X/10, DestName: X/10, ...]
SUMMARY: [your brief explanation]`;

    const response = await queryHF([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Find me travel destinations for: "${query}"` }
    ]);

    console.log("AI Response:", response);

    // Parse destinations
    const destMatch = response.match(/DESTINATIONS:\s*(.+)/i);
    const summaryMatch = response.match(/SUMMARY:\s*(.+)/i);

    let aiDestNames = [];
    if (destMatch) {
      const parts = destMatch[1].split(/,|\n/).map(s => s.trim()).filter(Boolean);
      parts.forEach(part => {
        const found = destinations.find(d => d.name.toLowerCase() === part.toLowerCase() 
          || part.toLowerCase().includes(d.name.toLowerCase()));
        if (found && !aiDestNames.includes(found.name)) aiDestNames.push(found.name);
      });
    }

    // Fallback: find any destination names mentioned
    if (aiDestNames.length === 0) {
      aiDestNames = parseDestinationsFromAI(response);
    }

    // Parse scores
    const scores = parseScoresFromAI(response, aiDestNames);
    aiDestNames.forEach(name => {
      if (!scores[name]) scores[name] = 7.0;
    });
    Object.assign(aiScores, scores);

    // Show summary
    if (summaryMatch || aiDestNames.length > 0) {
      const summaryText = summaryMatch ? summaryMatch[1] : 
        `Found ${aiDestNames.length} destinations matching your query "${query}".`;
      aiSummaryText.textContent = summaryText;
      aiSummary.classList.remove("hidden");
    }

    // Update results
    if (aiDestNames.length > 0) {
      currentResults = destinations.filter(d => aiDestNames.includes(d.name));
      resultsTitle.textContent = `AI Results for "${query}"`;
    } else {
      // Fallback to basic search
      currentResults = searchDestinations(query);
      aiSummaryText.textContent = `Showing results for "${query}" (basic search — AI response didn't match exact destinations).`;
      aiSummary.classList.remove("hidden");
    }

    applyFiltersAndSort();

  } catch (err) {
    console.error("AI search failed:", err);
    // Fallback to basic search
    currentResults = searchDestinations(query);
    aiSummaryText.textContent = `⚠️ AI service unavailable. Showing basic search results for "${query}".`;
    aiSummary.classList.remove("hidden");
    applyFiltersAndSort();
  } finally {
    hideLoader();
    isSearching = false;
    searchBtn.disabled = false;
  }
}

// ── Basic Text Search ──────────────────────────────────────
function searchDestinations(query) {
  if (!query) return [...destinations];
  const q = query.toLowerCase();
  return destinations.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.type.toLowerCase().includes(q) ||
    d.baseWeather.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q) ||
    (d.season && d.season.toLowerCase().includes(q))
  );
}

// ── Filters & Sort ─────────────────────────────────────────
function applyFiltersAndSort() {
  let filtered = [...currentResults];

  // Type filter
  const typeVal = filterType.value;
  if (typeVal) filtered = filtered.filter(d => d.type === typeVal);

  // Weather filter
  const weatherVal = filterWeather.value;
  if (weatherVal) {
    filtered = filtered.filter(d => {
      const live = weatherCache[d.name];
      const liveDesc = live?.current?.weather_descriptions?.[0] || "";
      const baseW = d.baseWeather;
      return liveDesc.toLowerCase().includes(weatherVal.toLowerCase()) ||
             baseW.toLowerCase().includes(weatherVal.toLowerCase());
    });
  }

  // Temperature filters
  const minT = tempMin.value !== "" ? parseFloat(tempMin.value) : null;
  const maxT = tempMax.value !== "" ? parseFloat(tempMax.value) : null;
  if (minT !== null) {
    filtered = filtered.filter(d => {
      const t = weatherCache[d.name]?.current?.temperature ?? d.baseTemp;
      return t >= minT;
    });
  }
  if (maxT !== null) {
    filtered = filtered.filter(d => {
      const t = weatherCache[d.name]?.current?.temperature ?? d.baseTemp;
      return t <= maxT;
    });
  }

  // Sort
  const sort = sortBy.value;
  filtered.sort((a, b) => {
    if (sort === "score") {
      return (aiScores[b.name] ?? 5) - (aiScores[a.name] ?? 5);
    } else if (sort === "name") {
      return a.name.localeCompare(b.name);
    } else if (sort === "temp-asc") {
      const ta = weatherCache[a.name]?.current?.temperature ?? a.baseTemp;
      const tb = weatherCache[b.name]?.current?.temperature ?? b.baseTemp;
      return ta - tb;
    } else if (sort === "temp-desc") {
      const ta = weatherCache[a.name]?.current?.temperature ?? a.baseTemp;
      const tb = weatherCache[b.name]?.current?.temperature ?? b.baseTemp;
      return tb - ta;
    }
    return 0;
  });

  renderResults(filtered);
}

function updateDisplay() {
  if (!currentResults || currentResults.length === 0) {
    currentResults = [...destinations];
  }
  applyFiltersAndSort();
}

function resetFilters() {
  filterType.value = "";
  filterWeather.value = "";
  tempMin.value = "";
  tempMax.value = "";
  sortBy.value = "score";
  searchInput.value = "";
  currentResults = [...destinations];
  aiScores = {};
  aiSummary.classList.add("hidden");
  resultsTitle.textContent = "All Destinations";
  applyFiltersAndSort();
}

// ── Render Destination Cards ───────────────────────────────
function renderResults(results) {
  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    noResults.classList.remove("hidden");
    resultsCount.textContent = "";
    return;
  }
  noResults.classList.add("hidden");
  resultsCount.textContent = `${results.length} destination${results.length>1?"s":""}`;

  results.forEach((dest, i) => {
    const isFav   = favorites.has(dest.name);
    const score   = aiScores[dest.name];
    const live    = weatherCache[dest.name];
    const liveTemp = live?.current?.temperature;
    const liveDesc = live?.current?.weather_descriptions?.[0] || "";
    const liveIcon = live?.current?.weather_icons?.[0] || "";
    const cachedImg = imageCache[dest.name];  // may be URL, null, or undefined

    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${i * 0.05}s`;
    const cardId = `card-${dest.name.replace(/[\s/]/g, '-')}`;
    card.id = cardId;

    const scoreHtml = score
      ? `<div class="card-score-badge">⭐ ${score.toFixed(1)}/10</div>`
      : "";
    const liveBadge = live
      ? `<div class="card-live-badge">Live</div>`
      : "";
    const weatherInline = live
      ? `<div class="card-weather-inline">
          ${liveIcon ? `<img src="${liveIcon}" style="width:20px;height:20px;border-radius:4px" alt="${liveDesc}">` : ""}
          <span class="weather-tag">🌡️ ${liveTemp}°C</span>
          <span class="weather-tag">☁️ ${liveDesc || dest.baseWeather}</span>
          <span class="weather-tag">💨 ${live.current.wind_speed || dest.wind} km/h</span>
        </div>`
      : `<div class="card-weather-inline">
          <span class="weather-tag">🌡️ ~${dest.baseTemp}°C</span>
          <span class="weather-tag">☁️ ${dest.baseWeather}</span>
          <span class="weather-tag">💨 ${dest.wind} km/h</span>
        </div>`;

    // Card header: show shimmer skeleton if image not loaded yet,
    // real photo if cached, or gradient+emoji as permanent fallback
    const headerContent = cachedImg
      ? `<img class="card-bg-img loaded" src="${cachedImg}" alt="${dest.name}" />`
      : cachedImg === null
        ? `<div class="card-emoji">${dest.emoji}</div>`  // failed – emoji fallback
        : `<div class="card-img-skeleton"></div><div class="card-emoji card-emoji-loading">${dest.emoji}</div>`;

    card.innerHTML = `
      <div class="card-header">
        ${headerContent}
        <div class="card-header-overlay"></div>
        ${scoreHtml}
        ${liveBadge}
      </div>
      <div class="card-body">
        <div class="card-name">
          ${dest.name}
          <span class="card-type-pill">${dest.type}</span>
        </div>
        <div class="card-stats">
          <div class="stat"><span class="stat-icon">🌍</span>
            <div><div class="stat-label">Country</div><div class="stat-value">${dest.country}</div></div>
          </div>
          <div class="stat"><span class="stat-icon">📅</span>
            <div><div class="stat-label">Best Season</div><div class="stat-value">${dest.season}</div></div>
          </div>
        </div>
      </div>
      ${weatherInline}
      <div class="card-footer">
        <button class="btn-weather" id="weatherBtn-${dest.name.replace(/[\s/]/g,'-')}" 
          onclick="showWeather('${dest.name}', this)">
          🌦️ Live Weather
        </button>
        <button class="btn-fav ${isFav ? 'active' : ''}" 
          id="favBtn-${dest.name.replace(/[\s/]/g,'-')}"
          onclick="toggleFavorite('${dest.name}', this)">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
    `;

    resultsDiv.appendChild(card);

    // If image not in cache yet, fetch asynchronously and update 
    if (cachedImg === undefined) {
      fetchUnsplashImage(dest.name, dest.type).then(imgUrl => {
        const existingCard = document.getElementById(cardId);
        if (!existingCard) return;  // card may have been replaced
        const header = existingCard.querySelector(".card-header");
        const skeleton = existingCard.querySelector(".card-img-skeleton");
        const emojiLoading = existingCard.querySelector(".card-emoji-loading");
        if (!header) return;

        if (imgUrl) {
          // Insert real image
          if (skeleton) skeleton.remove();
          if (emojiLoading) emojiLoading.remove();
          const img = document.createElement("img");
          img.className = "card-bg-img";
          img.alt = dest.name;
          img.src = imgUrl;
          img.onload = () => img.classList.add("loaded");
          header.insertBefore(img, header.firstChild);
        } else {
          // Image failed – switch to plain emoji fallback
          if (skeleton) skeleton.remove();
          if (emojiLoading) {
            emojiLoading.classList.remove("card-emoji-loading");
          }
        }
      });
    }
  });
}

// ── Favorites ──────────────────────────────────────────────
function toggleFavorite(name, btn) {
  if (favorites.has(name)) {
    favorites.delete(name);
    btn.textContent = '🤍';
    btn.classList.remove('active');
  } else {
    favorites.add(name);
    btn.textContent = '❤️';
    btn.classList.add('active');
  }
  
  // Save updated favorites to local storage
  localStorage.setItem('ennego_favorites', JSON.stringify(Array.from(favorites)));

  // Refresh favorites page if active
  if (document.getElementById("page-favorites").classList.contains("active")) {
    renderFavorites();
  }
}

function renderFavorites() {
  const favDiv  = document.getElementById("favResults");
  const noFavs  = document.getElementById("noFavs");
  favDiv.innerHTML = "";

  const favDests = destinations.filter(d => favorites.has(d.name));
  if (favDests.length === 0) {
    noFavs.classList.remove("hidden");
    return;
  }
  noFavs.classList.add("hidden");

  favDests.forEach((dest, i) => {
    const live = weatherCache[dest.name];
    const liveTemp = live?.current?.temperature;
    const liveDesc = live?.current?.weather_descriptions?.[0] || dest.baseWeather;
    const cachedImg = imageCache[dest.name];

    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${i * 0.05}s`;
    const cardId = `fav-card-${dest.name.replace(/[\s/]/g, '-')}`;
    card.id = cardId;

    const headerContent = cachedImg
      ? `<img class="card-bg-img loaded" src="${cachedImg}" alt="${dest.name}" />`
      : cachedImg === null
        ? `<div class="card-emoji">${dest.emoji}</div>`
        : `<div class="card-img-skeleton"></div><div class="card-emoji card-emoji-loading">${dest.emoji}</div>`;

    card.innerHTML = `
      <div class="card-header">
        ${headerContent}
        <div class="card-header-overlay"></div>
        ${live ? `<div class="card-live-badge">Live</div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-name">
          ${dest.name}
          <span class="card-type-pill">${dest.type}</span>
        </div>
        <div class="card-stats">
          <div class="stat"><span class="stat-icon">🌡️</span>
            <div><div class="stat-label">Temp</div><div class="stat-value">${liveTemp ?? dest.baseTemp}°C</div></div>
          </div>
          <div class="stat"><span class="stat-icon">☁️</span>
            <div><div class="stat-label">Weather</div><div class="stat-value">${liveDesc}</div></div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-weather" onclick="showWeather('${dest.name}', this)">🌦️ Live Weather</button>
        <button class="btn-fav active" onclick="toggleFavorite('${dest.name}', this)">❤️</button>
      </div>
    `;
    favDiv.appendChild(card);

    // Async image fetch if not cached
    if (cachedImg === undefined) {
      fetchUnsplashImage(dest.name, dest.type).then(imgUrl => {
        const existingCard = document.getElementById(cardId);
        if (!existingCard) return;
        const header = existingCard.querySelector(".card-header");
        const skeleton = existingCard.querySelector(".card-img-skeleton");
        const emojiLoading = existingCard.querySelector(".card-emoji-loading");
        if (!header) return;
        if (imgUrl) {
          if (skeleton) skeleton.remove();
          if (emojiLoading) emojiLoading.remove();
          const img = document.createElement("img");
          img.className = "card-bg-img";
          img.alt = dest.name;
          img.src = imgUrl;
          img.onload = () => img.classList.add("loaded");
          header.insertBefore(img, header.firstChild);
        } else {
          if (skeleton) skeleton.remove();
          if (emojiLoading) emojiLoading.classList.remove("card-emoji-loading");
        }
      });
    }
  });
}

// ── Weather Modal ──────────────────────────────────────────
async function showWeather(destName, btnEl) {
  const modal   = document.getElementById("weatherModal");
  const content = document.getElementById("weatherModalContent");

  // Show modal with loader
  modal.classList.remove("hidden");
  content.innerHTML = `
    <div class="weather-modal-title">${destName}</div>
    <div class="weather-error">
      <div class="loader-spinner" style="margin:0 auto 1rem;"></div>
      <p>Fetching live weather...</p>
    </div>`;

  if (btnEl) { btnEl.disabled = true; btnEl.textContent = "⏳ Loading..."; }

  try {
    const data = await fetchWeather(destName);

    if (!data || data.error) {
      throw new Error(data?.error?.info || "No data");
    }

    const cur   = data.current;
    const loc   = data.location;
    const temp  = cur.temperature;
    const feels = cur.feelslike;
    const humid = cur.humidity;
    const wind  = cur.wind_speed;
    const uv    = cur.uv_index;
    const vis   = cur.visibility;
    const desc  = cur.weather_descriptions?.[0] || "N/A";
    const icon  = cur.weather_icons?.[0] || "";

    const isSuitable  = temp >= 15 && temp <= 32 && cur.weather_code < 300;
    const suitLabel   = isSuitable
      ? "✅ Great time to visit!"
      : temp < 10 ? "🥶 Very cold — pack warm clothes"
      : temp > 35 ? "🔥 Very hot — travel early/late"
      : "⚠️ Check conditions before planning";
    const suitClass   = isSuitable ? "suitable" : temp < 10 || temp > 35 ? "unsuitable" : "neutral";

    // Update card with live weather
    const destObj = destinations.find(d => d.name === destName);
    if (destObj) {
      weatherCache[destName] = data;
      // Re-render results to show live badge
      applyFiltersAndSort();
    }

    content.innerHTML = `
      <div class="weather-modal-title">${destName}</div>
      <div class="weather-modal-location">📍 ${loc?.name || destName}, ${loc?.country || ""} · Updated: ${loc?.localtime || "now"}</div>
      <div class="weather-modal-main">
        ${icon ? `<img src="${icon}" style="width:64px;height:64px;border-radius:12px" alt="${desc}" />` : `<div class="weather-modal-icon">🌤️</div>`}
        <div>
          <div class="weather-modal-temp">${temp}°C</div>
          <div class="weather-modal-desc">${desc}</div>
        </div>
      </div>
      <div class="weather-modal-stats">
        <div class="ws">
          <div class="ws-icon">🤔</div>
          <div class="ws-label">Feels Like</div>
          <div class="ws-value">${feels}°C</div>
        </div>
        <div class="ws">
          <div class="ws-icon">💧</div>
          <div class="ws-label">Humidity</div>
          <div class="ws-value">${humid}%</div>
        </div>
        <div class="ws">
          <div class="ws-icon">💨</div>
          <div class="ws-label">Wind</div>
          <div class="ws-value">${wind} km/h</div>
        </div>
        <div class="ws">
          <div class="ws-icon">☀️</div>
          <div class="ws-label">UV Index</div>
          <div class="ws-value">${uv}</div>
        </div>
        <div class="ws">
          <div class="ws-icon">👁️</div>
          <div class="ws-label">Visibility</div>
          <div class="ws-value">${vis} km</div>
        </div>
        <div class="ws">
          <div class="ws-icon">🗺️</div>
          <div class="ws-label">Timezone</div>
          <div class="ws-value" style="font-size:0.75rem;">${loc?.timezone_id?.split("/")[1] || "IST"}</div>
        </div>
      </div>
      <div class="weather-suitability ${suitClass}">${suitLabel}</div>
    `;

  } catch (err) {
    content.innerHTML = `
      <div class="weather-modal-title">${destName}</div>
      <div class="weather-error">
        <p>⚠️ Unable to fetch live weather for <strong>${destName}</strong>.</p>
        <p style="margin-top:0.5rem;font-size:0.8rem;color:var(--text-dim)">${err.message}</p>
        <p style="margin-top:0.5rem">Showing estimated data:</p>
        <p style="margin-top:0.5rem;font-size:1rem;">🌡️ ~${destinations.find(d=>d.name===destName)?.baseTemp}°C · 
        ${destinations.find(d=>d.name===destName)?.baseWeather}</p>
      </div>
    `;
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = "🌦️ Live Weather";
    }
  }
}

function closeWeatherModal(event, force = false) {
  if (force || (event && event.target === document.getElementById("weatherModal"))) {
    document.getElementById("weatherModal").classList.add("hidden");
  }
}

// ── AI Chat ─────────────────────────────────────────────────
const chatHistory = [
  {
    role: "system",
    content: `You are EnneGo, an expert AI travel guide specializing in Indian and Asian destinations.
You help users discover perfect travel destinations based on their preferences, budget, and interests.
You know about: ${destinations.map(d => `${d.name} (${d.type}, ${d.country})`).join(", ")}.
Be friendly, concise, and enthusiastic. Use emojis sparingly. Provide practical advice.`
  }
];

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg || isChatting) return;

  isChatting = true;
  document.getElementById("chatSendBtn").disabled = true;
  input.value = "";

  appendChatMsg("user", msg);
  chatHistory.push({ role: "user", content: msg });

  const typingEl = appendTypingIndicator();

  try {
    const model = document.getElementById("chatAiModel").value;
    const reply = await queryHF(chatHistory, model);

    typingEl.remove();
    const cleaned = reply.replace(/<\|im_end\|>[\s\S]*/g, "").trim(); // strip Qwen artifacts
    appendChatMsg("assistant", cleaned);
    chatHistory.push({ role: "assistant", content: cleaned });

    // Keep history manageable (last 12 messages + system)
    if (chatHistory.length > 14) {
      chatHistory.splice(1, chatHistory.length - 13);
    }
  } catch (err) {
    typingEl.remove();
    appendChatMsg("assistant", `⚠️ Sorry, I couldn't connect to the AI service. Please try again. (${err.message})`);
  } finally {
    isChatting = false;
    document.getElementById("chatSendBtn").disabled = false;
  }
}

function appendChatMsg(role, text) {
  const chatMessages = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.innerHTML = `
    <div class="chat-avatar">${role === "user" ? "👤" : "🤖"}</div>
    <div class="chat-bubble">${escapeHtml(text).replace(/\n/g, "<br>")}</div>
  `;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

function appendTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages");
  const el = document.createElement("div");
  el.className = "chat-msg assistant";
  el.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble">
      <div class="chat-typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Tab Navigation ─────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.add("hidden");
    p.classList.remove("active");
  });
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));

  document.getElementById(`page-${tab}`).classList.remove("hidden");
  document.getElementById(`page-${tab}`).classList.add("active");
  document.getElementById(`tab-${tab}`).classList.add("active");

  if (tab === "favorites") renderFavorites();
}

// ── Dark Mode ──────────────────────────────────────────────
function toggleDarkMode() {
  const btn = document.getElementById("darkModeToggle");
  document.body.classList.toggle("dark");
  btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}


// ── Loader Helpers ─────────────────────────────────────────
function showLoader(text = "Loading...") {
  loaderText.textContent = text;
  loader.classList.remove("hidden");
}
function hideLoader() {
  loader.classList.add("hidden");
}

// ── Utility: Debounce ──────────────────────────────────────
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const debouncedSearch = debounce(handleSearch, 600);

// ── Settings Modal ──────────────────────────────────────────
function openSettingsModal() {
  document.getElementById("settingsModal").classList.remove("hidden");
  const storedToken = localStorage.getItem("hf_token");
  if (storedToken) {
    document.getElementById("hfTokenInput").value = storedToken;
  }
}

function closeSettingsModal(event, force=false) {
  if (force || event.target.id === "settingsModal") {
    document.getElementById("settingsModal").classList.add("hidden");
  }
}

function saveSettings() {
  const token = document.getElementById("hfTokenInput").value.trim();
  if (token) {
    localStorage.setItem("hf_token", token);
    closeSettingsModal(null, true);
    // Optionally trigger a brief visual success marker
    searchBtn.textContent = "Saved ✓";
    setTimeout(() => { searchBtn.innerHTML = '<span class="btn-text">Search</span><span class="btn-icon">→</span>'; }, 2000);
  } else {
    alert("Please enter a valid token.");
  }
}

// ── Event Listeners ────────────────────────────────────────
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("input", () => {
    // Basic search runs instantly, AI search runs on debounce
    const query = searchInput.value.trim();
    if(query) {
      currentResults = searchDestinations(query); 
      // Do a fast, local render via array methods (filtering)
      applyFiltersAndSort();
      // Schedule the AI analysis call
      debouncedSearch();
    } else {
      resetFilters();
    }
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
filterType.addEventListener("change", updateDisplay);
filterWeather.addEventListener("change", updateDisplay);
sortBy.addEventListener("change", updateDisplay);
tempMin.addEventListener("input", debounce(updateDisplay, 300));
tempMax.addEventListener("input", debounce(updateDisplay, 300));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWeatherModal(null, true);
});

// ── Initial Render ─────────────────────────────────────────
updateDisplay();
