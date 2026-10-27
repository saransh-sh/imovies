import axios from 'axios';

// Helper to resolve and normalize backend API URL across Render, Vercel, and local dev
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }
  let url = envUrl.trim();
  // If protocol is missing (e.g., from Render blueprint host property)
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Append /api only if not already present
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

// Create Axios client with base URL
const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear localStorage
      localStorage.removeItem('imovies_token');
      localStorage.removeItem('imovies_user');
    }
    return Promise.reject(error);
  }
);

export default api;
