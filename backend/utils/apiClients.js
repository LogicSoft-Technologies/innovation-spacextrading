import axios from "axios";

export const finnHubApi = axios.create({
  baseURL: "https://finnhub.io/api/v1",
  headers: { "Content-Type": "application/json" },
});

export const coinGeckoApi = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});
