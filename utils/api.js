import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;