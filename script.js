const apiKey = "ad3bf76b14350b6d193245448fa05c47";

const searchBtn = document.getElementById("searchBtn");
const inputBox = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const loader = document.getElementById("loader");


function getCities(keyword) {
  keyword = keyword.toLowerCase();

  if (keyword.includes("cold")) {
    return ["Manali", "Shimla", "Leh"];
  } else if (keyword.includes("beach")) {
    return ["Goa", "Maldives", "Bali"];
  } else if (keyword.includes("rain")) {
    return ["Cherrapunji", "Mawsynram", "Kerala"];
  } else {
    return ["Delhi", "Mumbai", "Bangalore"];
  }
}

async function fetchWeather(city) {
  try {
    const res = await fetch(
      `https://api.weatherstack.com/forecast?access_key=${apiKey}&query=${city}`
    );

    const data = await res.json();
    return data;

  } catch (err) {
    console.error("Error:", err);
  }
}

function displayWeather(data) {
  if (!data || !data.current) return;

  resultsDiv.innerHTML += `
    <div class="card">
      <h2>${data.location.name}</h2>
      <p>🌡️ Temp: ${data.current.temperature}°C</p>
      <p>🌦️ Weather: ${data.current.weather_descriptions[0]}</p>
      <p>💨 Wind: ${data.current.wind_speed} km/h</p>
    </div>
  `;
}

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

searchBtn.addEventListener("click", async () => {
  const userInput = inputBox.value;

  resultsDiv.innerHTML = "";
  showLoader();

  const cities = getCities(userInput);

  for (let city of cities) {
    const data = await fetchWeather(city);
    displayWeather(data);
  }

  hideLoader();
});