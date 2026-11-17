import axios from "axios";

// Resolve API base URL from Vite env.
// VITE_API_URL MUST be set in production (Vercel/Render environment variables).
// No silent fallback to avoid misconfiguration.
const getApiBaseUrl = () => {
  const url = (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) || "";

  if (!url && import.meta.env.PROD) {
    console.error("[LeafGuard] VITE_API_URL is not set in production! API calls will fail.");
  }
  return url;
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 120000,
  headers: {
    "ngrok-skip-browser-warning": "69420",
    "Accept": "application/json",
  },
});

// Request timestamp for debugging cold starts
api.interceptors.request.use((config) => {
  config.headers["X-Request-Time"] = new Date().toISOString();
  return config;
});

// Response interceptor: surface clear error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — server likely offline / cold-starting
      error.message = "Unable to reach the analysis server. It may be waking up. Please try again in a moment.";
    } else if (error.response?.status === 404 && !API_BASE_URL) {
      error.message = "API base URL not configured. Set VITE_API_URL environment variable.";
    }
    return Promise.reject(error);
  }
);

export default api;