import axios from 'axios';

// Create API instances
const API = axios.create({ baseURL: 'http://localhost:5000/api' });
const AUTH_API = axios.create({ baseURL: 'http://localhost:5000/api/auth' });

// Add request interceptors
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

AUTH_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptors
const handleAuthError = (error) => {
  // Only handle specific auth errors that require logout
  if (error.response?.status === 401 && 
      (error.response.data.error === "Invalid token" || 
       error.response.data.error === "Token expired" ||
       error.response.data.error === "Access denied. No token provided.")) {
    // Check if we're not already on the login page to prevent redirect loops
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

API.interceptors.response.use(
  (response) => response,
  handleAuthError
);

AUTH_API.interceptors.response.use(
  (response) => response,
  handleAuthError
);

export { API as default, AUTH_API };
