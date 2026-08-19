import axios from 'axios';

const PRODUCTION_API = 'https://campusrecover-nbbw.onrender.com/api';

// Use same-origin /api so Vercel rewrites and Vite proxy route seamlessly to Render backend.
// This prevents cross-domain CORS/Network errors in modern browsers.
const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PUBLIC_AUTH_PATHS = ['/auth/register', '/auth/login', '/auth/forgot-password', '/auth/reset-password'];

api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
    const token = localStorage.getItem('campus_recover_token');
    if (token && !isPublicAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token storage and unauthorized access
api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      localStorage.setItem('campus_recover_token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const headers = error.config?.headers;
      const sentAuth = headers?.Authorization || headers?.authorization || headers?.get?.('Authorization');
      const currentToken = localStorage.getItem('campus_recover_token');
      const sentToken = typeof sentAuth === 'string' && sentAuth.startsWith('Bearer ')
        ? sentAuth.slice(7)
        : null;

      // Only drop the stored token if THIS request used that same token.
      // A slow /auth/me 401 must not wipe a token just issued by register/login.
      if (sentToken && currentToken && sentToken === currentToken) {
        localStorage.removeItem('campus_recover_token');
        console.warn('Session expired or unauthorized request made.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
