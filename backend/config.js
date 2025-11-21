// backend config file 
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;

// Database
export const MONGODB_URI = process.env.MONGODB_URI;

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET;

// Email Settings
export const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL;
export const MANAGEMENT_EMAIL_PASS = process.env.MANAGEMENT_EMAIL_PASS;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Redis Config
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_USERNAME = process.env.REDIS_USERNAME;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Third-Party API
export const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// URLs
export const BACKEND_URL = process.env.BACKEND_URL;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const ADMIN_URL = process.env.ADMIN_URL;
