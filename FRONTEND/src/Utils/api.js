import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we are not already on the login/landing routes
      const publicPaths = ['/', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    
    // Extract server error message
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const code = error.response?.data?.code || 'NETWORK_ERROR';
    
    const customError = new Error(message);
    customError.code = code;
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    
    return Promise.reject(customError);
  }
);

export default api;
