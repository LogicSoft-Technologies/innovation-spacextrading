// routes/marketRoutes.js
import express from "express";
import {
  getStockPrice,
  getCryptoPrices,
} from "../controllers/marketController.js";

const router = express.Router();

router.get("/stock", getStockPrice);
router.get("/crypto", getCryptoPrices);

export default router;
