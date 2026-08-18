// Central API configuration
// VITE_API_URL should be set to your Render backend URL in Vercel's environment variables
// e.g. https://gatherly-cd0d.onrender.com
// Falls back to same-origin (for local dev where Vite proxies /api to the backend)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
