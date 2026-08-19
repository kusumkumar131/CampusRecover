import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle unauthorized access automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, we can handle redirects or clear states if needed
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request made.');
    }
    return Promise.reject(error);
  }
);

export default api;
