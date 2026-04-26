import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const diseaseAPI = {
  predict: (formData) => api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  predictUnauth: (formData) => api.post('/predict', formData),
  getHistory: () => api.get('/history'),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
};

export const marketAPI = {
  createListing: (data) => api.post('/market/listings', data),
  getMyListings: () => api.get('/market/listings/my'),
  getListings: (location = '') => api.get(`/market/listings?location=${location}`),
  deleteListing: (id) => api.delete(`/market/listings/${id}`),
  approveListing: (id) => api.put(`/market/listings/${id}/approve`),
  rejectListing: (id) => api.put(`/market/listings/${id}/reject`),
  setMarketPrice: (data) => api.post('/market/prices', data),
  getMarketPrices: () => api.get('/market/prices'),
  getMarketPrice: (vegetable) => api.get(`/market/prices/${vegetable}`),
};

export default api;