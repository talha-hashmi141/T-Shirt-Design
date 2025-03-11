import axios from 'axios';

// Create API instances
const API = axios.create({ baseURL: 'http://localhost:5000/api' });
const AUTH_API = axios.create({ baseURL: 'http://localhost:5000/api/auth' });

// Add request interceptors
const requestInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure token is properly formatted
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
};

const requestErrorHandler = (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
};

API.interceptors.request.use(requestInterceptor, requestErrorHandler);
AUTH_API.interceptors.request.use(requestInterceptor, requestErrorHandler);

// Response interceptors
const responseInterceptor = (response) => {
  return response;
};

const errorInterceptor = (error) => {
  if (error.response) {
    // Handle token related errors
    if (error.response.status === 401) {
      const errorMessage = error.response.data?.error;
      if (errorMessage === 'Token expired' || errorMessage === 'Invalid token') {
        // Clear invalid token
        localStorage.removeItem('token');
      }
    }
    
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
  }
  return Promise.reject(error);
};

API.interceptors.response.use(responseInterceptor, errorInterceptor);
AUTH_API.interceptors.response.use(responseInterceptor, errorInterceptor);

export { API as default, AUTH_API };
