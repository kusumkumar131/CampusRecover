import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://campusrecover-nbbw.onrender.com/api',
  timeout: 30000, // 30s timeout to allow free-tier Render server wake-up
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_recover_token');
    if (token) {
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
