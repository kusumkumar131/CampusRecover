import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('campus_recover_token');
      console.warn('Session expired or unauthorized request made.');
    }
    return Promise.reject(error);
  }
);

export default api;
