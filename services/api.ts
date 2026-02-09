
import axios from 'axios';

// Prioritize environment variable, fallback to the provided Vercel backend URL
const API_URL = process.env.NODE_ENV !== 'development' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dosely_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dosely_token');
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
