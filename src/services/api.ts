import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        // Backend middleware expects just the token or Bearer?
        // Checking authMiddleware... usually it extracts from Authorization header.
        // I will assume Bearer scheme for standard practice, but verify if code available.
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      if (typeof window !== 'undefined') {
        // localStorage.removeItem('auth_token');
        // window.location.href = '/login';
        alert('401 Unauthorized detected! Token might be invalid.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
