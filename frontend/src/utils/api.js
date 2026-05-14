/**
 * Centralized API configuration for Vatsalya Lifestyle Enterprise.
 * 
 * In development, uses VITE_API_URL env var or defaults to same-hostname:8080.
 * In production (deployed website), uses VITE_API_URL from the .env file.
 * 
 * Usage:
 *   import { API_BASE, api } from '../utils/api';
 *   api.get('/api/orders');
 */
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL
  || (window.location.hostname === 'localhost' 
      ? 'http://localhost:8080' 
      : 'https://vatsalya-lifestyle-1.onrender.com');

/**
 * Pre-configured Axios instance with:
 *  - baseURL already set to API_BASE
 *  - 90-second timeout (Render free tier cold start can take 30-60s)
 *  - Automatic retry on network / 5xx errors (up to 2 retries)
 */
const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000, // 90 seconds for cold-start tolerance
});

// Simple retry interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Only retry on network errors or 5xx, and only up to 2 retries
    if (
      config &&
      !config._retryCount &&
      (!error.response || error.response.status >= 500)
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= 2) {
        // Wait a bit before retrying (exponential backoff: 2s, 4s)
        await new Promise((r) => setTimeout(r, config._retryCount * 2000));
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
