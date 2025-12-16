import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token and user info management
const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'user_info';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

export const setAuthData = (token, userInfo) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
};

export const isGuest = () => {
  const user = getStoredUser();
  return user?.is_guest === true;
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  
  login: async (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Store auth data
    setAuthData(response.data.access_token, {
      username: data.username,
      is_guest: false
    });
    
    return response;
  },
  
  guestLogin: async () => {
    const response = await api.post('/auth/guest');
    
    // Store guest auth data
    setAuthData(response.data.access_token, {
      username: response.data.guest_id,
      is_guest: true,
      expires_in: response.data.expires_in
    });
    
    return response;
  },
  
  getGuestInfo: () => api.get('/auth/guest/info'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  logout: () => {
    clearAuthData();
  }
};

export const healthAPI = {
  addHealthData: (data) => api.post('/health/health-data', data),
  getHealthData: (days = 30) => api.get(`/health/health-data?days=${days}`),
  getHealthTrends: () => api.get('/health/health-trends'),
  addMedicine: (data) => api.post('/health/medicines', data),
  getMedicines: () => api.get('/health/medicines'),
  clearGuestData: () => api.delete('/health/clear-guest-data'),
};

export const chatAPI = {
  analyzeSymptoms: (symptoms) => api.post('/chat/symptoms', { symptoms }),
  checkMedicineInteractions: (medicines) => 
    api.post('/chat/medicine-check', { medicines }),
};

export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (includePast = false) => 
    api.get(`/appointments?include_past=${includePast}`),
  optimizeAppointments: () => api.get('/appointments/optimize'),
};

export default api;