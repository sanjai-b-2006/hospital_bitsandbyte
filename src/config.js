// Centralized API Base Configuration
// In production (Vercel), VITE_API_URL can be configured as an environment variable.
// Defaults to http://localhost:5001/api for local development.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
