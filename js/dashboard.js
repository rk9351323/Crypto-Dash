import { fetchCoin, fetchHistory, fetchTopMarketCoins } from "./api.js";
import { saveFavorite, loadFavorites, removeFavorite } from "./utils.js";

const search = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const results = document.getElementById("results");
const favList = document.getElementById("favList");
const errorMsg = document.getElementById("error-msg");

let chart;

// Show/Hide search button on typing
if (search) {
  search.addEventListener("input", (e) => {
    const coin = search.value.toLowerCase().trim();
    errorMsg.innerHTML = ""; // Clear previous error
    
    if (coin.length > 0) {
      searchBtn.classList.add("show");
    } else {
      searchBtn.classList.remove("show");
      results.innerHTML = "";
      if (chart) chart.destroy();
    }
  });

  search.addEventListener("keypress", (e) => {
    if (e.key === "Enter") triggerSearch();
  });
}

const triggerSearch = async () => {
  const coin = search.value.toLowerCase().trim();
  if (!coin) return;
  
  results.innerHTML = `<p class="loading">Loading...</p>`;
  errorMsg.innerHTML = "";
  
  try {
    const data = await fetchCoin(coin);
    console.log("Fetched Coin API Data:", data);
    renderResult(data);
    renderChart(coin);
  } catch (err) {
    results.innerHTML = "";
    if (chart) chart.destroy();
    errorMsg.innerHTML = "Coin not found. Please try names like 'bitcoin' or 'ethereum'.";
  }
};

search.addEventListener("keypress", (e) => {
  if (e.key === "Enter") triggerSearch();
});

if (searchBtn) {
  searchBtn.addEventListener("click", triggerSearch);
}

function renderResult(data) {
  results.innerHTML = `
    <div class="card">
      <img src="${data.image.small}" alt="${data.name}">
      <div>
        <h2>${data.name} <span>(${data.symbol.toUpperCase()})</span></h2>
        <p class="price">$${data.market_data.current_price.usd.toLocaleString()}</p>
        <p class="change ${data.market_data.price_change_percentage_24h >= 0 ? "positive" : "negative"}">
          24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%
        </p>
      </div>
      <button id="favBtn">Add to Favorites</button>
    </div>
  `;
  document.getElementById("favBtn").addEventListener("click", () => {
    saveFavorite(data.id);
    renderFavorites();
  });
}

async function renderChart(coin) {
  const history = await fetchHistory(coin);
  const ctx = document.getElementById("priceChart").getContext("2d");
  if (chart) chart.destroy();
  
  const themeColor = getComputedStyle(document.body).getPropertyValue('--secondary-color').trim();
  
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.prices.map(p => new Date(p[0]).toLocaleDateString()),
      datasets: [{
        label: `${coin} Price`,
        data: history.prices.map(p => p[1]),
        borderColor: "#007BFF",
        fill: false
      }]
    },
    options: {
      scales: {
        x: {
          ticks: { color: themeColor }
        },
        y: {
          ticks: { color: themeColor }
        }
      }
    }
  });
}

function renderFavorites() {
  if (!favList) return;
  const favs = loadFavorites();
  if (favs.length === 0) {
    favList.innerHTML = "<p class='muted-text'>No favorites yet.</p>";
    return;
  }
  
  favList.innerHTML = favs.map(f => `
    <li>
      <span class="fav-name" style="text-transform: capitalize; cursor: pointer;" onclick="document.getElementById('search').value='${f}'; document.getElementById('search').dispatchEvent(new KeyboardEvent('keypress', {'key': 'Enter'}));">${f}</span>
      <button class="remove-btn" data-coin="${f}">❌</button>
    </li>
  `).join("");

  // Attach remove event listeners
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const coinToRemove = e.target.getAttribute("data-coin");
      removeFavorite(coinToRemove);
      renderFavorites();
    });
  });
}

// Init favorites & movers
renderFavorites();
initMarketMovers();

// Fetch and render Top Gainers/Losers
async function initMarketMovers() {
  try {
    const coins = await fetchTopMarketCoins();
    
    // Sort coins by 24h percentage change
    const validCoins = coins.filter(c => c.price_change_percentage_24h !== null);
    const sortedCoins = [...validCoins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    
    // Get top 5 gainers and top 5 losers
    const topGainers = sortedCoins.slice(0, 5);
    const topLosers = sortedCoins.slice(-5).reverse();

    // Render Gainers
    document.getElementById("gainers-list").innerHTML = topGainers.map(c => `
      <li class="mover-item" onclick="document.getElementById('search').value='${c.id}'; document.getElementById('search-btn').click();">
        <div class="mover-info">
          <img src="${c.image}" alt="${c.name}">
          <span>${c.name} <small>(${c.symbol.toUpperCase()})</small></span>
        </div>
        <span class="change positive">+${c.price_change_percentage_24h.toFixed(2)}%</span>
      </li>
    `).join("");

    // Render Losers
    document.getElementById("losers-list").innerHTML = topLosers.map(c => `
      <li class="mover-item" onclick="document.getElementById('search').value='${c.id}'; document.getElementById('search-btn').click();">
        <div class="mover-info">
          <img src="${c.image}" alt="${c.name}">
          <span>${c.name} <small>(${c.symbol.toUpperCase()})</small></span>
        </div>
        <span class="change negative">${c.price_change_percentage_24h.toFixed(2)}%</span>
      </li>
    `).join("");

  } catch (err) {
    console.error("Failed to load top movers:", err);
    document.getElementById("gainers-list").innerHTML = "<li><span class='error'>Failed to load</span></li>";
    document.getElementById("losers-list").innerHTML = "<li><span class='error'>Failed to load</span></li>";
  }
}