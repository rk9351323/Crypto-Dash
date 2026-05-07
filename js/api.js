const API_URL = "https://api.coingecko.com/api/v3";

// Fetch coin data
export async function fetchCoin(coin = "bitcoin") {
  const res = await fetch(`${API_URL}/coins/${coin}`);
  if (!res.ok) throw new Error("Failed to fetch coin data");
  return res.json();
}

// Fetch price history
export async function fetchHistory(coin = "bitcoin") {
  const res = await fetch(`${API_URL}/coins/${coin}/market_chart?vs_currency=usd&days=7`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

// Fetch Top 100 Coins for Gainers/Losers
export async function fetchTopMarketCoins() {
  const res = await fetch(`${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
  if (!res.ok) throw new Error("Failed to fetch market data");
  return res.json();
}

///conveter
// Elements

const amountInput = document.getElementById("amount");

const fromCurrency = document.getElementById("fromCurrency");

const toCurrency = document.getElementById("toCurrency");

const convertBtn = document.getElementById("convertBtn");

const result = document.getElementById("result");

const loading = document.getElementById("loading");

const swapBtn = document.getElementById("swapBtn");

const form = document.getElementById("converterForm");


// Crypto List

const cryptoCoins = [
  "bitcoin",
  "ethereum",
  "dogecoin"
];


// Convert Function

async function convertCurrency() {

  const amount = amountInput.value;

  const from = fromCurrency.value;

  const to = toCurrency.value;


  // Validation

  if(amount === "" || amount <= 0){

    result.innerText = "Please enter valid amount";

    return;
  }


  // Same Currency

  if(from === to){

    result.innerText =
      `${amount} ${from.toUpperCase()} = ${amount} ${to.toUpperCase()}`;

    return;
  }


  loading.style.display = "block";

  result.innerText = "";


  try {

    let finalAmount;


    // =========================
    // CRYPTO → FIAT
    // =========================

    if(cryptoCoins.includes(from) && !cryptoCoins.includes(to)){

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
      );

      const data = await response.json();

      finalAmount = amount * data[from][to];
    }


    // =========================
    // FIAT → CRYPTO
    // =========================

    else if(!cryptoCoins.includes(from) && cryptoCoins.includes(to)){

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${to}&vs_currencies=${from}`
      );

      const data = await response.json();

      finalAmount = amount / data[to][from];
    }


    // =========================
    // CRYPTO → CRYPTO
    // =========================

    else if(cryptoCoins.includes(from) && cryptoCoins.includes(to)){

      // Step 1
      // Convert FROM crypto → USD

      const response1 = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=usd`
      );

      const data1 = await response1.json();

      const usdValue = amount * data1[from].usd;


      // Step 2
      // Convert USD → TO crypto

      const response2 = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${to}&vs_currencies=usd`
      );

      const data2 = await response2.json();

      finalAmount = usdValue / data2[to].usd;
    }


    // =========================
    // FIAT → FIAT
    // =========================

    else {

      const response = await fetch(
        `https://open.er-api.com/v6/latest/${from.toUpperCase()}`
      );

      const data = await response.json();

      finalAmount = amount * data.rates[to.toUpperCase()];
    }


    // Show Result

    result.innerText =
      `${amount} ${from.toUpperCase()} = ${finalAmount.toFixed(4)} ${to.toUpperCase()}`;

  }

  catch(error){

    console.log(error);

    result.innerText = "Conversion Failed";
  }

  finally{

    loading.style.display = "none";
  }
}



// Convert Button
if (form) {
  form.addEventListener("submit", function(event){

    event.preventDefault();

    convertCurrency();
  });
}



// Swap Button
if (swapBtn) {
  swapBtn.addEventListener("click", function(){

    const temp = fromCurrency.value;

    fromCurrency.value = toCurrency.value;

    toCurrency.value = temp;
  });
}
