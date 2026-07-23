import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hire_me_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const providerService = {
  getProviders: async (params = {}) => {
    const response = await api.get('/providers', { params });
    return response.data;
  },
  getEarnings: async () => {
    const response = await api.get('/providers/me/earnings');
    return response.data;
  }
};

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  updateStatus: async (bookingId, status) => {
    const response = await api.patch(`/bookings/${bookingId}`, { status });
    return response.data;
  },
  submitReview: async (bookingId, reviewData) => {
    const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
  upgradeToProvider: async (trade, hourlyRate) => {
    const res = await api.post('/users/upgrade-to-provider', { trade, hourlyRate });
    return res.data;
  },
  getNotifications: async () => {
    const res = await api.get('/users/notifications');
    return res.data;
  }
};

export const savedService = {
  getSaved: async () => {
    const res = await api.get('/saved');
    return res.data;
  },
  save: async (providerId) => {
    const res = await api.post(`/saved/${providerId}`);
    return res.data;
  },
  unsave: async (providerId) => {
    const res = await api.delete(`/saved/${providerId}`);
    return res.data;
  },
};

export default api;
