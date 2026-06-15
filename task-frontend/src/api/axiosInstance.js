// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor: Inject JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 errors globally and handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Forcefully redirect the browser window to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;