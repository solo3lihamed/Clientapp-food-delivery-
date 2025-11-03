import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your actual API URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          await AsyncStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // You might want to dispatch a logout action here
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login/', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register/', userData),
  
  getProfile: () =>
    api.get('/auth/profile/'),
  
  updateProfile: (data: any) =>
    api.patch('/auth/profile/', data),
  
  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.post('/auth/change-password/', data),
};

// Restaurant API
export const restaurantAPI = {
  getCategories: () =>
    api.get('/restaurants/categories/'),
  
  getRestaurants: (params?: any) =>
    api.get('/restaurants/', { params }),
  
  getRestaurant: (id: number) =>
    api.get(`/restaurants/${id}/`),
  
  getMenuItems: (restaurantId: number, params?: any) =>
    api.get(`/restaurants/${restaurantId}/menu/`, { params }),
  
  searchRestaurants: (params: any) =>
    api.get('/restaurants/search/', { params }),
  
  getReviews: (restaurantId: number) =>
    api.get(`/restaurants/${restaurantId}/reviews/`),
  
  createReview: (restaurantId: number, data: { rating: number; comment: string }) =>
    api.post(`/restaurants/${restaurantId}/reviews/`, data),
};

// Cart API
export const cartAPI = {
  getCart: () =>
    api.get('/orders/cart/'),
  
  addToCart: (data: { menu_item_id: number; quantity: number; special_instructions?: string }) =>
    api.post('/orders/cart/add/', data),
  
  updateCartItem: (itemId: number, data: { quantity: number }) =>
    api.put(`/orders/cart/items/${itemId}/update/`, data),
  
  removeFromCart: (itemId: number) =>
    api.delete(`/orders/cart/items/${itemId}/remove/`),
  
  clearCart: () =>
    api.delete('/orders/cart/clear/'),
};

// Order API
export const orderAPI = {
  getOrders: () =>
    api.get('/orders/'),
  
  getOrder: (id: number) =>
    api.get(`/orders/${id}/`),
  
  createOrder: (data: any) =>
    api.post('/orders/create/', data),
  
  cancelOrder: (id: number) =>
    api.post(`/orders/${id}/cancel/`),
  
  processPayment: (orderId: number, data: { payment_method: string; payment_details?: any }) =>
    api.post(`/orders/${orderId}/pay/`, data),
  
  requestRefund: (orderId: number) =>
    api.post(`/orders/${orderId}/refund/`),
  
  getPaymentMethods: () =>
    api.get('/orders/payment-methods/'),
  
  validateCoupon: (params: { code: string; restaurant_id?: number }) =>
    api.get('/orders/coupons/validate/', { params }),
};

export default api;
