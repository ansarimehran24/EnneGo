# 🌍 EnneGo – AI Travel Planner

## 📌 Overview

EnneGo is a smart AI-powered travel planning web application that helps users discover the best travel destinations based on natural language input. Users can describe their ideal trip (e.g., *"peaceful hill station with cool weather"*), and the system will suggest suitable locations.

The application enhances recommendations using real-time weather data and an AI-powered filtering and scoring system to rank destinations based on suitability.

---

## 🎯 Purpose

Planning a trip involves multiple factors like weather, preferences, and timing. EnneGo simplifies decision-making by:

* Understanding user intent through natural language input
* Suggesting relevant destinations
* Evaluating real-time weather conditions
* Ranking destinations based on suitability

---

## 🔌 APIs Used

### 🌦️ Weather API

* API Key: `ad3bf76b14350b6d193245448fa05c47`
* Used to fetch real-time weather data (temperature, conditions, etc.) for each destination

---

### 🤖 Hugging Face Inference API (AI Processing)

* **API Endpoint:** `https://router.huggingface.co/v1/chat/completions`
* **Models Available:**
  * `Qwen/Qwen3-1.7B:featherless-ai` — Fast AI responses
  * `meta-llama/Llama-3.2-1B-Instruct:novita` — Balanced AI responses
* **Used for:**

  * Understanding user input (NLP) via natural language travel queries
  * Suggesting & scoring destinations from the built-in database
  * Conversational AI travel assistant (Chat tab)
  * Intelligent filtering and ranking with suitability scores

---

## ✨ Features

### 🔍 Smart Search

* Users can enter natural language queries
  *(e.g., "beach destinations in summer", "snowy places in December")*

---

### 📍 AI-Based Destination Suggestions

* Uses Hugging Face Inference API to analyze user intent
* Returns a list of relevant travel destinations

---

### 🌦️ Weather-Based Analysis

* Displays real-time weather data for each destination
* Indicates whether the weather is suitable for travel

---

### 🎯 Smart Scoring System (Advanced Feature)

Each destination is assigned a **Travel Suitability Score** based on:

* Weather conditions
* Temperature match with user preference
* Seasonal relevance
* AI-based relevance scoring

This score is used for ranking and sorting results.

---

### 🧭 Filtering (Core Requirement ✅)

Users can filter destinations based on:

* 🌡️ Temperature range (e.g., 10°C–25°C)
* 🌦️ Weather condition (sunny, rainy, snowy)
* 🏝️ Destination type (beach, mountains, city)
* 📅 Season or month of travel

---

### 🔃 Sorting (Core Requirement ✅)

Users can sort results based on:

* ⭐ Travel Suitability Score (default)
* 🌡️ Temperature (low → high / high → low)
* 🤖 AI relevance score
* 📍 Popularity (future enhancement)

---

### ❤️ Save Favorites (Optional)

* Users can bookmark destinations for future reference

---

## 🛠️ Technologies Used

* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Core Logic:** Array Higher-Order Functions (map, filter, sort, forEach) for all data manipulation
* **API Integration:** Weatherstack API + Hugging Face API + Wikipedia Image API
* **Version Control:** Git & GitHub

---

## 🎯 Milestone Checklist Completed

* ✅ **Milestone 1:** Project setup, UI planning, README created.
* ✅ **Milestone 2:** Public APIs integrated using `fetch`, loading states handled, layout is responsive.
* ✅ **Milestone 3:** Core features added!
  * **Searching, Filtering & Sorting** implemented natively using Array HOFs (No `for`/`while` loops!)
  * **Button Interactions:** View live weather modals and ❤️ Favorite buttons.
  * **Dark Mode/Light Mode:** Full CSS variable toggle implemented.
* ✅ **Bonus Features Implemented!**
  * **Debouncing:** Applied to the text Search and Temperature inputs to minimize API calls.
  * **Local Storage:** Favorites are persistently saved across page reloads.
  
---

## ⚙️ Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/ansarimehran24/EnneGo
   ```

2. Navigate to the project folder:

   ```bash
   cd EnneGo
   ```

3. Open `index.html` in your browser. (No node.js or npm required!)

---

## 📂 Project Structure

```
EnneGo/
│── index.html
│── style.css
│── script.js
│── README.md
```

---

## 🚀 Future Enhancements

* 🤖 Advanced AI recommendation engine
* 🗺️ Map integration (Google Maps / Mapbox)
* 💰 Budget-based filtering (currently in it, but will improve over time)
* 📅 Personalized travel itineraries
* 🔐 User authentication system

---

## 🤝 Contribution

Contributions are welcome! Feel free to fork this repository and submit pull requests.

---

## 📄 License

This project is open-source and available under the MIT License.

---
