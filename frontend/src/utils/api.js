/**
 * Centralized API configuration for Vatsalya Lifestyle Enterprise.
 * 
 * In development, uses VITE_API_URL env var or defaults to same-hostname:8080.
 * In production (deployed website), uses VITE_API_URL from the .env file.
 * 
 * Usage:
 *   import { API_BASE } from '../utils/api';
 *   axios.get(`${API_BASE}/api/orders`);
 */

export const API_BASE = import.meta.env.VITE_API_URL
  || `http://${window.location.hostname}:8080`;
