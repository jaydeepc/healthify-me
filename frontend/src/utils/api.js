import axios from 'axios';
import { getAccessToken } from './auth';

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '/health-tracker/api';

// Create axios instance with some defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
