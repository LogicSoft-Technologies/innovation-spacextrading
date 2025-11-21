import asyncHandler from "express-async-handler";
import { finnHubApi, coinGeckoApi } from "../utils/apiClients.js";

// In-memory cache
let stockCache = {};
let stockHistory = {};
let cryptoCache = {};
let lastStockFetch = 0;
let lastCryptoFetch = 0;
const CACHE_DURATION = 10000;

// GET STOCK PRICE
export const getStockPrice = asyncHandler(async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ success: false, message: "Stock symbol is required" });

  const now = Date.now();

  if (stockCache[symbol] && now - lastStockFetch < CACHE_DURATION) {
    return res.json({
      success: true,
      data: {
        c: stockCache[symbol].c,
        o: stockCache[symbol].o,
        h: stockCache[symbol].h,
        l: stockCache[symbol].l,
        history: stockHistory[symbol] || [],
      },
      cached: true,
    });
  }

  try {
    const { data } = await finnHubApi.get(`/quote`, { params: { symbol, token: process.env.FINNHUB_API_KEY } });
    
    if (!data || typeof data.c !== "number") {
      return res.status(404).json({ success: false, message: "No data found for the provided stock symbol" });
    }

    stockCache[symbol] = data;
    lastStockFetch = now;

    if (!stockHistory[symbol]) stockHistory[symbol] = [];
    stockHistory[symbol].push({
      time: now,
      open: data.o,
      high: data.h,
      low: data.l,
      close: data.c,
    });
    if (stockHistory[symbol].length > 50) stockHistory[symbol].shift();

    res.json({
      success: true,
      data: {
        c: data.c,
        o: data.o,
        h: data.h,
        l: data.l,
        history: stockHistory[symbol],
      },
    });
  } catch (err) {
    console.error("Error fetching stock price:", err.response?.data || err.message);
    if (err.response?.status === 429) {
      res.status(429).json({ success: false, message: "Finnhub rate limit exceeded. Try again in a few seconds." });
    } else {
      res.status(500).json({ success: false, message: "Failed to fetch stock data" });
    }
  }
});

// GET CRYPTO PRICES
export const getCryptoPrices = asyncHandler(async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ success: false, message: "Crypto IDs are required" });

  const now = Date.now();
  if (cryptoCache[ids] && now - lastCryptoFetch < CACHE_DURATION) {
    return res.json({ success: true, data: cryptoCache[ids], cached: true });
  }

  try {
    const { data } = await coinGeckoApi.get(`/simple/price`, {
      params: { ids, vs_currencies: "usd", include_24hr_change: "true" },
    });

    const idsArr = ids.split(",");
    if (!cryptoCache.histories) cryptoCache.histories = {};

    idsArr.forEach((id) => {
      const price = data[id]?.usd || 0;
      if (!cryptoCache.histories[id]) cryptoCache.histories[id] = [];
      cryptoCache.histories[id].push({ time: now, price, open: price, high: price, low: price, close: price });
      if (cryptoCache.histories[id].length > 20) cryptoCache.histories[id].shift();
    });

    cryptoCache[ids] = { prices: data, history: cryptoCache.histories };
    lastCryptoFetch = now;

    res.json({ success: true, data: cryptoCache[ids] });
  } catch (err) {
    console.error("Error fetching crypto prices:", err.response?.data || err.message);
    if (err.response?.status === 429) {
      res.status(429).json({ success: false, message: "CoinGecko rate limit exceeded. Try again in a few seconds." });
    } else {
      res.status(500).json({ success: false, message: "Failed to fetch crypto data" });
    }
  }
});
