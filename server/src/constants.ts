export const PORT = process.env.PORT || 80;
export const NODE_ENV = process.env.NODE_ENV || "development";

export const LLM_API_KEY = process.env.LLM_API_KEY;
export const LLM_BASE_URL =
  process.env.LLM_BASE_URL || "http://localhost:8080";
export const MODEL = process.env.MODEL || "local-model";
export const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || "";

// Search Configuration - Google Custom Search API only
export const SEARCH_PROVIDER = "google"; // Fixed to Google only
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
export const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// Search configuration
export const SEARCH_TIMEOUT = parseInt(process.env.SEARCH_TIMEOUT || "10000");
export const SEARCH_MAX_RETRIES = parseInt(process.env.SEARCH_MAX_RETRIES || "3");